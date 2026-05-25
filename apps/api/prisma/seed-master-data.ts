import { PrismaClient, Grade, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

const curriculum = [
  {
    grade: Grade.X,
    chapters: [
      { name: 'Eksponen dan Logaritma', desc: 'Sifat-sifat eksponen dan logaritma' },
      { name: 'Sistem Persamaan Linear', desc: 'SPLDV dan SPLTV' },
      { name: 'Fungsi Kuadrat', desc: 'Grafik dan penerapan fungsi kuadrat' },
      { name: 'Trigonometri Dasar', desc: 'Perbandingan trigonometri pada segitiga siku-siku' },
      { name: 'Statistika X', desc: 'Penyajian data dan ukuran pemusatan' },
    ]
  },
  {
    grade: Grade.XI,
    chapters: [
      { name: 'Matriks', desc: 'Operasi matriks dan determinan' },
      { name: 'Transformasi Geometri', desc: 'Translasi, refleksi, rotasi, dilatasi' },
      { name: 'Limit Fungsi', desc: 'Konsep limit dan limit fungsi aljabar' },
      { name: 'Turunan Fungsi', desc: 'Turunan pertama dan penerapannya' },
      { name: 'Barisan dan Deret', desc: 'Barisan aritmetika dan geometri' },
    ]
  },
  {
    grade: Grade.XII,
    chapters: [
      { name: 'Integral', desc: 'Integral tak tentu dan tentu' },
      { name: 'Dimensi Tiga', desc: 'Jarak dan sudut pada bangun ruang' },
      { name: 'Peluang', desc: 'Kaidah pencacahan dan peluang kejadian' },
      { name: 'Statistika Inferensial', desc: 'Distribusi peluang binomial dan normal' },
      { name: 'Limit Fungsi Trigonometri', desc: 'Limit fungsi trigonometri dan ketakhinggaan' },
    ]
  }
]

async function main() {
  console.log('🚀 Starting bulk generation for Master Data...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })

  for (const gradeData of curriculum) {
    console.log(`\n📚 Generating for Grade: ${gradeData.grade}`)
    
    let chapterOrder = 1;
    for (const chap of gradeData.chapters) {
      console.log(`  -> Creating Chapter: ${chap.name}`)
      
      const chapter = await prisma.chapter.create({
        data: {
          name: chap.name,
          description: chap.desc,
          grade: gradeData.grade,
          order: chapterOrder++,
          status: 'PUBLISHED',
        }
      })

      const materials = []
      for (let i = 1; i <= 10; i++) {
        materials.push({
          title: `Materi ${i}: ${chap.name}`,
          content: `# Pengantar ${chap.name} Bagian ${i}\n\nIni adalah materi pembelajaran untuk bab ${chap.name}. Pada bagian ini kita akan membahas konsep dasar dan contoh soal secara mendalam.\n\n## Konsep Utama\n1. Pemahaman dasar\n2. Rumus penting\n3. Cara penyelesaian\n\n**Contoh:**\nJika diketahui x = ${i}, maka nilai persamaannya dapat dicari dengan mensubstitusi x ke dalam rumus utama.`,
          duration: `${Math.floor(Math.random() * 10) + 10} menit`, // 10-20 minutes
          chapterId: chapter.id,
          order: i,
          status: 'PUBLISHED' as const,
          isSystem: true,
        })
      }
      await prisma.material.createMany({ data: materials })

      const questionsData = []
      for (let j = 1; j <= 10; j++) {
        const difficulty = j <= 3 ? Difficulty.EASY : (j <= 7 ? Difficulty.MEDIUM : Difficulty.HARD)
        questionsData.push({
          text: `Pertanyaan evaluasi ${j} untuk materi ${chap.name}. Berapakah hasil perhitungan dari konsep ini jika nilai konstanta adalah ${j * 2}?`,
          difficulty,
          explanation: `Penjelasan singkat: Karena ini menerapkan prinsip ${chap.name}, kita menggunakan rumus standar untuk menyelesaikannya.`,
          chapterId: chapter.id,
          grade: gradeData.grade,
          isSystem: true,
          rating: 4.0 + Math.random(),
          usageCount: Math.floor(Math.random() * 50)
        })
      }

      for (const q of questionsData) {
        await prisma.question.create({
          data: {
            ...q,
            options: {
              create: [
                { label: 'A', text: `Pilihan jawaban A`, isCorrect: true },
                { label: 'B', text: `Pilihan jawaban B`, isCorrect: false },
                { label: 'C', text: `Pilihan jawaban C`, isCorrect: false },
                { label: 'D', text: `Pilihan jawaban D`, isCorrect: false },
                { label: 'E', text: `Pilihan jawaban E`, isCorrect: false },
              ]
            }
          }
        })
      }

      console.log(`     ✅ Created 10 materials and 10 questions for ${chap.name}`)
    }
  }

  console.log('\n🎉 Bulk generation completed successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
