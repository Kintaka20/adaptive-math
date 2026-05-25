import { PrismaClient } from '@prisma/client'

const localUrl = process.env.LOCAL_DB_URL
const remoteUrl = process.env.REMOTE_DB_URL

if (!localUrl || !remoteUrl) {
  console.error('Harap masukkan LOCAL_DB_URL dan REMOTE_DB_URL')
  process.exit(1)
}

const prismaLocal = new PrismaClient({
  datasources: { db: { url: localUrl } },
})

const prismaRemote = new PrismaClient({
  datasources: { db: { url: remoteUrl } },
})

async function main() {
  console.log('🔄 Memulai migrasi Master Data...')

  // 1. Ambil data dari Local DB
  console.log('📦 Mengambil data dari database lokal...')
  const chapters = await prismaLocal.chapter.findMany()
  const materials = await prismaLocal.material.findMany()
  const questions = await prismaLocal.question.findMany({
    include: { options: true }
  })
  const badges = await prismaLocal.badge.findMany()

  console.log(`Ditemukan: ${chapters.length} Bab, ${materials.length} Materi, ${questions.length} Soal, ${badges.length} Badge.`)

  // 2. Masukkan ke Remote DB (Supabase)
  console.log('🚀 Mulai memindahkan data ke Supabase...')

  // Hapus data lama di Supabase (hanya master data) untuk menghindari duplikasi
  // Hati-hati: kita hapus dari bawah (child) ke atas (parent)
  await prismaRemote.questionOption.deleteMany()
  await prismaRemote.question.deleteMany()
  await prismaRemote.material.deleteMany()
  await prismaRemote.chapter.deleteMany()
  await prismaRemote.badge.deleteMany()

  // Migrasi Badges
  if (badges.length > 0) {
    await prismaRemote.badge.createMany({ data: badges, skipDuplicates: true })
    console.log('✅ Badges berhasil dipindahkan')
  }

  // Migrasi Chapters
  if (chapters.length > 0) {
    await prismaRemote.chapter.createMany({ data: chapters, skipDuplicates: true })
    console.log('✅ Bab (Chapters) berhasil dipindahkan')
  }

  // Migrasi Materials
  if (materials.length > 0) {
    await prismaRemote.material.createMany({ data: materials, skipDuplicates: true })
    console.log('✅ Materi berhasil dipindahkan')
  }

  // Migrasi Questions & Options
  if (questions.length > 0) {
    for (const q of questions) {
      const { options, ...questionData } = q
      // Insert Soal
      await prismaRemote.question.create({
        data: {
          ...questionData,
          options: {
            create: options.map(opt => {
              const { id, questionId, ...optData } = opt
              return optData
            })
          }
        }
      })
    }
    console.log('✅ Soal (Questions) dan Pilihan Ganda berhasil dipindahkan')
  }

  console.log('🎉 Migrasi Selesai!')
}

main()
  .catch(e => {
    console.error('❌ Terjadi kesalahan:', e)
  })
  .finally(async () => {
    await prismaLocal.$disconnect()
    await prismaRemote.$disconnect()
  })
