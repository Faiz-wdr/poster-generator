import { Palette } from 'lucide-react';

/**
 * ResultRow — A single result list item with click-to-open-modal action
 */
export default function ResultRow({ result, onOpenModal, actionSlot }) {
  const winners = result?.winners || [];

  const winnerSummary = winners.map(w =>
    `${w.name}${w.team ? ` [${w.team}]` : ''}`
  ).join(' | ');

  return (
    <div
      className="result-list-item"
      onClick={() => onOpenModal?.(result)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpenModal?.(result)}
    >
      <div className="result-list-main">
        <span className="badge badge-primary result-list-category">{result.category}</span>
        <div className="result-list-title-wrap">
          <div className="result-list-title">{result.programName}</div>
          {winnerSummary && (
            <div className="result-list-winner">
              {winners.map((w, i) => (
                <span key={i}>
                  {i > 0 && ' | '}
                  <strong>{w.name}</strong>
                  {w.team && ` [${w.team}]`}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {actionSlot ? (
        <div onClick={e => e.stopPropagation()}>{actionSlot}</div>
      ) : (
        <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => { e.stopPropagation(); onOpenModal?.(result); }}>
          <Palette size={14} /> View Poster
        </button>
      )}
    </div>
  );
}
