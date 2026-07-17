import { supabase } from './supabase';
import { DEFAULT_TEMPLATES, DEFAULT_RESULTS } from '../data/defaults';

function showDbError(action, error) {
  const msg = error?.message || String(error);
  console.error(`DB Error (${action}):`, error);
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to determine if we should use local fallback
const useLocal = !supabase;

// ── LOCAL STORAGE TENANCY SEED DATA ──────────────────────────────────────────
const DEFAULT_CLIENTS = [
  {
    id: 'default-client',
    organization_name: 'Wandoor Sector',
    event_name: 'Sahityotsav 2026',
    slug: 'wandoor-sahityotsav-2026',
    logo: 'S',
    primary_color: '#7C3AED',
    secondary_color: '#0EA5E9',
    accent_color: '#F59E0B',
    admin_password: 'password',
    start_date: '2026-05-01',
    end_date: '2026-06-30',
    expiry_date: '2030-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'alqamar-client',
    organization_name: 'Al Qamar',
    event_name: 'Arts Festival 2027',
    slug: 'alqamar-2027',
    logo: '🌙',
    primary_color: '#06B6D4',
    secondary_color: '#EC4899',
    accent_color: '#F59E0B',
    admin_password: 'password',
    start_date: '2027-01-01',
    end_date: '2027-01-10',
    expiry_date: '2030-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'expired-client',
    organization_name: 'Expired Event Org',
    event_name: 'Expired Event 2020',
    slug: 'expired-event',
    logo: '⌛',
    primary_color: '#EF4444',
    secondary_color: '#6B7280',
    accent_color: '#F59E0B',
    admin_password: 'password',
    start_date: '2020-01-01',
    end_date: '2020-01-05',
    expiry_date: '2020-01-10T00:00:00.000Z',
    status: 'active',
  }
];

// Local Storage fallback write operations (used if Supabase fails)
function saveLocalClientFallback(updatedClient, isNew) {
  const clients = getLocalClients();
  const idx = clients.findIndex(c => c.id === updatedClient.id);
  if (idx >= 0) {
    clients[idx] = updatedClient;
  } else {
    clients.push(updatedClient);
  }
  saveLocalClients(clients);
  if (isNew) {
    seedNewClientLocalData(updatedClient.id);
  }
  return updatedClient;
}

function deleteLocalClientFallback(id) {
  const clients = getLocalClients();
  const filtered = clients.filter(c => c.id !== id);
  saveLocalClients(filtered);
  localStorage.removeItem(`arts_poster_results_${id}`);
  localStorage.removeItem(`arts_poster_templates_${id}`);
}

function saveLocalResultFallback(cId, id, updatedResult) {
  const results = getLocalResults(cId);
  const idx = results.findIndex(r => r.id === id);
  if (idx >= 0) {
    results[idx] = updatedResult;
  } else {
    results.unshift(updatedResult);
  }
  saveLocalResults(cId, results);
  return updatedResult;
}

function deleteLocalResultFallback(id) {
  const clients = getLocalClients();
  for (const client of clients) {
    const results = getLocalResults(client.id);
    const filtered = results.filter(r => r.id !== id);
    if (results.length !== filtered.length) {
      saveLocalResults(client.id, filtered);
      break;
    }
  }
}

function saveLocalTemplateFallback(cId, updatedTemplate) {
  const templates = getLocalTemplates(cId);
  const idx = templates.findIndex(t => t.id === updatedTemplate.id);
  if (idx >= 0) {
    templates[idx] = updatedTemplate;
  } else {
    templates.push(updatedTemplate);
  }
  saveLocalTemplates(cId, templates);
  return updatedTemplate;
}

function deleteLocalTemplateFallback(id) {
  const clients = getLocalClients();
  for (const client of clients) {
    const templates = getLocalTemplates(client.id);
    const filtered = templates.filter(t => t.id !== id);
    if (templates.length !== filtered.length) {
      saveLocalTemplates(client.id, filtered);
      break;
    }
  }
}

// Helper to get active client ID in fallback mode or if none provided
function getFallbackClientId() {
  const clients = getLocalClients();
  return clients[0]?.id || 'default-client';
}

// ── CLIENTS ──────────────────────────────────────────────────────────────────

export async function getClients() {
  if (useLocal) {
    return getLocalClients();
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('organization_name', { ascending: true });

    if (error) {
      showDbError('fetching clients', error);
      return getLocalClients();
    }
    
    // Merge local storage clients with Supabase clients to prevent data loss
    const localClients = getLocalClients();
    const supabaseClients = data || [];
    const merged = [...supabaseClients];
    
    localClients.forEach(lc => {
      if (lc && lc.id && !merged.some(sc => sc && sc.id === lc.id)) {
        merged.push(lc);
      }
    });

    return merged;
  } catch (e) {
    showDbError('fetching clients exception', e);
    return getLocalClients();
  }
}

export async function getClient(id) {
  if (useLocal) {
    const clients = getLocalClients();
    return clients.find(c => c.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      showDbError('fetching client', error);
      const clients = getLocalClients();
      return clients.find(c => c.id === id) || null;
    }
    return data;
  } catch (e) {
    showDbError('fetching client exception', e);
    const clients = getLocalClients();
    return clients.find(c => c.id === id) || null;
  }
}

export async function getClientBySlug(slug) {
  if (useLocal) {
    const clients = getLocalClients();
    return clients.find(c => c.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      showDbError('fetching client by slug', error);
      const clients = getLocalClients();
      return clients.find(c => c.slug === slug) || null;
    }
    return data;
  } catch (e) {
    showDbError('fetching client by slug exception', e);
    const clients = getLocalClients();
    return clients.find(c => c.slug === slug) || null;
  }
}

export async function saveClient(clientData) {
  const id = clientData.id || generateUUID();
  const isNew = !clientData.id;
  const updatedClient = { ...clientData, id };

  if (useLocal) {
    const clients = getLocalClients();
    const idx = clients.findIndex(c => c.id === id);
    if (idx >= 0) {
      clients[idx] = updatedClient;
    } else {
      clients.push(updatedClient);
    }
    saveLocalClients(clients);

    // If new client, seed templates and results
    if (isNew) {
      seedNewClientLocalData(id);
    }
    return updatedClient;
  }

  try {
    const { error } = await supabase.from('clients').upsert({
      id,
      organization_name: clientData.organization_name,
      event_name: clientData.event_name,
      slug: clientData.slug,
      logo: clientData.logo,
      primary_color: clientData.primary_color,
      secondary_color: clientData.secondary_color,
      accent_color: clientData.accent_color,
      admin_password: clientData.admin_password,
      start_date: clientData.start_date,
      end_date: clientData.end_date,
      expiry_date: clientData.expiry_date,
      status: clientData.status || 'active',
      programs: clientData.programs || [],
      categories: clientData.categories || [],
      teams: clientData.teams || [],
    });

    if (error) {
      showDbError('saving client', error);
      if (error.code === '23505') {
        return null; // Unique constraint violation (slug taken)
      }
      return saveLocalClientFallback(updatedClient, isNew);
    }

    if (isNew) {
      // Seed templates into Supabase for this new client ID
      await seedNewClientSupabaseData(id);
    }

    return updatedClient;
  } catch (e) {
    showDbError('saving client exception', e);
    if (e && (e.code === '23505' || e.message?.includes('duplicate key'))) {
      return null;
    }
    return saveLocalClientFallback(updatedClient, isNew);
  }
}

export async function deleteClient(id) {
  if (useLocal) {
    const clients = getLocalClients();
    const filtered = clients.filter(c => c.id !== id);
    saveLocalClients(filtered);

    // Clean up client-scoped storage
    localStorage.removeItem(`arts_poster_results_${id}`);
    localStorage.removeItem(`arts_poster_templates_${id}`);
    return true;
  }

  try {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      showDbError('deleting client', error);
      deleteLocalClientFallback(id);
      return true;
    }
    return true;
  } catch (e) {
    showDbError('deleting client exception', e);
    deleteLocalClientFallback(id);
    return true;
  }
}

// ── LOCAL STORAGE CLIENTS STORAGE HELPERS ────────────────────────────────────
function getLocalClients() {
  try {
    const raw = localStorage.getItem('arts_poster_clients');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse local clients", e);
  }
  localStorage.setItem('arts_poster_clients', JSON.stringify(DEFAULT_CLIENTS));
  return DEFAULT_CLIENTS;
}

function saveLocalClients(clients) {
  try {
    localStorage.setItem('arts_poster_clients', JSON.stringify(clients));
  } catch (e) {
    console.error("Failed to save local clients", e);
  }
}

// ── LOCAL STORAGE CLIENT-SCOPED RETRIEVAL ────────────────────────────────────
function getLocalResults(clientId) {
  const cId = clientId || getFallbackClientId();
  try {
    const raw = localStorage.getItem(`arts_poster_results_${cId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(r => {
          if (!r.status) r.status = 'published';
          if (!r.resultNo) r.resultNo = '01';
        });
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Failed to parse local results for ${cId}`, e);
  }
  // Default seeding for Wandoor client
  if (cId === 'default-client') {
    const seeded = JSON.parse(JSON.stringify(DEFAULT_RESULTS));
    seeded.forEach(r => {
      if (!r.status) r.status = 'published';
      if (!r.resultNo) r.resultNo = '01';
    });
    localStorage.setItem(`arts_poster_results_${cId}`, JSON.stringify(seeded));
    return seeded;
  }
  return [];
}

function saveLocalResults(clientId, results) {
  const cId = clientId || getFallbackClientId();
  try {
    localStorage.setItem(`arts_poster_results_${cId}`, JSON.stringify(results));
  } catch (e) {
    console.error(`Failed to save local results for ${cId}`, e);
  }
}

function getLocalTemplates(clientId) {
  const cId = clientId || getFallbackClientId();
  try {
    const raw = localStorage.getItem(`arts_poster_templates_${cId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(t => {
          if (t.fields && !t.fields.resultNo) {
            t.fields.resultNo = { left: 90, top: 160, width: 900, height: 40, fontSize: 24, color: '#7C3AED', align: 'center', shadow: false, visible: true };
          }
        });
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Failed to parse local templates for ${cId}`, e);
  }
  
  // Seed default templates for any client
  const seededTemplates = DEFAULT_TEMPLATES.map(t => ({
    ...t,
    id: t.id + '_' + cId,
    client_id: cId
  }));
  localStorage.setItem(`arts_poster_templates_${cId}`, JSON.stringify(seededTemplates));
  return seededTemplates;
}

function saveLocalTemplates(clientId, templates) {
  const cId = clientId || getFallbackClientId();
  try {
    localStorage.setItem(`arts_poster_templates_${cId}`, JSON.stringify(templates));
  } catch (e) {
    console.error(`Failed to save local templates for ${cId}`, e);
  }
}

// ── SEEDING HELPERS ──────────────────────────────────────────────────────────
function seedNewClientLocalData(clientId) {
  const seededTemplates = DEFAULT_TEMPLATES.map(t => ({
    ...t,
    id: t.id + '_' + clientId,
    client_id: clientId
  }));
  saveLocalTemplates(clientId, seededTemplates);
  saveLocalResults(clientId, []);
}

async function seedNewClientSupabaseData(clientId) {
  try {
    const templatesToInsert = DEFAULT_TEMPLATES.map(t => ({
      id: t.id + '_' + clientId.substr(0, 8),
      name: t.name,
      background: t.background,
      fields: t.fields,
      client_id: clientId,
    }));
    await supabase.from('templates').insert(templatesToInsert);
  } catch (e) {
    console.error("Failed to seed template data to Supabase:", e);
  }
}

// ── PROGRAM NAME SERIALIZATION HELPERS ────────────────────────────────────────
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

export async function getResults(clientId) {
  const cId = clientId || getFallbackClientId();
  if (useLocal) {
    return getLocalResults(cId);
  }

  try {
    const { data, error } = await supabase
      .from('results')
      .select(`
        id,
        programName:program_name,
        category,
        client_id,
        created:created_at,
        winners:placements ( position, name, team )
      `)
      .eq('client_id', cId)
      .order('created_at', { ascending: false });

    if (error) {
      showDbError(`fetching results for ${cId}`, error);
      return getLocalResults(cId);
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
    return getLocalResults(cId);
  }
}

export async function getResult(id) {
  if (useLocal) {
    // Search across all clients in local storage fallback
    const clients = getLocalClients();
    for (const client of clients) {
      const results = getLocalResults(client.id);
      const found = results.find(r => r.id === id);
      if (found) return found;
    }
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('results')
      .select(`
        id,
        programName:program_name,
        category,
        client_id,
        created:created_at,
        winners:placements ( position, name, team )
      `)
      .eq('id', id)
      .single();

    if (error) {
      showDbError('fetching result', error);
      return null;
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
    return null;
  }
}

export async function saveResult(resultData, clientId) {
  const cId = clientId || resultData.client_id || getFallbackClientId();
  const id = resultData.id || 'result_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const updatedResult = { ...resultData, id, client_id: cId };

  if (useLocal) {
    const results = getLocalResults(cId);
    const idx = results.findIndex(r => r.id === id);
    if (idx >= 0) {
      results[idx] = updatedResult;
    } else {
      results.unshift(updatedResult);
    }
    saveLocalResults(cId, results);
    return updatedResult;
  }

  try {
    const encodedProgramName = encodeProgramName(resultData.programName, resultData.resultNo, resultData.status || 'published');
    const { error: resErr } = await supabase.from('results').upsert({
      id, 
      program_name: encodedProgramName, 
      category: resultData.category,
      client_id: cId
    });
    if (resErr) { 
      showDbError('saving result', resErr); 
      return saveLocalResultFallback(cId, id, updatedResult); 
    }

    const { error: delErr } = await supabase.from('placements').delete().eq('result_id', id);
    if (delErr) { 
      showDbError('deleting placements', delErr); 
      return saveLocalResultFallback(cId, id, updatedResult); 
    }

    const placements = (resultData.winners || []).map(w => ({ result_id: id, position: w.position, name: w.name, team: w.team }));
    if (placements.length > 0) {
      const { error: insErr } = await supabase.from('placements').insert(placements);
      if (insErr) { 
        showDbError('inserting placements', insErr); 
        return saveLocalResultFallback(cId, id, updatedResult); 
      }
    }

    return updatedResult;
  } catch (e) {
    showDbError('saving result exception', e);
    return saveLocalResultFallback(cId, id, updatedResult);
  }
}

export async function deleteResult(id) {
  if (useLocal) {
    const clients = getLocalClients();
    for (const client of clients) {
      const results = getLocalResults(client.id);
      const filtered = results.filter(r => r.id !== id);
      if (results.length !== filtered.length) {
        saveLocalResults(client.id, filtered);
        return true;
      }
    }
    return true;
  }

  try {
    const { error } = await supabase.from('results').delete().eq('id', id);
    if (error) { 
      showDbError('deleting result', error); 
      deleteLocalResultFallback(id);
      return true; 
    }
    return true;
  } catch (e) {
    showDbError('deleting result exception', e);
    deleteLocalResultFallback(id);
    return true;
  }
}

// ── TEMPLATES ─────────────────────────────────────────────────────────────────

export async function getTemplates(clientId) {
  const cId = clientId || getFallbackClientId();
  if (useLocal) {
    return getLocalTemplates(cId);
  }

  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('client_id', cId)
      .order('created_at', { ascending: true });
      
    if (error) {
      showDbError(`fetching templates for ${cId}`, error);
      return getLocalTemplates(cId);
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
    return getLocalTemplates(cId);
  }
}

export async function getTemplate(id) {
  if (useLocal) {
    const clients = getLocalClients();
    for (const client of clients) {
      const templates = getLocalTemplates(client.id);
      const found = templates.find(t => t.id === id);
      if (found) return found;
    }
    return null;
  }

  try {
    const { data, error } = await supabase.from('templates').select('*').eq('id', id).single();
    if (error) {
      showDbError('fetching template', error);
      return null;
    }
    if (data && data.fields && !data.fields.resultNo) {
      data.fields.resultNo = { left: 90, top: 160, width: 900, height: 40, fontSize: 24, color: '#7C3AED', align: 'center', shadow: false, visible: true };
    }
    return data;
  } catch (e) {
    showDbError('fetching template exception', e);
    return null;
  }
}

export async function saveTemplate(templateData, clientId) {
  const cId = clientId || templateData.client_id || getFallbackClientId();
  const updatedTemplate = { ...templateData, client_id: cId };
  if (useLocal) {
    const templates = getLocalTemplates(cId);
    const idx = templates.findIndex(t => t.id === templateData.id);
    if (idx >= 0) {
      templates[idx] = updatedTemplate;
    } else {
      templates.push(updatedTemplate);
    }
    saveLocalTemplates(cId, templates);
    return updatedTemplate;
  }

  try {
    const { error } = await supabase.from('templates').upsert({
      id: templateData.id,
      name: templateData.name,
      background: templateData.background,
      fields: templateData.fields,
      client_id: cId
    });
    if (error) { 
      showDbError('saving template', error); 
      return saveLocalTemplateFallback(cId, updatedTemplate); 
    }
    return updatedTemplate;
  } catch (e) {
    showDbError('saving template exception', e);
    return saveLocalTemplateFallback(cId, updatedTemplate);
  }
}

export async function deleteTemplate(id) {
  if (useLocal) {
    const clients = getLocalClients();
    for (const client of clients) {
      const templates = getLocalTemplates(client.id);
      const filtered = templates.filter(t => t.id !== id);
      if (templates.length !== filtered.length) {
        saveLocalTemplates(client.id, filtered);
        return true;
      }
    }
    return true;
  }

  try {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) { 
      showDbError('deleting template', error); 
      deleteLocalTemplateFallback(id);
      return true; 
    }
    return true;
  } catch (e) {
    showDbError('deleting template exception', e);
    deleteLocalTemplateFallback(id);
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

export async function uploadClientLogo(file, fileName) {
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
    const { error } = await supabase.storage.from('logos').upload(cleanName, file, { cacheControl: '3600', upsert: true });
    if (error) {
      // Fallback to template-backgrounds bucket if logos bucket does not exist
      const { error: fallbackErr } = await supabase.storage.from('template-backgrounds').upload(cleanName, file, { cacheControl: '3600', upsert: true });
      if (fallbackErr) {
        showDbError('uploading logo fallback', fallbackErr);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }
      const { data: urlData } = supabase.storage.from('template-backgrounds').getPublicUrl(cleanName);
      return urlData?.publicUrl || null;
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(cleanName);
    return urlData?.publicUrl || null;
  } catch (e) {
    showDbError('uploading logo exception', e);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
}

// ── BRANDING SETTINGS (TENANT-SCOPED) ─────────────────────────────────────────

export async function getSettings(clientId) {
  const cId = clientId || getFallbackClientId();
  const client = await getClient(cId);
  if (client) {
    return {
      institutionName: client.event_name,
      organizationName: client.organization_name,
      eventName: client.event_name,
      logo: client.logo,
      primaryColor: client.primary_color,
      secondaryColor: client.secondary_color,
      accentColor: client.accent_color,
      startDate: client.start_date,
      endDate: client.end_date,
      expiryDate: client.expiry_date,
      status: client.status,
      slug: client.slug,
      adminPassword: client.admin_password,
      programs: client.programs || [],
      categories: client.categories || [],
      teams: client.teams || [],
    };
  }
  return { institutionName: 'Sahityotsav', primaryColor: '#7C3AED', programs: [], categories: [], teams: [] };
}

export async function saveSettings(clientId, data) {
  const cId = clientId || getFallbackClientId();
  const client = await getClient(cId);
  if (!client) return false;

  const updated = {
    ...client,
    organization_name: data.organizationName || client.organization_name,
    event_name: data.eventName || client.event_name,
    logo: data.logo || client.logo,
    primary_color: data.primaryColor || client.primary_color,
    secondary_color: data.secondaryColor || client.secondary_color,
    accent_color: data.accentColor || client.accent_color,
    slug: data.slug || client.slug,
    admin_password: data.adminPassword || client.admin_password,
    programs: data.programs !== undefined ? data.programs : client.programs,
    categories: data.categories !== undefined ? data.categories : client.categories,
    teams: data.teams !== undefined ? data.teams : client.teams,
  };

  const saved = await saveClient(updated);
  return !!saved;
}

// ── FACTORY RESET (TENANT-SCOPED) ─────────────────────────────────────────────

export async function resetToDefault(clientId) {
  const cId = clientId || getFallbackClientId();
  if (useLocal) {
    localStorage.setItem(`arts_poster_results_${cId}`, JSON.stringify([]));
    localStorage.setItem(`arts_poster_templates_${cId}`, JSON.stringify([]));
    return true;
  }

  try {
    await supabase.from('placements').delete().in(
      'result_id', 
      (await supabase.from('results').select('id').eq('client_id', cId)).data?.map(r => r.id) || []
    );
    await supabase.from('results').delete().eq('client_id', cId);
    await supabase.from('templates').delete().eq('client_id', cId);
    return true;
  } catch (e) {
    showDbError(`reset to default exception for ${cId}`, e);
    return false;
  }
}
