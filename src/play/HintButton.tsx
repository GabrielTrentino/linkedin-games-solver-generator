// Dicas entram na Fase 3 do roadmap. Enquanto isso o botão fica visível mas
// desabilitado, e o motivo aparece ao passar o mouse (ou ao focar, pelo teclado).
const REASON = "Dicas ainda não estão prontas. Chegam na Fase 3 do roadmap.";

export function HintButton() {
  return (
    <span className="hint-wrap" title={REASON}>
      <button type="button" disabled aria-disabled="true" aria-describedby="hint-reason">
        Dica
      </button>
      <span id="hint-reason" className="sr-only">
        {REASON}
      </span>
    </span>
  );
}
