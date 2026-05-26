import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { questionApi, adminApi, uploadApi } from '../../lib/api'
import LatexRenderer from '../../components/LatexRenderer'

interface AnswerOption {
    id: string
    text: string
}

interface Chapter {
    id: string
    name: string
    grade: string
}

const grades = ['X', 'XI', 'XII']

export default function TambahSoalPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [chapters, setChapters] = useState<Chapter[]>([])

    const [formData, setFormData] = useState({
        chapterId: '',
        grade: '',
        difficulty: 'MEDIUM',
        type: 'multiple_choice',
        question: '',
        imageUrl: '',
        explanation: '',
        estimatedTime: 3,
        points: 10,
        isRemedial: false,
        isActive: true,
    })

    const [answers, setAnswers] = useState<AnswerOption[]>([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' },
    ])
    const [correctAnswer, setCorrectAnswer] = useState<string>('A')

    useEffect(() => {
        const loadChapters = async () => {
            try {
                const data = await adminApi.chapters()
                setChapters(Array.isArray(data) ? data as Chapter[] : [])
            } catch (err) {
                console.error('Failed to load chapters:', err)
            }
        }
        loadChapters()
    }, [])

    const filteredChapters = formData.grade
        ? chapters.filter(c => c.grade === formData.grade)
        : chapters

    const [errors, setErrors] = useState<Record<string, string>>({})

    const insertLatex = (latex: string) => {
        const textarea = document.getElementById('question-textarea') as HTMLTextAreaElement
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newText = formData.question.substring(0, start) + latex + formData.question.substring(end)
            setFormData(prev => ({ ...prev, question: newText }))
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
        { label: '≤', value: '$\\leq$' },
        { label: '≥', value: '$\\geq$' },
        { label: 'frac', value: '$\\frac{}{}$' },
        { label: 'x²', value: '$x^{2}$' },
        { label: 'xₙ', value: '$x_{n}$' },
    ]

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.chapterId) newErrors.chapter = 'Pilih bab'
        if (!formData.question || formData.question.length < 10) newErrors.question = 'Soal minimal 10 karakter'

        const filledAnswers = answers.filter(a => a.text.trim())
        if (filledAnswers.length < 2) newErrors.answers = 'Minimal 2 pilihan jawaban'

        const correctAnswerOption = answers.find(a => a.id === correctAnswer)
        if (!correctAnswerOption?.text.trim()) newErrors.correctAnswer = 'Pilih jawaban yang benar'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (asDraft: boolean = false) => {
        if (!asDraft && !validateForm()) return

        setIsLoading(true)
        try {
            const options = answers
                .filter(a => a.text.trim())
                .map(a => ({
                    label: a.id,
                    text: a.text,
                    isCorrect: a.id === correctAnswer,
                }))

            await questionApi.create({
                text: formData.question,
                difficulty: formData.difficulty,
                explanation: formData.explanation || undefined,
                imageUrl: formData.imageUrl || undefined,
                chapterId: formData.chapterId || undefined,
                grade: formData.grade || undefined,
                isSystem: false,
                options,
            })

            navigate('/guru/bank-soal')
        } catch (error) {
            console.error('Failed to create question:', error)
            alert('Gagal menyimpan soal. Silakan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran gambar maksimal 5MB')
            return
        }

        setIsUploading(true)
        try {
            const res = await uploadApi.uploadImage(file)
            setFormData(prev => ({ ...prev, imageUrl: res.url }))
        } catch (error: any) {
            console.error('Failed to upload image:', error)
            alert(error.message || 'Gagal mengunggah gambar. Pastikan backend sudah dikonfigurasi.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link to="/guru/bank-soal" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Kembali ke Bank Soal
                    </Link>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">add_circle</span>
                        Tambah Soal Baru
                    </h1>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Info Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">info</span>
                        Informasi Soal
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Grade */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                🎓 Kelas *
                            </label>
                            <select
                                value={formData.grade}
                                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value, chapterId: '' }))}
                                className="w-full px-4 py-3 rounded-xl border-2 transition-all border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none"
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {grades.map(g => <option key={g} value={g}>Kelas {g}</option>)}
                            </select>
                        </div>

                        {/* Chapter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                📚 Pilih Bab *
                            </label>
                            <select
                                value={formData.chapterId}
                                onChange={(e) => setFormData(prev => ({ ...prev, chapterId: e.target.value }))}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.chapter ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                                    } bg-white dark:bg-slate-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none`}
                            >
                                <option value="">-- Pilih Bab --</option>
                                {filteredChapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                            </select>
                            {errors.chapter && <p className="text-red-500 text-sm mt-1">{errors.chapter}</p>}
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                ⚡ Tingkat Kesulitan *
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'EASY', label: '🟢 Easy', color: 'emerald' },
                                    { value: 'MEDIUM', label: '🟡 Medium', color: 'amber' },
                                    { value: 'HARD', label: '🔴 Hard (HOTS)', color: 'red' },
                                ].map(d => (
                                    <button
                                        key={d.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, difficulty: d.value }))}
                                        className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.difficulty === d.value
                                            ? `border-${d.color}-500 bg-${d.color}-50 dark:bg-${d.color}-900/20 text-${d.color}-600`
                                            : 'border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Type */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                🏷️ Tipe Soal *
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { value: 'multiple_choice', label: 'Pilihan Ganda' },
                                    { value: 'essay', label: 'Essay' },
                                    { value: 'short_answer', label: 'Isian Singkat' },
                                ].map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: t.value }))}
                                        className={`py-2 px-4 rounded-xl border-2 text-sm font-medium transition-all ${formData.type === t.value
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                            : 'border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Content */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_note</span>
                        Konten Soal
                    </h2>

                    {/* LaTeX Toolbar */}
                    <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <div className="flex gap-1">
                            <button type="button" className="px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">B</button>
                            <button type="button" className="px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 italic">I</button>
                            <button type="button" className="px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 underline">U</button>
                        </div>
                        <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                        <div className="flex gap-1 flex-wrap">
                            {latexButtons.map(btn => (
                                <button
                                    key={btn.label}
                                    type="button"
                                    onClick={() => insertLatex(btn.value)}
                                    className="px-2 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-mono"
                                    title={btn.value}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${showPreview ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            Preview
                        </button>
                    </div>

                    {/* Question Textarea */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            📄 Teks Soal * (Mendukung LaTeX)
                        </label>
                        <textarea
                            id="question-textarea"
                            value={formData.question}
                            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Jika diketahui $\sin \theta = \frac{3}{5}$ dengan $0° < \theta < 90°$, tentukan nilai dari $\cos \theta$..."
                            rows={6}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all font-mono ${errors.question ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                                } bg-white dark:bg-slate-900 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none`}
                        />
                        <p className="text-xs text-slate-500 mt-1">💡 Gunakan $...$ untuk inline LaTeX dan $$...$$ untuk block</p>
                        {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
                    </div>

                    {/* Preview */}
                    {showPreview && formData.question && (
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 mb-2">Preview:</p>
                            <div className="text-slate-900 dark:text-white">
                                <LatexRenderer content={formData.question} />
                            </div>
                        </div>
                    )}

                    {/* Image URL / Upload */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            📷 Gambar Soal (Opsional)
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="url"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                placeholder="Pilih file gambar atau tempel URL (https://...)"
                                className="flex-1 px-4 py-3 rounded-xl border-2 transition-all border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none"
                            />
                            <div className="relative">
                                <button type="button" disabled={isUploading} className="h-full px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl border-2 border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xl">{isUploading ? 'hourglass_empty' : 'upload_file'}</span>
                                    {isUploading ? 'Mengunggah...' : 'Pilih File'}
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                        {formData.imageUrl && (
                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 inline-block">
                                <p className="text-xs text-slate-500 mb-2">Preview Gambar:</p>
                                <img src={formData.imageUrl} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Answer Options */}
                {formData.type === 'multiple_choice' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">task_alt</span>
                            Pilihan Jawaban
                        </h2>

                        <div className="space-y-3">
                            {answers.map((answer, index) => (
                                <div key={answer.id} className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCorrectAnswer(answer.id)}
                                        className={`size-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${correctAnswer === answer.id
                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                                            }`}
                                    >
                                        {correctAnswer === answer.id && <span className="material-symbols-outlined text-sm">check</span>}
                                    </button>
                                    <span className="font-bold text-slate-500 w-6">{answer.id}.</span>
                                    <input
                                        type="text"
                                        value={answer.text}
                                        onChange={(e) => {
                                            const newAnswers = [...answers]
                                            newAnswers[index].text = e.target.value
                                            setAnswers(newAnswers)
                                        }}
                                        placeholder={`Jawaban ${answer.id}... (dukung LaTeX: $\\frac{4}{5}$)`}
                                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-3">💡 Klik lingkaran untuk menandai jawaban yang benar</p>
                        {errors.answers && <p className="text-red-500 text-sm mt-1">{errors.answers}</p>}
                        {errors.correctAnswer && <p className="text-red-500 text-sm mt-1">{errors.correctAnswer}</p>}
                    </div>
                )}

                {/* Explanation */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">lightbulb</span>
                        Pembahasan (Opsional tapi Disarankan)
                    </h2>
                    <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                        placeholder="Gunakan identitas Pythagoras: $\sin^2 \theta + \cos^2 \theta = 1$..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                    />
                </div>

                {/* Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">settings</span>
                        Pengaturan Tambahan
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                ⏱️ Estimasi Waktu (menit)
                            </label>
                            <select
                                value={formData.estimatedTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: Number(e.target.value) }))}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            >
                                {[1, 2, 3, 5, 10].map(t => <option key={t} value={t}>{t} menit</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                🎯 Bobot Nilai
                            </label>
                            <select
                                value={formData.points}
                                onChange={(e) => setFormData(prev => ({ ...prev, points: Number(e.target.value) }))}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            >
                                {[5, 10, 15, 20, 25].map(p => <option key={p} value={p}>{p} poin</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isRemedial}
                                onChange={(e) => setFormData(prev => ({ ...prev, isRemedial: e.target.checked }))}
                                className="size-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Tandai sebagai soal untuk Paket Remedial</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="size-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Aktifkan soal (tampilkan di bank soal)</span>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm sticky bottom-4">
                    <Link to="/guru/bank-soal" className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900">
                        Batal
                    </Link>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleSubmit(true)}
                            disabled={isLoading}
                            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            Simpan Draft
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit(false)}
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">check_circle</span>
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
