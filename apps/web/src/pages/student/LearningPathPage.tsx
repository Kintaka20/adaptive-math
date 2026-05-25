import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { studentApi } from '../../lib/api'

type CombinedLesson = {
    id: string
    name: string
    status: 'completed' | 'in_progress' | 'locked' | 'failed'
    type: 'material' | 'quiz'
    quizType?: string
    score?: number
    remedialQuizId?: string | null
    isRemedialPassed?: boolean
}

type PathChapter = {
    id: string
    name: string
    order: number
    status: 'completed' | 'in_progress' | 'locked'
    progress: number
    xpEarned: number
    grade?: string
    lessons: CombinedLesson[]
    isLocked: boolean
}

export default function LearningPathPage() {
    const [chapters, setChapters] = useState<PathChapter[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedChapter, setSelectedChapter] = useState<PathChapter | null>(null)
    const location = useLocation()
    
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        const classId = queryParams.get('classId') || undefined

        setIsLoading(true)
        studentApi.learningPath(classId)
            .then((data: any) => {
                const formattedChapters: PathChapter[] = data.map((item: any, index: number) => {
                    const materials = item.materials || []
                    const quizzes = item.quizzes || []

                    const lessons: CombinedLesson[] = []
                    
                    materials.forEach((m: any) => {
                        lessons.push({
                            id: m.id,
                            name: m.title,
                            status: m.isCompleted ? 'completed' : item.chapter.isLocked ? 'locked' : 'in_progress',
                            type: 'material'
                        })
                    })

                    quizzes.forEach((q: any) => {
                        if (q.type === 'REMEDIAL') return;
                        
                        let qStatus: CombinedLesson['status'] = 'in_progress'
                        if (q.isPassed) qStatus = 'completed'
                        else if (q.isFailed) qStatus = 'failed'
                        else if (item.chapter.isLocked) qStatus = 'locked'

                        lessons.push({
                            id: q.id,
                            name: q.title,
                            status: qStatus,
                            type: 'quiz',
                            quizType: q.type,
                            score: q.bestScore,
                            remedialQuizId: q.remedialQuizId || null,
                            isRemedialPassed: q.isRemedialPassed,
                        })
                    })

                    const completedLessons = lessons.filter(l => l.status === 'completed').length
                    const progress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0
                    
                    let status: 'completed' | 'in_progress' | 'locked' = 'locked'
                    if (item.chapter.isLocked) status = 'locked'
                    else if (progress === 100) status = 'completed'
                    else status = 'in_progress'

                    return {
                        id: item.chapter.id,
                        name: item.chapter.name,
                        order: item.chapter.order || (index + 1),
                        status,
                        progress: Math.round(progress),
                        xpEarned: 0,
                        isLocked: item.chapter.isLocked,
                        lessons
                    }
                })

                setChapters(formattedChapters)
                setSelectedChapter(formattedChapters.find(c => c.status === 'in_progress') || formattedChapters[0] || null)
            })
            .catch(err => console.error('Error fetching learning path:', err))
            .finally(() => setIsLoading(false))
    }, [])

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-[400px] bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                    <div className="lg:col-span-2 h-[400px] bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                </div>
            </div>
        )
    }

    if (chapters.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-4">info</span>
                <p>Belum ada jalur belajar yang tersedia untuk kelas kamu. Hubungi gurumu untuk membuka bab pelajaran.</p>
            </div>
        )
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <span className="material-symbols-outlined text-emerald-500">check_circle</span>
            case 'in_progress': return <span className="material-symbols-outlined text-primary animate-pulse">play_circle</span>
            case 'locked': return <span className="material-symbols-outlined text-slate-300">lock</span>
            default: return null
        }
    }

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'text-emerald-500'
        if (grade.startsWith('B')) return 'text-blue-500'
        if (grade.startsWith('C')) return 'text-amber-500'
        return 'text-red-500'
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl lg:text-3xl font-black mb-2">
                    Jalur Belajar 📚
                </h1>
                <p className="text-white/80">
                    Ikuti alur pembelajaran yang disesuaikan dengan kemampuanmu
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                        <span className="text-white/70 text-sm">Bab Selesai</span>
                        <p className="font-bold text-lg">{chapters.filter(c => c.status === 'completed').length}/{chapters.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                        <span className="text-white/70 text-sm">Total XP Didapat</span>
                        <p className="font-bold text-lg">{chapters.reduce((a, b) => a + (b.xpEarned || 0), 0)} XP</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Chapter List */}
                <div className="lg:col-span-1 space-y-3">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">route</span>
                        Daftar Bab
                    </h2>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {chapters.map((chapter, index) => (
                            <button
                                key={chapter.id}
                                onClick={() => chapter.status !== 'locked' && setSelectedChapter(chapter)}
                                disabled={chapter.status === 'locked'}
                                className={`w-full flex items-center gap-3 p-4 text-left transition-all border-b last:border-b-0 border-slate-100 dark:border-slate-700
                                    ${selectedChapter?.id === chapter.id ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}
                                    ${chapter.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                {/* Chapter Number */}
                                <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${chapter.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                    chapter.status === 'in_progress' ? 'bg-primary/10' :
                                        'bg-slate-100 dark:bg-slate-700'
                                    }`}>
                                    <span className={`text-sm font-bold ${chapter.status === 'completed' ? 'text-emerald-600' :
                                        chapter.status === 'in_progress' ? 'text-primary' :
                                            'text-slate-400'
                                        }`}>{index + 1}</span>
                                </div>

                                {/* Chapter Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${chapter.status === 'locked' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                        {chapter.name}
                                    </p>
                                    {chapter.status !== 'locked' && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${chapter.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`}
                                                    style={{ width: `${chapter.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-500">{chapter.progress}%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                {getStatusIcon(chapter.status)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right - Chapter Details */}
                <div className="lg:col-span-2">
                    {selectedChapter ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                            {/* Chapter Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                        Bab {selectedChapter.order}: {selectedChapter.name}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className={`px-2 py-0.5 rounded-full ${selectedChapter.status === 'completed'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-primary/10 text-primary'
                                            }`}>
                                            {selectedChapter.status === 'completed' ? '✅ Selesai' : '🔄 Sedang Dipelajari'}
                                        </span>
                                        {selectedChapter.grade && (
                                            <span className={`font-bold ${getGradeColor(selectedChapter.grade)}`}>
                                                Nilai: {selectedChapter.grade}
                                            </span>
                                        )}
                                        <span className="text-slate-500">
                                            +{selectedChapter.xpEarned} XP
                                        </span>
                                    </div>
                                </div>
                                {selectedChapter.status === 'in_progress' && (
                                    <Link
                                        to={`/siswa/belajar/${selectedChapter.id}`}
                                        className="bg-gradient-to-r from-primary to-indigo-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
                                    >
                                        <span className="material-symbols-outlined">play_arrow</span>
                                        Lanjutkan
                                    </Link>
                                )}
                            </div>

                            {/* Lessons List */}
                            {selectedChapter.lessons ? (
                                <div className="space-y-2">
                                    <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Konten Pembelajaran:</h3>
                                    {selectedChapter.lessons.map((lesson) => (
                                        <div key={lesson.id} className="space-y-2">
                                        {lesson.quizType === 'PLACEMENT' && (
                                            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg w-max mb-1">
                                                <span className="material-symbols-outlined text-sm">star</span>
                                                Tes Penempatan - Lulus untuk lewati bab
                                            </div>
                                        )}
                                        <div
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${lesson.status === 'locked'
                                                ? 'bg-slate-50 dark:bg-slate-700/30 opacity-50'
                                                : lesson.status === 'failed'
                                                    ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
                                                    : lesson.status === 'in_progress'
                                                        ? 'bg-primary/10 border-2 border-primary'
                                                        : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {/* Connector Line */}
                                            <div className="relative flex flex-col items-center">
                                                <div className={`size-8 rounded-full flex items-center justify-center ${lesson.status === 'completed' ? 'bg-emerald-500 text-white' :
                                                    lesson.status === 'failed' ? 'bg-red-500 text-white' :
                                                    lesson.status === 'in_progress' ? 'bg-primary text-white' :
                                                        'bg-slate-200 dark:bg-slate-600 text-slate-400'
                                                    }`}>
                                                    {lesson.status === 'completed' ? (
                                                        <span className="material-symbols-outlined text-sm">check</span>
                                                    ) : lesson.status === 'failed' ? (
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    ) : lesson.type === 'quiz' ? (
                                                        <span className="material-symbols-outlined text-sm">{lesson.quizType === 'PLACEMENT' ? 'star' : 'quiz'}</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-sm">menu_book</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Lesson Info */}
                                            <div className="flex-1">
                                                <p className={`font-medium ${lesson.status === 'locked' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {lesson.name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {lesson.type === 'quiz' ? '📝 Kuis' : '📖 Materi'}
                                                    {lesson.score !== undefined && ` • Skor: ${lesson.score}%`}
                                                </p>
                                        </div>

                                            {/* Action */}
                                            {lesson.status === 'in_progress' && (
                                                <Link
                                                    to={lesson.type === 'quiz'
                                                        ? `/siswa/quiz/${lesson.id}`
                                                        : `/siswa/belajar/${selectedChapter.id}/lesson/${lesson.id}`
                                                    }
                                                    className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                                                >
                                                    Mulai
                                                </Link>
                                            )}
                                            {lesson.status === 'failed' && (
                                                <span className="text-red-500 text-sm font-bold">❌ Gagal</span>
                                            )}
                                            {lesson.status === 'completed' && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-500 text-sm">✓</span>
                                                    {lesson.type === 'quiz' ? (
                                                        <Link
                                                            to={`/siswa/quiz/${lesson.id}/result`}
                                                            className="text-primary hover:underline text-sm font-medium"
                                                        >
                                                            Lihat Hasil
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            to={`/siswa/belajar/${selectedChapter.id}/lesson/${lesson.id}`}
                                                            className="text-primary hover:underline text-sm font-medium"
                                                        >
                                                            Baca Ulang
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                            {lesson.status === 'locked' && (
                                                <span className="material-symbols-outlined text-slate-300">lock</span>
                                            )}
                                        </div>

                                        {/* Remedial Link - shown below failed quiz */}
                                        {lesson.status === 'failed' && lesson.remedialQuizId && (
                                            <Link
                                                to={`/siswa/quiz/${lesson.remedialQuizId}`}
                                                className="ml-11 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-400 transition-all hover:scale-[1.01]"
                                            >
                                                <div className="size-8 rounded-full bg-amber-500 text-white flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm">assignment_late</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-amber-900 dark:text-amber-200 text-sm">📋 Kuis Remedial</p>
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">Soal lebih mudah, sesuai kelemahanmu</p>
                                                </div>
                                                <span className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold">Kerjakan</span>
                                            </Link>
                                        )}
                                        {lesson.status === 'failed' && !lesson.remedialQuizId && (
                                            <div className="ml-11 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                                                <p className="text-sm text-red-600 dark:text-red-400">Skor: {lesson.score}% — Kerjakan kuis lagi untuk generate remedial otomatis.</p>
                                            </div>
                                        )}
                                        {lesson.status === 'completed' && lesson.isRemedialPassed && (
                                            <div className="ml-11 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700">
                                                <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-emerald-900 dark:text-emerald-200 text-sm">Remedial Lulus</p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Kamu telah memperbaiki nilai kuis ini.</p>
                                                </div>
                                                <Link
                                                    to={`/siswa/quiz/${lesson.remedialQuizId}/result`}
                                                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                                                >
                                                    Lihat Hasil
                                                </Link>
                                            </div>
                                        )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2">celebration</span>
                                    <p>Bab ini telah selesai! 🎉</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">touch_app</span>
                            <p className="text-slate-600 dark:text-slate-400">Pilih bab untuk melihat detail</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
