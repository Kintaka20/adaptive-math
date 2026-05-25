import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { classApi } from '../../lib/api'

export default function CreateKelasPage() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        grade: 'XII',
        description: '',
        academicYear: '2025/2026',
        semester: '2',
    })

    const grades = ['X', 'XI', 'XII']
    const academicYears = ['2024/2025', '2025/2026', '2026/2027']

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.name.length < 3) {
            setErrorMsg('Nama kelas minimal 3 karakter')
            return
        }
        
        setIsSubmitting(true)
        setErrorMsg('')

        try {
            await classApi.create({
                ...formData,
                semester: parseInt(formData.semester, 10)
            })
            navigate('/guru/kelas')
        } catch (err: any) {
            setErrorMsg(err.message || 'Gagal membuat kelas')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/guru/kelas" className="hover:text-primary">Manajemen Kelas</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Buat Kelas Baru</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                    Buat Kelas Baru
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Buat kelas untuk mengelola siswa dan materi pembelajaran</p>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Informasi Kelas</h2>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 rounded-xl text-sm">
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Class Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nama Kelas *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Contoh: XII-IPA 1"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                    required
                                />
                            </div>

                            {/* Grade Level */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Tingkat Kelas *
                                </label>
                                <div className="flex gap-2">
                                    {grades.map(grade => (
                                        <button
                                            key={grade}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, grade }))}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.grade === grade
                                                    ? 'bg-primary text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            Kelas {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Academic Year & Semester */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Tahun Ajaran
                                    </label>
                                    <select
                                        value={formData.academicYear}
                                        onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                    >
                                        {academicYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Semester
                                    </label>
                                    <select
                                        value={formData.semester}
                                        onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                    >
                                        <option value="1">Semester 1 (Ganjil)</option>
                                        <option value="2">Semester 2 (Genap)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Deskripsi singkat tentang kelas ini..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Link
                            to="/guru/kelas"
                            className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-center"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={!formData.name || isSubmitting}
                            className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Membuat...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    Buat Kelas
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sidebar - Class Code Preview */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-6 text-white">
                        <h3 className="font-bold mb-2">Kode Akses Kelas</h3>
                        <p className="text-white/80 text-sm mb-4">Kode unik akan di-generate otomatis setelah kelas berhasil dibuat. Anda dapat melihatnya di halaman detail kelas.</p>

                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-xl font-medium tracking-wide flex justify-center items-center gap-2">
                                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                Dibuat Otomatis
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Preview</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Nama:</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {formData.name || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tingkat:</span>
                                <span className="font-medium text-slate-900 dark:text-white">Kelas {formData.grade}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tahun:</span>
                                <span className="font-medium text-slate-900 dark:text-white">{formData.academicYear}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Semester:</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {formData.semester === '1' ? 'Ganjil' : 'Genap'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-500">info</span>
                            <div>
                                <p className="font-medium text-blue-700 dark:text-blue-400 text-sm">Langkah Selanjutnya</p>
                                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                    Setelah kelas dibuat, Anda bisa assign bab dari Master Data dan mengundang siswa dengan kode akses.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
