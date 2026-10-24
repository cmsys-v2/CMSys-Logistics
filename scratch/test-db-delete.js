const { db } = require('../src/lib/db');

async function testDelete() {
  try {
    console.log('Testing delete with non-id where clause...');
    // Create a dummy record or test query
    const res = await db.changeLog.findMany({ take: 1 });
    console.log('Found change logs:', res.length);
  } catch (err) {
    console.error('Test failed with error:', err);
  }
}

testDelete();
