import { useState, useRef } from "react";

interface Props {
  onTranscript: (t: string) => void;
  onDiagnosis: (r: any) => void;
}

export default function AudioRecorder({ onTranscript, onDiagnosis }: Props) {
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);

    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = async () => {
      await sendAudio();
      setRecording(false);
    };

    mediaRecorder.current.start();
    setRecording(true);
  }

  function stopRecording() {
    if (!mediaRecorder.current) return;

    if (mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.requestData();
      mediaRecorder.current.stop();
    }
  }

  async function sendAudio() {
    const webmBlob = new Blob(audioChunks.current, { type: "audio/webm" });

    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const wavBlob = audioBufferToWav(audioBuffer);

    const form = new FormData();
    form.append("audio", wavBlob, "audio.wav");

    
    const transRes = await fetch("http://localhost:3000/api/transcribe", {
      method: "POST",
      body: form,
    });

    const transData = await transRes.json();

    onTranscript(transData.text);

    
    const diagRes = await fetch("http://localhost:3000/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: transData.text }),
    });

    const diagData = await diagRes.json();
    onDiagnosis(diagData);
  }

  function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels,
      length = buffer.length * numOfChan * 2 + 44,
      bufferArray = new ArrayBuffer(length),
      view = new DataView(bufferArray),
      channels = [],
      sampleRate = buffer.sampleRate;

    let offset = 0;

    function writeString(s: string) {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(offset++, s.charCodeAt(i));
      }
    }

    function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
      for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
    }

    writeString("RIFF");
    view.setUint32(offset, length - 8, true);
    offset += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint16(offset, numOfChan, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, sampleRate * numOfChan * 2, true);
    offset += 4;
    view.setUint16(offset, numOfChan * 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;
    writeString("data");
    view.setUint32(offset, length - offset - 4, true);
    offset += 4;

    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numOfChan; ch++) {
        floatTo16BitPCM(view, offset, channels[ch].subarray(i, i + 1));
        offset += 2;
      }
    }

    return new Blob([bufferArray], { type: "audio/wav" });
  }

  return (
    <div>
      {!recording ? (
        <button onClick={startRecording}>🎤 Iniciar Gravação</button>
      ) : (
        <button onClick={stopRecording}>🛑 Finalizar Consulta</button>
      )}
    </div>
  );
}
