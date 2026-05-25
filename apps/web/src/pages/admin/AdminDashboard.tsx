import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null)
    const [pendingTeachers, setPendingTeachers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<any>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const fetchDashboard = async () => {
        setIsLoading(true)
        try {
            const res = await adminApi.dashboard()
            setData(res)
            
            const usersRes = await adminApi.users({ role: 'TEACHER' })
            const pending = (usersRes as any[]).filter((u: any) => !u.isActive && !u.isSuspended)
            setPendingTeachers(pending)
        } catch (error) {
            console.error("Failed to load admin dashboard", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    const handleApproveTeacher = async (userId: string) => {
        try {
            await adminApi.updateUser(userId, { isActive: true, isSuspended: false })
            showToast('Guru berhasil disetujui!', 'success')
            fetchDashboard() // refresh dashboard
        } catch (error) {
            console.error(error)
            showToast('Gagal menyetujui guru', 'error')
        }
    }

    const confirmDeleteUser = (user: any) => {
        setUserToDelete(user)
        setDeleteModalOpen(true)
    }

    const executeDeleteUser = async () => {
        if (!userToDelete) return
        setIsDeleting(true)
        try {
            await adminApi.deleteUser(userToDelete.id)
            showToast('Guru berhasil ditolak dan dihapus.', 'success')
            fetchDashboard()
            setDeleteModalOpen(false)
            setUserToDelete(null)
        } catch (error) {
            console.error(error)
            showToast('Gagal menghapus guru', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    const stats = data?.stats || {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        activeToday: 0,
        pendingTeachersCount: 0,
        totalQuestions: 0,
    }

    const recentActivity = data?.recentUsers ? data.recentUsers.map((u: any) => ({
        id: u.id,
        type: 'user_registered',
        user: u.name,
        time: new Date(u.createdAt).toLocaleDateString('id-ID')
    })) : []

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Memuat dashboard...</div>
    }
    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-3xl font-black mb-2">
                        Dashboard Admin 🛡️
                    </h1>
                    <p className="text-white/80">
                        Kelola pengguna, konten, dan konfigurasi sistem
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500">school</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalStudents.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Siswa</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-500">person</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalTeachers}</p>
                            <p className="text-xs text-slate-500">Guru</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-500">class</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalClasses}</p>
                            <p className="text-xs text-slate-500">Kelas</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-500">online_prediction</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeToday}</p>
                            <p className="text-xs text-slate-500">Aktif Hari Ini</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-500">pending_actions</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingTeachers.length}</p>
                            <p className="text-xs text-slate-500">Pending Guru</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-indigo-500">quiz</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalQuestions.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Total Soal</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Teachers */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">pending</span>
                            Guru Menunggu Verifikasi
                            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingTeachers.length}</span>
                        </h2>
                        <Link to="/admin/users" className="text-primary text-sm font-medium hover:underline">
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pendingTeachers.length === 0 ? (
                            <p className="text-slate-500 text-sm">Tidak ada guru yang menunggu verifikasi.</p>
                        ) : pendingTeachers.map((teacher: any) => (
                            <div key={teacher.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 font-bold shrink-0">
                                        {teacher.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{teacher.name}</p>
                                        <p className="text-sm text-slate-500">{teacher.teacher?.school?.name || 'Tidak diketahui'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button onClick={() => handleApproveTeacher(teacher.id)} title="Approve" className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    </button>
                                    <button onClick={() => confirmDeleteUser(teacher)} title="Tolak" className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Aksi Cepat</h2>
                    <div className="space-y-2">
                        <Link
                            to="/admin/users"
                            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <span className="material-symbols-outlined">group</span>
                            <span className="font-medium">Kelola Pengguna</span>
                        </Link>
                        <Link
                            to="/admin/sekolah"
                            className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <span className="material-symbols-outlined">school</span>
                            <span className="font-medium">Kelola Sekolah</span>
                        </Link>
                        <Link
                            to="/admin/master-data"
                            className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                            <span className="material-symbols-outlined">database</span>
                            <span className="font-medium">Master Data</span>
                        </Link>
                        <Link
                            to="/admin/api-logs"
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <span className="material-symbols-outlined">article</span>
                            <span className="font-medium">API Logs</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    Aktivitas Terbaru
                </h2>
                <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                        <p className="text-slate-500 text-sm">Belum ada aktivitas terbaru.</p>
                    ) : recentActivity.map((activity: any) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                            <div className={`size-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-500`}>
                                <span className="material-symbols-outlined text-sm">
                                    person_add
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="text-slate-900 dark:text-white">
                                    Pengguna baru: <span className="font-medium">{activity.user}</span> mendaftar
                                </p>
                                <p className="text-sm text-slate-500">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Luxury Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800'}`}>
                        <div className={`size-10 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'}`}>
                            <span className="material-symbols-outlined font-bold">
                                {toast.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                        </div>
                        <div>
                            <h4 className={`text-sm font-bold ${toast.type === 'success' ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'}`}>
                                {toast.type === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan'}
                            </h4>
                            <p className={`text-xs mt-0.5 ${toast.type === 'success' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                                {toast.message}
                            </p>
                        </div>
                        <button onClick={() => setToast(null)} className={`ml-4 p-1 rounded-lg transition-colors ${toast.type === 'success' ? 'hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-600' : 'hover:bg-red-200 dark:hover:bg-red-800 text-red-600'}`}>
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => !isDeleting && setDeleteModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 p-6 transform transition-all scale-100 opacity-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-500">person_remove</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Tolak & Hapus Pengguna?
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Anda akan menolak registrasi dan menghapus akun <span className="font-bold text-slate-700 dark:text-slate-300">"{userToDelete.name}"</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={executeDeleteUser}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Menghapus...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                            Ya, Hapus
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
