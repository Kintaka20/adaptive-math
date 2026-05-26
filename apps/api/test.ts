import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const cls = await prisma.classroom.findFirst({
    include: {
      chapters: { include: { chapter: true } }
    }
  });
  console.log(JSON.stringify(cls.chapters, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
