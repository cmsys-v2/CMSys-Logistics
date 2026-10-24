const https = require('https');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function test() {
  console.log("=== Deep Inspection of ce-admin-panel2025 ===");
  const base = 'https://ce-admin-panel2025-default-rtdb.firebaseio.com';
  
  const nodes = ['daily_tasks', 'out_projects', 'sailor_project_history', 'sd_office_data', 'temp_drafts', 'availability', 'users', 'officerAccess', 'task_settings', 'pms_settings'];
  for (const node of nodes) {
    const res = await fetchJson(`${base}/${node}.json`);
    console.log(`\n--- Node: ${node} ---`);
    if (res.body && typeof res.body === 'object') {
      const keys = Object.keys(res.body);
      console.log(`Total Keys: ${keys.length}`);
      console.log(`First 3 keys:`, keys.slice(0, 3));
      const sampleKey = keys[0];
      if (sampleKey) {
        console.log(`Sample item [${sampleKey}]:`, JSON.stringify(res.body[sampleKey]).slice(0, 200));
      }
    } else {
      console.log(`Response:`, res.body);
    }
  }
}

test();
