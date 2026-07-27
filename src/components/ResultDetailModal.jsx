import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteResult } from '../lib/db';
import { Award, Share2, Check, Pencil, Trash2, X } from 'lucide-react';

/**
 * ResultDetailModal — Mobile-responsive pop-up modal displaying program result standings
 * with left-aligned category badge.
 */
export default function ResultDetailModal({ result, slug, isAdmin, onClose, onDeleteSuccess }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const winners = result.winners || [];

  const handleDelete = async () => {
    if (!window.confirm(`Delete result "${result.programName}"? This cannot be undone.`)) return;
    const ok = await deleteResult(result.id);
    if (ok) {
      onDeleteSuccess?.(result.id);
      onClose();
    } else {
      alert('Failed to delete result.');
    }
  };

  const handleShare = () => {
    const detailUrl = `${window.location.origin}/event/${slug}/detail/${result.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(detailUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPlaceBadge = (pos, index) => {
    const positionStr = pos || String(index + 1).padStart(2, '0');
    if (positionStr === '01' || positionStr === '1') {
      return { label: '1st Place', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
    }
    if (positionStr === '02' || positionStr === '2') {
      return { label: '2nd Place', bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' };
    }
    if (positionStr === '03' || positionStr === '3') {
      return { label: '3rd Place', bg: '#FFEDD5', color: '#9A3412', border: '#FDBA74' };
    }
    return { label: `Rank ${positionStr}`, bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        className="modal-card result-modal-card"
        style={{
          maxWidth: 640,
          width: '100%',
          maxHeight: '90vh',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          fontFamily: 'var(--font-body)',
          padding: 0
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569',
            zIndex: 10
          }}
          aria-label="Close popup"
        >
          <X size={18} />
        </button>

        {/* Modal Header with Left-Aligned Category */}
        <div style={{ padding: '24px 24px 18px', borderBottom: '1px solid #F1F5F9', paddingRight: 52, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10, marginBottom: 8, flexWrap: 'wrap', textAlign: 'left' }}>
            <span style={{
              background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0',
              fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px',
              textAlign: 'left', alignSelf: 'flex-start'
            }}>
              {result.category}
            </span>
            {result.resultNo && (
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>
                Result No: #{result.resultNo}
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.3, textAlign: 'left' }}>
            {result.programName}
          </h2>
        </div>

        {/* Standings Downward List Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} style={{ color: '#0F172A' }} />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Placement Standings
              </h3>
            </div>

            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px',
                color: '#334155', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} style={{ color: '#16A34A' }} /> : <Share2 size={14} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          {winners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748B', fontStyle: 'italic' }}>
              No winners recorded for this program yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {winners.map((w, index) => {
                const badge = getPlaceBadge(w.position, index);
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      padding: '12px 16px',
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      border: `1px solid ${badge.border}`,
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1, minWidth: 0 }}>
                      {/* Position Tag */}
                      <div style={{
                        minWidth: '76px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: badge.bg,
                        color: badge.color,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        textAlign: 'center',
                        border: `1px solid ${badge.border}`,
                        flexShrink: 0
                      }}>
                        {badge.label}
                      </div>

                      {/* Winner Name */}
                      <div style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.3, textAlign: 'left' }}>
                          {w.name}
                        </div>
                        {w.team && (
                          <div className="mobile-team-subtext" style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: 2, textAlign: 'left' }}>
                            {w.team}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop Team Badge */}
                    {w.team && (
                      <div className="desktop-team-badge" style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#475569',
                        background: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        {w.team}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer (Admin options if logged in) */}
        {isAdmin && (
          <div style={{
            padding: '14px 24px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            gap: 10,
            justify: 'flex-end'
          }}>
            <button
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
              onClick={() => navigate(`/admin/upload?edit=${result.id}`)}
            >
              <Pencil size={14} /> Edit Result
            </button>
            <button
              className="btn btn-outline btn-sm"
              style={{ color: '#DC2626', borderColor: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
              onClick={handleDelete}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
