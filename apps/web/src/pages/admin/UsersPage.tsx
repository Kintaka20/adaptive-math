import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'
import { User } from '../../lib/types'

type UserRole = 'all' | 'STUDENT' | 'TEACHER' | 'ADMIN'
type UserStatus = 'all' | 'active' | 'pending' | 'suspended'

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<UserRole>('all')
    const [statusFilter, setStatusFilter] = useState<UserStatus>('all')
    const [selectedUser, setSelectedUser] = useState<User & { isActive?: boolean; joinedAt?: string } | null>(null)
    const [users, setUsers] = useState<(User & { isActive: boolean; createdAt: string })[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await adminApi.users()
            setUsers((res as any) || [])
        } catch (error) {
            console.error("Failed to load users", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const filteredUsers = users
        .filter(u => roleFilter === 'all' || u.role === roleFilter)
        .filter(u => {
            if (statusFilter === 'all') return true
            if (statusFilter === 'active') return u.isActive
            if (statusFilter === 'pending') return !u.isActive && !u.isSuspended
            if (statusFilter === 'suspended') return !u.isActive && u.isSuspended
            return true
        })
        .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleApprove = async (userId: string) => {
        try {
            await adminApi.updateUser(userId, { isActive: true, isSuspended: false })
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true, isSuspended: false } : u))
            if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, isActive: true, isSuspended: false } : null)
            showToast('Pengguna berhasil disetujui/diaktifkan.', 'success')
        } catch (error) {
            console.error(error)
            showToast('Gagal menyetujui/mengaktifkan pengguna.', 'error')
        }
    }

    const handleSuspend = async (userId: string) => {
        try {
            await adminApi.updateUser(userId, { isActive: false, isSuspended: true })
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false, isSuspended: true } : u))
            if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, isActive: false, isSuspended: true } : null)
            showToast('Pengguna berhasil dinonaktifkan.', 'success')
        } catch (error) {
            console.error(error)
            showToast('Gagal menonaktifkan pengguna.', 'error')
        }
    }

    const confirmDelete = (user: User) => {
        setUserToDelete(user)
        setDeleteModalOpen(true)
    }

    const executeDelete = async () => {
        if (!userToDelete) return
        setIsDeleting(true)
        try {
            await adminApi.deleteUser(userToDelete.id)
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
            if (selectedUser?.id === userToDelete.id) setSelectedUser(null)
            showToast('Pengguna berhasil dihapus.', 'success')
            setDeleteModalOpen(false)
            setUserToDelete(null)
        } catch (error) {
            console.error("Failed to delete user", error)
            showToast('Gagal menghapus pengguna.', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    const getStatusBadge = (isActive: boolean, isSuspended?: boolean) => {
        if (isActive) return <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">🟢 Aktif</span>
        if (isSuspended) return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-medium rounded-full">🔴 Nonaktif</span>
        return <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">⏳ Menunggu Verifikasi</span>
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'STUDENT': return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-full">Siswa</span>
            case 'TEACHER': return <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">Guru</span>
            case 'ADMIN': return <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 text-xs font-medium rounded-full">Admin</span>
            default: return null
        }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">group</span>
                        Manajemen Pengguna
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Kelola siswa, guru, dan admin</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <button onClick={() => { setRoleFilter('all'); setStatusFilter('all') }} className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 text-left transition-all ${roleFilter === 'all' && statusFilter === 'all' ? 'border-primary' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</p>
                    <p className="text-sm text-slate-500">Total Pengguna</p>
                </button>
                <button onClick={() => { setRoleFilter('STUDENT'); setStatusFilter('all') }} className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 text-left transition-all ${roleFilter === 'STUDENT' ? 'border-blue-500' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className="text-2xl font-black text-blue-500">{users.filter(u => u.role === 'STUDENT').length}</p>
                    <p className="text-sm text-slate-500">Siswa</p>
                </button>
                <button onClick={() => { setRoleFilter('TEACHER'); setStatusFilter('all') }} className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 text-left transition-all ${roleFilter === 'TEACHER' && statusFilter === 'all' ? 'border-amber-500' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className="text-2xl font-black text-amber-500">{users.filter(u => u.role === 'TEACHER').length}</p>
                    <p className="text-sm text-slate-500">Guru</p>
                </button>
                <button onClick={() => { setRoleFilter('all'); setStatusFilter('pending') }} className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 text-left transition-all ${statusFilter === 'pending' ? 'border-amber-500' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className="text-2xl font-black text-amber-500">{users.filter(u => !u.isActive && !u.isSuspended).length}</p>
                    <p className="text-sm text-slate-500">Menunggu Verifikasi</p>
                </button>
                <button onClick={() => { setRoleFilter('all'); setStatusFilter('suspended') }} className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 text-left transition-all ${statusFilter === 'suspended' ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className="text-2xl font-black text-red-500">{users.filter(u => !u.isActive && u.isSuspended).length}</p>
                    <p className="text-sm text-slate-500">Nonaktif</p>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as UserRole)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                >
                    <option value="all">Semua Role</option>
                    <option value="STUDENT">Siswa</option>
                    <option value="TEACHER">Guru</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as UserStatus)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="pending">Menunggu Verifikasi</option>
                    <option value="suspended">Nonaktif</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50">
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Nama</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Email</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Role</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Bergabung</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Memuat data pengguna...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Tidak ada data pengguna</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-gradient-to-r from-primary to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{user.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(user.isActive, user.isSuspended)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setSelectedUser(user as any)} className="text-primary hover:text-primary-dark font-medium text-sm">Detail</button>
                                            {!user.isActive && !user.isSuspended && (
                                                <>
                                                    <span className="text-slate-300">|</span>
                                                    <button onClick={() => handleApprove(user.id)} className="text-emerald-500 hover:text-emerald-600 font-medium text-sm">Approve</button>
                                                </>
                                            )}
                                            {!user.isActive && user.isSuspended && (
                                                <>
                                                    <span className="text-slate-300">|</span>
                                                    <button onClick={() => handleApprove(user.id)} className="text-emerald-500 hover:text-emerald-600 font-medium text-sm">Pulihkan</button>
                                                </>
                                            )}
                                            <span className="text-slate-300">|</span>
                                            <button onClick={() => confirmDelete(user)} className="text-red-500 hover:text-red-600 font-medium text-sm">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Detail Pengguna</h3>
                            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="size-20 bg-gradient-to-r from-primary to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                                {selectedUser.name.charAt(0).toUpperCase()}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h4>
                            <p className="text-slate-500">{selectedUser.email}</p>
                            <div className="flex gap-2 mt-2">
                                {getRoleBadge(selectedUser.role)}
                                {getStatusBadge(selectedUser.isActive || false, selectedUser.isSuspended)}
                            </div>
                            {selectedUser.role === 'TEACHER' && selectedUser.teacher?.nip && (
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                                    NIP: {selectedUser.teacher.nip}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-slate-500">Bergabung</span>
                                <span className="font-medium">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('id-ID') : selectedUser.joinedAt}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {!selectedUser.isActive && !selectedUser.isSuspended ? (
                                <button onClick={() => handleApprove(selectedUser.id)} className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition hover:bg-emerald-600">Approve</button>
                            ) : !selectedUser.isActive && selectedUser.isSuspended ? (
                                <button onClick={() => handleApprove(selectedUser.id)} className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition hover:bg-emerald-600">Pulihkan</button>
                            ) : (
                                <button onClick={() => handleSuspend(selectedUser.id)} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl transition hover:bg-red-600">Nonaktifkan</button>
                            )}
                            <button onClick={() => confirmDelete(selectedUser as User)} className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold py-2.5 rounded-xl transition hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/30">Hapus</button>
                            <button onClick={() => setSelectedUser(null)} className="flex-1 border border-slate-200 dark:border-slate-700 font-medium py-2.5 rounded-xl transition hover:bg-slate-50">Tutup</button>
                        </div>
                    </div>
                </div>
            )}

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
                                Hapus Pengguna?
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Anda akan menghapus pengguna <span className="font-bold text-slate-700 dark:text-slate-300">"{userToDelete.name}"</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
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
                                    onClick={executeDelete}
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
