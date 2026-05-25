import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'
import { materialApi, questionApi, adminApi } from '../../lib/api'

interface Chapter {
    id: string
    name: string
    grade: string
}

interface AnswerOption {
    id: string
    text: string
}



type ContentType = 'material' | 'quiz'
type QuizMode = 'manual' | 'import'

export default function AdminContentEditorPage() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [contentType, setContentType] = useState<ContentType>('material')
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
    const [quizMode] = useState<QuizMode>('manual')
    
    // API data
    const [chapters, setChapters] = useState<Chapter[]>([])
        
                    
    const [materialData, setMaterialData] = useState({
        title: '',
        chapterId: '',
        duration: '',
        content: '',
        videoUrl: '',
        documentFile: null as File | null,
    })

    const [quizData, setQuizData] = useState({
        title: '',
        chapterId: '',
        difficulty: 'medium',
        question: '',
        explanation: '',
        image: null as File | null,
    })
    
    const [answers, setAnswers] = useState<AnswerOption[]>([
        { id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }, { id: 'E', text: '' },
    ])
    const [correctAnswer, setCorrectAnswer] = useState<string>('A')

    useEffect(() => {
        const loadData = async () => {
            try {
                const [chaps] = await Promise.all([
                    adminApi.chapters(),
                                    ])
                setChapters(chaps as Chapter[])
                            } catch (err) {
                console.error(err)
            }
        }
        loadData()
    }, [])

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            if (contentType === 'material') {
                await materialApi.create({
                    ...materialData,
                    isSystem: true,
                    status: 'PUBLISHED',
                    order: 1
                })
            } else {
                if (quizMode === 'manual') {
                    await questionApi.create({
                        ...quizData,
                        options: answers.map(a => ({
                            label: a.id,
                            text: a.text,
                            isCorrect: a.id === correctAnswer
                        })),
                        isSystem: true,
                        difficulty: quizData.difficulty.toUpperCase()
                    })
                }
            }
            navigate('/admin/master-data')
        } catch (err) {
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    
    const insertLatex = (latex: string, targetId: string, currentValue: string, setter: (value: string) => void) => {
        const textarea = document.getElementById(targetId) as HTMLTextAreaElement
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newText = currentValue.substring(0, start) + latex + currentValue.substring(end)
            setter(newText)
            setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(start + latex.length, start + latex.length)
            }, 0)
        }
    }

    const latexButtons = [
        { label: 'Σ', value: '$\\sum_{}^{}$' },
        { label: '√', value: '$\\sqrt{}$' },
        { label: '∫', value: '$\\int_{}^{}$' },
        { label: 'π', value: '$\\pi$' },
        { label: 'frac', value: '$\\frac{}{}$' },
        { label: 'x²', value: '$x^{2}$' },
        { label: 'xₙ', value: '$x_{n}$' },
        { label: '≤', value: '$\\leq$' },
        { label: '≥', value: '$\\geq$' },
        { label: '∞', value: '$\\infty$' },
    ]

    
    
    
    
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/admin/master-data" className="hover:text-primary">Master Data</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Tambah Konten Sistem</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                    Tambah Konten Sistem
                </h1>
            </div>

            {/* Content Type Selector */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4">Pilih Jenis Konten</h2>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setContentType('material')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${contentType === 'material' ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}>
                        <span className="material-symbols-outlined text-3xl text-purple-500 mb-2">article</span>
                        <h3 className="font-bold">Materi Sistem</h3>
                    </button>
                    <button onClick={() => setContentType('quiz')}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${contentType === 'quiz' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
                        <span className="material-symbols-outlined text-3xl text-amber-500 mb-2">quiz</span>
                        <h3 className="font-bold">Soal Sistem</h3>
                    </button>
                </div>
            </div>

            {/* Material Form */}
            {contentType === 'material' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="font-bold mb-4">Informasi Materi</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Judul Materi *</label>
                                <input type="text" value={materialData.title} onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Bab *</label>
                                <select value={materialData.chapterId} onChange={(e) => setMaterialData({ ...materialData, chapterId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
                                    <option value="">Pilih Bab</option>
                                    {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold">Konten Materi</h2>
                            <div className="flex bg-slate-100 rounded-xl p-1">
                                <button onClick={() => setActiveTab('edit')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'edit' ? 'bg-white shadow' : ''}`}>Editor</button>
                                <button onClick={() => setActiveTab('preview')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'preview' ? 'bg-white shadow' : ''}`}>Preview</button>
                            </div>
                        </div>
                        {activeTab === 'edit' ? (
                            <>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {latexButtons.map(btn => (
                                        <button key={btn.label} type="button" onClick={() => insertLatex(btn.value, 'material-content', materialData.content, (v) => setMaterialData({ ...materialData, content: v }))} className="px-2 py-1.5 rounded-lg bg-slate-100">{btn.label}</button>
                                    ))}
                                </div>
                                <textarea id="material-content" value={materialData.content} onChange={(e) => setMaterialData({ ...materialData, content: e.target.value })} rows={12} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-mono" />
                            </>
                        ) : (
                            <div className="min-h-[300px] p-4 bg-slate-50 rounded-xl">
                                {materialData.content ? <LatexRenderer content={materialData.content} /> : <p className="text-slate-400">Belum ada konten</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quiz Form */}
            {contentType === 'quiz' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="font-bold mb-4">Informasi Soal</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Bab *</label>
                                <select value={quizData.chapterId} onChange={(e) => setQuizData({ ...quizData, chapterId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
                                    <option value="">Pilih Bab</option>
                                    {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Kesulitan</label>
                                <select value={quizData.difficulty} onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="font-bold mb-4">Soal</h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {latexButtons.map(btn => (
                                <button key={btn.label} type="button" onClick={() => insertLatex(btn.value, 'quiz-question', quizData.question, (v) => setQuizData({ ...quizData, question: v }))} className="px-2 py-1.5 rounded-lg bg-slate-100">{btn.label}</button>
                            ))}
                        </div>
                        <textarea id="quiz-question" value={quizData.question} onChange={(e) => setQuizData({ ...quizData, question: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50" />
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="font-bold mb-4">Pilihan Jawaban</h2>
                        <div className="space-y-3">
                            {answers.map((answer, index) => (
                                <div key={answer.id} className="flex items-center gap-3">
                                    <button type="button" onClick={() => setCorrectAnswer(answer.id)}
                                        className={`size-8 rounded-full border-2 flex items-center justify-center ${correctAnswer === answer.id ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                                        {correctAnswer === answer.id && <span className="material-symbols-outlined text-sm">check</span>}
                                    </button>
                                    <span className="font-bold text-slate-500 w-6">{answer.id}.</span>
                                    <input type="text" value={answer.text}
                                        onChange={(e) => { const newAnswers = [...answers]; newAnswers[index].text = e.target.value; setAnswers(newAnswers) }}
                                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 shadow-sm sticky bottom-4">
                <Link to="/admin/master-data" className="px-4 py-2 text-slate-600">Batal</Link>
                <button type="button" onClick={() => handleSubmit()} disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50">
                    {isSubmitting ? 'Menyimpan...' : 'Simpan & Publikasi'}
                </button>
            </div>
        </div>
    )
}
