import { supabase } from './supabase';
import { DEFAULT_TEMPLATES, DEFAULT_RESULTS } from '../data/defaults';

function showDbError(action, error) {
  const msg = error?.message || String(error);
  console.error(`DB Error (${action}):`, error);
  // In React, errors are shown via component state — this just logs.
}

// ── RESULTS ───────────────────────────────────────────────────────────────────

export async function getResults() {
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

  if (error) { showDbError('fetching results', error); return []; }

  if (!data || data.length === 0) {
    // Auto-seed
    for (const r of DEFAULT_RESULTS) {
      await supabase.from('results').insert({ id: r.id, program_name: r.programName, category: r.category });
      await supabase.from('placements').insert(r.winners.map(w => ({ result_id: r.id, ...w })));
    }
    return DEFAULT_RESULTS;
  }

  data.forEach(r => r.winners?.sort((a, b) => (a.position || '').localeCompare(b.position || '')));
  return data;
}

export async function getResult(id) {
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

  if (error) { showDbError('fetching result', error); return null; }
  data?.winners?.sort((a, b) => (a.position || '').localeCompare(b.position || ''));
  return data;
}

export async function saveResult(resultData) {
  const id = resultData.id || 'result_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  const { error: resErr } = await supabase.from('results').upsert({
    id, program_name: resultData.programName, category: resultData.category,
  });
  if (resErr) { showDbError('saving result', resErr); return null; }

  const { error: delErr } = await supabase.from('placements').delete().eq('result_id', id);
  if (delErr) { showDbError('deleting placements', delErr); return null; }

  const placements = (resultData.winners || []).map(w => ({ result_id: id, position: w.position, name: w.name, team: w.team }));
  if (placements.length > 0) {
    const { error: insErr } = await supabase.from('placements').insert(placements);
    if (insErr) { showDbError('inserting placements', insErr); return null; }
  }

  return { ...resultData, id };
}

export async function deleteResult(id) {
  const { error } = await supabase.from('results').delete().eq('id', id);
  if (error) { showDbError('deleting result', error); return false; }
  return true;
}

// ── TEMPLATES ─────────────────────────────────────────────────────────────────

export async function getTemplates() {
  const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: true });
  if (error) { showDbError('fetching templates', error); return []; }

  if (!data || data.length === 0) {
    await supabase.from('templates').insert(DEFAULT_TEMPLATES);
    return DEFAULT_TEMPLATES;
  }
  return data;
}

export async function getTemplate(id) {
  const { data, error } = await supabase.from('templates').select('*').eq('id', id).single();
  if (error) { showDbError('fetching template', error); return null; }
  return data;
}

export async function saveTemplate(templateData) {
  const { error } = await supabase.from('templates').upsert({
    id: templateData.id,
    name: templateData.name,
    background: templateData.background,
    fields: templateData.fields,
  });
  if (error) { showDbError('saving template', error); return null; }
  return templateData;
}

export async function deleteTemplate(id) {
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) { showDbError('deleting template', error); return false; }
  return true;
}

// ── STORAGE ───────────────────────────────────────────────────────────────────

export async function uploadTemplateBackground(file, fileName) {
  const cleanName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const { error } = await supabase.storage.from('template-backgrounds').upload(cleanName, file, { cacheControl: '3600', upsert: true });
  if (error) { showDbError('uploading background', error); return null; }

  const { data: urlData } = supabase.storage.from('template-backgrounds').getPublicUrl(cleanName);
  return urlData?.publicUrl || null;
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
  await supabase.from('placements').delete().neq('result_id', '___dummy___');
  await supabase.from('results').delete().neq('id', '___dummy___');
  await supabase.from('templates').delete().neq('id', '___dummy___');

  await supabase.from('templates').insert(DEFAULT_TEMPLATES);

  for (const r of DEFAULT_RESULTS) {
    await supabase.from('results').insert({ id: r.id, program_name: r.programName, category: r.category });
    await supabase.from('placements').insert(r.winners.map(w => ({ result_id: r.id, ...w })));
  }
  return true;
}
