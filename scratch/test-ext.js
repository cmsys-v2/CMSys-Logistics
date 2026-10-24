const { PrismaClient } = require('@prisma/client');
const rawDb = new PrismaClient();
const db = rawDb.$extends({
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        console.log('Extension model name:', model);
        return query(args);
      }
    }
  }
});
async function test() {
  await db.qCInspection.findMany({ take: 1 });
  await db.projectFile.findMany({ take: 1 });
}
test().catch(console.error).finally(() => rawDb.$disconnect());
