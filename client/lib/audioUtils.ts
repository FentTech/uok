// Audio utilities using Web Audio API (no external dependencies needed)

export const audioUtils = {
  // Play a simple beep sound using Web Audio API
  playBeep: (frequency: number = 800, duration: number = 100) => {
    try {
      // Get or create audio context
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create oscillator (generates the sound wave)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set frequency and wave type
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      // Set volume (very quiet so it doesn't startle)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000,
      );

      // Play the beep
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn("Audio beep failed (audio might be disabled):", error);
    }
  },

  // Play a success sound (ascending tones)
  playSuccess: () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      // Create three ascending tones
      const tones = [
        { freq: 400, time: 0 },
        { freq: 600, time: 100 },
        { freq: 800, time: 200 },
      ];

      tones.forEach(({ freq, time }) => {
        const osc = audioContext.createOscillator();
        osc.frequency.value = freq;
        osc.type = "sine";
        osc.connect(gainNode);

        const duration = 150;
        gainNode.gain.setValueAtTime(
          0.1,
          audioContext.currentTime + time / 1000,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + (time + duration) / 1000,
        );

        osc.start(audioContext.currentTime + time / 1000);
        osc.stop(audioContext.currentTime + (time + duration) / 1000);
      });
    } catch (error) {
      console.warn("Success sound failed:", error);
    }
  },

  // Play notification sound
  playNotification: () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      const oscillator = audioContext.createOscillator();
      oscillator.frequency.value = 600;
      oscillator.type = "sine";
      oscillator.connect(gainNode);

      const duration = 200;
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn("Notification sound failed:", error);
    }
  },
};
