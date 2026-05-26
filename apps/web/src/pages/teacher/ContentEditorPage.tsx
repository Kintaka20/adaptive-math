import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { materialApi, quizApi, questionApi, classApi, adminApi, uploadApi } from '../../lib/api'
import LatexRenderer from '../../components/LatexRenderer'

interface Chapter {
    id: string
    name: string
}

interface Question {
    id: string
    text: string
    difficulty: string
    chapter?: { name: string }
    chapterId?: string
    grade?: string
    isSystem?: boolean
    options?: { id: string, text: string, isCorrect: boolean, label: string }[]
    explanation?: string
}

interface Material {
    id: string
    title: string
    content: string
    chapter?: { name: string }
}

export default function ContentEditorPage() {
    const { id: classId } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const initialChapterId = searchParams.get('chapterId') || ''
    
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [contentType, setContentType] = useState<'material' | 'quiz'>('material')
    const [materialMode, setMaterialMode] = useState<'manual' | 'import'>('manual')
    
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Form states
    const [materialData, setMaterialData] = useState({
        title: '',
        content: '',
        chapterId: initialChapterId,
        duration: '',
        videoUrl: '',
        pdfUrl: ''
    })

    const [isUploadingVideo, setIsUploadingVideo] = useState(false)
    const [isUploadingPdf, setIsUploadingPdf] = useState(false)
    const [isUploadingImageContent, setIsUploadingImageContent] = useState(false)

    const [quizData] = useState({
        title: '',
        description: '',
        chapterId: initialChapterId,
        passingScore: 70,
        timeLimit: 60,
        type: 'PRACTICE'
    })

    // Bank states
    const [bankQuestions, setBankQuestions] = useState<Question[]>([])
    const [bankMaterials, setBankMaterials] = useState<Material[]>([])
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
    const [selectedMaterial, setSelectedMaterial] = useState<string>('')
    const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null)
    const [questionFilter, setQuestionFilter] = useState({ chapter: '', difficulty: '' })
    const [allChapters, setAllChapters] = useState<any[]>([])

    // Manual Quiz Question states
    interface ManualQuestionForm {
        id: string;
        difficulty: string;
        question: string;
        explanation: string;
        imageUrl: string;
        answers: { id: string, text: string }[];
        correctAnswer: string;
        showPreview: boolean;
        isUploading?: boolean;
    }

    const createEmptyQuestion = (): ManualQuestionForm => ({
        id: Math.random().toString(36).substring(7),
        difficulty: 'MEDIUM',
        question: '',
        explanation: '',
        imageUrl: '',
        answers: [
            { id: 'A', text: '' },
            { id: 'B', text: '' },
            { id: 'C', text: '' },
            { id: 'D', text: '' },
            { id: 'E', text: '' },
        ],
        correctAnswer: 'A',
        showPreview: false,
    });

    const [manualQuestions, setManualQuestions] = useState<ManualQuestionForm[]>([createEmptyQuestion()]);

    const latexButtons = [
        { label: 'Σ', value: '$\\sum_{}^{}$' },
        { label: '√', value: '$\\sqrt{}$' },
        { label: '∫', value: '$\\int_{}^{}$' },
        { label: 'π', value: '$\\pi$' },
        { label: '∞', value: '$\\infty$' },
        { label: '≤', value: '$\\leq$' },
        { label: '≥', value: '$\\geq$' },
        { label: 'frac', value: '$\\frac{}{}$' },
        { label: 'x²', value: '$x^{2}$' },
        { label: 'xₙ', value: '$x_{n}$' },
    ]

    const insertLatex = (latex: string, qId?: string) => {
        if (!qId) {
            const textarea = document.getElementById('material-content-textarea') as HTMLTextAreaElement
            if (textarea) {
                const start = textarea.selectionStart
                const end = textarea.selectionEnd
                const newText = materialData.content.substring(0, start) + latex + materialData.content.substring(end)
                setMaterialData(prev => ({ ...prev, content: newText }))
                setTimeout(() => {
                    textarea.focus()
                    textarea.setSelectionRange(start + latex.length, start + latex.length)
                }, 0)
            }
            return
        }

        const textarea = document.getElementById('question-textarea-' + qId) as HTMLTextAreaElement
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            
            setManualQuestions(prev => prev.map(q => {
                if (q.id === qId) {
                    const newText = q.question.substring(0, start) + latex + q.question.substring(end)
                    return { ...q, question: newText }
                }
                return q;
            }))
            
            setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(start + latex.length, start + latex.length)
            }, 0)
        }
    }

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                if (classId) {
                    const cls = await classApi.get(classId)
                    if (cls.chapters) {
                        setChapters((cls.chapters as any[]).map(c => c.chapter))
                    }
                }
                
                // Load bank data for import modes
                const [qs, ms, chs] = await Promise.all([
                    questionApi.list(),
                    materialApi.list(),
                    adminApi.chapters()
                ])
                
                setBankQuestions(qs as unknown as Question[])
                setBankMaterials(ms as unknown as Material[])
                setAllChapters(chs as any[])
                
                // If initialChapterId is present, try to automatically set the filter
                if (initialChapterId) {
                    const matchedChapter = (chs as any[]).find(c => c.id === initialChapterId)
                    if (matchedChapter) {
                        setQuestionFilter(prev => ({ ...prev, chapter: matchedChapter.name }))
                    }
                }
            } catch (err) {
                console.error('Failed to load data:', err)
            }
        }
        
        loadInitialData()
    }, [classId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            if (contentType === 'material') {
                if (materialMode === 'manual') {
                    const newMat = await materialApi.create({
                        ...materialData,
                        isSystem: false,
                        status: 'PUBLISHED',
                        order: 1
                    })
                    navigate(`/guru/kelas/${materialData.chapterId}/content/${newMat.id}/review`)
                    return
                } else {
                    if (!selectedMaterial) throw new Error('Pilih materi dari bank terlebih dahulu')
                    // ... assignment logic
                }
            } else {
                // Combined mode for quiz
                const validManualQs = manualQuestions.filter(q => q.question.trim().length >= 10)

                if (validManualQs.length === 0 && selectedQuestions.length === 0) {
                    throw new Error('Minimal harus ada 1 soal (dari bank atau buat baru dengan minimal 10 karakter)')
                }

                // Validate manual questions
                for (const mq of validManualQs) {
                    const filled = mq.answers.filter(a => a.text.trim())
                    if (filled.length < 2) throw new Error('Soal baru minimal 2 pilihan jawaban')
                    const correctOpt = mq.answers.find(a => a.id === mq.correctAnswer)
                    if (!correctOpt?.text.trim()) throw new Error('Pilih jawaban yang benar untuk semua soal baru')
                }

                const newQuiz = await quizApi.create({
                    ...quizData,
                    isSystem: false,
                    status: 'PUBLISHED',
                    order: 1
                })

                const newQuestionIds: string[] = []
                for (const mq of validManualQs) {
                    const options = mq.answers
                        .filter(a => a.text.trim())
                        .map(a => ({
                            label: a.id,
                            text: a.text,
                            isCorrect: a.id === mq.correctAnswer,
                        }))

                    const newQuestion = await questionApi.create({
                        text: mq.question,
                        difficulty: mq.difficulty,
                        explanation: mq.explanation || undefined,
                        imageUrl: mq.imageUrl || undefined,
                        chapterId: quizData.chapterId || undefined,
                        isSystem: false,
                        options,
                    })
                    newQuestionIds.push(newQuestion.id)
                }

                const allQIds = [...selectedQuestions, ...newQuestionIds]
                if (allQIds.length > 0) {
                    await questionApi.importToQuiz(newQuiz.id, allQIds)
                }
                
                navigate(`/guru/kelas/${quizData.chapterId}/content/${newQuiz.id}/review`)
                return
            }
            
            navigate(`/guru/kelas/${classId}`)
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan konten')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleSelectQuestion = (id: string) => {
        setSelectedQuestions(prev => 
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to={`/guru/kelas/${classId}`} className="hover:text-primary">Kelas</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Tambah Konten</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                    Tambah Konten Baru
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            {chapters.length === 0 && !isLoading && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-4xl text-amber-500 mb-2">warning</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Belum Ada Bab</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Anda tidak dapat membuat konten karena kelas ini belum memiliki bab. Silakan tambahkan bab terlebih dahulu.
                    </p>
                    <Link to={`/guru/kelas/${classId}`} className="inline-block px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors">
                        Kembali ke Kelas
                    </Link>
                </div>
            )}

            {chapters.length > 0 && (
                <>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Pilih Jenis Konten</h2>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setContentType('material')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${contentType === 'material' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'}`}
                    >
                        <span className="material-symbols-outlined text-3xl text-purple-500 mb-2">article</span>
                        <h3 className="font-bold text-slate-900 dark:text-white">Materi</h3>
                        <p className="text-sm text-slate-500">Konten pembelajaran dengan teks, video, dan file</p>
                    </button>
                    <button
                        onClick={() => setContentType('quiz')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${contentType === 'quiz' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}
                    >
                        <span className="material-symbols-outlined text-3xl text-amber-500 mb-2">quiz</span>
                        <h3 className="font-bold text-slate-900 dark:text-white">Kuis</h3>
                        <p className="text-sm text-slate-500">Soal latihan atau ujian untuk siswa</p>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {contentType === 'material' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="font-bold text-slate-900 dark:text-white mb-4">Sumber Materi</h2>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setMaterialMode('manual')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${materialMode === 'manual' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'}`}>
                                    <span className="material-symbols-outlined text-2xl text-purple-500 mb-1">edit</span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Buat Manual</h3>
                                </button>
                                <button type="button" onClick={() => setMaterialMode('import')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${materialMode === 'import' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'}`}>
                                    <span className="material-symbols-outlined text-2xl text-purple-500 mb-1">library_books</span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Ambil dari Bank</h3>
                                </button>
                            </div>
                        </div>

                        {materialMode === 'manual' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Judul Materi *</label>
                                    <input required type="text" value={materialData.title} onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-purple-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bab *</label>
                                        <select required value={materialData.chapterId} onChange={(e) => {
                                        setMaterialData({ ...materialData, chapterId: e.target.value })
                                    }} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-purple-500 outline-none">
                                            <option value="">Pilih Bab</option>
                                            {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estimasi Waktu Belajar (Opsional)</label>
                                        <input type="text" placeholder="Contoh: 15 Menit" value={materialData.duration} onChange={(e) => setMaterialData({ ...materialData, duration: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-purple-500 outline-none" />
                                    </div>
                                </div>

                                {/* Main Media Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">🎥 Media Utama (Video / Gambar) (Opsional)</label>
                                    <div className="flex gap-3">
                                        <input type="url" value={materialData.videoUrl}
                                            onChange={(e) => setMaterialData({ ...materialData, videoUrl: e.target.value })}
                                            placeholder="Tempel URL Video/Gambar atau upload file..."
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-purple-500 outline-none" />
                                        <div className="relative">
                                            <button type="button" disabled={isUploadingVideo} className="h-full px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2">
                                                <span className="material-symbols-outlined text-xl">{isUploadingVideo ? 'hourglass_empty' : 'upload_file'}</span>
                                                {isUploadingVideo ? 'Mengunggah...' : 'Pilih File'}
                                            </button>
                                            <input type="file" accept="video/*,image/*" disabled={isUploadingVideo}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]
                                                    if (!file) return
                                                    setIsUploadingVideo(true)
                                                    try {
                                                        const res = await uploadApi.uploadImage(file)
                                                        setMaterialData({ ...materialData, videoUrl: res.url })
                                                    } catch (error: any) {
                                                        alert('Gagal mengunggah media: ' + error.message)
                                                    } finally {
                                                        setIsUploadingVideo(false)
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                                        </div>
                                    </div>
                                </div>

                                {/* PDF/Doc Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">📄 Lampiran Dokumen (PDF/Word) (Opsional)</label>
                                    <div className="flex gap-3">
                                        <input type="url" value={materialData.pdfUrl}
                                            onChange={(e) => setMaterialData({ ...materialData, pdfUrl: e.target.value })}
                                            placeholder="Tempel URL Dokumen atau upload file..."
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-purple-500 outline-none" />
                                        <div className="relative">
                                            <button type="button" disabled={isUploadingPdf} className="h-full px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2">
                                                <span className="material-symbols-outlined text-xl">{isUploadingPdf ? 'hourglass_empty' : 'upload_file'}</span>
                                                {isUploadingPdf ? 'Mengunggah...' : 'Pilih File'}
                                            </button>
                                            <input type="file" accept=".pdf,.doc,.docx" disabled={isUploadingPdf}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]
                                                    if (!file) return
                                                    setIsUploadingPdf(true)
                                                    try {
                                                        const res = await uploadApi.uploadImage(file)
                                                        setMaterialData({ ...materialData, pdfUrl: res.url })
                                                    } catch (error: any) {
                                                        alert('Gagal mengunggah dokumen: ' + error.message)
                                                    } finally {
                                                        setIsUploadingPdf(false)
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">📝 Konten (Mendukung Markdown & LaTeX) *</label>
                                    
                                    <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl items-center justify-between">
                                        <div className="flex gap-1 flex-wrap items-center">
                                            {latexButtons.map(btn => (
                                                <button key={btn.label} type="button" onClick={() => insertLatex(btn.value)}
                                                    className="px-2 py-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-mono">
                                                    {btn.label}
                                                </button>
                                            ))}
                                            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2" />
                                            
                                            {/* Image to Markdown Upload */}
                                            <div className="relative">
                                                <button type="button" disabled={isUploadingImageContent} className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700">
                                                    <span className="material-symbols-outlined text-sm">{isUploadingImageContent ? 'hourglass_empty' : 'add_photo_alternate'}</span>
                                                    {isUploadingImageContent ? 'Upload...' : 'Sisipkan Gambar'}
                                                </button>
                                                <input type="file" accept="image/*" disabled={isUploadingImageContent}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (!file) return
                                                        setIsUploadingImageContent(true)
                                                        try {
                                                            const res = await uploadApi.uploadImage(file)
                                                            const imageMarkdown = `\n![Gambar](${res.url})\n`
                                                            insertLatex(imageMarkdown)
                                                        } catch (error: any) {
                                                            alert('Gagal mengunggah gambar: ' + error.message)
                                                        } finally {
                                                            setIsUploadingImageContent(false)
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                                            </div>
                                        </div>
                                    </div>

                                    <textarea id="material-content-textarea" required rows={12} value={materialData.content} onChange={(e) => setMaterialData({ ...materialData, content: e.target.value })} 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-purple-500 outline-none" 
                                        placeholder="Tuliskan materi di sini... Anda bisa menggunakan Markdown (seperti **tebal** atau ## Heading) dan $...$ untuk LaTeX."></textarea>
                                    <p className="text-xs text-slate-500 mt-2">💡 Tips: Anda dapat menyisipkan gambar langsung ke dalam tulisan menggunakan tombol di atas.</p>
                                </div>
                            </div>
                        )}
                        
                        {materialMode === 'import' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="font-bold mb-4">Pilih Materi dari Bank</h3>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {bankMaterials.map(m => (
                                        <label key={m.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedMaterial === m.id ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <input type="radio" name="material" value={m.id} checked={selectedMaterial === m.id} onChange={() => setSelectedMaterial(m.id)} className="w-4 h-4 text-purple-600" />
                                            <div>
                                                <p className="font-medium">{m.title}</p>
                                                <p className="text-sm text-slate-500">{m.chapter?.name}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {contentType === 'quiz' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                            <h2 className="font-bold text-slate-900 dark:text-white mb-2">Pilih Soal dari Bank</h2>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <select 
                                        value={questionFilter.chapter}
                                        onChange={(e) => setQuestionFilter({ ...questionFilter, chapter: e.target.value })}
                                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm flex-1 sm:flex-none"
                                    >
                                        <option value="">Semua Bab</option>
                                        {Array.from(new Set(bankQuestions.map(q => allChapters.find(c => c.id === q.chapterId)?.name).filter(Boolean))).map(chapterName => (
                                            <option key={chapterName as string} value={chapterName as string}>{chapterName as string}</option>
                                        ))}
                                    </select>
                                    <select 
                                        value={questionFilter.difficulty}
                                        onChange={(e) => setQuestionFilter({ ...questionFilter, difficulty: e.target.value })}
                                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm flex-1 sm:flex-none"
                                    >
                                        <option value="">Semua Kesulitan</option>
                                        <option value="EASY">Mudah</option>
                                        <option value="MEDIUM">Sedang</option>
                                        <option value="HARD">Sulit</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {bankQuestions
                                    .filter(q => {
                                        if (questionFilter.chapter) {
                                            const chapterName = allChapters.find(c => c.id === q.chapterId)?.name
                                            if (chapterName !== questionFilter.chapter) return false
                                        }
                                        if (questionFilter.difficulty && q.difficulty !== questionFilter.difficulty) return false
                                        return true
                                    })
                                    .map(q => (
                                    <label key={q.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedQuestions.includes(q.id) ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                        <input type="checkbox" checked={selectedQuestions.includes(q.id)} onChange={() => toggleSelectQuestion(q.id)} className="mt-1 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${q.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700' : q.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                    {q.difficulty}
                                                </span>
                                                <span className="text-xs text-slate-500">{allChapters.find(c => c.id === q.chapterId)?.name}</span>
                                            </div>
                                            <LatexRenderer content={q.text} />
                                        </div>
                                    </label>
                                ))}
                                {bankQuestions.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">Belum ada soal di bank soal</div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {manualQuestions.map((mq, mqIndex) => (
                                <div key={mq.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                                    <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">edit_note</span>
                                            Buat Soal Baru #{mqIndex + 1}
                                        </h2>
                                        {manualQuestions.length > 1 && (
                                            <button type="button" onClick={() => setManualQuestions(prev => prev.filter(q => q.id !== mq.id))}
                                                className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">delete</span> Hapus
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">⚡ Kesulitan *</label>
                                        <div className="flex gap-2">
                                            {[
                                                { value: 'EASY', label: '🟢 Easy' },
                                                { value: 'MEDIUM', label: '🟡 Medium' },
                                                { value: 'HARD', label: '🔴 Hard' },
                                            ].map(d => (
                                                <button key={d.value} type="button" onClick={() => setManualQuestions(prev => prev.map(q => q.id === mq.id ? { ...q, difficulty: d.value } : q))}
                                                    className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${mq.difficulty === d.value
                                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                                        : 'border-slate-200 dark:border-slate-700'
                                                        }`}>
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Image URL / Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gambar Soal (Opsional)</label>
                                        <div className="flex gap-3">
                                            <input type="url" value={mq.imageUrl}
                                                onChange={(e) => setManualQuestions(prev => prev.map(q => q.id === mq.id ? { ...q, imageUrl: e.target.value } : q))}
                                                placeholder="Pilih file gambar atau tempel URL (https://...)"
                                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 outline-none" />
                                            <div className="relative">
                                                <button type="button" disabled={mq.isUploading} className="h-full px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xl">{mq.isUploading ? 'hourglass_empty' : 'upload_file'}</span>
                                                    {mq.isUploading ? 'Mengunggah...' : 'Pilih File'}
                                                </button>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    disabled={mq.isUploading}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (!file) return
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            alert('Ukuran gambar maksimal 5MB')
                                                            return
                                                        }
                                                        
                                                        setManualQuestions(prev => prev.map(q => q.id === mq.id ? { ...q, isUploading: true } : q))
                                                        try {
                                                            const res = await uploadApi.uploadImage(file)
                                                            setManualQuestions(prev => prev.map(q => q.id === mq.id ? { ...q, imageUrl: res.url } : q))
                                                        } catch (error: any) {
                                                            console.error('Failed to upload image:', error)
                                                            alert(error.message || 'Gagal mengunggah gambar. Pastikan backend sudah dikonfigurasi.')
                                                        } finally {
                                                            setManualQuestions(prev => prev.map(q => q.id === mq.id ? { ...q, isUploading: false } : q))
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        {mq.imageUrl && (
                                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 inline-block">
                                                <p className="text-xs text-slate-500 mb-2">Preview Gambar:</p>
                                                <img src={mq.imageUrl} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Konten Soal *</label>
                                        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                            <div className="flex gap-1 flex-wrap">
                                                {latexButtons.map(btn => (
                                                    <button key={btn.label} type="button" onClick={() => insertLatex(btn.value, mq.id)}
                                                        className="px-2 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-mono">
                                                        {btn.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="w-px bg-slate-300 dark:bg-slate-600" />
                                            <button type="button" onClick={() => setManualQuestions(prev => prev.map(q => q.id === mq.id ? { ...q, showPreview: !q.showPreview } : q))}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mq.showPreview ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                                {mq.showPreview ? '👁️ Preview ON' : '👁️ Preview'}
                                            </button>
                                        </div>

                                        <textarea id={`question-textarea-${mq.id}`} value={mq.question}
                                            onChange={(e) => setManualQuestions(prev => prev.map(q => q.id === mq.id ? { ...q, question: e.target.value } : q))}
                                            placeholder="Tulis soal dengan LaTeX..."
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 outline-none" />
                                        
                                        {mq.showPreview && mq.question && (
                                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 mb-2">Preview:</p>
                                                <LatexRenderer content={mq.question} />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pilihan Jawaban *</label>
                                        <div className="space-y-3">
                                            {mq.answers.map((answer, index) => (
                                                <div key={answer.id} className="flex items-center gap-3">
                                                    <button type="button" onClick={() => setManualQuestions(prev => prev.map(q => q.id === mq.id ? { ...q, correctAnswer: answer.id } : q))}
                                                        className={`size-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${mq.correctAnswer === answer.id
                                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                                                            }`}>
                                                        {mq.correctAnswer === answer.id && <span className="material-symbols-outlined text-sm">check</span>}
                                                    </button>
                                                    <span className="font-bold text-slate-500 w-6">{answer.id}.</span>
                                                    <input type="text" value={answer.text}
                                                        onChange={(e) => {
                                                            setManualQuestions(prev => prev.map(q => {
                                                                if (q.id === mq.id) {
                                                                    const newAnswers = [...q.answers]
                                                                    newAnswers[index].text = e.target.value
                                                                    return { ...q, answers: newAnswers }
                                                                }
                                                                return q
                                                            }))
                                                        }}
                                                        placeholder={`Jawaban ${answer.id}...`}
                                                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 outline-none" />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-3">💡 Klik lingkaran untuk menandai jawaban yang benar</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pembahasan (Opsional)</label>
                                        <textarea value={mq.explanation}
                                            onChange={(e) => setManualQuestions(prev => prev.map(q => q.id === mq.id ? { ...q, explanation: e.target.value } : q))}
                                            placeholder="Penjelasan jawaban yang benar..."
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 outline-none" />
                                    </div>
                                </div>
                            ))}
                            
                            <button type="button" onClick={() => setManualQuestions(prev => [...prev, createEmptyQuestion()])}
                                className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl text-slate-500 hover:text-primary hover:border-primary hover:bg-amber-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 font-medium">
                                <span className="material-symbols-outlined">add_circle</span> Tambah Soal Lain
                            </button>
                        </div>

                    </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={() => navigate(`/guru/kelas/${classId}`)} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50">
                        Batal
                    </button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl disabled:opacity-50">
                        {isLoading ? 'Menyimpan...' : 'Simpan Konten'}
                    </button>
                </div>
            </form>
            </>
            )}

            {/* Question Preview Modal */}
            {previewQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewQuestion(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">visibility</span>
                                Detail Soal
                            </h3>
                            <button
                                onClick={() => setPreviewQuestion(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-medium">{previewQuestion.chapter?.name || previewQuestion.chapterId || '-'}</span>
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                    previewQuestion.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                    previewQuestion.difficulty?.toLowerCase() === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-600'
                                }`}>
                                    {previewQuestion.difficulty?.toLowerCase() === 'easy' ? '🟢 Mudah' : previewQuestion.difficulty?.toLowerCase() === 'medium' ? '🟡 Sedang' : '🔴 Sulit'}
                                </span>
                                {previewQuestion.isSystem && (
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-medium rounded-full">🏛️ Sistem</span>
                                )}
                            </div>

                            {/* Question Text */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-200 dark:border-slate-600 overflow-x-auto">
                                <p className="text-xs font-medium text-slate-500 mb-2">SOAL</p>
                                <div className="text-slate-900 dark:text-white">
                                    <LatexRenderer content={previewQuestion.text} />
                                </div>
                            </div>

                            {/* Options */}
                            <div className="mb-6">
                                <p className="text-xs font-medium text-slate-500 mb-3">PILIHAN JAWABAN</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {previewQuestion.options?.map((opt: any) => (
                                        <div
                                            key={opt.id}
                                            className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-colors ${
                                                opt.isCorrect
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                            }`}
                                        >
                                            <span className={`size-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                                opt.isCorrect
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                            }`}>{opt.label}</span>
                                            <div className="flex-1 overflow-x-auto text-sm text-slate-700 dark:text-slate-300">
                                                <LatexRenderer content={opt.text} />
                                            </div>
                                            {opt.isCorrect && <span className="material-symbols-outlined text-emerald-500 text-sm flex-shrink-0">check_circle</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Explanation */}
                            {previewQuestion.explanation && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 mb-2">PEMBAHASAN</p>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-900/50">
                                        <LatexRenderer content={previewQuestion.explanation} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => setPreviewQuestion(null)}
                                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
