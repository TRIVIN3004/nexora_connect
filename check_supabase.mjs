import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
let url = '';
let key = '';
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k === 'VITE_SUPABASE_URL') {
    url = v.join('=').trim().replace(/['"]/g, '').replace(/\/rest\/v1\/?$/, '');
  }
  if (k === 'VITE_SUPABASE_ANON_KEY') {
    key = v.join('=').trim().replace(/['"]/g, '');
  }
});

const client = createClient(url, key);

async function check() {
  const tables = ['users', 'webinars', 'meetings', 'recordings', 'knowledge_notes', 'tickets', 'feedbacks', 'audit_logs', 'notifications'];
  for (const t of tables) {
    const { data, error } = await client.from(t).select('*');
    if (error) {
      console.log(t, 'ERROR:', error.message);
    } else {
      console.log(`\n=== Table: ${t} (${data.length} rows) ===`);
      if (t === 'users') {
        data.forEach(u => console.log(`  User: ${u.id} | ${u.email} | ${u.name} | ${u.role}`));
      } else {
        const ids = data.map(d => d.id);
        const titles = data.map(d => d.title || d.subject || d.email || d.name || d.id);
        console.log(`  Total: ${ids.length}`);
        data.forEach(d => console.log(`  - [${d.id}] ${d.title || d.subject || d.email || d.name || ''}`));
      }
    }
  }
}

check();
