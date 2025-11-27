export default function DiagnosisResult({ data }: any) {
  return (
    <div className="result">
      <h2>Resultado da IA</h2>

      <p><strong>Diagnóstico:</strong> {data.diagnostico}</p>

      <p><strong>Doenças associadas:</strong></p>
      <ul>{data.doencas_associadas?.map((d: string) => <li key={d}>{d}</li>)}</ul>

      <p><strong>Exames sugeridos:</strong></p>
      <ul>{data.exames_sugeridos?.map((e: string) => <li key={e}>{e}</li>)}</ul>

      <p><strong>Medicamentos comuns:</strong></p>
      <ul>{data.medicamentos?.map((m: string) => <li key={m}>{m}</li>)}</ul>
    </div>
  );
}