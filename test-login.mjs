import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vzycrsbzajgzqzfbujfb.supabase.co'
import * as fs from 'fs';
const env = fs.readFileSync('.env', 'utf-8');
const anonKey = env.split('\n').find(line => line.startsWith('VITE_SUPABASE_ANON_KEY='))?.split('=')[1] || '';

const supabase = createClient(supabaseUrl, anonKey)

async function testLogin() {
  console.log('Attempting login as admin...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@aviva.com',
    password: 'aviva123'
  })
  
  if (error) {
    console.error('Login Error:', error.status, error.message);
  } else {
    console.log('Login Success!', data.user?.email);
  }
}

testLogin();
