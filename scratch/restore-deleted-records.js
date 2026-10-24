const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Target DB (CE-Logistic Panel)
const mainDbPath = path.resolve(__dirname, '../prisma/custom.db');
process.env.DATABASE_URL = `file:${mainDbPath}`;
const mainPrisma = new PrismaClient();

// Source DB (CE-Logistic Panel - Copy)
const copyDbPath = path.resolve(__dirname, '../../CE-Logistic Panel - Copy/prisma/custom.db');

async function restore() {
  console.log("=== Starting Database Restoration ===");
  console.log("Source DB:", copyDbPath);
  console.log("Target DB:", mainDbPath);

  const copyPrisma = new (require('@prisma/client').PrismaClient)({
    datasources: { db: { url: `file:${copyDbPath}` } }
  });

  try {
    // 1. Stakeholders
    const copyStakeholders = await copyPrisma.stakeholder.findMany();
    console.log(`Found ${copyStakeholders.length} stakeholders in backup.`);
    for (const item of copyStakeholders) {
      await mainPrisma.stakeholder.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
    }

    // 2. Procurement Files
    const copyProcurements = await copyPrisma.procurementFile.findMany();
    console.log(`Found ${copyProcurements.length} procurement files in backup.`);
    for (const item of copyProcurements) {
      await mainPrisma.procurementFile.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
    }

    // 3. Collection Items
    const copyCollections = await copyPrisma.collectionItem.findMany();
    console.log(`Found ${copyCollections.length} collection items in backup.`);
    for (const item of copyCollections) {
      await mainPrisma.collectionItem.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
    }

    // 4. Daily Collections
    const copyDaily = await copyPrisma.dailyCollection.findMany();
    console.log(`Found ${copyDaily.length} daily collection records in backup.`);
    for (const item of copyDaily) {
      await mainPrisma.dailyCollection.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
    }

    // 5. User Profiles
    const copyUsers = await copyPrisma.userProfile.findMany();
    console.log(`Found ${copyUsers.length} user profiles in backup.`);
    for (const item of copyUsers) {
      await mainPrisma.userProfile.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
    }

    console.log("\n✅ RESTORATION COMPLETE SUCCESSFULLY!");
  } catch (err) {
    console.error("Restoration error:", err);
  } finally {
    await mainPrisma.$disconnect();
    await copyPrisma.$disconnect();
  }
}

restore();
