import { useEffect, useRef } from 'react';
import { posterEngine } from '../lib/posterEngine';

/**
 * PosterPreview — Renders a poster imperatively into a DOM container
 * using the posterEngine. This pattern is necessary because the engine
 * uses direct DOM manipulation + html2canvas for export.
 */
export default function PosterPreview({ result, template, opts = {}, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !template || !result) return;
    const cleanup = posterEngine.render(containerRef.current, result, template, opts);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, template, opts.editable, opts.activeFieldId, JSON.stringify(opts.selectedFieldIds)]);

  return (
    <div
      ref={containerRef}
      className={`poster-preview-container ${className}`}
    />
  );
}
