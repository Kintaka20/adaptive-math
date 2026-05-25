import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '../../lib/api'

interface SchoolDetail {
    id: string
    name: string
    address: string | null
    city: string | null
    province: string | null
    isActive: boolean
    students: { id: string, grade: string, user: any }[]
    teachers: { id: string, nip: string, user: any }[]
}

export default function SchoolDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [school, setSchool] = useState<SchoolDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        province: '',
        status: 'active'
    })
    
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [gradeFilter, setGradeFilter] = useState('all')
    
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'suspend' | 'delete';
        userId: string;
        title: string;
        message: string;
    } | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)

    const fetchSchoolDetail = async () => {
        setIsLoading(true)
        try {
            const res = await adminApi.getSchool(id as string)
            const data = res as SchoolDetail
            setSchool(data)
            setFormData({
                name: data.name,
                address: data.address || '',
                city: data.city || '',
                province: data.province || '',
                status: data.isActive ? 'active' : 'inactive'
            })
        } catch (error) {
            console.error("Failed to fetch school details", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchSchoolDetail()
    }, [id])

    const handleSaveEdit = async () => {
        if (!formData.name) return
        setIsSaving(true)
        try {
            await adminApi.updateSchool(id as string, {
                name: formData.name,
                city: formData.city,
                province: formData.province,
                address: formData.address,
                isActive: formData.status === 'active'
            })
            await fetchSchoolDetail()
            setShowEditModal(false)
        } catch (error) {
            console.error("Failed to update school", error)
            alert("Gagal memperbarui sekolah")
        } finally {
            setIsSaving(false)
        }
    }

    const handleApproveUser = async (userId: string) => {
        try {
            await adminApi.updateUser(userId, { isActive: true, isSuspended: false })
            await fetchSchoolDetail()
        } catch (error) {
            console.error(error)
            alert('Gagal menyetujui pengguna')
        }
    }

    const confirmSuspendUser = (userId: string) => {
        setConfirmModal({
            isOpen: true,
            type: 'suspend',
            userId,
            title: 'Nonaktifkan Pengguna',
            message: 'Apakah Anda yakin ingin menonaktifkan pengguna ini? Pengguna tidak akan bisa login sampai akunnya dipulihkan.'
        })
    }

    const confirmDeleteUser = (userId: string) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            userId,
            title: 'Hapus Pengguna',
            message: 'Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus pengguna ini secara permanen?'
        })
    }

    const executeConfirmAction = async () => {
        if (!confirmModal) return
        setIsActionLoading(true)
        try {
            if (confirmModal.type === 'suspend') {
                await adminApi.updateUser(confirmModal.userId, { isActive: false, isSuspended: true })
            } else {
                await adminApi.deleteUser(confirmModal.userId)
            }
            await fetchSchoolDetail()
            setConfirmModal(null)
        } catch (error) {
            console.error(error)
            alert(`Gagal ${confirmModal.type === 'suspend' ? 'menonaktifkan' : 'menghapus'} pengguna`)
        } finally {
            setIsActionLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!school) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Sekolah tidak ditemukan</h2>
                <button onClick={() => navigate('/admin/schools')} className="mt-4 text-primary hover:underline">Kembali ke Daftar Sekolah</button>
            </div>
        )
    }

    const usersList = [
        ...school.teachers.map(t => ({ ...t.user, schoolRole: 'Guru', specificId: t.nip })),
        ...school.students.map(s => ({ ...s.user, schoolRole: 'Siswa', specificId: s.grade }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const filteredUsers = usersList.filter((user: any) => {
        const matchSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchRole = roleFilter === 'all' || user.schoolRole.toLowerCase() === roleFilter.toLowerCase()
        const matchGrade = gradeFilter === 'all' || (user.schoolRole === 'Siswa' && user.specificId === gradeFilter)
        return matchSearch && matchRole && matchGrade
    })

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <button onClick={() => navigate('/admin/schools')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2 text-sm">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Kembali
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">domain</span>
                        {school.name}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {school.city ? `${school.city}${school.province ? `, ${school.province}` : ''}` : 'Lokasi tidak diatur'}
                    </p>
                </div>
                <button 
                    onClick={() => setShowEditModal(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit Sekolah
                </button>
            </div>

            {/* School Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Status</p>
                    {school.isActive ? (
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-medium rounded-full inline-block">🟢 Aktif</span>
                    ) : (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 font-medium rounded-full inline-block">🔴 Nonaktif</span>
                    )}
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Guru</p>
                    <p className="text-2xl font-black text-amber-500">{school.teachers.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 mb-1">Total Siswa</p>
                    <p className="text-2xl font-black text-blue-500">{school.students.length}</p>
                </div>
            </div>

            {/* User Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Cari nama atau email pengguna..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-primary transition-colors text-sm text-slate-900 dark:text-white"
                    />
                </div>
                <select 
                    value={roleFilter} 
                    onChange={(e) => { setRoleFilter(e.target.value); if (e.target.value === 'guru') setGradeFilter('all') }} 
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-primary transition-colors text-sm text-slate-900 dark:text-white"
                >
                    <option value="all">Semua Role</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                </select>
                <select 
                    value={gradeFilter} 
                    onChange={(e) => setGradeFilter(e.target.value)} 
                    disabled={roleFilter === 'guru'}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-primary transition-colors text-sm text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="all">Semua Kelas</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                </select>
            </div>

            {/* Users List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Pengguna ({filteredUsers.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50">
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Nama</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Role</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Info Tambahan</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Tidak ada pengguna yang cocok dengan filter</td>
                                </tr>
                            ) : filteredUsers.map((user: any) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 bg-gradient-to-r from-primary to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.schoolRole === 'Guru' ? (
                                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">Guru</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">Siswa</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {user.schoolRole === 'Guru' ? `NIP: ${user.specificId || '-'}` : `Kelas: ${user.specificId || '-'}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isActive ? (
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">🟢 Aktif</span>
                                        ) : user.isSuspended ? (
                                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-medium rounded-full">🔴 Nonaktif</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">⏳ Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {!user.isActive && !user.isSuspended && (
                                                <>
                                                    <button onClick={() => handleApproveUser(user.id)} className="text-emerald-500 hover:text-emerald-600 font-medium text-sm">Approve</button>
                                                    <span className="text-slate-300">|</span>
                                                </>
                                            )}
                                            {!user.isActive && user.isSuspended && (
                                                <>
                                                    <button onClick={() => handleApproveUser(user.id)} className="text-emerald-500 hover:text-emerald-600 font-medium text-sm">Pulihkan</button>
                                                    <span className="text-slate-300">|</span>
                                                </>
                                            )}
                                            {user.isActive && (
                                                <>
                                                    <button onClick={() => confirmSuspendUser(user.id)} className="text-amber-500 hover:text-amber-600 font-medium text-sm">Suspend</button>
                                                    <span className="text-slate-300">|</span>
                                                </>
                                            )}
                                            <button onClick={() => confirmDeleteUser(user.id)} className="text-red-500 hover:text-red-600 font-medium text-sm">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isSaving && setShowEditModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">domain</span>
                                Edit Sekolah
                            </h3>
                            <button onClick={() => !isSaving && setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Sekolah *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                                    placeholder="Contoh: SMAN 1 Jakarta"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                                    placeholder="Jalan, RT/RW, Kelurahan..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kota / Kabupaten</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                                        placeholder="Contoh: Jakarta Selatan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Provinsi</label>
                                    <input
                                        type="text"
                                        value={formData.province}
                                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                                        placeholder="Contoh: DKI Jakarta"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                                >
                                    <option value="active">🟢 Aktif</option>
                                    <option value="inactive">🔴 Nonaktif</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                disabled={isSaving}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSaving || !formData.name}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal?.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isActionLoading && setConfirmModal(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 p-6 transform transition-all scale-100 opacity-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className={`size-16 rounded-full flex items-center justify-center mb-4 ${confirmModal.type === 'delete' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                <span className={`material-symbols-outlined text-3xl ${confirmModal.type === 'delete' ? 'text-red-500' : 'text-amber-500'}`}>
                                    {confirmModal.type === 'delete' ? 'warning' : 'block'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {confirmModal.title}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6">
                                {confirmModal.message}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    disabled={isActionLoading}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={executeConfirmAction}
                                    disabled={isActionLoading}
                                    className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${confirmModal.type === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25'}`}
                                >
                                    {isActionLoading ? (
                                        <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span>Ya, Lanjutkan</span>
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
