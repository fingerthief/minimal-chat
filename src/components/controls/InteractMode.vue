<template>
  <div class="interact-mode" @click="toggleInteractMode">
    <div v-if="isLoading" class="loading-message">Initializing, please wait...</div>
    <div class="visualizer-container" :class="state">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="waveMask">
            <rect width="100%" height="100%" fill="white" />
            <path :d="wavePath" fill="black" />
          </mask>
        </defs>
        <circle cx="100" cy="100" r="50" :class="state" />
        <circle cx="100" cy="100" r="50" :class="state" mask="url(#waveMask)" />
        <path :d="wavePath" />
      </svg>
    </div>
    <ul v-if="recognizedSentences.length > 0" class="sentence-list">
      <li v-for="(sentence, index) in recognizedSentences" :key="index">
        <p>{{ sentence.text }}</p>
        <button v-if="sentence.blob" @click="playAudio(sentence.blob)">Play</button>
        <button v-if="sentence.blob" @click="downloadAudio(sentence.blob, index)">Download</button>
      </li>
    </ul>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { fetchSTTResponse } from '@/libs/api-access/gpt-api-access';
import { useWhisper, isInteractModeOpen } from '@/libs/state-management/state';
import { 
  getSupportedMimeType, 
  checkMicrophoneAvailability, 
  checkWebSpeechAPI, 
  startMediaRecorder, 
  playAudio, 
  downloadAudio, 
  setupEchoCancellation, 
  getProcessedAudioStream
} from '@/libs/utils/audio-utils';

const emit = defineEmits(['recognized-sentence', 'close-interact-mode']);

const isRecording = ref(false);
const isLoading = ref(false);
const errorMessage = ref(null);
const analyser = ref(null);
const dataArray = ref(null);
const mediaRecorder = ref(null);
const recognizedSentences = ref([]);
let currentAudioChunks = [];
const wavePath = ref('');
const state = ref('idle');
const mimeType = getSupportedMimeType();
const recognition = ref(null);
let audioContextRef = null;
let stream = null;

const stopRecording = () => {
  console.log('Stopping recording');
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
  }

  if (recognition.value) {
    recognition.value.stop();
  }

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  isRecording.value = false;
  state.value = 'idle';
};

const toggleInteractMode = () => {
  console.log('Toggling interact mode', isRecording.value);
  if (isRecording.value) {
    stopRecording();
    closeInteractMode();
  } else {
    startRecording();
  }
};

const closeInteractMode = () => {
  console.log('Closing interact mode');
  stopRecording();
  emit('close-interact-mode');
};

const drawAudioWaveform = () => {
  if (!isRecording.value || !analyser.value || !dataArray.value) return;

  analyser.value.getByteTimeDomainData(dataArray.value);

  const radius = 50;
  const centerX = 100;
  const centerY = 100;
  const amplificationFactor = 20;
  const smoothingFactor = 0.005;
  const sliceAngle = (Math.PI * 2) / dataArray.value.length;

  const lerp = (a, b, t) => a + (b - a) * t;

  let pathData = [];
  let previousX = centerX + radius * Math.cos(0);
  let previousY = centerY + radius * Math.sin(0);

  for (let i = 0; i < dataArray.value.length; i++) {
    const v = dataArray.value[i] / 128.0;
    const angle = i * sliceAngle;
    const radiusVariation = radius * (1 + (v - 1) * 0.2 * amplificationFactor);
    const targetX = centerX + radiusVariation * Math.cos(angle);
    const targetY = centerY + radiusVariation * Math.sin(angle);

    const x = lerp(previousX, targetX, smoothingFactor);
    const y = lerp(previousY, targetY, smoothingFactor);

    if (i === 0) {
      pathData.push(`M ${x} ${y}`);
    } else {
      pathData.push(`L ${x} ${y}`);
    }

    previousX = targetX;
    previousY = targetY;
  }

  pathData.push('Z');
  wavePath.value = pathData.join(' ');

  if (isRecording.value) {
    requestAnimationFrame(drawAudioWaveform);
  }
};

const startRecording = async () => {
  if (isRecording.value) {
    console.log('Already recording, ignoring start request');
    return;
  }

  console.log('Starting recording');
  isLoading.value = true;
  state.value = 'fetching';
  errorMessage.value = null;

  if (!checkWebSpeechAPI()) {
    errorMessage.value = 'Web Speech API is not supported in this browser.';
    isLoading.value = false;
    state.value = 'error';
    return;
  }

  if (!(await checkMicrophoneAvailability())) {
    errorMessage.value = 'Microphone not available or permission denied.';
    isLoading.value = false;
    state.value = 'error';
    return;
  }

  try {
    const result = await setupEchoCancellation();
    audioContextRef = result.audioContext;
    stream = result.stream;
    const processedStream = getProcessedAudioStream();
    
    analyser.value = audioContextRef.createAnalyser();
    const source = audioContextRef.createMediaStreamSource(processedStream);
    source.connect(analyser.value);
    analyser.value.fftSize = 2048;
    dataArray.value = new Uint8Array(analyser.value.frequencyBinCount);

    isRecording.value = true;

    recognition.value = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.value.continuous = true;
    recognition.value.interimResults = false;
    recognition.value.lang = 'en-US';

    setupRecognitionEventListeners(processedStream);

    recognition.value.start();
    state.value = 'listening';

    await nextTick();
    drawAudioWaveform();

    isLoading.value = false;
    console.log('Recording started successfully');
  } catch (error) {
    console.error('Error in startRecording:', error);
    errorMessage.value = 'Error starting recording or speech recognition.';
    state.value = 'error';
    isLoading.value = false;
  }
};

const setupRecognitionEventListeners = (processedStream) => {
  recognition.value.onspeechstart = () => {
    console.log("Speech has been detected");

    if (!isInteractModeOpen.value) {
      return;
    }

    if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
      mediaRecorder.value = startMediaRecorder(processedStream, currentAudioChunks, mimeType, recognizedSentences);
      mediaRecorder.value.start();
    }
  };

  recognition.value.addEventListener("speechend", () => {
    console.log("Speech has stopped being detected");

    if (!isInteractModeOpen.value) {
      return;
    }

    if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
      mediaRecorder.value.stop();
    }
  });

  recognition.value.onresult = async (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.trim();
    if (transcript.length > 0) {
      state.value = 'transcribing';
      recognizedSentences.value.push({ text: transcript, blob: null });

      if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
        mediaRecorder.value.stop();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (useWhisper.value) {
        const lastBlob = recognizedSentences.value[recognizedSentences.value.length - 1].blob;
        if (lastBlob) {
          isLoading.value = true;
          state.value = 'fetching';
          try {
            const transcription = await fetchSTTResponse(lastBlob, mimeType);
            recognizedSentences.value[recognizedSentences.value.length - 1].text = transcription;
            emit('recognized-sentence', { text: transcription, timestamp: new Date().toISOString() });
          } catch (error) {
            errorMessage.value = `Transcription error: ${error.message}`;
          } finally {
            isLoading.value = false;
            state.value = 'listening';
          }
        }
      } else {
        emit('recognized-sentence', { text: transcript, timestamp: new Date().toISOString() });
        state.value = 'listening';
      }
    }
  };

  recognition.value.onerror = (event) => {
    if (event.error == "no-speech") {
      return;
    }

    console.error('Speech recognition error:', event.error);
    errorMessage.value = `Speech recognition error: ${event.error}`;
    state.value = 'error';

    if (event.error === 'aborted' && isRecording.value) {
      setTimeout(() => {
        recognition.value.start();
      }, 1000);
    }
  };

  recognition.value.onend = () => {
    console.log("Speech recognition ended");
    if (isRecording.value) {
      setTimeout(() => {
        recognition.value.start();
      }, 1000);
    }
  };
};

onMounted(async () => {
  console.log('InteractMode component mounted');
  if (!checkWebSpeechAPI()) {
    errorMessage.value = 'Web Speech API is not supported in this browser.';
    state.value = 'error';
  }

  await startRecording();
});

onUnmounted(() => {
  console.log('InteractMode component unmounting');
  stopRecording();
  if (audioContextRef) {
    audioContextRef.close().catch(console.error);
  }
});

watch(isInteractModeOpen, (newValue) => {
  console.log('isInteractModeOpen changed:', newValue);
  if (!newValue && isRecording.value) {
    stopRecording();
  }
});
</script>

<style scoped lang="scss">
.interact-mode {
  cursor: pointer;
}

.chevron-icon {
  position: absolute;
  top: 20px;
  left: 20px;
  cursor: pointer;
}

.visualizer-container {
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
}

.circle-container {
  width: 200px;
  height: 200px;
  position: relative;
  transition: stroke 150ms ease, fill 150ms ease;
}

circle {
  fill: none;
  stroke-width: 10;
}

path {
  fill: none;
  stroke-width: 10;
  transition: d 150ms ease;
}

.listening {
  --circle-visualizer-color: lightblue;
}

.listening circle,
.listening path {
  stroke: var(--circle-visualizer-color);
}

.transcribing {
  --circle-visualizer-color: lightgreen;
}

.transcribing circle,
.transcribing path {
  stroke: var(--circle-visualizer-color);
}

.fetching {
  --circle-visualizer-color: lightcoral;
}

.fetching circle,
.fetching path {
  stroke: var(--circle-visualizer-color);
}

.speaking {
  --circle-visualizer-color: lightgoldenrodyellow;
}

.speaking circle,
.speaking path {
  stroke: var(--circle-visualizer-color);
}

.error {
  --circle-visualizer-color: red;
}

.error circle,
.error path {
  stroke: var(--circle-visualizer-color);
}

.sentence-list {
  display: none;
  margin-top: 20px;
  list-style-type: none;
  padding: 0;
  max-width: 300px;
  text-align: left;
  position: absolute;
  bottom: 6rem;
  width: 500px;
}

.sentence-list li {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
  background-color: #f9f9f9;
  color: black;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
}

.sentence-list li p {
  width: 100%;
}

.sentence-list li button {
  width: calc(50% - 1rem);
}

.loading-message {
  display: none;
  margin-top: 20px;
  color: #000;
}

.error-message {
  margin-top: 20px;
  position: absolute;
  color: #fff;
  background: #850000;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  bottom: 3.5rem;
  right: 0;
  font-size: 12px;
  text-align: center;
  width: fit-content;
}
</style>
