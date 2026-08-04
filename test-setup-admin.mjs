import * as fs from 'fs';

async function run() {
  const env = fs.readFileSync('.env', 'utf-8');
  const anonKey = env.split('\n').find(line => line.startsWith('VITE_SUPABASE_ANON_KEY='))?.split('=')[1] || '';
  
  console.log('Invoking setup-admin edge function...');
  const res = await fetch('https://vzycrsbzajgzqzfbujfb.supabase.co/functions/v1/setup-admin', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

run();
