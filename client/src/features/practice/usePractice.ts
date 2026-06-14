import { useCallback, useEffect, useRef, useState } from 'react';
import { getMistakes, getVoices, getWords, postResult, ttsUrl } from '../../lib/api';
import { spellingEqual } from '../../lib/normalize';
import { pickUpWord } from '../../lib/picker';
import { getSettings, setSettings } from '../../lib/storage';
import type { MistakesMap, Word } from '../../lib/types';

type Feedback = { open: boolean; correct: boolean | null; answer?: string };

/**
 * Hook encapsulating practice flow: load data, countdown, one-shot TTS playback, grading, and progression.
 */
export function usePractice() {
  const [words, setWords] = useState<Word[]>([]);
  const [mistakes, setMistakes] = useState<MistakesMap>({});
  const [voices, setVoices] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [current, setCurrent] = useState<Word | null>(null);
  const [roundWord, setRoundWord] = useState<Word | null>(null);
  const [played, setPlayed] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ open: false, correct: null });
  const [settingsState, setSettingsState] = useState(getSettings());
  const playedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    Promise.all([getWords(), getMistakes(), getVoices()]).then(([w, m, v]) => {
      setWords(w);
      setMistakes(m);
      setVoices(v);
      // Default voice if not set
      if (!settingsState.voice && v.length) {
        const nextVoice = v.includes('Samantha') ? 'Samantha' : v[0];
        const next = { ...settingsState, voice: nextVoice };
        setSettingsState(next);
        setSettings(next);
      }
    });
  }, [settingsState]);

  const canStart = words.length > 0 && !busy;

  const pickNext = useCallback(() => {
    const w = pickUpWord(words, mistakes);
    setCurrent(w);
    setInput('');
    playedRef.current = false;
    setPlayed(false);
  }, [words, mistakes]);

  const start = useCallback(() => {
    if (!canStart || playedRef.current) return;
    setBusy(true);
    setFeedback({ open: false, correct: null });
    setCountdown(3);
    let n = 3;
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(id);
        setCountdown(null);
        // Play once
        if (current) {
          setRoundWord(current); // lock the round target to avoid mismatch
          const u = ttsUrl(current.en, settingsState.voice);
          const a = new Audio(u);
          a.volume = Math.max(0, Math.min(1, settingsState.volume));
          audioRef.current = a;
          if (!playedRef.current) {
            playedRef.current = true;
            setPlayed(true);
            a.play().catch(() => {});
          }
        }
        setBusy(false);
      } else {
        setCountdown(n);
      }
    }, 1000);
  }, [canStart, current]);

  const submit = useCallback(async () => {
    const target = roundWord ?? current;
    if (!target) return;
    const ok = spellingEqual(input, target.en, target.spellingMap);
    setFeedback({ open: true, correct: ok, answer: target.en });
    try {
      await postResult(target.en, ok);
      const nextMistakes = await getMistakes();
      setMistakes(nextMistakes);
    } catch {}
  }, [current, input]);

  const next = useCallback(() => {
    setFeedback({ open: false, correct: null });
    setRoundWord(null);
    pickNext();
    setTimeout(() => start(), 200); // quick next
  }, [pickNext, start]);

  // Initialize first word
  useEffect(() => {
    if (words.length && !current) pickNext();
  }, [words, current, pickNext]);

  const note = 'Press Enter to grade, ⌘+Enter for the next word.\nNote: each word plays only once.';

  return {
    state: { current, input, countdown, feedback, voices, settings: settingsState, note, played },
    setInput,
    setVoice: (v: string) => {
      const next = { ...settingsState, voice: v };
      setSettingsState(next);
      setSettings(next);
    },
    setVolume: (vol: number) => {
      const next = { ...settingsState, volume: Math.max(0, Math.min(1, vol)) };
      setSettingsState(next);
      setSettings(next);
    },
    start,
    submit,
    next,
    canStart,
  };
}
