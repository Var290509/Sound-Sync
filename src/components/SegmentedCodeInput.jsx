import React, { useRef, useEffect } from 'react';

export default function SegmentedCodeInput({ value = '', onChange, length = 6, disabled = false }) {
  const inputsRef = useRef([]);

  // Ensure value is an array of length characters
  const charArray = (value || '').toUpperCase().padEnd(length, ' ').slice(0, length).split('');

  const handleChange = (index, char) => {
    if (disabled) return;
    const cleanChar = char.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const newChars = [...charArray];
    newChars[index] = cleanChar || ' ';
    const newCode = newChars.join('').trimEnd();
    onChange(newCode);

    // Auto advance to next input
    if (cleanChar && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;
    if (e.key === 'Backspace') {
      if (charArray[index] === ' ' && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else {
        const newChars = [...charArray];
        newChars[index] = ' ';
        onChange(newChars.join('').trimEnd());
        if (index > 0 && !charArray[index].trim()) {
          inputsRef.current[index - 1]?.focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
      {Array.from({ length }).map((_, index) => {
        const char = charArray[index]?.trim() || '';
        return (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="text"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl border-2 transition-all duration-200 outline-none shadow-sm ${
              char
                ? 'border-theme-accent bg-theme-accent/10 text-theme-accent shadow-[0_0_15px_var(--color-glow)]'
                : 'border-theme-border bg-theme-surface text-theme-text hover:border-theme-borderHover'
            } focus:border-theme-accent focus:bg-theme-surfaceHover focus:scale-105`}
            placeholder="•"
          />
        );
      })}
    </div>
  );
}
