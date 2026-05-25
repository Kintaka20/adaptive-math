import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../lib/api'

interface GradeStat {
    id: string
    name: string
    icon: string
    color: string
    chapters: number
    materials: number
    questions: number // or quizzes
}

export default function MasterDataPage() {
    const [stats, setStats] = useState({
        totalGrades: 3,
        totalChapters: 0,
        totalMaterials: 0,
        totalQuestions: 0,
    })
    
    const [gradeData, setGradeData] = useState<GradeStat[]>([
        { id: 'X', name: 'Kelas X', icon: '📘', color: 'from-blue-500 to-blue-600', chapters: 0, materials: 0, questions: 0 },
        { id: 'XI', name: 'Kelas XI', icon: '📗', color: 'from-emerald-500 to-emerald-600', chapters: 0, materials: 0, questions: 0 },
        { id: 'XII', name: 'Kelas XII', icon: '📕', color: 'from-rose-500 to-rose-600', chapters: 0, materials: 0, questions: 0 },
    ])

    useEffect(() => {
        const loadData = async () => {
            try {
                const [dashboardRes, chaptersRes] = await Promise.all([
                    adminApi.dashboard(),
                    adminApi.chapters()
                ])
                
                const dbStats = (dashboardRes as any)?.stats
                if (dbStats) {
                    setStats({
                        totalGrades: 3,
                        totalChapters: dbStats.totalChapters || 0,
                        totalMaterials: dbStats.totalMaterials || 0,
                        totalQuestions: dbStats.totalQuestions || 0,
                    })
                }

                const chapters = Array.isArray(chaptersRes) ? chaptersRes : []
                
                const updatedGradeData = [...gradeData].map(g => {
                    const gradeChapters = chapters.filter((c: any) => c.grade === g.id)
                    const materialsCount = gradeChapters.reduce((acc: number, c: any) => acc + (c._count?.materials || 0), 0)
                    const quizzesCount = gradeChapters.reduce((acc: number, c: any) => acc + (c._count?.quizzes || 0), 0)
                    
                    return {
                        ...g,
                        chapters: gradeChapters.length,
                        materials: materialsCount,
                        questions: quizzesCount // Using quizzes count as questions placeholder per grade
                    }
                })
                
                setGradeData(updatedGradeData)
            } catch (error) {
                console.error("Failed to load master data stats", error)
            }
        }
        
        loadData()
    }, [])

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">database</span>
                    Master Data
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Kelola kurikulum, bab, dan konten pembelajaran
                </p>
            </div>

            {/* Stats Overview - Clickable */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    to="/admin/master-data/curriculum"
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 hover:shadow-lg transition-all group cursor-pointer"
                >
                    <div className="size-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-white text-sm">school</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalGrades}</p>
                    <p className="text-sm text-slate-500">Tingkat Kelas</p>
                    <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
                        Lihat Detail <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                </Link>

                <Link
                    to="/admin/master-data/curriculum"
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-emerald-500 hover:shadow-lg transition-all group cursor-pointer"
                >
                    <div className="size-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-white text-sm">menu_book</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalChapters}</p>
                    <p className="text-sm text-slate-500">Bab Total</p>
                    <span className="text-xs text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
                        Kelola Bab <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                </Link>

                <Link
                    to="/admin/master-data/materials"
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-purple-500 hover:shadow-lg transition-all group cursor-pointer"
                >
                    <div className="size-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-white text-sm">article</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalMaterials}</p>
                    <p className="text-sm text-slate-500">Materi Total</p>
                    <span className="text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
                        Kelola Materi <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                </Link>

                <Link
                    to="/admin/master-data/questions"
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-amber-500 hover:shadow-lg transition-all group cursor-pointer"
                >
                    <div className="size-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-white text-sm">quiz</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalQuestions.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">Soal Total</p>
                    <span className="text-xs text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
                        Kelola Soal <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                </Link>
            </div>

            {/* Curriculum Per Grade */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">school</span>
                        Kurikulum Per Tingkat
                    </h2>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {gradeData.map((grade) => (
                        <div
                            key={grade.id}
                            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`size-14 rounded-xl bg-gradient-to-r ${grade.color} flex items-center justify-center text-2xl`}>
                                        {grade.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                            {grade.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {grade.chapters} Bab • {grade.materials} Materi • {grade.questions} Kuis
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    to={`/admin/master-data/curriculum?grade=${grade.id}`}
                                    className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                                >
                                    Lihat Detail
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Manage Curriculum Button */}
            <div className="flex justify-center">
                <Link
                    to="/admin/master-data/curriculum"
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">menu_book</span>
                    Kelola Kurikulum
                </Link>
            </div>
        </div>
    )
}
