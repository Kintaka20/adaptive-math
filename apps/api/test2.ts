import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const cls = await prisma.classroom.findUnique({
    where: { id: 'cmplf70510001dt5suexensvc' },
    include: {
      chapters: { include: { chapter: true } }
    }
  });
  console.log(JSON.stringify(cls, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
