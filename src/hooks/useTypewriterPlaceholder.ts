import { useEffect, useState } from 'react';

const TYPE_MS = 175;
const DELETE_MS = 90;
const PAUSE_MS = 2800;
const NEXT_WORD_DELAY_MS = 150;

/** Shared list covering major app + EXO Marketplace categories, used by both search bars. */
export const TYPEWRITER_SEARCH_TERMS = [
  'Plumber',
  'Electrician',
  'AC Service',
  'Hospitals',
  'Wedding Halls',
  'Cleaning',
  'Properties',
  'Cars',
  'Mobiles',
];

/**
 * Cycles `prefix + '<word>'` through `words`, typing/pausing/deleting like a typewriter — a full
 * cycle (type + pause + delete) averages ~5s with the default timings.
 * Pass `paused: true` (e.g. while the user has typed a real query) to freeze and hide it.
 */
export function useTypewriterPlaceholder(words: string[], prefix: string, paused = false): string {
  const [text, setText] = useState(prefix);

  useEffect(() => {
    if (paused || words.length === 0) return undefined;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const run = (wordIndex: number, charIndex: number, phase: 'typing' | 'deleting') => {
      if (cancelled) return;
      const word = words[wordIndex % words.length];
      const closingQuote = phase === 'typing' && charIndex === word.length ? "'" : '';
      setText(`${prefix}${word.slice(0, charIndex)}${closingQuote}`);

      if (phase === 'typing') {
        if (charIndex < word.length) {
          timer = setTimeout(() => run(wordIndex, charIndex + 1, 'typing'), TYPE_MS);
        } else {
          timer = setTimeout(() => run(wordIndex, charIndex, 'deleting'), PAUSE_MS);
        }
      } else if (charIndex > 0) {
        timer = setTimeout(() => run(wordIndex, charIndex - 1, 'deleting'), DELETE_MS);
      } else {
        timer = setTimeout(() => run(wordIndex + 1, 0, 'typing'), NEXT_WORD_DELAY_MS);
      }
    };

    run(0, 0, 'typing');
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paused, words, prefix]);

  return paused ? prefix : text;
}
