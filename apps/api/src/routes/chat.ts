import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { validate } from '../middleware/validate'
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { env } from '../config/env'
import { getRelevantContext } from '../utils/contextLoader'

const router = Router()

const newSessionSchema = z.object({
  title: z.string().optional(),
  chapterId: z.string().optional(),
})

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
})

router.get('/sessions', authMiddleware, roleMiddleware('STUDENT'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
    if (!student) throw createError('Profile siswa tidak ditemukan', 404)

    const sessions = await prisma.chatSession.findMany({
      where: { studentId: student.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, createdAt: true } },
      },
    })

    res.json({ success: true, data: sessions })
  } catch (err) {
    next(err)
  }
})

router.post('/sessions', authMiddleware, roleMiddleware('STUDENT'), validate(newSessionSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
    if (!student) throw createError('Profile siswa tidak ditemukan', 404)

    const session = await prisma.chatSession.create({
      data: {
        studentId: student.id,
        title: req.body.title || 'Sesi Chat Baru',
        chapterId: req.body.chapterId,
      },
    })

    res.status(201).json({ success: true, data: session })
  } catch (err) {
    next(err)
  }
})

router.get('/sessions/:id', authMiddleware, roleMiddleware('STUDENT'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
    if (!student) throw createError('Profil siswa tidak ditemukan', 404)

    const session = await prisma.chatSession.findUnique({
      where: { id: req.params.id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        chapter: { select: { name: true } },
      },
    })

    if (!session) throw createError('Sesi chat tidak ditemukan', 404)
    if (session.studentId !== student.id) throw createError('Akses ditolak', 403)

    res.json({ success: true, data: session })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/sessions/:id/messages',
  authMiddleware,
  roleMiddleware('STUDENT'),
  validate(sendMessageSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (!student) throw createError('Profil siswa tidak ditemukan', 404)

      const session = await prisma.chatSession.findUnique({
        where: { id: req.params.id },
        include: {
          messages: { orderBy: { createdAt: 'asc' }, take: 20 },
          chapter: { select: { name: true, description: true } },
          student: { select: { grade: true } },
        },
      })

      if (!session) throw createError('Sesi chat tidak ditemukan', 404)
      if (session.studentId !== student.id) throw createError('Akses ditolak', 403)

      const userContent = req.body.content

      const studentGrade = (session as any).student?.grade || 'X'
      const bookContext = getRelevantContext(studentGrade, session.chapter?.name, userContent)
      if (bookContext) {
        console.log(`📚 Context injected: ${bookContext.length} chars for grade ${studentGrade}, chapter: ${session.chapter?.name || 'umum'}`)
      }

      const userMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'USER',
          content: userContent,
        },
      })

      let aiContent = ''

      if (env.COHERE_API_KEY) {
        aiContent = await callCohere(session, userContent, bookContext)
      } else if (env.GEMINI_API_KEY) {
        aiContent = await callGemini(session, userContent, bookContext)
      } else if (env.OPENAI_API_KEY) {
        aiContent = await callOpenAI(session, userContent, bookContext)
      } else {
        aiContent = generateFallbackResponse(userContent, session.chapter?.name)
      }

      const aiMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'ASSISTANT',
          content: aiContent,
        },
      })

      await prisma.chatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      })

      try {
        const student = await prisma.student.findUnique({
          where: { userId: req.user!.userId },
          include: {
            enrollments: {
              where: { isActive: true },
              include: {
                classroom: { select: { teacherId: true } },
              },
              take: 1,
            },
          },
        })

        const teacherId = student?.enrollments[0]?.classroom?.teacherId
        if (teacherId) {
          await prisma.auditLog.create({
            data: {
              messageId: aiMessage.id,
              teacherId,
              status: 'PENDING',
            },
          })
        }
      } catch (auditErr) {
        console.error('Failed to create audit log:', auditErr)
      }

      res.json({ success: true, data: { userMessage, aiMessage } })
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  '/sessions/:id/evaluate-steps',
  authMiddleware,
  roleMiddleware('STUDENT'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
      if (!student) throw createError('Profil siswa tidak ditemukan', 404)

      const session = await prisma.chatSession.findUnique({
        where: { id: req.params.id },
        include: {
          messages: { orderBy: { createdAt: 'asc' }, take: 20 },
          chapter: { select: { name: true, description: true } },
          student: { select: { grade: true } },
        },
      })

      if (!session) throw createError('Sesi chat tidak ditemukan', 404)
      if (session.studentId !== student.id) throw createError('Akses ditolak', 403)

      const { question, steps } = req.body
      if (!question || !steps || !Array.isArray(steps)) {
        throw createError('Data tidak valid', 400)
      }

      // Format for DB (what the user sees)
      const userDisplayContent = `**Minta Evaluasi Langkah Penyelesaian:**\n\n**Soal:**\n${question}\n\n**Langkah-langkah:**\n${steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`

      // Format for AI
      const systemInstruction = `[TUGAS KHUSUS: EVALUASI LANGKAH]\nSiswa meminta Anda untuk mengevaluasi langkah-langkah penyelesaian dari sebuah soal matematika.\n\nTugas Anda:\n1. Analisis setiap langkah secara teliti.\n2. Temukan di mana tepatnya letak kesalahan operasional, konsep, atau perhitungan.\n3. Jangan langsung memberikan jawaban akhir yang benar.\n4. Berikan panduan bertahap (scaffolding) agar siswa bisa menyadari kesalahannya dan memperbaikinya sendiri.\n5. Gunakan bahasa yang mendukung dan positif.\n\nEvaluasi soal dan langkah-langkah berikut:\nSoal: ${question}\n\nLangkah-langkah:\n${steps.map((s: string, i: number) => `Langkah ${i + 1}: ${s}`).join('\n')}`

      const studentGrade = (session as any).student?.grade || 'X'
      const bookContext = getRelevantContext(studentGrade, session.chapter?.name, question)

      const userMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'USER',
          content: userDisplayContent,
        },
      })

      let aiContent = ''

      if (env.COHERE_API_KEY) {
        aiContent = await callCohere(session, systemInstruction, bookContext)
      } else if (env.GEMINI_API_KEY) {
        aiContent = await callGemini(session, systemInstruction, bookContext)
      } else if (env.OPENAI_API_KEY) {
        aiContent = await callOpenAI(session, systemInstruction, bookContext)
      } else {
        aiContent = generateFallbackResponse(systemInstruction, session.chapter?.name)
      }

      const aiMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'ASSISTANT',
          content: aiContent,
        },
      })

      await prisma.chatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      })

      try {
        const studentRecord = await prisma.student.findUnique({
          where: { userId: req.user!.userId },
          include: {
            enrollments: {
              where: { isActive: true },
              include: { classroom: { select: { teacherId: true } } },
              take: 1,
            },
          },
        })
        const teacherId = studentRecord?.enrollments[0]?.classroom?.teacherId
        if (teacherId) {
          await prisma.auditLog.create({
            data: { messageId: aiMessage.id, teacherId, status: 'PENDING' },
          })
        }
      } catch (auditErr) {
        console.error('Failed to create audit log:', auditErr)
      }

      res.json({ success: true, data: { userMessage, aiMessage } })
    } catch (err) {
      next(err)
    }
  }
)

router.delete('/sessions/:id', authMiddleware, roleMiddleware('STUDENT'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } })
    if (!student) throw createError('Profile siswa tidak ditemukan', 404)

    const session = await prisma.chatSession.findFirst({ where: { id: req.params.id, studentId: student.id } })
    if (!session) throw createError('Sesi chat tidak ditemukan', 404)

    await prisma.chatSession.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Sesi chat dihapus' })
  } catch (err) {
    next(err)
  }
})

async function callGemini(session: any, userContent: string, bookContext?: string): Promise<string> {
  const history = session.messages.slice(-10).map((m: any) => ({
    role: m.role === 'USER' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const chapterContext = session.chapter?.name 
    ? `Kamu sedang membantu siswa mempelajari bab "${session.chapter.name}". ${session.chapter.description ? `Deskripsi bab: ${session.chapter.description}.` : ''}` 
    : 'Kamu membantu siswa dengan pertanyaan matematika umum.'

  const bookSection = bookContext
    ? `\n\nBERIKUT ADALAH REFERENSI DARI BUKU PELAJARAN MATEMATIKA (BSE Kurikulum Merdeka) YANG RELEVAN:\n---\n${bookContext}\n---\nGunakan referensi buku di atas sebagai dasar untuk menjawab. Pastikan penjelasanmu sesuai dengan materi di buku.`
    : ''

  const systemPrompt = `Kamu adalah AI Tutor matematika SMA yang ramah, sabar, dan interaktif. 
${chapterContext}${bookSection}

Panduan menjawab:
- Gunakan bahasa Indonesia yang sederhana dan mudah dipahami siswa SMA
- Gunakan format LaTeX untuk rumus matematika (format: $rumus$ untuk inline, $$rumus$$ untuk block)
- Berikan penjelasan langkah demi langkah berdasarkan referensi buku pelajaran
- Gunakan contoh konkret dan angka yang mudah dihitung
- Berikan emoji untuk membuat penjelasan lebih menarik (🤔 💡 📐 ✅ dll)
- Jika siswa salah, jangan langsung memberi jawaban — bimbing mereka ke jawaban yang benar
- Di akhir penjelasan, tawarkan untuk memberi contoh soal atau menjelaskan lebih detail
- Jawab HANYA dalam konteks matematika SMA. Tolak pertanyaan di luar topik dengan sopan.
- Jika ada referensi buku, sebutkan bahwa penjelasanmu berdasarkan buku pelajaran.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [...history, { role: 'user', parts: [{ text: userContent }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Gemini API error:', response.status, errorBody)
      return generateFallbackResponse(userContent, session.chapter?.name)
    }

    const data = await response.json() as any
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak dapat menjawab saat ini. Coba ulangi pertanyaanmu ya! 🤔'
  } catch (err) {
    console.error('Gemini API call failed:', err)
    return generateFallbackResponse(userContent, session.chapter?.name)
  }
}

async function callOpenAI(session: any, userContent: string, bookContext?: string): Promise<string> {
  const historyMessages = session.messages.slice(-10).map((m: any) => ({
    role: m.role.toLowerCase() as 'user' | 'assistant',
    content: m.content,
  }))

  const bookSection = bookContext
    ? `\n\nReferensi buku pelajaran:\n${bookContext}`
    : ''

  const systemMessage = {
    role: 'system' as const,
    content: `Kamu adalah AI Tutor matematika SMA yang ramah dan sabar. 
Konteks bab: ${session.chapter?.name || 'Matematika Umum'}.${bookSection}
Jelaskan dengan bahasa sederhana dan gunakan LaTeX untuk rumus (format: $rumus$). Dasarkan jawabanmu pada referensi buku jika tersedia.`,
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...historyMessages, { role: 'user', content: userContent }],
      max_tokens: 1024,
    }),
  })

  const data = await response.json() as any
  return data.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat menjawab saat ini.'
}

async function callCohere(session: any, userContent: string, bookContext?: string): Promise<string> {
  const chapterContext = session.chapter?.name
    ? `Kamu sedang membantu siswa mempelajari bab "${session.chapter.name}". ${session.chapter.description ? `Deskripsi bab: ${session.chapter.description}.` : ''}`
    : 'Kamu membantu siswa dengan pertanyaan matematika umum.'

  const bookSection = bookContext
    ? `\n\nBERIKUT ADALAH REFERENSI DARI BUKU PELAJARAN MATEMATIKA (BSE Kurikulum Merdeka) YANG RELEVAN:\n---\n${bookContext}\n---\nGunakan referensi buku di atas sebagai dasar untuk menjawab. Pastikan penjelasanmu sesuai dengan materi di buku.`
    : ''

  const preamble = `Kamu adalah AI Tutor matematika SMA yang ramah, sabar, dan interaktif.
${chapterContext}${bookSection}

Panduan menjawab:
- Gunakan bahasa Indonesia yang sederhana dan mudah dipahami siswa SMA
- Gunakan format LaTeX untuk rumus matematika (format: $rumus$ untuk inline, $$rumus$$ untuk block)
- Berikan penjelasan langkah demi langkah berdasarkan referensi buku pelajaran
- Gunakan contoh konkret dan angka yang mudah dihitung
- Berikan emoji untuk membuat penjelasan lebih menarik (🤔 💡 📐 ✅ dll)
- Jika siswa salah, jangan langsung memberi jawaban — bimbing mereka ke jawaban yang benar
- Di akhir penjelasan, tawarkan untuk memberi contoh soal atau menjelaskan lebih detail
- Jawab HANYA dalam konteks matematika SMA. Tolak pertanyaan di luar topik dengan sopan.
- Jika ada referensi buku, sebutkan bahwa penjelasanmu berdasarkan buku pelajaran.`

  const chatHistory = session.messages.slice(-10).map((m: any) => ({
    role: m.role === 'USER' ? 'USER' : 'CHATBOT',
    message: m.content,
  }))

  try {
    const response = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'command-r-plus-08-2024',
        messages: [
          { role: 'system', content: preamble },
          ...chatHistory.map((m: any) => ({
            role: m.role === 'USER' ? 'user' : 'assistant',
            content: m.message,
          })),
          { role: 'user', content: userContent },
        ],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Cohere API error:', response.status, errorBody)
      return generateFallbackResponse(userContent, session.chapter?.name)
    }

    const data = await response.json() as any
    return data.message?.content?.[0]?.text || 'Maaf, saya tidak dapat menjawab saat ini. Coba ulangi pertanyaanmu ya! 🤔'
  } catch (err) {
    console.error('Cohere API call failed:', err)
    return generateFallbackResponse(userContent, session.chapter?.name)
  }
}

function generateFallbackResponse(userContent: string, chapterName?: string): string {
  const hasKey = !!(env.COHERE_API_KEY || env.GEMINI_API_KEY || env.OPENAI_API_KEY)

  if (hasKey) {
    return `Pertanyaanmu tentang "${userContent.slice(0, 50)}${userContent.length > 50 ? '...' : ''}" sangat bagus! 🤔

${chapterName ? `Dalam konteks bab **${chapterName}**, ` : ''}Saat ini AI Tutor sedang mengalami gangguan sementara (kemungkinan batas penggunaan API tercapai).

Silakan coba lagi dalam beberapa saat ya! Sambil menunggu, kamu bisa:
- 📖 Baca ulang materi yang tersedia
- 📝 Coba kerjakan latihan soal
- 💬 Coba kirim pertanyaan lagi dalam 1-2 menit`
  }

  return `Halo! Pertanyaanmu tentang "${userContent.slice(0, 50)}..." sangat bagus.

${chapterName ? `Dalam konteks bab **${chapterName}**, ` : ''}saya akan membantu menjelaskan konsep ini lebih lanjut.

*Catatan: AI Tutor belum terhubung ke API. Silakan isi COHERE_API_KEY, GEMINI_API_KEY, atau OPENAI_API_KEY di file .env untuk mengaktifkan AI.*`
}

export default router
