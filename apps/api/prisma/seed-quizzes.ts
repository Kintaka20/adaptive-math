import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedQuizzes() {
  console.log('🌱 Seeding quizzes and questions for existing chapters...')

  const chapters = await prisma.chapter.findMany({
    where: { isSystem: true },
    orderBy: [{ grade: 'asc' }, { order: 'asc' }],
  })

  console.log(`Found ${chapters.length} chapters`)

  const questionTemplates: Record<string, any[]> = {
    default: [
      {
        text: 'Manakah pernyataan berikut yang **benar**?',
        difficulty: 'EASY',
        explanation: 'Pernyataan ini merupakan konsep dasar yang perlu dipahami.',
        options: [
          { label: 'A', text: 'Pernyataan A yang benar', isCorrect: true },
          { label: 'B', text: 'Pernyataan B yang salah', isCorrect: false },
          { label: 'C', text: 'Pernyataan C yang salah', isCorrect: false },
          { label: 'D', text: 'Pernyataan D yang salah', isCorrect: false },
          { label: 'E', text: 'Pernyataan E yang salah', isCorrect: false },
        ],
      },
      {
        text: 'Nilai dari ekspresi berikut adalah...',
        difficulty: 'MEDIUM',
        explanation: 'Gunakan konsep dasar yang telah dipelajari untuk menyelesaikan soal ini.',
        options: [
          { label: 'A', text: '10', isCorrect: false },
          { label: 'B', text: '20', isCorrect: true },
          { label: 'C', text: '30', isCorrect: false },
          { label: 'D', text: '40', isCorrect: false },
          { label: 'E', text: '50', isCorrect: false },
        ],
      },
      {
        text: 'Tentukan hasil dari operasi berikut!',
        difficulty: 'HARD',
        explanation: 'Soal ini membutuhkan pemahaman mendalam tentang konsep yang dipelajari.',
        options: [
          { label: 'A', text: 'Hasil A', isCorrect: false },
          { label: 'B', text: 'Hasil B', isCorrect: false },
          { label: 'C', text: 'Hasil C', isCorrect: true },
          { label: 'D', text: 'Hasil D', isCorrect: false },
          { label: 'E', text: 'Hasil E', isCorrect: false },
        ],
      },
    ],
  }

  const topicQuestions: Record<string, any[]> = {
    'Eksponen': [
      {
        text: 'Nilai dari $2^3 \\times 2^4$ adalah...',
        difficulty: 'EASY',
        explanation: 'Menggunakan sifat $a^m \\times a^n = a^{m+n}$, maka $2^3 \\times 2^4 = 2^7 = 128$',
        options: [
          { label: 'A', text: '$64$', isCorrect: false },
          { label: 'B', text: '$128$', isCorrect: true },
          { label: 'C', text: '$256$', isCorrect: false },
          { label: 'D', text: '$512$', isCorrect: false },
          { label: 'E', text: '$32$', isCorrect: false },
        ],
      },
      {
        text: 'Bentuk sederhana dari $\\frac{3^6}{3^2}$ adalah...',
        difficulty: 'EASY',
        explanation: 'Menggunakan sifat $\\frac{a^m}{a^n} = a^{m-n}$, maka $\\frac{3^6}{3^2} = 3^4 = 81$',
        options: [
          { label: 'A', text: '$27$', isCorrect: false },
          { label: 'B', text: '$81$', isCorrect: true },
          { label: 'C', text: '$243$', isCorrect: false },
          { label: 'D', text: '$9$', isCorrect: false },
          { label: 'E', text: '$729$', isCorrect: false },
        ],
      },
      {
        text: 'Nilai dari $\\log_2 8$ adalah...',
        difficulty: 'EASY',
        explanation: '$\\log_2 8 = \\log_2 2^3 = 3$',
        options: [
          { label: 'A', text: '$2$', isCorrect: false },
          { label: 'B', text: '$3$', isCorrect: true },
          { label: 'C', text: '$4$', isCorrect: false },
          { label: 'D', text: '$8$', isCorrect: false },
          { label: 'E', text: '$16$', isCorrect: false },
        ],
      },
      {
        text: 'Jika $\\log 2 = 0,301$, maka nilai dari $\\log 8$ adalah...',
        difficulty: 'MEDIUM',
        explanation: '$\\log 8 = \\log 2^3 = 3 \\log 2 = 3 \\times 0,301 = 0,903$',
        options: [
          { label: 'A', text: '$0,602$', isCorrect: false },
          { label: 'B', text: '$0,699$', isCorrect: false },
          { label: 'C', text: '$0,903$', isCorrect: true },
          { label: 'D', text: '$1,204$', isCorrect: false },
          { label: 'E', text: '$2,408$', isCorrect: false },
        ],
      },
      {
        text: 'Nilai dari $5^0 + 5^{-1}$ adalah...',
        difficulty: 'MEDIUM',
        explanation: '$5^0 = 1$ dan $5^{-1} = \\frac{1}{5} = 0,2$, sehingga $5^0 + 5^{-1} = 1 + 0,2 = 1,2 = \\frac{6}{5}$',
        options: [
          { label: 'A', text: '$\\frac{4}{5}$', isCorrect: false },
          { label: 'B', text: '$\\frac{6}{5}$', isCorrect: true },
          { label: 'C', text: '$\\frac{7}{5}$', isCorrect: false },
          { label: 'D', text: '$\\frac{9}{5}$', isCorrect: false },
          { label: 'E', text: '$\\frac{11}{5}$', isCorrect: false },
        ],
      },
    ],
    'Trigonometri': [
      {
        text: 'Nilai dari $\\sin 30°$ adalah...',
        difficulty: 'EASY',
        explanation: '$\\sin 30° = \\frac{1}{2}$ merupakan nilai sudut istimewa.',
        options: [
          { label: 'A', text: '$\\frac{1}{2}$', isCorrect: true },
          { label: 'B', text: '$\\frac{\\sqrt{2}}{2}$', isCorrect: false },
          { label: 'C', text: '$\\frac{\\sqrt{3}}{2}$', isCorrect: false },
          { label: 'D', text: '$1$', isCorrect: false },
          { label: 'E', text: '$0$', isCorrect: false },
        ],
      },
      {
        text: 'Nilai dari $\\cos 60°$ adalah...',
        difficulty: 'EASY',
        explanation: '$\\cos 60° = \\frac{1}{2}$ merupakan nilai sudut istimewa.',
        options: [
          { label: 'A', text: '$\\frac{\\sqrt{3}}{2}$', isCorrect: false },
          { label: 'B', text: '$\\frac{1}{2}$', isCorrect: true },
          { label: 'C', text: '$\\frac{\\sqrt{2}}{2}$', isCorrect: false },
          { label: 'D', text: '$0$', isCorrect: false },
          { label: 'E', text: '$1$', isCorrect: false },
        ],
      },
      {
        text: 'Nilai dari $\\tan 45°$ adalah...',
        difficulty: 'EASY',
        explanation: '$\\tan 45° = 1$ karena $\\tan 45° = \\frac{\\sin 45°}{\\cos 45°} = \\frac{\\frac{\\sqrt{2}}{2}}{\\frac{\\sqrt{2}}{2}} = 1$',
        options: [
          { label: 'A', text: '$0$', isCorrect: false },
          { label: 'B', text: '$\\frac{1}{2}$', isCorrect: false },
          { label: 'C', text: '$\\frac{\\sqrt{3}}{2}$', isCorrect: false },
          { label: 'D', text: '$1$', isCorrect: true },
          { label: 'E', text: '$\\sqrt{3}$', isCorrect: false },
        ],
      },
      {
        text: 'Jika $\\sin \\alpha = \\frac{3}{5}$, maka $\\cos \\alpha$ adalah...',
        difficulty: 'MEDIUM',
        explanation: 'Menggunakan identitas $\\sin^2 \\alpha + \\cos^2 \\alpha = 1$, maka $\\cos \\alpha = \\sqrt{1 - (\\frac{3}{5})^2} = \\sqrt{\\frac{16}{25}} = \\frac{4}{5}$',
        options: [
          { label: 'A', text: '$\\frac{3}{4}$', isCorrect: false },
          { label: 'B', text: '$\\frac{4}{5}$', isCorrect: true },
          { label: 'C', text: '$\\frac{5}{4}$', isCorrect: false },
          { label: 'D', text: '$\\frac{4}{3}$', isCorrect: false },
          { label: 'E', text: '$\\frac{5}{3}$', isCorrect: false },
        ],
      },
      {
        text: 'Nilai dari $\\sin^2 30° + \\cos^2 30°$ adalah...',
        difficulty: 'EASY',
        explanation: 'Menggunakan identitas Pythagoras: $\\sin^2 \\theta + \\cos^2 \\theta = 1$ untuk semua $\\theta$.',
        options: [
          { label: 'A', text: '$0$', isCorrect: false },
          { label: 'B', text: '$\\frac{1}{2}$', isCorrect: false },
          { label: 'C', text: '$1$', isCorrect: true },
          { label: 'D', text: '$\\frac{3}{4}$', isCorrect: false },
          { label: 'E', text: '$2$', isCorrect: false },
        ],
      },
    ],
    'Persamaan': [
      {
        text: 'Himpunan penyelesaian dari $2x + 3 = 7$ adalah...',
        difficulty: 'EASY',
        explanation: '$2x = 7 - 3 = 4$, maka $x = 2$',
        options: [
          { label: 'A', text: '$\\{1\\}$', isCorrect: false },
          { label: 'B', text: '$\\{2\\}$', isCorrect: true },
          { label: 'C', text: '$\\{3\\}$', isCorrect: false },
          { label: 'D', text: '$\\{4\\}$', isCorrect: false },
          { label: 'E', text: '$\\{5\\}$', isCorrect: false },
        ],
      },
      {
        text: 'Penyelesaian dari sistem persamaan $x + y = 5$ dan $x - y = 1$ adalah...',
        difficulty: 'MEDIUM',
        explanation: 'Menjumlahkan kedua persamaan: $2x = 6$, maka $x = 3$. Substitusi: $3 + y = 5$, maka $y = 2$.',
        options: [
          { label: 'A', text: '$x = 2, y = 3$', isCorrect: false },
          { label: 'B', text: '$x = 3, y = 2$', isCorrect: true },
          { label: 'C', text: '$x = 4, y = 1$', isCorrect: false },
          { label: 'D', text: '$x = 1, y = 4$', isCorrect: false },
          { label: 'E', text: '$x = 5, y = 0$', isCorrect: false },
        ],
      },
      {
        text: 'Nilai $x$ yang memenuhi $3x - 2 = x + 6$ adalah...',
        difficulty: 'EASY',
        explanation: '$3x - x = 6 + 2$, maka $2x = 8$, sehingga $x = 4$',
        options: [
          { label: 'A', text: '$2$', isCorrect: false },
          { label: 'B', text: '$3$', isCorrect: false },
          { label: 'C', text: '$4$', isCorrect: true },
          { label: 'D', text: '$5$', isCorrect: false },
          { label: 'E', text: '$6$', isCorrect: false },
        ],
      },
      {
        text: 'Diketahui sistem persamaan $2x + 3y = 12$ dan $x - y = 1$. Nilai $x + y$ adalah...',
        difficulty: 'MEDIUM',
        explanation: 'Dari persamaan 2: $x = y + 1$. Substitusi ke persamaan 1: $2(y+1) + 3y = 12 \\Rightarrow 5y = 10 \\Rightarrow y = 2, x = 3$. Jadi $x + y = 5$.',
        options: [
          { label: 'A', text: '$3$', isCorrect: false },
          { label: 'B', text: '$4$', isCorrect: false },
          { label: 'C', text: '$5$', isCorrect: true },
          { label: 'D', text: '$6$', isCorrect: false },
          { label: 'E', text: '$7$', isCorrect: false },
        ],
      },
      {
        text: 'Jika $\\frac{1}{x} + \\frac{1}{y} = \\frac{5}{6}$ dan $\\frac{1}{x} - \\frac{1}{y} = \\frac{1}{6}$, maka nilai $xy$ adalah...',
        difficulty: 'HARD',
        explanation: 'Menjumlahkan: $\\frac{2}{x} = 1 \\Rightarrow x = 2$. Mengurangkan: $\\frac{2}{y} = \\frac{4}{6} = \\frac{2}{3} \\Rightarrow y = 3$. Maka $xy = 6$.',
        options: [
          { label: 'A', text: '$4$', isCorrect: false },
          { label: 'B', text: '$5$', isCorrect: false },
          { label: 'C', text: '$6$', isCorrect: true },
          { label: 'D', text: '$8$', isCorrect: false },
          { label: 'E', text: '$12$', isCorrect: false },
        ],
      },
    ],
    'Fungsi': [
      {
        text: 'Jika $f(x) = 2x + 3$, maka $f(4)$ adalah...',
        difficulty: 'EASY',
        explanation: '$f(4) = 2(4) + 3 = 8 + 3 = 11$',
        options: [
          { label: 'A', text: '$8$', isCorrect: false },
          { label: 'B', text: '$10$', isCorrect: false },
          { label: 'C', text: '$11$', isCorrect: true },
          { label: 'D', text: '$12$', isCorrect: false },
          { label: 'E', text: '$13$', isCorrect: false },
        ],
      },
      {
        text: 'Fungsi $f(x) = x^2 - 4$ memiliki titik balik di...',
        difficulty: 'MEDIUM',
        explanation: 'Fungsi $f(x) = x^2 - 4$ memiliki titik minimum di $(0, -4)$ karena koefisien $x^2 > 0$.',
        options: [
          { label: 'A', text: '$(0, 4)$', isCorrect: false },
          { label: 'B', text: '$(0, -4)$', isCorrect: true },
          { label: 'C', text: '$(2, 0)$', isCorrect: false },
          { label: 'D', text: '$(-2, 0)$', isCorrect: false },
          { label: 'E', text: '$(4, 0)$', isCorrect: false },
        ],
      },
      {
        text: 'Domain dari fungsi $f(x) = \\sqrt{x - 2}$ adalah...',
        difficulty: 'MEDIUM',
        explanation: 'Agar fungsi terdefinisi, syaratnya $x - 2 \\geq 0$, sehingga $x \\geq 2$. Domain: $\\{x | x \\geq 2, x \\in \\mathbb{R}\\}$.',
        options: [
          { label: 'A', text: '$x < 2$', isCorrect: false },
          { label: 'B', text: '$x \\leq 2$', isCorrect: false },
          { label: 'C', text: '$x \\geq 2$', isCorrect: true },
          { label: 'D', text: '$x > 2$', isCorrect: false },
          { label: 'E', text: 'Semua bilangan real', isCorrect: false },
        ],
      },
      {
        text: 'Jika $f(x) = x^2 + 1$ dan $g(x) = 2x - 3$, maka $(f \\circ g)(2)$ adalah...',
        difficulty: 'MEDIUM',
        explanation: '$g(2) = 2(2) - 3 = 1$. $(f \\circ g)(2) = f(g(2)) = f(1) = 1^2 + 1 = 2$.',
        options: [
          { label: 'A', text: '$1$', isCorrect: false },
          { label: 'B', text: '$2$', isCorrect: true },
          { label: 'C', text: '$3$', isCorrect: false },
          { label: 'D', text: '$5$', isCorrect: false },
          { label: 'E', text: '$9$', isCorrect: false },
        ],
      },
      {
        text: 'Invers dari fungsi $f(x) = 3x - 6$ adalah...',
        difficulty: 'MEDIUM',
        explanation: 'Misalkan $y = 3x - 6$, maka $3x = y + 6$, sehingga $x = \\frac{y+6}{3}$. Jadi $f^{-1}(x) = \\frac{x+6}{3}$.',
        options: [
          { label: 'A', text: '$f^{-1}(x) = 3x + 6$', isCorrect: false },
          { label: 'B', text: '$f^{-1}(x) = \\frac{x+6}{3}$', isCorrect: true },
          { label: 'C', text: '$f^{-1}(x) = \\frac{x-6}{3}$', isCorrect: false },
          { label: 'D', text: '$f^{-1}(x) = \\frac{3}{x-6}$', isCorrect: false },
          { label: 'E', text: '$f^{-1}(x) = \\frac{6}{x+3}$', isCorrect: false },
        ],
      },
    ],
    'Statistika': [
      {
        text: 'Rata-rata dari data: 4, 6, 8, 10, 12 adalah...',
        difficulty: 'EASY',
        explanation: 'Rata-rata $= \\frac{4 + 6 + 8 + 10 + 12}{5} = \\frac{40}{5} = 8$',
        options: [
          { label: 'A', text: '$6$', isCorrect: false },
          { label: 'B', text: '$7$', isCorrect: false },
          { label: 'C', text: '$8$', isCorrect: true },
          { label: 'D', text: '$9$', isCorrect: false },
          { label: 'E', text: '$10$', isCorrect: false },
        ],
      },
      {
        text: 'Median dari data: 3, 7, 5, 2, 9, 1, 6 adalah...',
        difficulty: 'EASY',
        explanation: 'Data diurutkan: 1, 2, 3, 5, 6, 7, 9. Median adalah nilai tengah = 5 (posisi ke-4 dari 7 data).',
        options: [
          { label: 'A', text: '$3$', isCorrect: false },
          { label: 'B', text: '$4$', isCorrect: false },
          { label: 'C', text: '$5$', isCorrect: true },
          { label: 'D', text: '$6$', isCorrect: false },
          { label: 'E', text: '$7$', isCorrect: false },
        ],
      },
      {
        text: 'Modus dari data: 2, 3, 3, 4, 5, 3, 6, 7 adalah...',
        difficulty: 'EASY',
        explanation: 'Modus adalah nilai yang paling sering muncul. Nilai 3 muncul 3 kali, lebih banyak dari nilai lainnya.',
        options: [
          { label: 'A', text: '$2$', isCorrect: false },
          { label: 'B', text: '$3$', isCorrect: true },
          { label: 'C', text: '$4$', isCorrect: false },
          { label: 'D', text: '$5$', isCorrect: false },
          { label: 'E', text: '$6$', isCorrect: false },
        ],
      },
      {
        text: 'Simpangan baku dari data: 2, 4, 6, 8, 10 adalah...',
        difficulty: 'HARD',
        explanation: 'Mean = 6. Varians = $\\frac{(2-6)^2 + (4-6)^2 + (6-6)^2 + (8-6)^2 + (10-6)^2}{5} = \\frac{16+4+0+4+16}{5} = 8$. Simpangan baku = $\\sqrt{8} = 2\\sqrt{2}$.',
        options: [
          { label: 'A', text: '$2$', isCorrect: false },
          { label: 'B', text: '$2\\sqrt{2}$', isCorrect: true },
          { label: 'C', text: '$4$', isCorrect: false },
          { label: 'D', text: '$4\\sqrt{2}$', isCorrect: false },
          { label: 'E', text: '$8$', isCorrect: false },
        ],
      },
      {
        text: 'Persentil ke-25 (Q1) dari data: 10, 20, 30, 40, 50, 60, 70, 80 adalah...',
        difficulty: 'MEDIUM',
        explanation: 'Q1 = nilai pada posisi $\\frac{25}{100} \\times 8 = 2$, yaitu rata-rata data ke-2 dan ke-3 = $\\frac{20+30}{2} = 25$.',
        options: [
          { label: 'A', text: '$20$', isCorrect: false },
          { label: 'B', text: '$25$', isCorrect: true },
          { label: 'C', text: '$30$', isCorrect: false },
          { label: 'D', text: '$35$', isCorrect: false },
          { label: 'E', text: '$40$', isCorrect: false },
        ],
      },
    ],
  }

  let totalQuizzes = 0
  let totalQuestions = 0

  for (const chapter of chapters) {
    let questionSet = questionTemplates.default
    for (const [keyword, questions] of Object.entries(topicQuestions)) {
      if (chapter.name.toLowerCase().includes(keyword.toLowerCase())) {
        questionSet = questions
        break
      }
    }

    const existingQuiz = await prisma.quiz.findFirst({
      where: { chapterId: chapter.id, isSystem: true },
    })

    if (existingQuiz) {
      console.log(`⏭️  Quiz already exists for: ${chapter.name}`)
      continue
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: `Latihan Soal: ${chapter.name}`,
        description: `Kumpulan soal latihan untuk bab ${chapter.name}`,
        chapterId: chapter.id,
        type: 'PRACTICE',
        timeLimit: 30,
        passingScore: 70,
        order: 1,
        status: 'PUBLISHED',
        isSystem: true,
      },
    })
    totalQuizzes++
    console.log(`✅ Created quiz for: ${chapter.name}`)

    let questionOrder = 1
    for (const qData of questionSet) {
      const question = await prisma.question.create({
        data: {
          text: qData.text,
          difficulty: qData.difficulty,
          explanation: qData.explanation,
          chapterId: chapter.id,
          grade: chapter.grade,
          isSystem: true,
          options: {
            create: qData.options,
          },
        },
      })
      totalQuestions++

      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionId: question.id,
          order: questionOrder++,
        },
      })
    }

    console.log(`   Added ${questionSet.length} questions`)
  }

  console.log(`\n✨ Done! Created ${totalQuizzes} quizzes with ${totalQuestions} questions total`)
}

seedQuizzes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
