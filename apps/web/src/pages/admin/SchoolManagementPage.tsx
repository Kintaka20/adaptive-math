import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../lib/api'

interface School {
    id: string
    name: string
    city: string | null
    province: string | null
    isActive: boolean
    _count?: {
        teachers: number
        students: number
    }
}

interface SchoolForm {
    name: string
    address: string
    city: string
    province: string
    status: 'active' | 'inactive'
}

export default function SchoolManagementPage() {
    const [schools, setSchools] = useState<School[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [formData, setFormData] = useState<SchoolForm>({
        name: '',
        address: '',
        city: '',
        province: '',
        status: 'active',
    })
    const [isSaving, setIsSaving] = useState(false)

    const fetchSchools = async () => {
        setIsLoading(true)
        try {
            const res = await adminApi.schools()
            setSchools((res as any) || [])
        } catch (error) {
            console.error("Failed to fetch schools", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSchools()
    }, [])

    const filteredSchools = schools.filter(school =>
        school.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.city?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleOpenModal = () => {
        setFormData({
            name: '',
            address: '',
            city: '',
            province: '',
            status: 'active',
        })
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!formData.name || !formData.city) return
        setIsSaving(true)

        const payload = {
            name: formData.name,
            city: formData.city,
            province: formData.province,
            address: formData.address,
            isActive: formData.status === 'active'
        }

        try {
            await adminApi.createSchool(payload)
            await fetchSchools()
            setShowModal(false)
        } catch (error) {
            console.error("Failed to save school", error)
            alert("Gagal menyimpan data sekolah")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = (school: School) => {
        setSchoolToDelete(school)
        setDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!schoolToDelete) return
        setIsDeleting(true)
        try {
            await adminApi.deleteSchool(schoolToDelete.id)
            await fetchSchools()
            setDeleteModalOpen(false)
            setSchoolToDelete(null)
        } catch (error) {
            console.error("Failed to delete school", error)
            alert("Gagal menghapus sekolah")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link to="/admin" className="hover:text-primary">Dashboard</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white">Manajemen Sekolah</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">school</span>
                        Manajemen Sekolah
                    </h1>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Tambah Sekolah
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500">domain</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{schools.length}</p>
                            <p className="text-xs text-slate-500">Total Sekolah</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {schools.filter(s => s.isActive).length}
                            </p>
                            <p className="text-xs text-slate-500">Sekolah Aktif</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-500">groups</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {schools.reduce((a, b) => a + (b._count?.teachers || 0), 0)}
                            </p>
                            <p className="text-xs text-slate-500">Total Guru</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-500">school</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {schools.reduce((a, b) => a + (b._count?.students || 0), 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500">Total Siswa</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Cari sekolah..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50">
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Nama Sekolah</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Kota</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Guru</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Siswa</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredSchools.map((school) => (
                                <tr key={school.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                                                {school.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{school.name}</p>
                                                <p className="text-xs text-slate-500">{school.province}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{school.city}</td>
                                    <td className="px-6 py-4 font-medium">{school._count?.teachers || 0}</td>
                                    <td className="px-6 py-4 font-medium">{school._count?.students || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${school.isActive
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                            }`}>
                                            {school.isActive ? '✓ Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/admin/sekolah/${school.id}`}
                                                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                                <span className="ml-1 text-sm font-medium">Detail</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(school)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                title="Hapus"
                                            >
                                                <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredSchools.length === 0 && (
                    <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
                        <p className="text-slate-500">{isLoading ? 'Memuat data sekolah...' : 'Tidak ada sekolah yang ditemukan'}</p>
                    </div>
                )}
            </div>

            {/* Modal Add/Edit School */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Tambah Sekolah Baru
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Sekolah *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: SMAN 1 Jakarta"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Alamat
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Alamat lengkap sekolah"
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Kota/Kabupaten *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Jakarta Pusat"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Provinsi
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.province}
                                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                        placeholder="DKI Jakarta"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Status
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="active"
                                            checked={formData.status === 'active'}
                                            onChange={() => setFormData({ ...formData, status: 'active' })}
                                            className="text-primary"
                                        />
                                        <span className="text-sm">Aktif</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="inactive"
                                            checked={formData.status === 'inactive'}
                                            onChange={() => setFormData({ ...formData, status: 'inactive' })}
                                            className="text-primary"
                                        />
                                        <span className="text-sm">Nonaktif</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !formData.name || !formData.city}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        Tambah Sekolah
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && schoolToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => !isDeleting && setDeleteModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 p-6 transform transition-all scale-100 opacity-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Hapus Sekolah?
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Anda akan menghapus data sekolah <span className="font-bold text-slate-700 dark:text-slate-300">"{schoolToDelete.name}"</span> secara permanen. Tindakan ini tidak dapat dibatalkan dan akan memengaruhi data terkait guru dan siswa.
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
                                    onClick={confirmDelete}
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
