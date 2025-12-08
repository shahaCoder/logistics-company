/**
 * Utility to force English keyboard layout only
 * Blocks IME (Input Method Editor) for non-English languages
 */

/**
 * Prevent IME composition (blocks non-English input methods)
 */
export function preventNonEnglishIME(e: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.preventDefault();
  e.stopPropagation();
  
  // Show visual feedback
  const target = e.currentTarget;
  target.style.borderColor = '#ef4444';
  target.style.backgroundColor = '#fef2f2';
  
  setTimeout(() => {
    target.style.borderColor = '';
    target.style.backgroundColor = '';
  }, 500);
  
  return false;
}

/**
 * Block non-English characters on input
 */
export function blockNonEnglishInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
  const value = e.target.value;
  // Remove any non-English characters that might have been pasted
  const englishOnly = value.replace(/[^A-Za-z0-9\s.,\-'()/&#@]/g, '');
  
  if (englishOnly !== value) {
    e.target.value = englishOnly;
    // Trigger change event
    const event = new Event('input', { bubbles: true });
    e.target.dispatchEvent(event);
    
    // Visual feedback
    e.target.style.borderColor = '#ef4444';
    e.target.style.backgroundColor = '#fef2f2';
    
    setTimeout(() => {
      e.target.style.borderColor = '';
      e.target.style.backgroundColor = '';
    }, 500);
  }
}

/**
 * Block non-English key presses
 */
export function blockNonEnglishKeyPress(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  // Allow control keys
  const controlKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End', 'PageUp', 'PageDown', 'Insert'
  ];
  
  if (controlKeys.includes(e.key)) {
    return;
  }
  
  // Allow Ctrl/Cmd combinations
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }
  
  // Block if not English character, number, or allowed punctuation
  const isEnglish = /^[A-Za-z0-9\s.,\-'()/&#@]$/.test(e.key);
  
  if (!isEnglish) {
    e.preventDefault();
    e.stopPropagation();
    
    // Visual feedback
    const target = e.currentTarget;
    target.style.borderColor = '#ef4444';
    target.style.backgroundColor = '#fef2f2';
    
    setTimeout(() => {
      target.style.borderColor = '';
      target.style.backgroundColor = '';
    }, 300);
    
    return false;
  }
}

/**
 * Combined handler for input fields to force English only
 */
export const englishOnlyInputProps = {
  lang: 'en' as const,
  inputMode: 'text' as const,
  autoComplete: 'off' as const,
  onCompositionStart: preventNonEnglishIME,
  onCompositionUpdate: preventNonEnglishIME,
  onCompositionEnd: preventNonEnglishIME,
  onKeyPress: blockNonEnglishKeyPress,
  onPaste: (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Allow paste, but filter content
    const pastedText = e.clipboardData.getData('text');
    const englishOnly = pastedText.replace(/[^A-Za-z0-9\s.,\-'()/&#@]/g, '');
    
    if (englishOnly !== pastedText) {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      const currentValue = (target as HTMLInputElement).value || '';
      const newValue = currentValue.slice(0, start) + englishOnly + currentValue.slice(end);
      
      (target as HTMLInputElement).value = newValue;
      
      // Visual feedback
      target.style.borderColor = '#ef4444';
      target.style.backgroundColor = '#fef2f2';
      
      setTimeout(() => {
        target.style.borderColor = '';
        target.style.backgroundColor = '';
      }, 500);
      
      // Trigger change event
      const changeEvent = new Event('input', { bubbles: true });
      target.dispatchEvent(changeEvent);
    }
  },
};

