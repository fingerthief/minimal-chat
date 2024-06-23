// audio-utils.js
import { audioQueue, audioIsPlaying } from '@/libs/state-management/state';

let audioContext;
let microphone;
let echoCanceller;

const logDebug = (message) => {
  console.log(`[Audio Utils]: ${message}`);
};

const ensureAudioContext = () => {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const playNextAudio = () => {
  if (audioQueue.value.length > 0 && !audioIsPlaying.value) {
    const audioBlob = audioQueue.value.shift();
    logDebug(`Playing next audio. Queue length: ${audioQueue.value.length}`);

    const reader = new FileReader();
    reader.onload = () => {
      ensureAudioContext().decodeAudioData(reader.result, (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);

        source.onended = () => {
          logDebug(`Audio ended. Queue length: ${audioQueue.value.length}`);
          audioIsPlaying.value = false;
          playNextAudio();
        };

        source.start(0);
        logDebug('Audio started playing.');
        audioIsPlaying.value = true;
      }, (error) => {
        logDebug(`Error decoding audio: ${error.message}`);
        audioIsPlaying.value = false;
        playNextAudio();
      });
    };

    reader.readAsArrayBuffer(audioBlob);
  } else {
    logDebug('Audio queue is empty or audio is already playing.');
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

export const setupEchoCancellation = async () => {
  audioContext = ensureAudioContext();
  
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  microphone = audioContext.createMediaStreamSource(stream);

  echoCanceller = audioContext.createEchoModerator ? audioContext.createEchoModerator() : audioContext.createGain();

  microphone.connect(echoCanceller);
  // Do not connect echoCanceller to audioContext.destination

  return { audioContext, echoCanceller, stream };
};

export const getProcessedAudioStream = () => {
  if (!echoCanceller) {
    throw new Error('Echo cancellation not set up. Call setupEchoCancellation first.');
  }
  const processorNode = audioContext.createMediaStreamDestination();
  echoCanceller.connect(processorNode);
  return processorNode.stream;
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

export const startMediaRecorder = (stream, currentAudioChunks, mimeType, recognizedSentences) => {
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      currentAudioChunks.push(event.data);
      logDebug('Audio data available.');
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(currentAudioChunks, { type: mimeType });
    currentAudioChunks.length = 0;

    if (recognizedSentences.value.length > 0) {
      recognizedSentences.value[recognizedSentences.value.length - 1].blob = blob;
      logDebug('MediaRecorder stopped. Audio blob created.');
    }
  };

  logDebug('MediaRecorder created.');
  return mediaRecorder;
};
