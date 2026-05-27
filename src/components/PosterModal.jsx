import { useState, useEffect, useRef } from 'react';
import { posterEngine } from '../lib/posterEngine';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * PosterModal — Simplified full-screen popup with poster preview,
 * previous/next template switcher buttons, and high-res download button.
 */
export default function PosterModal({ result, templates, onClose }) {
  const containerRef = useRef(null);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);

  const activeTemplate = templates[activeTemplateIdx] || null;

  // Render poster on mount and whenever activeTemplate or result changes
  useEffect(() => {
    if (containerRef.current && activeTemplate) {
      posterEngine.render(containerRef.current, result, activeTemplate, {});
    }
  }, [activeTemplateIdx, result, activeTemplate]);

  const handlePrev = () => {
    setActiveTemplateIdx(prev => (prev - 1 + templates.length) % templates.length);
  };

  const handleNext = () => {
    setActiveTemplateIdx(prev => (prev + 1) % templates.length);
  };

  const handleDownload = () => {
    if (!containerRef.current || !activeTemplate) return;
    posterEngine.exportJpg(containerRef.current, `${result.programName}.jpg`);
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" style={{ maxWidth: 420, width: '90%', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button className="modal-close-btn" onClick={onClose} style={{ top: 12, right: 12 }}>×</button>

        {/* Poster Preview */}
        <div ref={containerRef} className="poster-preview-container" style={{ width: '100%', marginBottom: 20 }} />

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button
              className="btn btn-outline"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', fontSize: '0.88rem' }}
              onClick={handlePrev}
              disabled={templates.length <= 1}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="btn btn-outline"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', fontSize: '0.88rem' }}
              onClick={handleNext}
              disabled={templates.length <= 1}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 18px' }}
            onClick={handleDownload}
          >
            <Download size={18} /> Download Poster
          </button>
        </div>
      </div>
    </div>
  );
}
