import { ChevronRight } from 'lucide-react';

/**
 * ResultRow — Mobile-optimized result list item with left-aligned category name
 */
export default function ResultRow({ result, onOpenModal, actionSlot }) {
  const winners = result?.winners || [];

  return (
    <div
      className="public-result-item"
      onClick={() => onOpenModal?.(result)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpenModal?.(result)}
    >
      <div className="result-list-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', flexGrow: 1, minWidth: 0 }}>
        {/* Left-aligned Category Badge & Result Number */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-start', textAlign: 'left' }}>
          <span className="badge" style={{
            background: '#F1F5F9',
            color: '#334155',
            border: '1px solid #E2E8F0',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            textAlign: 'left',
            alignSelf: 'flex-start'
          }}>
            {result.category}
          </span>
          {result.resultNo && (
            <span style={{ color: '#64748B', fontSize: '0.82rem', fontWeight: 600 }}>
              #{result.resultNo}
            </span>
          )}
        </div>
        
        {/* Left-aligned Program Title & Winners Summary */}
        <div className="result-list-title-wrap" style={{ width: '100%', textAlign: 'left' }}>
          <div className="result-list-title" style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.35, textAlign: 'left' }}>
            {result.programName}
          </div>
          
          {winners.length > 0 && (
            <div className="result-list-winner" style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px', textAlign: 'left' }}>
              {winners.map((w, i) => (
                <span key={i} style={{ marginRight: 10, display: 'inline-block' }}>
                  <strong style={{ color: '#1E293B', fontWeight: 600 }}>{w.position || `${i+1}`}. {w.name}</strong>
                  {w.team && <span style={{ color: '#64748B', marginLeft: 3 }}>({w.team})</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {actionSlot ? (
        <div onClick={e => e.stopPropagation()}>{actionSlot}</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748B', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0, paddingLeft: 6 }}>
          <ChevronRight size={18} />
        </div>
      )}
    </div>
  );
}
