// /libs/utils/audio-utils.js
import { audioQueue, audioIsPlaying } from '@/libs/state-management/state';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();  // Create a single AudioContext instance

const logDebug = (message) => {
  console.log(`[Audio Utils]: ${message}`);
};

const playNextAudio = () => {
  if (audioQueue.value.length > 0) {
    const audioBlob = audioQueue.value.shift();
    logDebug(`Playing next audio. Queue length: ${audioQueue.value.length}`);

    const reader = new FileReader();
    reader.onload = () => {
      audioContext.decodeAudioData(reader.result, (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);

        source.onended = () => {
          logDebug(`Audio ended. Queue length: ${audioQueue.value.length}`);
          audioIsPlaying.value = false;  // Reset the flag when the audio ends
          playNextAudio();  // Recursively play the next audio
        };

        source.start(0);
        logDebug('Audio started playing.');
        audioIsPlaying.value = true;  // Set the flag when an audio starts playing
      }, (error) => {
        logDebug(`Error decoding audio: ${error.message}`);
        audioIsPlaying.value = false;  // Reset the flag on error
        playNextAudio();  // Try to play the next audio
      });
    };

    reader.readAsArrayBuffer(audioBlob);
  } else {
    logDebug('Audio queue is empty.');
  }
};

export const addToAudioQueue = (blob) => {
  logDebug(`Adding audio to queue. Current queue length: ${audioQueue.value.length}`);
  audioQueue.value.push(blob);
  if (!audioIsPlaying.value) {
    logDebug('No audio currently playing. Initiating playback.');
    playNextAudio();
  } else {
    logDebug('Audio is already playing. Added to queue.');
  }
};

export const playAudio = (blob) => {
  logDebug('playAudio called.');
  addToAudioQueue(blob);
};

export const downloadAudio = (blob, index) => {
  if (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const extension = blob.type.split('/')[1]; // Get the extension from the MIME type
    a.download = `sentence_${index + 1}.${extension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    logDebug(`Audio downloaded: sentence_${index + 1}.${extension}`);
  }
};

export const getSupportedMimeType = () => {
  const mimeTypes = [
    'audio/webm',
    'audio/mp4',
    'audio/wav',
    'audio/mp3',
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      logDebug(`Supported MIME type found: ${mimeType}`);
      return mimeType;
    }
  }

  logDebug('No supported MIME type found.');
  return null;
};

export const checkMicrophoneAvailability = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    logDebug('Microphone available.');
    return true;
  } catch (error) {
    logDebug('Microphone not available or permission denied.');
    return false;
  }
};

export const checkWebSpeechAPI = () => {
  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  logDebug(`Web Speech API supported: ${supported}`);
  return supported;
};

export const startMediaRecorder = async (stream, mediaRecorder, currentAudioChunks, mimeType, recognizedSentences) => {
  mediaRecorder.value = new MediaRecorder(stream);

  mediaRecorder.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      currentAudioChunks.push(event.data);
      logDebug('Audio data available.');
    }
  };

  mediaRecorder.value.onstop = async () => {
    const blob = new Blob(currentAudioChunks, { type: mimeType });
    currentAudioChunks = [];

    if (recognizedSentences.value.length > 0) {
      recognizedSentences.value[recognizedSentences.value.length - 1].blob = blob;
      logDebug('MediaRecorder stopped. Audio blob created.');
    }
  };

  logDebug('MediaRecorder started.');
};
