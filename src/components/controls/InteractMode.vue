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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { fetchSTTResponse } from '@/libs/api-access/gpt-api-access';
import { useWhisper, isInteractModeOpen } from '@/libs/state-management/state';
import { getSupportedMimeType, checkMicrophoneAvailability, checkWebSpeechAPI, startMediaRecorder, playAudio, downloadAudio } from '@/libs/utils/audio-utils';

const emit = defineEmits(['recognized-sentence', 'close-interact-mode']);

const isRecording = ref(false);
const isLoading = ref(false);
const errorMessage = ref(null);
const audioContext = ref(null);
const analyser = ref(null);
const dataArray = ref(null);
const mediaRecorder = ref(null);
const recognizedSentences = ref([]);
let currentAudioChunks = [];
let vadStream = null;
let lastSpeechTime = 0;
const wavePath = ref('');
const state = ref('listening');
const mimeType = getSupportedMimeType();

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
  }

  if (recognition.value) {
    recognition.value.stop();
  }

  if (vadStream) {
    vadStream.getTracks().forEach(track => track.stop());
    vadStream = null;
  }

  isRecording.value = false;
};

const toggleInteractMode = () => {
  if (isRecording.value) {
    stopRecording();
    closeInteractMode();
  } else {
    startRecording();
  }
};

const closeInteractMode = () => {
  emit('close-interact-mode');
};

const drawAudioWaveform = () => {
  if (!isRecording.value) return;

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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
    analyser.value = audioContext.value.createAnalyser();
    const source = audioContext.value.createMediaStreamSource(stream);
    source.connect(analyser.value);
    analyser.value.fftSize = 2048;
    const bufferLength = analyser.value.frequencyBinCount;
    dataArray.value = new Uint8Array(bufferLength);
    vadStream = stream;

    isRecording.value = true;

    recognition.value.start();
    state.value = 'listening';

    await nextTick();
    drawAudioWaveform();

    isLoading.value = false;
  } catch (error) {
    errorMessage.value = 'Error starting recording or speech recognition.';
    state.value = 'error';
    isLoading.value = false;
  }
};

const recognition = ref(null);

onMounted(async () => {
  if (!checkWebSpeechAPI()) {
    errorMessage.value = 'Web Speech API is not supported in this browser.';
    state.value = 'error';
    return;
  }

  recognition.value = new (window.SpeechRecognition || window.webkitSpeechRecognition)();


  recognition.value.onspeechstart = () => {
    drawAudioWaveform();
    console.log("Speech has been detected");

    if (!isInteractModeOpen.value) {
      return;
    }

    lastSpeechTime = currentTime;
    if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
      startMediaRecorder(stream, mediaRecorder, currentAudioChunks, mimeType, recognizedSentences);
      mediaRecorder.value.start();
    }
  };

  recognition.value.addEventListener("speechend", () => {
    drawAudioWaveform();
    console.log("Speech has stopped being detected");

    if (!isInteractModeOpen.value) {
      return;
    }

    mediaRecorder.value.stop();
  });

  recognition.value.continuous = true;
  recognition.value.interimResults = false;
  recognition.value.lang = 'en-US';

  recognition.value.onresult = async (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.trim();
    if (transcript.length > 0) {
      state.value = 'transcribing';
      recognizedSentences.value.push({ text: transcript, blob: null });

      if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
        mediaRecorder.value.stop();
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for the mediaRecorder to finish processing the last chunk
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
      return; //This prevents the error message for no speech from popping up repeatedly.
      //Maybe consider a counter here in the future for if no speech is is thrown more than X times we disable interact mode.
    }

    errorMessage.value = `Speech recognition error: ${event.error}`;
    isLoading.value = false;
    state.value = 'error';

    if (event.error === 'aborted') {
      if (isRecording.value) {
        setTimeout(() => {
          recognition.value.start();
        }, 1000);
      }
    }
  };

  recognition.value.onend = () => {
    if (isRecording.value) {
      setTimeout(() => {
        recognition.value.start();
      }, 1000);
    }
  };

  await startRecording();
});

onUnmounted(() => {
  if (audioContext.value) {
    audioContext.value.close();
  }
  if (recognition.value) {
    recognition.value.stop();
  }
  stopRecording();
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
