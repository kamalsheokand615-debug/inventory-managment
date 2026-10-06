import { InventoryItem, LanguageCode } from '../types';

// Web Speech Synthesis (Speaker feature to announce stock aloud)
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

// Find appropriate voice based on language preference
function getPreferredVoice(langCode: LanguageCode): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  if (langCode === 'hi') {
    // Look for Hindi voice
    const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.lang.includes('hi-IN'));
    if (hiVoice) return hiVoice;
  }

  // Fallback to Indian English or standard English
  const inEnVoice = voices.find(v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india'));
  if (inEnVoice) return inEnVoice;

  const enVoice = voices.find(v => v.lang.startsWith('en'));
  return enVoice || voices[0] || null;
}

export function speakText(
  text: string, 
  lang: LanguageCode = 'hi', 
  rate: number = 0.95,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported on this browser');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    const voice = getPreferredVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis failure:', err);
    return false;
  }
}

// Speak item stock in natural Hindi or English
export function speakItemStock(
  item: InventoryItem, 
  lang: LanguageCode = 'hi',
  onStart?: () => void,
  onEnd?: () => void
) {
  let message = '';
  const itemName = item.nameHi && lang === 'hi' ? item.nameHi : item.name;

  if (lang === 'hi' || lang === 'hinglish') {
    if (item.quantity === 0) {
      message = `सावधान! ${itemName} का स्टॉक समाप्त हो चुका है! वर्तमान में शून्य ${item.unit} बचा है। कृपया तुरंत ऑर्डर करें।`;
    } else if (item.quantity <= item.minThreshold) {
      message = `अलर्ट! ${itemName} का स्टॉक कम है। वर्तमान में केवल ${item.quantity} ${item.unit} शेष है, जबकि न्यूनतम सीमा ${item.minThreshold} है।`;
    } else {
      message = `${itemName} का वर्तमान स्टॉक ${item.quantity} ${item.unit} है। यह स्टॉक पर्याप्त मात्रा में उपलब्ध है। बिक्री मूल्य ${item.sellingPrice} रुपये है।`;
    }
  } else {
    if (item.quantity === 0) {
      message = `Attention! ${item.name} is completely out of stock. Zero ${item.unit} available. Please reorder immediately.`;
    } else if (item.quantity <= item.minThreshold) {
      message = `Low stock alert! ${item.name} has only ${item.quantity} ${item.unit} remaining. Threshold is ${item.minThreshold}.`;
    } else {
      message = `${item.name} has ${item.quantity} ${item.unit} in stock. Selling price is ${item.sellingPrice}. Stock level is healthy.`;
    }
  }

  return speakText(message, lang, 0.95, onStart, onEnd);
}

// Speak full inventory summary
export function speakStockSummary(
  items: InventoryItem[],
  lang: LanguageCode = 'hi',
  onStart?: () => void,
  onEnd?: () => void
) {
  const total = items.length;
  const outOfStock = items.filter(i => i.quantity === 0);
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold);
  const inStock = items.filter(i => i.quantity > i.minThreshold);

  let message = '';

  if (lang === 'hi' || lang === 'hinglish') {
    message = `दुकान की स्टॉक रिपोर्ट: आपकी इन्वेंटरी में कुल ${total} आइटम हैं। `;
    if (outOfStock.length > 0) {
      const outNames = outOfStock.slice(0, 3).map(i => i.nameHi || i.name).join(', ');
      message += `इनमें से ${outOfStock.length} आइटम खत्म हो चुके हैं, जैसे कि ${outNames}। `;
    } else {
      message += `कोई भी आइटम शून्य स्टॉक पर नहीं है। `;
    }

    if (lowStock.length > 0) {
      const lowNames = lowStock.slice(0, 3).map(i => i.nameHi || i.name).join(', ');
      message += `${lowStock.length} आइटम का स्टॉक कम है, जैसे कि ${lowNames}। `;
    } else {
      message += `अन्य सभी आइटम पर्याप्त मात्रा में उपलब्ध हैं। `;
    }

    message += `कुल ${inStock.length} आइटम का स्टॉक पूरी तरह सुरक्षित है। धन्यवाद!`;
  } else {
    message = `Inventory summary report: Total ${total} products. `;
    if (outOfStock.length > 0) {
      const outNames = outOfStock.slice(0, 3).map(i => i.name).join(', ');
      message += `${outOfStock.length} items are out of stock, including ${outNames}. `;
    } else {
      message += `No items are completely out of stock. `;
    }

    if (lowStock.length > 0) {
      const lowNames = lowStock.slice(0, 3).map(i => i.name).join(', ');
      message += `${lowStock.length} items are running low, including ${lowNames}. `;
    }

    message += `${inStock.length} items have healthy stock. Thank you!`;
  }

  return speakText(message, lang, 0.95, onStart, onEnd);
}

// Voice Recognition for search & queries
let hasUserInteracted = false;

if (typeof window !== 'undefined') {
  const handleInteraction = () => {
    hasUserInteracted = true;
    window.removeEventListener('click', handleInteraction);
    window.removeEventListener('touchstart', handleInteraction);
    window.removeEventListener('keydown', handleInteraction);
  };
  window.addEventListener('click', handleInteraction, { passive: true });
  window.addEventListener('touchstart', handleInteraction, { passive: true });
  window.addEventListener('keydown', handleInteraction, { passive: true });
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // Only expose speech recognition support after the user has interacted with the website.
  // This prevents eager webviews or browsers from scanning the window object and auto-prompting for mic permission on page load.
  if (!hasUserInteracted) return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function startListening(
  lang: LanguageCode,
  onResult: (transcript: string) => void,
  onError?: (err: unknown) => void,
  onEnd?: () => void
): { stop: () => void } | null {
  // If we are explicitly starting to listen, the user has clicked the mic button, so we can force set interaction state to true.
  hasUserInteracted = true;
  
  if (typeof window === 'undefined') return null;
  const hasSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  if (!hasSupport) return null;

  try {
    const SpeechRecognitionClass = 
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition || 
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      if (onError) onError(event);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
    };
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}
