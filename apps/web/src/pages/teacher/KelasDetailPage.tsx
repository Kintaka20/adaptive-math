import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { classApi } from '../../lib/api'

type Tab = 'curriculum' | 'students'
type ContentType = 'material' | 'quiz'

interface NewContent {
    type: ContentType
    title: string
    description: string
    duration: string
    videoUrl: string
    documentUrl: string
}

export default function KelasDetailPage() {
    const { id } = useParams()
    const [activeTab, setActiveTab] = useState<Tab>('curriculum')
    const [selectedChapter, setSelectedChapter] = useState<any | null>(null)
    const [isCopied, setIsCopied] = useState(false)
    const [classData, setClassData] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [chapters, setChapters] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [showAddContentModal, setShowAddContentModal] = useState(false)
    const [newContent, setNewContent] = useState<NewContent>({
        type: 'material', title: '', description: '', duration: '', videoUrl: '', documentUrl: '',
    })
    const [showExportModal, setShowExportModal] = useState(false)
    const [exportOptions, setExportOptions] = useState({
        includeRanking: true, includeProgress: true, includeScores: true, includeChapterDetails: true, format: 'xlsx' as 'xlsx' | 'pdf' | 'csv',
    })
    const [isExporting, setIsExporting] = useState(false)

    const [showCustomChapterModal, setShowCustomChapterModal] = useState(false)
    const [customChapterForm, setCustomChapterForm] = useState({ name: '', description: '' })
    const [isCreatingChapter, setIsCreatingChapter] = useState(false)

    const [chapterToDelete, setChapterToDelete] = useState<any>(null)
    const [isDeletingChapter, setIsDeletingChapter] = useState(false)

    const loadData = () => {
        if (!id) return
        setIsLoading(true)
        Promise.all([
            classApi.get(id),
            classApi.students(id)
        ])
            .then(([classRes, studentsRes]) => {
                setClassData(classRes)
                
                const formattedChapters = (classRes.chapters || []).map((cc: any) => {
                    const chapter = cc.chapter
                    const materials = (chapter.materials || []).map((m: any) => ({ ...m, type: 'material', duration: m.duration || '15 menit' }))
                    const quizzes = (chapter.quizzes || []).map((q: any) => ({ ...q, type: 'quiz', questions: 10 }))
                    const contents = [...materials, ...quizzes].sort((a, b) => a.order - b.order)
                    return {
                        id: chapter.id,
                        order: cc.order,
                        name: chapter.name,
                        contents
                    }
                })
                setChapters(formattedChapters)
                if (formattedChapters.length > 0) {
                    setSelectedChapter(formattedChapters[0])
                }

                const formattedStudents = (Array.isArray(studentsRes) ? studentsRes : (studentsRes as any).data || []).map((enrollment: any) => {
                    const student = enrollment.student
                    return {
                        id: student.id,
                        name: student.user.name,
                        progress: student.totalXP > 0 ? Math.min(100, Math.round(student.totalXP / 100)) : 0, // Mock calculation for now
                        avgScore: 0,
                        xp: student.totalXP || 0,
                        streak: student.streakDays || 0,
                        lastActive: student.lastActiveAt ? new Date(student.lastActiveAt).toLocaleDateString('id-ID') : 'Baru saja',
                    }
                }).sort((a: any, b: any) => b.xp - a.xp).map((s: any, i: number) => ({ ...s, rank: i + 1 }))
                
                setStudents(formattedStudents)
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }

    useEffect(() => {
        loadData()
    }, [id])

    const handleAddCustomChapter = async () => {
        if (!id || !customChapterForm.name) return
        setIsCreatingChapter(true)
        try {
            await classApi.createCustomChapter(id, customChapterForm)
            setCustomChapterForm({ name: '', description: '' })
            setShowCustomChapterModal(false)
            loadData() // Refresh data
        } catch (err) {
            console.error(err)
            alert('Gagal membuat bab.')
        } finally {
            setIsCreatingChapter(false)
        }
    }

    const handleDeleteChapter = async () => {
        if (!id || !chapterToDelete) return
        setIsDeletingChapter(true)
        try {
            await classApi.deleteChapter(id, chapterToDelete.id)
            setChapterToDelete(null)
            if (selectedChapter?.id === chapterToDelete.id) {
                setSelectedChapter(null)
            }
            loadData() // Refresh data
        } catch (err) {
            console.error(err)
            alert('Gagal menghapus bab.')
        } finally {
            setIsDeletingChapter(false)
        }
    }

    const handleAddContent = () => {
        setShowAddContentModal(false)
        setNewContent({ type: 'material', title: '', description: '', duration: '', videoUrl: '', documentUrl: '' })
    }

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const headers = ['Peringkat', 'Nama Siswa', 'Progress (%)', 'Skor Rata-rata', 'XP', 'Streak (Hari)', 'Terakhir Aktif']
            const rows = students.map((s: any) => [
                s.rank,
                s.name,
                s.progress,
                s.avgScore,
                s.xp,
                s.streak,
                s.lastActive
            ])
            
            const XLSX = await import('xlsx')
            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Kelas')
            
            XLSX.writeFile(workbook, `Laporan_Kelas_${classData?.name || 'Siswa'}.xlsx`)
            
            setShowExportModal(false)
        } catch (err) {
            console.error('Failed to export', err)
            alert('Gagal mengekspor laporan')
        } finally {
            setIsExporting(false)
        }
    }

    const totalMaterials = chapters.reduce((a, b) => a + b.contents.filter((c: any) => c.type === 'material').length, 0)
    const totalQuizzes = chapters.reduce((a, b) => a + b.contents.filter((c: any) => c.type === 'quiz').length, 0)
    const avgProgress = students.length > 0 ? Math.round(students.reduce((a, b) => a + b.progress, 0) / students.length) : 0

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <Link to="/guru/kelas" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Kembali ke Daftar Kelas
                    </Link>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">school</span>
                        {isLoading ? 'Memuat...' : classData?.name}
                        {classData?.isFinished && (
                            <span className="ml-2 px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">SELESAI</span>
                        )}
                    </h1>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">Kode: {isLoading ? '...' : classData?.joinCode}</span>
                        <span>{isLoading ? '...' : (classData?._count?.enrollments ?? 0)} siswa</span>
                        <span>Dibuat: {isLoading ? '...' : (classData?.createdAt ? new Date(classData.createdAt).toLocaleDateString('id-ID') : '-')}</span>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (!classData?.joinCode) return
                        navigator.clipboard.writeText(classData.joinCode)
                        setIsCopied(true)
                        setTimeout(() => setIsCopied(false), 2000)
                    }}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors ${isCopied ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-600' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <span className="material-symbols-outlined text-sm">{isCopied ? 'check' : 'content_copy'}</span>
                    {isCopied ? 'Tersalin!' : 'Salin Kode Kelas'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Rata-rata Progres</p>
                    <p className="text-2xl font-black text-primary">{avgProgress}%</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Bab</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{chapters.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Materi</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{totalMaterials}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Kuis</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{totalQuizzes}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Link
                    to={`/guru/kelas/${id}/assign-bab`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">library_add</span>
                    Assign Bab dari Template
                </Link>
                <button
                    onClick={() => setShowCustomChapterModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Buat Bab Sendiri
                </button>
                <Link
                    to={`/guru/kelas/${id}/kkm`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">tune</span>
                    Pengaturan KKM
                </Link>
                <Link
                    to={`/guru/monitoring/struggle`}
                    className="flex items-center gap-2 px-4 py-2.5 border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Siswa Kesulitan
                </Link>
                <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Export Laporan Kelas
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('curriculum')}
                    className={`px-4 py-3 font-medium border-b-2 -mb-px transition-colors ${activeTab === 'curriculum'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">menu_book</span>
                        Kurikulum & Materi
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-3 font-medium border-b-2 -mb-px transition-colors ${activeTab === 'students'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">group</span>
                        Daftar Siswa ({students.length})
                    </span>
                </button>
            </div>

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chapter List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="font-bold text-slate-900 dark:text-white">Daftar Bab</h2>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {chapters.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500 text-sm">
                                        Belum ada bab yang di-assign.
                                    </div>
                                ) : chapters.map((chapter) => (
                                    <div key={chapter.id} className={`group flex items-center p-4 transition-colors ${selectedChapter?.id === chapter.id ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                        <button
                                            onClick={() => setSelectedChapter(chapter)}
                                            className="flex-1 flex items-center gap-3 text-left"
                                        >
                                            <div className="size-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-slate-600">
                                                {chapter.order}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900 dark:text-white">{chapter.name}</p>
                                                <p className="text-sm text-slate-500">{chapter.contents.length} konten</p>
                                            </div>
                                        </button>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setSelectedChapter(chapter)}
                                                className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-800"
                                            >
                                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                            </button>
                                            <button
                                                onClick={() => setChapterToDelete(chapter)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Hapus Bab dari Kelas"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chapter Content */}
                    <div className="lg:col-span-2">
                        {selectedChapter ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <h2 className="font-bold text-slate-900 dark:text-white">
                                            Bab {selectedChapter.order}: {selectedChapter.name}
                                        </h2>
                                        <p className="text-sm text-slate-500">Atur urutan konten pembelajaran</p>
                                    </div>
                                    <Link
                                        to={`/guru/kelas/${id}/content/create?chapterId=${selectedChapter.id}`}
                                        className="bg-primary text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Tambah Konten
                                    </Link>
                                </div>

                                {selectedChapter.contents.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inbox</span>
                                        <p className="text-slate-500">Belum ada konten di bab ini</p>
                                        <Link
                                            to={`/guru/kelas/${id}/content/create?chapterId=${selectedChapter.id}`}
                                            className="mt-4 text-primary font-medium hover:underline inline-block"
                                        >
                                            + Tambah konten pertama
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-2">
                                        {selectedChapter.contents.map((content: any, index: number) => (
                                            <div
                                                key={content.id}
                                                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl group"
                                            >
                                                {/* Order number */}
                                                <div className="flex flex-col items-center gap-1">
                                                    <button className="text-slate-300 hover:text-slate-500 disabled:opacity-30" disabled={index === 0}>
                                                        <span className="material-symbols-outlined text-sm">expand_less</span>
                                                    </button>
                                                    <span className="text-sm font-bold text-slate-400">{index + 1}</span>
                                                    <button className="text-slate-300 hover:text-slate-500 disabled:opacity-30" disabled={index === selectedChapter.contents.length - 1}>
                                                        <span className="material-symbols-outlined text-sm">expand_more</span>
                                                    </button>
                                                </div>

                                                {/* Icon */}
                                                <div className={`size-10 rounded-lg flex items-center justify-center ${content.type === 'material'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'
                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'
                                                    }`}>
                                                    <span className="material-symbols-outlined">
                                                        {content.type === 'material' ? 'menu_book' : 'quiz'}
                                                    </span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900 dark:text-white">{content.title}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {content.type === 'material'
                                                            ? `📖 Materi • ${content.duration}`
                                                            : `📝 Kuis • ${content.questions} soal`
                                                        }
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        to={`/guru/kelas/${id}/content/${content.id}/review`}
                                                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-1"
                                                        title="Lihat & Edit"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="material-symbols-outlined text-sm text-blue-500">edit_document</span>
                                                    </Link>
                                                    <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                                                        <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">touch_app</span>
                                <p className="text-slate-500">Pilih bab untuk melihat dan mengatur konten</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Ranking</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Nama</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Progres</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Rata-rata Skor</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">XP</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Streak</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Terakhir Aktif</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Belum ada siswa yang bergabung ke kelas ini.</td>
                                    </tr>
                                ) : students.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4">
                                            <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${student.rank === 1 ? 'bg-amber-100 text-amber-600' :
                                                student.rank === 2 ? 'bg-slate-200 text-slate-600' :
                                                    student.rank === 3 ? 'bg-orange-100 text-orange-600' :
                                                        'bg-slate-100 text-slate-500'
                                                }`}>
                                                {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : `#${student.rank}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-gradient-to-r from-primary to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${student.progress >= 80 ? 'bg-emerald-500' :
                                                            student.progress >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${student.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-primary">{student.avgScore}</td>
                                        <td className="px-6 py-4 font-medium text-amber-500">{student.xp.toLocaleString()}</td>
                                        <td className="px-6 py-4">🔥 {student.streak} hari</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{student.lastActive}</td>
                                        <td className="px-6 py-4">
                                            <Link to={`/guru/kelas/${id}/siswa/${student.id}`} className="text-primary hover:underline text-sm font-medium">
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Content Modal */}
            {showAddContentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddContentModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Tambah Konten ke Bab "{selectedChapter?.name}"
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Content Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Tipe Konten *
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewContent(prev => ({ ...prev, type: 'material' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${newContent.type === 'material'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                            : 'border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">menu_book</span>
                                        Materi
                                    </button>
                                    <button
                                        onClick={() => setNewContent(prev => ({ ...prev, type: 'quiz' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${newContent.type === 'quiz'
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                            : 'border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">quiz</span>
                                        Kuis/Test
                                    </button>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Judul Konten *
                                </label>
                                <input
                                    type="text"
                                    value={newContent.title}
                                    onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder={newContent.type === 'material' ? 'Contoh: Pengertian Trigonometri' : 'Contoh: Pre-Test Trigonometri'}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={newContent.description}
                                    onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Deskripsi singkat tentang konten ini..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>

                            {newContent.type === 'material' && (
                                <>
                                    {/* Duration */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Estimasi Durasi
                                        </label>
                                        <input
                                            type="text"
                                            value={newContent.duration}
                                            onChange={(e) => setNewContent(prev => ({ ...prev, duration: e.target.value }))}
                                            placeholder="Contoh: 15 menit"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                        />
                                    </div>

                                    {/* Video URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            URL Video (YouTube/Vimeo)
                                        </label>
                                        <input
                                            type="url"
                                            value={newContent.videoUrl}
                                            onChange={(e) => setNewContent(prev => ({ ...prev, videoUrl: e.target.value }))}
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                        />
                                    </div>

                                    {/* Document Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Upload Dokumen (PDF)
                                        </label>
                                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                                            <span className="material-symbols-outlined text-3xl text-slate-300">upload_file</span>
                                            <p className="text-sm text-slate-500 mt-2">Klik untuk upload atau drag & drop</p>
                                            <p className="text-xs text-slate-400">PDF, max 10MB</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {newContent.type === 'quiz' && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-blue-500">info</span>
                                        <div>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Pilih Soal dari Bank Soal</p>
                                            <p className="text-sm text-blue-600 dark:text-blue-300">Setelah menyimpan, Anda akan diarahkan untuk memilih soal dari bank soal yang sudah dibuat.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowAddContentModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddContent}
                                disabled={!newContent.title}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl disabled:opacity-50"
                            >
                                Simpan Konten
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export Laporan Kelas</h3>
                            <button onClick={() => setShowExportModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-slate-500 mb-4">Pilih data yang akan diekspor:</p>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions.includeRanking}
                                        onChange={(e) => setExportOptions({ ...exportOptions, includeRanking: e.target.checked })}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">🏆 Ranking Siswa</p>
                                        <p className="text-xs text-slate-500">Peringkat siswa berdasarkan skor</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions.includeProgress}
                                        onChange={(e) => setExportOptions({ ...exportOptions, includeProgress: e.target.checked })}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">📊 Progress Belajar</p>
                                        <p className="text-xs text-slate-500">Kemajuan setiap siswa per bab</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions.includeScores}
                                        onChange={(e) => setExportOptions({ ...exportOptions, includeScores: e.target.checked })}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">📝 Nilai Kuis</p>
                                        <p className="text-xs text-slate-500">Nilai setiap kuis yang sudah dikerjakan</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions.includeChapterDetails}
                                        onChange={(e) => setExportOptions({ ...exportOptions, includeChapterDetails: e.target.checked })}
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">📚 Detail Per Bab</p>
                                        <p className="text-xs text-slate-500">Evaluasi kinerja setiap bab</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-slate-500 mb-2">Format Export:</p>
                            <div className="flex gap-2">
                                {(['xlsx', 'pdf', 'csv'] as const).map(format => (
                                    <button
                                        key={format}
                                        onClick={() => setExportOptions({ ...exportOptions, format })}
                                        className={`flex-1 py-2 rounded-xl font-medium transition-colors ${exportOptions.format === format
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        {format.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-6">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                <span className="font-medium">📋 Laporan akan berisi:</span><br />
                                • Kelas: {classData?.name} ({students.length} siswa)<br />
                                • Rata-rata progres: {avgProgress}%<br />
                                • Total {chapters.length} bab
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isExporting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Mengexport...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Export Laporan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Chapter Modal */}
            {showCustomChapterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowCustomChapterModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-xl border border-slate-200 dark:border-slate-700">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Buat Bab Sendiri</h3>
                            <button onClick={() => setShowCustomChapterModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-2">
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    Bab ini hanya akan tersedia di kelas ini dan tidak mengubah kurikulum utama sekolah.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nama Bab *
                                </label>
                                <input
                                    type="text"
                                    value={customChapterForm.name}
                                    onChange={(e) => setCustomChapterForm({ ...customChapterForm, name: e.target.value })}
                                    placeholder="Contoh: Bab 1 Pendahuluan"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Deskripsi Singkat
                                </label>
                                <textarea
                                    value={customChapterForm.description}
                                    onChange={(e) => setCustomChapterForm({ ...customChapterForm, description: e.target.value })}
                                    placeholder="Opsional"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowCustomChapterModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                disabled={isCreatingChapter}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddCustomChapter}
                                disabled={!customChapterForm.name || isCreatingChapter}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isCreatingChapter ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Buat Bab'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Chapter Modal */}
            {chapterToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => !isDeletingChapter && setChapterToDelete(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                        <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hapus Bab?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Apakah Anda yakin ingin menghapus bab <strong className="text-slate-700 dark:text-slate-300">"{chapterToDelete.name}"</strong> dari kelas ini?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setChapterToDelete(null)}
                                disabled={isDeletingChapter}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteChapter}
                                disabled={isDeletingChapter}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeletingChapter ? (
                                    <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
