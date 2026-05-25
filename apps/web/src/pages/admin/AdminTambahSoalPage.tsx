import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'

interface AnswerOption {
    id: string
    text: string
}

const chapters = ['Trigonometri', 'Turunan', 'Integral', 'Limit', 'Logaritma', 'Persamaan Kuadrat', 'Fungsi Linear']
const grades = ['X', 'XI', 'XII']

export default function AdminTambahSoalPage() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const [formData, setFormData] = useState({
        chapter: '',
        grade: '',
        difficulty: 'medium',
        question: '',
        image: null as File | null,
        explanation: '',
    })

    const [answers, setAnswers] = useState<AnswerOption[]>([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' },
    ])
    const [correctAnswer, setCorrectAnswer] = useState<string>('A')

    const insertLatex = (latex: string) => {
        const textarea = document.getElementById('question-textarea') as HTMLTextAreaElement
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newText = formData.question.substring(0, start) + latex + formData.question.substring(end)
            setFormData(prev => ({ ...prev, question: newText }))
        }
    }

    const latexButtons = [
        { label: 'Σ', value: '$\\sum_{}^{}$' },
        { label: '√', value: '$\\sqrt{}$' },
        { label: '∫', value: '$\\int_{}^{}$' },
        { label: 'π', value: '$\\pi$' },
        { label: 'frac', value: '$\\frac{}{}$' },
        { label: 'x²', value: '$x^{2}$' },
    ]

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            navigate('/admin/master-data/questions')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.size <= 5 * 1024 * 1024) {
            setFormData(prev => ({ ...prev, image: file }))
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/admin/master-data/questions" className="hover:text-primary">Bank Soal</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Tambah Soal Sistem</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">add_circle</span>
                    Tambah Soal Sistem
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Soal yang ditambahkan akan menjadi Soal Sistem</p>
            </div>

            <div className="space-y-6">
                {/* Info Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">info</span>
                        Informasi Soal
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelas *</label>
                            <select value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <option value="">Pilih Kelas</option>
                                {grades.map(g => <option key={g} value={g}>Kelas {g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bab *</label>
                            <select value={formData.chapter} onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <option value="">Pilih Bab</option>
                                {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kesulitan *</label>
                            <div className="flex gap-2">
                                {[{ value: 'easy', label: '🟢' }, { value: 'medium', label: '🟡' }, { value: 'hard', label: '🔴' }].map(d => (
                                    <button key={d.value} type="button" onClick={() => setFormData({ ...formData, difficulty: d.value })}
                                        className={`flex-1 py-2 rounded-xl border-2 ${formData.difficulty === d.value ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">edit_note</span>
                            Soal
                        </h2>
                        <button onClick={() => setShowPreview(!showPreview)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${showPreview ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            {showPreview ? '✏️ Editor' : '👁️ Preview'}
                        </button>
                    </div>

                    {!showPreview ? (
                        <>
                            <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                {latexButtons.map(btn => (
                                    <button key={btn.label} type="button" onClick={() => insertLatex(btn.value)} className="px-2 py-1.5 rounded-lg hover:bg-amber-100 text-amber-700 text-sm font-mono">{btn.label}</button>
                                ))}
                            </div>
                            <textarea id="question-textarea" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                placeholder="Tulis soal dengan LaTeX..." rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm" />
                        </>
                    ) : (
                        <div className="min-h-[150px] p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            {formData.question ? <LatexRenderer content={formData.question} /> : <p className="text-slate-400 text-center">Belum ada soal</p>}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="mt-4 relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-amber-500 transition-colors">
                        {formData.image ? (
                            <div className="flex items-center justify-center gap-4">
                                <img src={URL.createObjectURL(formData.image)} alt="Preview" className="h-16 rounded-lg" />
                                <button onClick={() => setFormData(prev => ({ ...prev, image: null }))} className="text-red-500 text-sm">✕ Hapus</button>
                            </div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-2xl text-slate-300">image</span>
                                <p className="text-sm text-slate-500">Tambah gambar (opsional)</p>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </>
                        )}
                    </div>
                </div>

                {/* Answers */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">task_alt</span>
                        Pilihan Jawaban
                    </h2>
                    <div className="space-y-3">
                        {answers.map((answer, index) => (
                            <div key={answer.id} className="flex items-center gap-3">
                                <button type="button" onClick={() => setCorrectAnswer(answer.id)}
                                    className={`size-8 rounded-full border-2 flex items-center justify-center ${correctAnswer === answer.id ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500'}`}>
                                    {correctAnswer === answer.id && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                                <span className="font-bold text-slate-500 w-6">{answer.id}.</span>
                                <input type="text" value={answer.text}
                                    onChange={(e) => { const newAnswers = [...answers]; newAnswers[index].text = e.target.value; setAnswers(newAnswers) }}
                                    placeholder={`Jawaban ${answer.id}...`}
                                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                        Pembahasan (Opsional)
                    </h2>
                    <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        placeholder="Penjelasan jawaban yang benar..." rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 sticky bottom-4">
                    <Link to="/admin/master-data/questions" className="px-4 py-2 text-slate-600 hover:text-slate-900">Batal</Link>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => handleSubmit()} disabled={isSubmitting}
                            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50">
                            💾 Simpan Draft
                        </button>
                        <button type="button" onClick={() => handleSubmit()} disabled={isSubmitting}
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2">
                            {isSubmitting ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg><span>Menyimpan...</span></> : <><span className="material-symbols-outlined">publish</span>Simpan & Publikasi</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
