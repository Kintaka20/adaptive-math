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

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                if (classId) {
                    const cls = await classApi.get(classId)
                    if (cls.chapters) {
                        setChapters(cls.chapters)
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
        </div>
    )
}
