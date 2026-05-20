const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').replace(/\r/g, '').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
});
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('profiles').select('*').then(res => {
  if(res.error) console.error(res.error);
  else console.log(JSON.stringify(res.data, null, 2));
});
