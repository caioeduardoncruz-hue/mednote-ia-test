import { useState } from 'react'
import AudioRecorder from "./components/AudioRecorder";
import DiagnosisResult from "./components/DiagnosisResult";

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<any>(null);

  return (
    <div className="container">
      <h1>Médico Copilot</h1>
      <AudioRecorder
        onTranscript={setTranscript}
        onDiagnosis={setResult}
      />
    
      {result && <DiagnosisResult data={result} />} 
    </div>
  )
}