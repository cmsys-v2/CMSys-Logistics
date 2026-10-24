const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.userProfile.findMany();
  console.log('User profiles:', JSON.stringify(users, null, 2));
  const projectCount = await prisma.project.count();
  const fileCount = await prisma.projectFile.count();
  const procurementCount = await prisma.procurementFile.count();
  const storeItemCount = await prisma.storeItem.count();
  const rateContractCount = await prisma.rateContract.count();
  const stakeholderCount = await prisma.stakeholder.count();
  console.log({ projectCount, fileCount, procurementCount, storeItemCount, rateContractCount, stakeholderCount });
}
main().catch(console.error).finally(() => prisma.$disconnect());
