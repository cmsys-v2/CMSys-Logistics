const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function checkDb(dbRelativePath) {
  const dbPath = path.resolve(__dirname, dbRelativePath);
  process.env.DATABASE_URL = `file:${dbPath}`;
  const prisma = new PrismaClient();

  console.log("=== Inspecting DB:", dbPath, "===");
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
        console.log(`  ${m}: ${count} records`);
      }
    } catch(e) {
      console.log(`  ${m}: error ${e.message}`);
    }
  }
  await prisma.$disconnect();
}

async function main() {
  await checkDb('../../CE-Logistic Panel - Copy/db/custom.db');
  await checkDb('../../CE-Logistic Panel - Copy/prisma/custom.db');
  await checkDb('../db/custom.db');
  await checkDb('../prisma/custom.db');
}

main().catch(console.error);
