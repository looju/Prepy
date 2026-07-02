import hark from "hark";

export const detectMicrophoneActivities = async (
  onSpeaking: () => void,
  onStoppedSpeaking: () => void
) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const speechEvents = hark(stream);
  speechEvents.on("speaking", onSpeaking);
  speechEvents.on("stopped_speaking", onStoppedSpeaking);
  return () => stream.getTracks().forEach((t) => t.stop());
};
