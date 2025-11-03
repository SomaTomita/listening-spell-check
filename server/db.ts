import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'data.sqlite');
export const db = new Database(dbPath);

// Initialize tables
db.exec(`
CREATE TABLE IF NOT EXISTS mistakes (
  word TEXT PRIMARY KEY,
  seen INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  streak_wrong INTEGER NOT NULL DEFAULT 0,
  last_ts INTEGER
);

CREATE TABLE IF NOT EXISTS motivation (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  today_count INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  week_total INTEGER NOT NULL DEFAULT 0,
  last_updated TEXT
);
`);

export function recordResult(word: string, isCorrect: boolean, ts: number) {
  // Upsert mistakes
  const row = db.prepare('SELECT seen, correct, streak_wrong FROM mistakes WHERE word=?').get(word) as
    | { seen: number; correct: number; streak_wrong: number }
    | undefined;
  if (!row) {
    db.prepare('INSERT INTO mistakes (word, seen, correct, streak_wrong, last_ts) VALUES (?,?,?,?,?)').run(
      word,
      1,
      isCorrect ? 1 : 0,
      isCorrect ? 0 : 1,
      ts
    );
  } else {
    const nextSeen = row.seen + 1;
    const nextCorrect = row.correct + (isCorrect ? 1 : 0);
    const nextStreakWrong = isCorrect ? 0 : row.streak_wrong + 1;
    db.prepare('UPDATE mistakes SET seen=?, correct=?, streak_wrong=?, last_ts=? WHERE word=?').run(
      nextSeen,
      nextCorrect,
      nextStreakWrong,
      ts,
      word
    );
  }

  // Motivation single-row update (id=1)
  const today = new Date(ts).toISOString().slice(0, 10);
  const m = db.prepare('SELECT * FROM motivation WHERE id=1').get() as any;
  if (!m) {
    db.prepare(
      'INSERT INTO motivation (id, today_count, streak_days, week_total, last_updated) VALUES (1,1,1,1,?)'
    ).run(today);
  } else {
    const last = m.last_updated as string | null;
    const lastDate = last ?? today;
    const isSameDay = lastDate === today;
    const yesterday = new Date(ts);
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.toISOString().slice(0, 10);
    const isYesterday = lastDate === y;
    const nextStreak = isYesterday ? m.streak_days + 1 : isSameDay ? m.streak_days : 1;
    const nextToday = isSameDay ? m.today_count + 1 : 1;
    // Simplified week reset: reset when ISO week changes
    const weekOf = (d: string) => {
      const dt = new Date(d);
      const t = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
      const nDay = (t.getUTCDay() + 6) % 7;
      t.setUTCDate(t.getUTCDate() - nDay + 3);
      const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
      const nDay2 = (firstThursday.getUTCDay() + 6) % 7;
      firstThursday.setUTCDate(firstThursday.getUTCDate() - nDay2 + 3);
      const week = 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 864e5));
      return `${t.getUTCFullYear()}-W${week}`;
    };
    const sameWeek = weekOf(lastDate) === weekOf(today);
    const nextWeekTotal = sameWeek ? m.week_total + 1 : 1;
    db.prepare('UPDATE motivation SET today_count=?, streak_days=?, week_total=?, last_updated=? WHERE id=1').run(
      nextToday,
      nextStreak,
      nextWeekTotal,
      today
    );
  }
}

export function getMistakes() {
  const rows = db.prepare('SELECT * FROM mistakes').all() as any[];
  const map: Record<string, { seen: number; correct: number; streakWrong: number; lastTs?: number }> = {};
  for (const r of rows) {
    map[r.word] = {
      seen: r.seen,
      correct: r.correct,
      streakWrong: r.streak_wrong,
      lastTs: r.last_ts ?? undefined,
    };
  }
  return map;
}

export function getMotivation() {
  const r = db.prepare('SELECT * FROM motivation WHERE id=1').get() as any;
  return r
    ? {
        todayCount: r.today_count,
        streakDays: r.streak_days,
        weekTotal: r.week_total,
        lastUpdated: r.last_updated ?? null,
      }
    : { todayCount: 0, streakDays: 0, weekTotal: 0, lastUpdated: null };
}
