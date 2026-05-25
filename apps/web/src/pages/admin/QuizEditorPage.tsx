import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'
import { quizApi, questionApi } from '../../lib/api'

export default function QuizEditorPage() {
    const { contentId, chapterId } = useParams()
    const navigate = useNavigate()
    const isNew = contentId === 'new'

    const [quiz, setQuiz] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [bankSoalData, setBankSoalData] = useState<any[]>([])

    useEffect(() => {
        setIsLoading(true)
        if (isNew) {
            setQuiz({
                id: 0,
                title: '',
                description: '',
                chapterId: chapterId || '',
                chapterName: 'Chapter Baru',
                grade: 'XII',
                order: 1,
                status: 'DRAFT',
                timeLimit: 30,
                passingScore: 70,
                questions: []
            })
            setIsLoading(false)
        } else if (contentId) {
            quizApi.get(contentId).then(data => {
                const flatQuestions = (data as any).questions?.map((q: any) => {
                    const question = q.question;
                    const correctOpt = question.options?.find((opt: any) => opt.isCorrect)
                    return {
                        ...question,
                        order: q.order,
                        correctAnswer: correctOpt ? correctOpt.label : 'A',
                        options: question.options?.map((o: any) => ({ ...o, id: o.label })) || []
                    }
                }) || []
                
                setQuiz({
                    ...data,
                    chapterName: (data as any).chapter?.name || '',
                    grade: (data as any).chapter?.grade || '',
                    questions: flatQuestions
                })
            }).catch(console.error)
            .finally(() => setIsLoading(false))
        }

        questionApi.list().then(data => {
            const formatted = (data as any[]).map((q: any) => {
                const correctOpt = q.options?.find((opt: any) => opt.isCorrect)
                return {
                    ...q,
                    correctAnswer: correctOpt ? correctOpt.label : 'A',
                    options: q.options?.map((o: any) => ({ ...o, id: o.label })) || []
                }
            })
            setBankSoalData(formatted)
        }).catch(console.error)

    }, [contentId, chapterId, isNew])

    const [editingQuestion, setEditingQuestion] = useState<any | null>(null)
    const [showQuestionModal, setShowQuestionModal] = useState(false)
    const [showBankSoalModal, setShowBankSoalModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

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

    const insertLatex = (latex: string) => {
        const textarea = document.getElementById('question-editor') as HTMLTextAreaElement
        if (textarea && editingQuestion) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newText = editingQuestion.text.substring(0, start) + latex + editingQuestion.text.substring(end)
            setEditingQuestion({ ...editingQuestion, text: newText })
            setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(start + latex.length, start + latex.length)
            }, 0)
        }
    }

    const handleSave = async (publish = false) => {
        setIsSaving(true)
        try {
            const payload = {
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                passingScore: quiz.passingScore,
                status: publish ? 'PUBLISHED' : quiz.status
            }
            if (!isNew && contentId) {
                await quizApi.update(contentId, payload)
                setQuiz((prev: any) => ({ ...prev, status: payload.status }))
            }
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 2000)
        } catch (err) {
            console.error('Failed to save quiz', err)
            alert('Gagal menyimpan quiz')
        } finally {
            setIsSaving(false)
        }
    }

    const handleBack = () => {
        navigate(`/admin/master-data/chapters/${quiz.chapterId}/content`)
    }

    const openAddQuestion = () => {
        setEditingQuestion({
            id: Date.now(),
            text: '',
            options: [
                { id: 'A', text: '' },
                { id: 'B', text: '' },
                { id: 'C', text: '' },
                { id: 'D', text: '' },
                { id: 'E', text: '' },
            ],
            correctAnswer: 'A',
            explanation: '',
            difficulty: 'medium',
        })
        setShowQuestionModal(true)
    }

    const openEditQuestion = (question: any) => {
        setEditingQuestion({ ...question })
        setShowQuestionModal(true)
    }

    const handleSaveQuestion = () => {
        if (!editingQuestion) return

        const existingIndex = quiz.questions.findIndex((q: any) => q.id === editingQuestion.id)
        if (existingIndex >= 0) {
            const newQuestions = [...quiz.questions]
            newQuestions[existingIndex] = editingQuestion
            setQuiz((prev: any) => ({ ...prev, questions: newQuestions }))
        } else {
            setQuiz((prev: any) => ({ ...prev, questions: [...prev.questions, editingQuestion] }))
        }
        setShowQuestionModal(false)
        setEditingQuestion(null)
    }

    const handleDeleteQuestion = (questionId: number) => {
        setQuiz((prev: any) => ({
            ...prev,
            questions: prev.questions.filter((q: any) => q.id !== questionId)
        }))
    }

    const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
        const newQuestions = [...quiz.questions]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newQuestions.length) return

        const temp = newQuestions[index]
        newQuestions[index] = newQuestions[targetIndex]
        newQuestions[targetIndex] = temp
        setQuiz((prev: any) => ({ ...prev, questions: newQuestions }))
    }

    const getDifficultyColor = (diff: string) => {
        if (!diff) return 'bg-slate-100 text-slate-600'
        switch (diff.toLowerCase()) {
            case 'easy': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
            case 'medium': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
            case 'hard': return 'bg-red-100 dark:bg-red-900/30 text-red-600'
            default: return 'bg-slate-100 text-slate-600'
        }
    }

    if (isLoading) return <div className="p-8 text-center">Loading...</div>
    if (!quiz) return <div className="p-8 text-center text-red-500">Gagal memuat kuis</div>

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/admin/master-data" className="hover:text-primary">Master Data</Link>
                    <span>/</span>
                    <Link to="/admin/master-data/curriculum" className="hover:text-primary">Kurikulum</Link>
                    <span>/</span>
                    <Link to={`/admin/master-data/chapters/${quiz.chapterId}/content`} className="hover:text-primary">
                        {quiz.chapterName}
                    </Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">{isNew ? 'Quiz Baru' : quiz.title}</span>
                </div>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">quiz</span>
                            {isNew ? 'Buat Quiz Baru' : 'Edit Quiz'}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Kelas {quiz.grade} • {quiz.chapterName} • {quiz.questions.length} soal
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-medium flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Kembali
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="px-4 py-2 border border-primary text-primary rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <span className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-sm">save</span>
                            )}
                            Simpan Draft
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving || quiz.questions.length === 0}
                            className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">publish</span>
                            Publish
                        </button>
                    </div>
                </div>
                {saveSuccess && (
                    <div className="mt-2 text-emerald-600 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Quiz berhasil disimpan!
                    </div>
                )}
            </div>

            {/* Quiz Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4">Informasi Quiz</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Judul Quiz *
                        </label>
                        <input
                            type="text"
                            value={quiz.title}
                            onChange={(e) => setQuiz((prev: any) => ({ ...prev, title: e.target.value }))}
                            placeholder="Contoh: Post-Test Trigonometri"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Batas Waktu (menit)
                        </label>
                        <input
                            type="number"
                            value={quiz.timeLimit}
                            onChange={(e) => setQuiz((prev: any) => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Deskripsi
                        </label>
                        <input
                            type="text"
                            value={quiz.description}
                            onChange={(e) => setQuiz((prev: any) => ({ ...prev, description: e.target.value }))}
                            placeholder="Deskripsi singkat quiz..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Nilai Minimum Lulus (KKM)
                        </label>
                        <input
                            type="number"
                            value={quiz.passingScore}
                            onChange={(e) => setQuiz((prev: any) => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">help</span>
                        Daftar Soal ({quiz.questions.length})
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowBankSoalModal(true)}
                            className="border border-primary text-primary px-4 py-2 rounded-xl font-medium flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">folder_open</span>
                            Bank Soal
                        </button>
                        <button
                            onClick={openAddQuestion}
                            className="bg-primary text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Tambah Soal
                        </button>
                    </div>
                </div>

                {quiz.questions.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">quiz</span>
                        <p className="text-slate-500 mb-4">Belum ada soal. Tambahkan soal pertama!</p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={openAddQuestion}
                                className="bg-primary text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Buat Soal Baru
                            </button>
                            <button
                                onClick={() => setShowBankSoalModal(true)}
                                className="border border-primary text-primary px-6 py-2 rounded-xl font-medium flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">folder_open</span>
                                Pilih dari Bank Soal
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {quiz.questions.map((question: any, index: number) => (
                            <div key={question.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={() => handleMoveQuestion(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 disabled:opacity-30"
                                        >
                                            <span className="material-symbols-outlined text-sm">expand_less</span>
                                        </button>
                                        <span className="size-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-slate-600">
                                            {index + 1}
                                        </span>
                                        <button
                                            onClick={() => handleMoveQuestion(index, 'down')}
                                            disabled={index === quiz.questions.length - 1}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 disabled:opacity-30"
                                        >
                                            <span className="material-symbols-outlined text-sm">expand_more</span>
                                        </button>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                                                {question.difficulty?.toLowerCase() === 'easy' ? '🟢 Easy' : question.difficulty?.toLowerCase() === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                                            </span>
                                            <span className="text-xs text-slate-500">Jawaban: {question.correctAnswer}</span>
                                        </div>
                                        <div className="text-slate-900 dark:text-white font-medium mb-2">
                                            <LatexRenderer content={question.text.length > 100 ? question.text.substring(0, 100) + '...' : question.text} />
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {question.options.map((opt: any) => (
                                                <div
                                                    key={opt.id}
                                                    className={`px-2 py-1 rounded flex items-center gap-1 ${opt.id === question.correctAnswer
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-medium'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                        }`}
                                                >
                                                    <span className="font-bold">{opt.id}.</span>
                                                    <LatexRenderer content={opt.text} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditQuestion(question)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-sm text-primary">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title="Hapus"
                                        >
                                            <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Question Editor Modal */}
            {showQuestionModal && editingQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowQuestionModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-xl my-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">edit</span>
                            {editingQuestion.id === 0 ? 'Tambah Soal Baru' : 'Edit Soal'}
                        </h3>

                        <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
                            {/* Question Text */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Pertanyaan * (Gunakan $...$ untuk LaTeX)
                                </label>
                                {/* LaTeX Toolbar */}
                                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    {latexButtons.map(btn => (
                                        <button
                                            key={btn.label}
                                            type="button"
                                            onClick={() => insertLatex(btn.value)}
                                            className="px-2 py-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-mono"
                                            title={`Insert ${btn.label}`}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    id="question-editor"
                                    value={editingQuestion.text}
                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                                    placeholder="Contoh: Nilai dari $\sin 30°$ adalah..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Tingkat Kesulitan
                                </label>
                                <div className="flex gap-3">
                                    {(['easy', 'medium', 'hard'] as const).map(diff => (
                                        <button
                                            key={diff}
                                            onClick={() => setEditingQuestion({ ...editingQuestion, difficulty: diff })}
                                            className={`px-4 py-2 rounded-xl font-medium transition-all ${editingQuestion.difficulty === diff
                                                ? getDifficultyColor(diff) + ' ring-2 ring-offset-2'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                                                }`}
                                        >
                                            {diff === 'easy' ? '🟢 Easy' : diff === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Options */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Pilihan Jawaban (Gunakan $...$ untuk LaTeX)
                                </label>
                                <div className="space-y-2">
                                    {editingQuestion.options.map((opt: any, idx: number) => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingQuestion({ ...editingQuestion, correctAnswer: opt.id })}
                                                className={`size-10 rounded-lg font-bold flex items-center justify-center transition-all ${editingQuestion.correctAnswer === opt.id
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                title="Klik untuk jadikan jawaban benar"
                                            >
                                                {opt.id}
                                            </button>
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => {
                                                    const newOptions = [...editingQuestion.options]
                                                    newOptions[idx] = { ...opt, text: e.target.value }
                                                    setEditingQuestion({ ...editingQuestion, options: newOptions })
                                                }}
                                                placeholder={`Pilihan ${opt.id}...`}
                                                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                            />
                                            {editingQuestion.correctAnswer === opt.id && (
                                                <span className="text-emerald-500 text-sm font-medium">✓ Benar</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    💡 Klik huruf untuk memilih jawaban yang benar
                                </p>
                            </div>

                            {/* Explanation */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Pembahasan (Opsional)
                                </label>
                                <textarea
                                    value={editingQuestion.explanation}
                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                                    placeholder="Jelaskan cara mendapatkan jawaban..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQuestionModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSaveQuestion}
                                disabled={!editingQuestion.text || editingQuestion.options.some((o: any) => !o.text)}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl disabled:opacity-50"
                            >
                                Simpan Soal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Soal Modal */}
            {showBankSoalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowBankSoalModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-xl my-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">folder_open</span>
                            Pilih Soal dari Bank Soal
                        </h3>

                        <p className="text-sm text-slate-500 mb-4">
                            Klik soal untuk menambahkannya ke quiz. Soal yang sudah ditambahkan akan diberi tanda.
                        </p>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {bankSoalData.map((soal) => {
                                const isAdded = quiz.questions.some((q: any) => q.id === soal.id)
                                return (
                                    <div
                                        key={soal.id}
                                        className={`p-4 rounded-xl border-2 transition-all ${isAdded
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary cursor-pointer'
                                            }`}
                                        onClick={() => {
                                            if (!isAdded) {
                                                if (!isNew && contentId) {
                                                    questionApi.importToQuiz(contentId, [soal.id]).then(() => {
                                                        setQuiz((prev: any) => ({
                                                            ...prev,
                                                            questions: [...prev.questions, { ...soal }]
                                                        }))
                                                    }).catch(err => {
                                                        console.error(err)
                                                        alert('Gagal impor soal')
                                                    })
                                                } else {
                                                    setQuiz((prev: any) => ({
                                                        ...prev,
                                                        questions: [...prev.questions, { ...soal }]
                                                    }))
                                                }
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(soal.difficulty)}`}>
                                                        {soal.difficulty === 'easy' ? '🟢 Easy' : soal.difficulty === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                                                    </span>
                                                    {isAdded && (
                                                        <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                                            Sudah ditambahkan
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mb-2">
                                                    <LatexRenderer content={soal.text} />
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    {soal.options.map((opt: any) => (
                                                        <div
                                                            key={opt.id}
                                                            className={`px-2 py-1 rounded ${opt.id === soal.correctAnswer
                                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                                                                }`}
                                                        >
                                                            <span className="font-bold">{opt.id}.</span> <LatexRenderer content={opt.text} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {!isAdded && (
                                                <button className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary">
                                                    <span className="material-symbols-outlined">add</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowBankSoalModal(false)}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
