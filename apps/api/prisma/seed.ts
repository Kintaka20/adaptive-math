import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const school = await prisma.school.upsert({
    where: { id: 'school-default' },
    update: {},
    create: {
      id: 'school-default',
      name: 'SMA Demo School',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      type: 'NEGERI',
    },
  })
  console.log('✅ School:', school.name)

  const adminPassword = await bcrypt.hash('admin123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adaptivemath.id' },
    update: {},
    create: {
      email: 'admin@adaptivemath.id',
      password: adminPassword,
      name: 'Admin Sistem',
      role: 'ADMIN',
      admin: { create: {} },
    },
  })
  console.log('✅ Admin:', admin.email)

  const teacherPassword = await bcrypt.hash('guru123456', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'guru@adaptivemath.id' },
    update: {},
    create: {
      email: 'guru@adaptivemath.id',
      password: teacherPassword,
      name: 'Budi Santoso',
      role: 'TEACHER',
      teacher: {
        create: {
          schoolId: school.id,
          nip: '198501012010011001',
        },
      },
    },
  })
  console.log('✅ Teacher:', teacher.email)

  const studentPassword = await bcrypt.hash('siswa123456', 12)
  const student = await prisma.user.upsert({
    where: { email: 'siswa@adaptivemath.id' },
    update: {},
    create: {
      email: 'siswa@adaptivemath.id',
      password: studentPassword,
      name: 'Andi Pratama',
      role: 'STUDENT',
      student: {
        create: {
          schoolId: school.id,
          grade: 'XII',
          totalXP: 250,
          currentLevel: 3,
          streakDays: 5,
        },
      },
    },
  })
  console.log('✅ Student:', student.email)

  const chapter1 = await prisma.chapter.upsert({
    where: { id: 'chapter-trig' },
    update: {},
    create: {
      id: 'chapter-trig',
      name: 'Trigonometri',
      description: 'Mempelajari fungsi sin, cos, tan dan identitas trigonometri',
      grade: 'XII',
      order: 1,
      status: 'PUBLISHED',
    },
  })

  const chapter2 = await prisma.chapter.upsert({
    where: { id: 'chapter-deriv' },
    update: {},
    create: {
      id: 'chapter-deriv',
      name: 'Turunan',
      description: 'Konsep turunan fungsi dan penerapannya',
      grade: 'XII',
      order: 2,
      status: 'PUBLISHED',
    },
  })
  console.log('✅ Chapters:', chapter1.name, chapter2.name)

  await prisma.material.upsert({
    where: { id: 'mat-trig-1' },
    update: {},
    create: {
      id: 'mat-trig-1',
      title: 'Pengenalan Sin, Cos, Tan',
      content: `# Pengenalan Trigonometri\n\nTrigonometri adalah cabang matematika yang mempelajari hubungan antara sudut dan sisi segitiga.\n\n## Fungsi Dasar\n\n$$\\sin \\theta = \\frac{\\text{sisi depan}}{\\text{sisi miring}}$$\n\n$$\\cos \\theta = \\frac{\\text{sisi samping}}{\\text{sisi miring}}$$\n\n$$\\tan \\theta = \\frac{\\text{sisi depan}}{\\text{sisi samping}} = \\frac{\\sin \\theta}{\\cos \\theta}$$`,
      duration: '15 menit',
      chapterId: chapter1.id,
      order: 1,
      status: 'PUBLISHED',
      isSystem: true,
    },
  })
  console.log('✅ Material created')

  const q1 = await prisma.question.upsert({
    where: { id: 'q-trig-1' },
    update: {},
    create: {
      id: 'q-trig-1',
      text: 'Nilai dari $\\sin 30°$ adalah...',
      difficulty: 'EASY',
      explanation: '$\\sin 30° = \\frac{1}{2}$ merupakan nilai sudut istimewa yang harus dihafal.',
      chapterId: chapter1.id,
      grade: 'XII',
      isSystem: true,
      rating: 4.5,
      options: {
        create: [
          { label: 'A', text: '$\\frac{1}{2}$', isCorrect: true },
          { label: 'B', text: '$\\frac{\\sqrt{2}}{2}$', isCorrect: false },
          { label: 'C', text: '$\\frac{\\sqrt{3}}{2}$', isCorrect: false },
          { label: 'D', text: '$1$', isCorrect: false },
          { label: 'E', text: '$0$', isCorrect: false },
        ],
      },
    },
  })
  console.log('✅ Question:', q1.text.slice(0, 30))

  const badges = [
    { id: 'badge-first', name: 'Pemula', description: 'Selesaikan quiz pertama', icon: '🎯', requirement: 'first_quiz', xpReward: 50 },
    { id: 'badge-streak', name: 'Konsisten', description: 'Login 7 hari berturut-turut', icon: '🔥', requirement: 'streak_7', xpReward: 100 },
    { id: 'badge-perfect', name: 'Sempurna', description: 'Nilai 100 di quiz', icon: '⭐', requirement: 'perfect_score', xpReward: 200 },
    { id: 'badge-master', name: 'Master', description: 'Selesaikan semua materi satu bab', icon: '🏆', requirement: 'chapter_complete', xpReward: 500 },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {},
      create: badge,
    })
  }
  console.log('✅ Badges seeded')

  console.log('\n✨ Seeding complete!')
  console.log('\nTest accounts:')
  console.log('  Admin:   admin@adaptivemath.id / admin123456')
  console.log('  Guru:    guru@adaptivemath.id / guru123456')
  console.log('  Siswa:   siswa@adaptivemath.id / siswa123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
