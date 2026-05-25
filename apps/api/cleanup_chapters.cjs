// Cleanup unwanted chapters that are not in the BIG BOOK
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const validChapterNames = [
  'Eksponen dan Logaritma',
  'Sistem Persamaan Linear',
  'Fungsi Kuadrat',
  'Trigonometri Dasar',
  'Statistika X',
  'Barisan dan Deret',
  'Matriks',
  'Trigonometri',
  'Limit Fungsi',
  'Turunan',
  'Dimensi Tiga',
  'Statistika',
  'Peluang',
  'Integral',
  'Logika Matematika',
]

async function main() {
  const allChapters = await prisma.chapter.findMany({
    select: { id: true, name: true, grade: true },
    orderBy: { name: 'asc' },
  })

  console.log('Total chapters in DB: ' + allChapters.length)
  
  const toDelete = allChapters.filter(c => !validChapterNames.includes(c.name))
  
  if (toDelete.length === 0) {
    console.log('No chapters to delete!')
    return
  }

  console.log('\nChapters to DELETE (' + toDelete.length + '):')
  toDelete.forEach(c => console.log('  - ' + c.name + ' (' + c.grade + ')'))

  for (const ch of toDelete) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.classroomChapter.deleteMany({ where: { chapterId: ch.id } })
        const materialIds = (await tx.material.findMany({ where: { chapterId: ch.id }, select: { id: true } })).map(m => m.id)
        if (materialIds.length > 0) {
          await tx.materialProgress.deleteMany({ where: { materialId: { in: materialIds } } })
        }
        await tx.material.deleteMany({ where: { chapterId: ch.id } })
        const quizIds = (await tx.quiz.findMany({ where: { chapterId: ch.id }, select: { id: true } })).map(q => q.id)
        if (quizIds.length > 0) {
          const attemptIds = (await tx.quizAttempt.findMany({ where: { quizId: { in: quizIds } }, select: { id: true } })).map(a => a.id)
          if (attemptIds.length > 0) {
            await tx.attemptAnswer.deleteMany({ where: { attemptId: { in: attemptIds } } })
            await tx.quizAttempt.deleteMany({ where: { id: { in: attemptIds } } })
          }
          await tx.quizQuestion.deleteMany({ where: { quizId: { in: quizIds } } })
        }
        await tx.quiz.deleteMany({ where: { chapterId: ch.id } })
        await tx.question.deleteMany({ where: { chapterId: ch.id } })
        await tx.chapter.delete({ where: { id: ch.id } })
      })
      console.log('  OK Deleted: ' + ch.name)
    } catch (err) {
      console.error('  FAIL ' + ch.name + ': ' + err.message)
    }
  }

  const remaining = await prisma.chapter.findMany({
    select: { name: true, grade: true },
    orderBy: [{ grade: 'asc' }, { order: 'asc' }],
  })
  console.log('\nRemaining chapters (' + remaining.length + '):')
  remaining.forEach(c => console.log('  OK ' + c.name + ' (' + c.grade + ')'))
}

main().catch(console.error).finally(() => prisma.$disconnect())
