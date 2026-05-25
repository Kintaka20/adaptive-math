import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function reset() {
  console.log('🗑️ Clearing old data...')
  await prisma.quizQuestion.deleteMany({})
  await prisma.questionOption.deleteMany({})
  await prisma.question.deleteMany({})
  await prisma.quiz.deleteMany({})
  await prisma.materialProgress.deleteMany({})
  await prisma.material.deleteMany({})
  console.log('✅ Old materials, quizzes, questions cleared')
}

reset().catch(console.error).finally(() => prisma.$disconnect())
