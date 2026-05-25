import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'
import { materialApi, adminApi } from '../../lib/api'

interface ChapterData {
    id: string
    name: string
    grade: string
}

const grades = ['X', 'XI', 'XII']

export default function TambahMateriPage() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
    const [chapters, setChapters] = useState<ChapterData[]>([])
    const [formData, setFormData] = useState({
        title: '',
        chapterId: '',
        grade: '',
        duration: '',
        content: '',
        videoUrl: '',
        documentFile: null as File | null,
        status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    })

    useEffect(() => {
        const loadChapters = async () => {
            try {
                const data = await adminApi.chapters()
                setChapters(Array.isArray(data) ? data as ChapterData[] : [])
            } catch (err) {
                console.error('Failed to load chapters:', err)
            }
        }
        loadChapters()
    }, [])

    const filteredChapters = formData.grade
        ? chapters.filter(c => c.grade === formData.grade)
        : chapters

    const handleSubmit = async (asDraft: boolean = false) => {
        if (!formData.title || !formData.chapterId) {
            alert('Judul dan Bab harus diisi')
            return
        }

        setIsSubmitting(true)
        try {
            await materialApi.create({
                title: formData.title,
                content: formData.content || 'Konten belum diisi.',
                chapterId: formData.chapterId,
                duration: formData.duration || undefined,
                videoUrl: formData.videoUrl || undefined,
                status: asDraft ? 'DRAFT' : 'PUBLISHED',
                isSystem: false,
            })
            navigate('/guru/bank-materi')
        } catch (error) {
            console.error('Failed to create material:', error)
            alert('Gagal menyimpan materi. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.size <= 10 * 1024 * 1024) { // 10MB max
            setFormData(prev => ({ ...prev, documentFile: file }))
        }
    }

    const insertLatex = (latex: string) => {
        const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newText = formData.content.substring(0, start) + latex + formData.content.substring(end)
            setFormData(prev => ({ ...prev, content: newText }))
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
        { label: '∞', value: '$\\infty$' },
        { label: 'frac', value: '$\\frac{}{}$' },
        { label: 'x²', value: '$x^{2}$' },
        { label: 'xₙ', value: '$x_{n}$' },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/guru/bank-materi" className="hover:text-primary">Bank Materi</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Tambah Materi</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">add_circle</span>
                    Tambah Materi Baru
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Buat materi pembelajaran baru</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Info Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">info</span>
                        Informasi Materi
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Judul Materi *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Contoh: Pengenalan Trigonometri"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                            />
                        </div>

                        {/* Grade */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Tingkat Kelas *
                            </label>
                            <select
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value, chapterId: '' })}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                            >
                                <option value="">Pilih Kelas</option>
                                {grades.map(grade => (
                                    <option key={grade} value={grade}>Kelas {grade}</option>
                                ))}
                            </select>
                        </div>

                        {/* Chapter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Bab *
                            </label>
                            <select
                                value={formData.chapterId}
                                onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                            >
                                <option value="">Pilih Bab</option>
                                {filteredChapters.map(chapter => (
                                    <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Estimasi Durasi Baca
                            </label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="Contoh: 15 menit"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Video URL Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">play_circle</span>
                        Video Pembelajaran (Opsional)
                    </h2>
                    <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=... atau link video lainnya"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-2">💡 Mendukung YouTube, Vimeo, atau video hosting lainnya</p>
                </div>

                {/* File Upload Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">attach_file</span>
                        File Pendukung (Opsional)
                    </h2>
                    <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                        {formData.documentFile ? (
                            <div className="flex items-center justify-center gap-4">
                                <span className="material-symbols-outlined text-4xl text-purple-500">description</span>
                                <div>
                                    <p className="text-sm font-medium">{formData.documentFile.name}</p>
                                    <p className="text-xs text-slate-500">{(formData.documentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, documentFile: null }))}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        ✕ Hapus
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-4xl text-slate-300">upload_file</span>
                                <p className="text-slate-500 mt-2">Klik atau drag & drop file di sini</p>
                                <p className="text-xs text-slate-400">Format: PDF, DOCX, PPT (Max 10MB)</p>
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.pptx,.doc,.ppt"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Content with Tabs */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">article</span>
                            Konten Materi
                        </h2>
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                            >
                                ✏️ Editor
                            </button>
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                            >
                                👁️ Preview
                            </button>
                        </div>
                    </div>

                    {activeTab === 'edit' ? (
                        <>
                            {/* LaTeX Toolbar */}
                            <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <div className="flex gap-1">
                                    <button type="button" onClick={() => insertLatex('# ')} className="px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">H1</button>
                                    <button type="button" onClick={() => insertLatex('## ')} className="px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">H2</button>
                                    <button type="button" onClick={() => insertLatex('**teks**')} className="px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">B</button>
                                    <button type="button" onClick={() => insertLatex('*teks*')} className="px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 italic">I</button>
                                </div>
                                <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                                <div className="flex gap-1 flex-wrap">
                                    {latexButtons.map(btn => (
                                        <button
                                            key={btn.label}
                                            type="button"
                                            onClick={() => insertLatex(btn.value)}
                                            className="px-2 py-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-mono"
                                            title={btn.value}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <textarea
                                id="content-textarea"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder={`# Judul Materi

## Sub Judul

Penjelasan materi...

Rumus inline: $\\sin^2 x + \\cos^2 x = 1$

Rumus block:
$$
\\frac{d}{dx}[\\sin x] = \\cos x
$$

- Point 1
- Point 2
- Point 3`}
                                rows={15}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-2">💡 Gunakan $...$ untuk inline LaTeX dan $$...$$ untuk block</p>
                        </>
                    ) : (
                        <div className="min-h-[300px] p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            {formData.content ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <LatexRenderer content={formData.content} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">visibility_off</span>
                                    <p>Belum ada konten untuk di-preview</p>
                                    <p className="text-sm">Tulis konten di tab Editor</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions - Sticky */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm sticky bottom-4">
                    <Link to="/guru/bank-materi" className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900">
                        Batal
                    </Link>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleSubmit(true)}
                            disabled={isSubmitting || !formData.title || !formData.grade || !formData.chapterId}
                            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            💾 Simpan Draft
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting || !formData.title || !formData.grade || !formData.chapterId}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">publish</span>
                                    Simpan & Publikasi
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
