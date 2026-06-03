/**
 * useTypewriter — animates text character by character.
 *
 * @param {string}  text      - The full string to type out
 * @param {number}  speed     - Milliseconds per character (default 18)
 * @param {boolean} enabled   - Start typing immediately when true (default true)
 *
 * Returns { displayed, isDone }
 */

import { useState, useEffect, useRef } from 'react';

export const useTypewriter = (text = '', speed = 18, enabled = true) => {
  const [displayed, setDisplayed] = useState('');
  const [isDone,    setIsDone]    = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Reset whenever text changes
    setDisplayed('');
    setIsDone(false);
    indexRef.current = 0;

    if (!enabled || !text) {
      setDisplayed(text);
      setIsDone(true);
      return;
    }

    const tick = () => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        setIsDone(true);
        clearInterval(timerRef.current);
      }
    };

    timerRef.current = setInterval(tick, speed);
    return () => clearInterval(timerRef.current);
  }, [text, speed, enabled]);

  return { displayed, isDone };
};
