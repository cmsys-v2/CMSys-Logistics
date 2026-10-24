const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== SQLite Database Inspection ===");
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
