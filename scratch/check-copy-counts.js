const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../CE-Logistic Panel - Copy/prisma/custom.db');
process.env.DATABASE_URL = `file:${dbPath}`;
const prisma = new PrismaClient();

async function main() {
  console.log("=== CE-Logistic Panel - Copy DB Inspection ===");
  console.log("DB path:", dbPath);
  const models = [
    'userProfile', 'project', 'projectFile', 'storeItem', 
    'rateContract', 'stakeholder', 'procurementFile', 
    'estimate', 'changeLog', 'syncStatus', 'discontinuedItem',
    'collectionItem', 'dailyCollection', 'itemMaster'
  ];
  for (const m of models) {
    try {
      if (prisma[m]) {
        const count = await prisma[m].count();
        console.log(`${m}: ${count} records`);
      }
    } catch(e) {
      console.log(`${m}: error ${e.message}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
