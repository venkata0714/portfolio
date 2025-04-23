import { useState, useEffect, useRef, useCallback } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function useSpeechInput({ onResult, lang = "en-US" } = {}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize recognition once
  useEffect(() => {
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.continuous = true; // keep listening until stopped
    recog.interimResults = true; // get partial transcripts
    recog.lang = lang;
    recognitionRef.current = recog;

    recog.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const isFinal = event.results[event.resultIndex].isFinal;
      onResult(transcript, isFinal);
      if (isFinal) {
        // auto-stop on final result
        recog.stop();
        setListening(false);
      }
    };

    recog.onerror = () => {
      recog.stop();
      setListening(false);
    };
    recog.onend = () => setListening(false);

    return () => {
      recog.abort?.();
    };
  }, [onResult, lang]);

  const start = useCallback(() => {
    const recog = recognitionRef.current;
    if (recog && !listening) {
      recog.start();
      setListening(true);
    }
  }, [listening]);

  const stop = useCallback(() => {
    const recog = recognitionRef.current;
    if (recog && listening) {
      recog.stop();
      setListening(false);
    }
  }, [listening]);

  return { listening, start, stop };
}
