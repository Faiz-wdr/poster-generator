import { supabase } from './supabase';
import { DEFAULT_TEMPLATES, DEFAULT_RESULTS } from '../data/defaults';

function showDbError(action, error) {
  const msg = error?.message || String(error);
  console.error(`DB Error (${action}):`, error);
}

// Helper to determine if we should use local fallback
const useLocal = !supabase;

// Helper to read/write from localStorage for local fallback
function getLocalResults() {
  try {
    const raw = localStorage.getItem('arts_poster_results');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse local results", e);
  }
  // Initialize with DEFAULT_RESULTS
  localStorage.setItem('arts_poster_results', JSON.stringify(DEFAULT_RESULTS));
  return DEFAULT_RESULTS;
}

function saveLocalResults(results) {
  try {
    localStorage.setItem('arts_poster_results', JSON.stringify(results));
  } catch (e) {
    console.error("Failed to save local results", e);
  }
}

function getLocalTemplates() {
  try {
    const raw = localStorage.getItem('arts_poster_templates');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.forEach(t => {
        if (t.fields && !t.fields.resultNo) {
          t.fields.resultNo = { left: 90, top: 160, width: 900, height: 40, fontSize: 24, color: '#7C3AED', align: 'center', shadow: false, visible: true };
        }
      });
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse local templates", e);
  }
  // Initialize with DEFAULT_TEMPLATES
  localStorage.setItem('arts_poster_templates', JSON.stringify(DEFAULT_TEMPLATES));
  return DEFAULT_TEMPLATES;
}

function saveLocalTemplates(templates) {
  try {
    localStorage.setItem('arts_poster_templates', JSON.stringify(templates));
  } catch (e) {
    console.error("Failed to save local templates", e);
  }
}

// Prefix serialization helpers for resultNo and status fallback storage
export function encodeProgramName(programName, resultNo, status = 'published') {
  const parts = [];
  if (resultNo) parts.push(`[No: ${resultNo}]`);
  parts.push(`[Status: ${status}]`);
  return `${parts.join('')} ${programName}`;
}

export function decodeProgramName(encodedName) {
  if (!encodedName) return { programName: '', resultNo: '01', status: 'published' };
  
  let resultNo = '01';
  let status = 'published';
  let programName = encodedName;

  // Extract [No: ...]
  const noMatch = programName.match(/^\[No:\s*([^\]]+)\]\s*/);
  if (noMatch) {
    resultNo = noMatch[1];
    programName = programName.replace(/^\[No:\s*[^\]]+\]\s*/, '');
  }

  // Extract [Status: ...]
  const statusMatch = programName.match(/^\[Status:\s*([^\]]+)\]\s*/);
  if (statusMatch) {
    status = statusMatch[1];
    programName = programName.replace(/^\[Status:\s*[^\]]+\]\s*/, '');
  }

  return { resultNo, status, programName };
}

// ── RESULTS ───────────────────────────────────────────────────────────────────

export async function getResults() {
  if (useLocal) {
    return getLocalResults();
  }

  try {
    const { data, error } = await supabase
      .from('results')
      .select(`
        id,
        programName:program_name,
        category,
        created:created_at,
        winners:placements ( position, name, team )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      showDbError('fetching results', error);
      return getLocalResults();
    }

    if (!data) return [];

    data.forEach(r => {
      const decoded = decodeProgramName(r.programName);
      r.programName = decoded.programName;
      r.resultNo = decoded.resultNo;
      r.status = decoded.status;
      r.winners?.sort((a, b) => (a.position || '').localeCompare(b.position || ''));
    });
    return data;
  } catch (e) {
    showDbError('fetching results exception', e);
    return getLocalResults();
  }
}

export async function getResult(id) {
  if (useLocal) {
    const results = getLocalResults();
    return results.find(r => r.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('results')
      .select(`
        id,
        programName:program_name,
        category,
        created:created_at,
        winners:placements ( position, name, team )
      `)
      .eq('id', id)
      .single();

    if (error) {
      showDbError('fetching result', error);
      const results = getLocalResults();
      return results.find(r => r.id === id) || null;
    }
    if (data) {
      const decoded = decodeProgramName(data.programName);
      data.programName = decoded.programName;
      data.resultNo = decoded.resultNo;
      data.status = decoded.status;
      data.winners?.sort((a, b) => (a.position || '').localeCompare(b.position || ''));
    }
    return data;
  } catch (e) {
    showDbError('fetching result exception', e);
    const results = getLocalResults();
    return results.find(r => r.id === id) || null;
  }
}

export async function saveResult(resultData) {
  const id = resultData.id || 'result_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const updatedResult = { ...resultData, id };

  if (useLocal) {
    const results = getLocalResults();
    const idx = results.findIndex(r => r.id === id);
    if (idx >= 0) {
      results[idx] = updatedResult;
    } else {
      results.unshift(updatedResult);
    }
    saveLocalResults(results);
    return updatedResult;
  }

  try {
    const encodedProgramName = encodeProgramName(resultData.programName, resultData.resultNo, resultData.status || 'published');
    const { error: resErr } = await supabase.from('results').upsert({
      id, program_name: encodedProgramName, category: resultData.category
    });
    if (resErr) { showDbError('saving result', resErr); return null; }

    const { error: delErr } = await supabase.from('placements').delete().eq('result_id', id);
    if (delErr) { showDbError('deleting placements', delErr); return null; }

    const placements = (resultData.winners || []).map(w => ({ result_id: id, position: w.position, name: w.name, team: w.team }));
    if (placements.length > 0) {
      const { error: insErr } = await supabase.from('placements').insert(placements);
      if (insErr) { showDbError('inserting placements', insErr); return null; }
    }

    return updatedResult;
  } catch (e) {
    showDbError('saving result exception', e);
    const results = getLocalResults();
    const idx = results.findIndex(r => r.id === id);
    if (idx >= 0) {
      results[idx] = updatedResult;
    } else {
      results.unshift(updatedResult);
    }
    saveLocalResults(results);
    return updatedResult;
  }
}

export async function deleteResult(id) {
  if (useLocal) {
    const results = getLocalResults();
    const filtered = results.filter(r => r.id !== id);
    saveLocalResults(filtered);
    return true;
  }

  try {
    const { error } = await supabase.from('results').delete().eq('id', id);
    if (error) { showDbError('deleting result', error); return false; }
    return true;
  } catch (e) {
    showDbError('deleting result exception', e);
    const results = getLocalResults();
    const filtered = results.filter(r => r.id !== id);
    saveLocalResults(filtered);
    return true;
  }
}

// ── TEMPLATES ─────────────────────────────────────────────────────────────────

export async function getTemplates() {
  if (useLocal) {
    return getLocalTemplates();
  }

  try {
    const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: true });
    if (error) {
      showDbError('fetching templates', error);
      return getLocalTemplates();
    }

    if (!data) return [];
    data.forEach(t => {
      if (t.fields && !t.fields.resultNo) {
        t.fields.resultNo = { left: 90, top: 160, width: 900, height: 40, fontSize: 24, color: '#7C3AED', align: 'center', shadow: false, visible: true };
      }
    });
    return data;
  } catch (e) {
    showDbError('fetching templates exception', e);
    return getLocalTemplates();
  }
}

export async function getTemplate(id) {
  if (useLocal) {
    const templates = getLocalTemplates();
    return templates.find(t => t.id === id) || null;
  }

  try {
    const { data, error } = await supabase.from('templates').select('*').eq('id', id).single();
    if (error) {
      showDbError('fetching template', error);
      const templates = getLocalTemplates();
      return templates.find(t => t.id === id) || null;
    }
    if (data && data.fields && !data.fields.resultNo) {
      data.fields.resultNo = { left: 90, top: 160, width: 900, height: 40, fontSize: 24, color: '#7C3AED', align: 'center', shadow: false, visible: true };
    }
    return data;
  } catch (e) {
    showDbError('fetching template exception', e);
    const templates = getLocalTemplates();
    return templates.find(t => t.id === id) || null;
  }
}

export async function saveTemplate(templateData) {
  if (useLocal) {
    const templates = getLocalTemplates();
    const idx = templates.findIndex(t => t.id === templateData.id);
    if (idx >= 0) {
      templates[idx] = templateData;
    } else {
      templates.push(templateData);
    }
    saveLocalTemplates(templates);
    return templateData;
  }

  try {
    const { error } = await supabase.from('templates').upsert({
      id: templateData.id,
      name: templateData.name,
      background: templateData.background,
      fields: templateData.fields,
    });
    if (error) { showDbError('saving template', error); return null; }
    return templateData;
  } catch (e) {
    showDbError('saving template exception', e);
    const templates = getLocalTemplates();
    const idx = templates.findIndex(t => t.id === templateData.id);
    if (idx >= 0) {
      templates[idx] = templateData;
    } else {
      templates.push(templateData);
    }
    saveLocalTemplates(templates);
    return templateData;
  }
}

export async function deleteTemplate(id) {
  if (useLocal) {
    const templates = getLocalTemplates();
    const filtered = templates.filter(t => t.id !== id);
    saveLocalTemplates(filtered);
    return true;
  }

  try {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) { showDbError('deleting template', error); return false; }
    return true;
  } catch (e) {
    showDbError('deleting template exception', e);
    const templates = getLocalTemplates();
    const filtered = templates.filter(t => t.id !== id);
    saveLocalTemplates(filtered);
    return true;
  }
}

// ── STORAGE ───────────────────────────────────────────────────────────────────

export async function uploadTemplateBackground(file, fileName) {
  if (useLocal) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  try {
    const cleanName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error } = await supabase.storage.from('template-backgrounds').upload(cleanName, file, { cacheControl: '3600', upsert: true });
    if (error) { showDbError('uploading background', error); return null; }

    const { data: urlData } = supabase.storage.from('template-backgrounds').getPublicUrl(cleanName);
    return urlData?.publicUrl || null;
  } catch (e) {
    showDbError('uploading background exception', e);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────

export function getSettings() {
  try {
    const raw = localStorage.getItem('arts_poster_settings');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { institutionName: 'Wandoor Sector Sahityotsav', theme: 'light-premium' };
}

export function saveSettings(data) {
  const current = getSettings();
  localStorage.setItem('arts_poster_settings', JSON.stringify({ ...current, ...data }));
}

// ── FACTORY RESET ─────────────────────────────────────────────────────────────

export async function resetToDefault() {
  if (useLocal) {
    localStorage.setItem('arts_poster_results', JSON.stringify([]));
    localStorage.setItem('arts_poster_templates', JSON.stringify([]));
    return true;
  }

  try {
    await supabase.from('placements').delete().neq('result_id', '___dummy___');
    await supabase.from('results').delete().neq('id', '___dummy___');
    await supabase.from('templates').delete().neq('id', '___dummy___');
    return true;
  } catch (e) {
    showDbError('reset to default exception', e);
    localStorage.setItem('arts_poster_results', JSON.stringify([]));
    localStorage.setItem('arts_poster_templates', JSON.stringify([]));
    return true;
  }
}
