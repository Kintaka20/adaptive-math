import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { materialApi, quizApi, questionApi, classApi } from '../../lib/api'
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
    const { classId } = useParams()
    const navigate = useNavigate()
    
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [contentType, setContentType] = useState<'material' | 'quiz'>('material')
    const [materialMode, setMaterialMode] = useState<'manual' | 'import'>('manual')
    const [quizMode, setQuizMode] = useState<'manual' | 'import'>('manual')
    
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Form states
    const [materialData, setMaterialData] = useState({
        title: '',
        content: '',
        chapterId: '',
        duration: '',
        videoUrl: ''
    })

    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        chapterId: '',
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
                const [qs, ms] = await Promise.all([
                    questionApi.list(),
                    materialApi.list()
                ])
                
                setBankQuestions(qs as unknown as Question[])
                setBankMaterials(ms as unknown as Material[])
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
                    await materialApi.create({
                        ...materialData,
                        isSystem: false,
                        status: 'PUBLISHED',
                        order: 1
                    })
                } else {
                    // For import, we'd normally attach the existing material to the class/chapter
                    // Simulating a success for now since API might just need cloning or assignment
                    if (!selectedMaterial) throw new Error('Pilih materi dari bank terlebih dahulu')
                    // ... assignment logic
                }
            } else {
                if (quizMode === 'manual') {
                    await quizApi.create({
                        ...quizData,
                        isSystem: false,
                        status: 'PUBLISHED',
                        order: 1
                    })
                } else {
                    if (selectedQuestions.length === 0) throw new Error('Pilih minimal 1 soal')
                    const newQuiz = await quizApi.create({
                        ...quizData,
                        isSystem: false,
                        status: 'PUBLISHED',
                        order: 1
                    })
                    // Link imported questions
                    await questionApi.importToQuiz(newQuiz.id, selectedQuestions)
                }
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
                                    <input required type="text" value={materialData.title} onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bab *</label>
                                    <select required value={materialData.chapterId} onChange={(e) => setMaterialData({ ...materialData, chapterId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="">Pilih Bab</option>
                                        {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Konten (Mendukung LaTeX) *</label>
                                    <textarea required rows={6} value={materialData.content} onChange={(e) => setMaterialData({ ...materialData, content: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"></textarea>
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
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="font-bold text-slate-900 dark:text-white mb-4">Sumber Kuis</h2>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setQuizMode('manual')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${quizMode === 'manual' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}>
                                    <span className="material-symbols-outlined text-2xl text-amber-500 mb-1">edit</span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Buat Manual (Kosong)</h3>
                                </button>
                                <button type="button" onClick={() => setQuizMode('import')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${quizMode === 'import' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}>
                                    <span className="material-symbols-outlined text-2xl text-amber-500 mb-1">library_books</span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Ambil Soal dari Bank</h3>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Judul Kuis *</label>
                                <input required type="text" value={quizData.title} onChange={(e) => setQuizData({ ...quizData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bab *</label>
                                <select required value={quizData.chapterId} onChange={(e) => setQuizData({ ...quizData, chapterId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                    <option value="">Pilih Bab</option>
                                    {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {quizMode === 'import' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="font-bold mb-4">Pilih Soal dari Bank</h3>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {bankQuestions.map(q => (
                                        <label key={q.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedQuestions.includes(q.id) ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <input type="checkbox" checked={selectedQuestions.includes(q.id)} onChange={() => toggleSelectQuestion(q.id)} className="w-4 h-4 mt-1 text-amber-600 rounded" />
                                            <div className="flex-1">
                                                <LatexRenderer content={q.text} />
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-md text-slate-600">{q.difficulty}</span>
                                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-md text-slate-600">{q.chapter?.name}</span>
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setPreviewQuestion(q);
                                                }}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Lihat Detail Soal"
                                            >
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                            </button>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
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
