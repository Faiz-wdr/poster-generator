// Script to inspect the current tables and columns in the Supabase schema
const SUPABASE_URL = 'https://ojtzjiosapraquwxvere.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdHpqaW9zYXByYXF1d3h2ZXJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgwNDE0NiwiZXhwIjoyMDk1MzgwMTQ2fQ.obArrfSNXq28vHTrtS2CX5LbG9AUk68V13ibFhnsVJI';

async function inspectSchema() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    console.error('Failed to fetch schema:', res.status, res.statusText);
    return;
  }

  const schema = await res.json();
  console.log('--- TABLES IN SCHEMA ---');
  if (schema.definitions) {
    for (const [tableName, definition] of Object.entries(schema.definitions)) {
      console.log(`Table: ${tableName}`);
      if (definition.properties) {
        console.log('  Columns:', Object.keys(definition.properties).join(', '));
      }
    }
  } else {
    console.log('No definitions found.');
  }
}

inspectSchema().catch(console.error);
