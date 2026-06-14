import { Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getMistakes, getMotivation, getWords } from '../../lib/api';
import { topMisses, type MissRow } from '../../lib/history';
import type { MotivationStats } from '../../lib/types';

type Props = { onStart: () => void };

const TOP_N = 5;

function formatDate(ts?: number): string {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleDateString();
  } catch {
    return '';
  }
}

/**
 * Home screen: a read-only summary of practice history (today / streak / week
 * and the most-missed words) plus the entry point into practice.
 */
export default function HomePage({ onStart }: Props) {
  const [motivation, setMotivation] = useState<MotivationStats | null>(null);
  const [misses, setMisses] = useState<MissRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([getMotivation(), getMistakes(), getWords()])
      .then(([m, mistakes, words]) => {
        if (!alive) return;
        setMotivation(m);
        setMisses(topMisses(mistakes, words, TOP_N));
      })
      .catch((e) => console.error('Failed to load history', e))
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const hasActivity = !!motivation && (motivation.todayCount > 0 || motivation.weekTotal > 0 || misses.length > 0);

  return (
    <Stack spacing={3} alignItems='center' sx={{ py: 6 }}>
      <Typography variant='h4' align='center'>
        IELTS Listening - Spelling Practice
      </Typography>

      {loaded && hasActivity && motivation && (
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 420 }}>
          <Stack direction='row' spacing={1} justifyContent='center' flexWrap='wrap' useFlexGap>
            <Chip label={`今日 ${motivation.todayCount}問`} color='primary' variant='outlined' />
            <Chip label={`🔥 ${motivation.streakDays}日連続`} color='secondary' variant='outlined' />
            <Chip label={`今週 ${motivation.weekTotal}問`} variant='outlined' />
          </Stack>

          {misses.length > 0 && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant='subtitle2' sx={{ mb: 1.5, opacity: 0.8 }}>
                よく間違える語
              </Typography>
              <Stack divider={<Divider flexItem sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />} spacing={1}>
                {misses.map((r) => (
                  <Stack key={r.en} direction='row' alignItems='baseline' justifyContent='space-between' spacing={2}>
                    <Box>
                      <Typography component='span'>{r.en}</Typography>
                      {r.ja && (
                        <Typography component='span' variant='body2' sx={{ ml: 1, opacity: 0.7 }}>
                          {r.ja}
                        </Typography>
                      )}
                      <Typography variant='caption' sx={{ display: 'block', opacity: 0.55 }}>
                        出題{r.seen}回・{formatDate(r.lastTs)}
                      </Typography>
                    </Box>
                    <Typography color='error' sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                      ×{r.misses}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}
        </Stack>
      )}

      {loaded && !hasActivity && (
        <Typography variant='body2' align='center' sx={{ opacity: 0.7 }}>
          まだ履歴がありません。最初の1問から始めよう！
        </Typography>
      )}

      <Button variant='contained' size='large' onClick={onStart}>
        今すぐ練習
      </Button>
    </Stack>
  );
}
