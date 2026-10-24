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
  console.log("=== Inspecting Firebase DB #1 (ce-admin-panel2025) ===");
  const fb1 = await fetchJson('https://ce-admin-panel2025-default-rtdb.firebaseio.com/.json');
  if (fb1.body && typeof fb1.body === 'object') {
    for (const key of Object.keys(fb1.body)) {
      const val = fb1.body[key];
      const count = val ? (Array.isArray(val) ? val.length : Object.keys(val).length) : 0;
      console.log(`Node [${key}]: ${count} items`);
    }
  }
}

test();
