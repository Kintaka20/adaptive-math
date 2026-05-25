const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function check() {
  const q1 = await p.question.findFirst({ include: { chapter: true, options: true } })
  console.log('First question:', JSON.stringify(q1, null, 2))
  const systemCount = await p.question.count({ where: { isSystem: true } })
  const noChapter = await p.question.count({ where: { chapterId: null } })
  console.log('isSystem=true count:', systemCount)
  console.log('No chapter count:', noChapter)
  await p.$disconnect()
}

check().catch(e => { console.error(e); p.$disconnect() })
