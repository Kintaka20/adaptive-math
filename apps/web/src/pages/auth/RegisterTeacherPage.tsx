import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authApi } from '../../lib/api'

interface SchoolOption {
    id: string
    name: string
    city: string
}

interface FormData {
    name: string
    email: string
    schoolId: string
    whatsapp: string
    password: string
    confirmPassword: string
    nip?: string
    agreeTerms: boolean
}

interface FormErrors {
    name?: string
    email?: string
    schoolId?: string
    whatsapp?: string
    password?: string
    confirmPassword?: string
    nip?: string
    agreeTerms?: string
    general?: string
}

export default function RegisterTeacherPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        schoolId: '',
        whatsapp: '',
        password: '',
        confirmPassword: '',
        nip: '',
        agreeTerms: false,
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [schoolSearch, setSchoolSearch] = useState('')
    const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)

    const [schools, setSchools] = useState<SchoolOption[]>([])

    useEffect(() => {
        authApi.schools()
            .then((data: any) => setSchools(data))
            .catch((err: any) => console.error("Failed to load schools:", err))
    }, [])

    const filteredSchools = schools.filter(school =>
        school.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        school.city.toLowerCase().includes(schoolSearch.toLowerCase())
    )

    const selectedSchool = schools.find(s => s.id === formData.schoolId)

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        let strength = 0
        if (password.length >= 8) strength++
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
        if (/\d/.test(password)) strength++
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

        const levels = [
            { strength: 0, label: 'Sangat Lemah', color: 'bg-red-500' },
            { strength: 1, label: 'Lemah', color: 'bg-orange-500' },
            { strength: 2, label: 'Cukup', color: 'bg-yellow-500' },
            { strength: 3, label: 'Kuat', color: 'bg-green-500' },
            { strength: 4, label: 'Sangat Kuat', color: 'bg-emerald-500' },
        ]

        return levels[strength]
    }

    const passwordStrength = getPasswordStrength(formData.password)

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name) {
            newErrors.name = 'Nama lengkap wajib diisi'
        } else if (formData.name.length < 3) {
            newErrors.name = 'Nama minimal 3 karakter'
        }

        if (!formData.email) {
            newErrors.email = 'Email institusi wajib diisi'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid'
        }

        if (!formData.schoolId) {
            newErrors.schoolId = 'Pilih sekolah terlebih dahulu'
        }

        if (!formData.whatsapp) {
            newErrors.whatsapp = 'Nomor WhatsApp wajib diisi'
        } else if (!/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(formData.whatsapp.replace(/[\s-]/g, ''))) {
            newErrors.whatsapp = 'Format nomor tidak valid (contoh: 08123456789)'
        }

        if (!formData.password) {
            newErrors.password = 'Password wajib diisi'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password minimal 8 karakter'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password wajib diisi'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok'
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'Anda harus menyetujui syarat dan ketentuan'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setErrors({})

        try {
            await authApi.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'TEACHER',
                schoolId: formData.schoolId,
                ...( { whatsapp: formData.whatsapp, nip: formData.nip } as any )
            })

            setIsSuccess(true)
        } catch (error: any) {
            setErrors({ general: error?.message || 'Gagal mendaftar. Silakan coba lagi.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
                <div className="max-w-md w-full text-center">
                    <div className="mb-8">
                        <div className="size-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-amber-600 dark:text-amber-400">hourglass_top</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                            Menunggu Verifikasi
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Pendaftaran Anda telah diterima dan sedang menunggu verifikasi dari Admin.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 mb-8">
                        <div className="space-y-4 text-left">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500">schedule</span>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Proses verifikasi</p>
                                    <p className="text-sm text-slate-500">Biasanya 1-2 hari kerja</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500">mail</span>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Notifikasi email</p>
                                    <p className="text-sm text-slate-500">Anda akan menerima email saat akun diverifikasi</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500">support_agent</span>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Butuh bantuan?</p>
                                    <p className="text-sm text-slate-500">Hubungi support@adaptivemath.id</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 relative overflow-hidden">
                {/* Floating shapes */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute top-1/3 right-10 w-24 h-24 bg-white/10 rounded-2xl rotate-45"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 mb-12">
                        <div className="size-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-3xl">calculate</span>
                        </div>
                        <span className="text-2xl font-bold text-white">AdaptiveMath</span>
                    </Link>

                    {/* Main illustration text */}
                    <div className="space-y-6">
                        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                            Tingkatkan<br />
                            pembelajaran<br />
                            <span className="text-yellow-200">di kelas Anda</span>
                        </h2>

                        <p className="text-white/80 text-lg max-w-md">
                            Dapatkan alat untuk membuat pembelajaran matematika lebih efektif dan menyenangkan.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3 text-white/90">
                            <span className="material-symbols-outlined text-yellow-200">check_circle</span>
                            <span>Buat kelas dan undang siswa dengan kode</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <span className="material-symbols-outlined text-yellow-200">check_circle</span>
                            <span>Tambahkan soal custom ke bank soal</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <span className="material-symbols-outlined text-yellow-200">check_circle</span>
                            <span>Monitor progres siswa secara real-time</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <span className="material-symbols-outlined text-yellow-200">check_circle</span>
                            <span>Audit dan koreksi interaksi AI siswa</span>
                        </div>
                    </div>

                    {/* Floating math symbols */}
                    <div className="absolute bottom-10 left-12 flex gap-4 text-white/30">
                        <span className="text-4xl">∑</span>
                        <span className="text-4xl">∫</span>
                        <span className="text-4xl">π</span>
                        <span className="text-4xl">√</span>
                        <span className="text-4xl">∞</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    {/* Mobile Logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="size-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                            <span className="material-symbols-outlined">calculate</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">AdaptiveMath</span>
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                            Daftar Sebagai Guru 👩‍🏫
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Buat kelas dan kelola pembelajaran siswa Anda.
                        </p>
                    </div>

                    {/* Verification Notice */}
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-500 text-xl">verified_user</span>
                        <div>
                            <p className="text-amber-700 dark:text-amber-400 font-medium text-sm">Memerlukan Verifikasi Admin</p>
                            <p className="text-amber-600 dark:text-amber-300 text-sm">Akun guru akan diverifikasi oleh admin sebelum dapat digunakan (1-2 hari kerja).</p>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <p className="text-red-600 dark:text-red-300 text-sm">{errors.general}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">person</span>
                                    Nama Lengkap
                                </span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Ani Suryani, S.Pd"
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                                    ${errors.name
                                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20'
                                    }
                                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400`}
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">mail</span>
                                    Email Institusi
                                </span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="ani.suryani@sman1.sch.id"
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                                    ${errors.email
                                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20'
                                    }
                                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400`}
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* School Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">school</span>
                                    Pilih Sekolah *
                                </span>
                            </label>
                            <div className="relative">
                                <div
                                    onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
                                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between
                                        ${errors.schoolId
                                            ? 'border-red-500'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'
                                        }
                                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
                                >
                                    {selectedSchool ? (
                                        <div>
                                            <p className="font-medium">{selectedSchool.name}</p>
                                            <p className="text-xs text-slate-500">{selectedSchool.city}</p>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">Pilih sekolah Anda...</span>
                                    )}
                                    <span className="material-symbols-outlined text-slate-400">
                                        {showSchoolDropdown ? 'expand_less' : 'expand_more'}
                                    </span>
                                </div>

                                {showSchoolDropdown && (
                                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto">
                                        <div className="sticky top-0 bg-white dark:bg-slate-800 p-2 border-b border-slate-200 dark:border-slate-700">
                                            <input
                                                type="text"
                                                placeholder="Cari sekolah..."
                                                value={schoolSearch}
                                                onChange={(e) => setSchoolSearch(e.target.value)}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        {filteredSchools.length > 0 ? (
                                            filteredSchools.map(school => (
                                                <button
                                                    key={school.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, schoolId: school.id })
                                                        setShowSchoolDropdown(false)
                                                        setSchoolSearch('')
                                                        if (errors.schoolId) setErrors({ ...errors, schoolId: undefined })
                                                    }}
                                                    className={`w-full px-4 py-3 text-left hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-3 ${formData.schoolId === school.id ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                                                        }`}
                                                >
                                                    <div className="size-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-amber-500 text-sm">domain</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{school.name}</p>
                                                        <p className="text-xs text-slate-500">{school.city}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-slate-500">
                                                Sekolah tidak ditemukan
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.schoolId && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    {errors.schoolId}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-slate-500">
                                Sekolah tidak terdaftar? Hubungi admin untuk mendaftarkan sekolah Anda.
                            </p>
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">phone</span>
                                    Nomor WhatsApp
                                </span>
                            </label>
                            <input
                                type="tel"
                                id="whatsapp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleInputChange}
                                placeholder="08123456789"
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                                    ${errors.whatsapp
                                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20'
                                    }
                                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400`}
                            />
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Untuk keperluan verifikasi dan komunikasi
                            </p>
                            {errors.whatsapp && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    {errors.whatsapp}
                                </p>
                            )}
                        </div>

                        {/* NIP Input */}
                        <div>
                            <label htmlFor="nip" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">badge</span>
                                    NIP (Opsional)
                                </span>
                            </label>
                            <input
                                type="text"
                                id="nip"
                                name="nip"
                                value={formData.nip}
                                onChange={handleInputChange}
                                placeholder="Nomor Induk Pegawai"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">lock</span>
                                    Password
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Minimal 8 karakter"
                                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 outline-none
                                        ${errors.password
                                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                            : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20'
                                        }
                                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[0, 1, 2, 3].map((index) => (
                                            <div
                                                key={index}
                                                className={`h-1.5 flex-1 rounded-full transition-all ${index < passwordStrength.strength
                                                    ? passwordStrength.color
                                                    : 'bg-slate-200 dark:bg-slate-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                        Kekuatan: {passwordStrength.label}
                                    </p>
                                </div>
                            )}
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">lock</span>
                                    Konfirmasi Password
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Ulangi password"
                                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 outline-none
                                        ${errors.confirmPassword
                                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                            : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20'
                                        }
                                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined">
                                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Terms */}
                        <div>
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleInputChange}
                                    className="mt-1 size-4 rounded border-2 border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    Saya setuju dengan{' '}
                                    <Link to="/terms" className="text-amber-600 hover:text-amber-700 font-medium">
                                        Syarat & Ketentuan
                                    </Link>
                                    {' '}dan{' '}
                                    <Link to="/privacy" className="text-amber-600 hover:text-amber-700 font-medium">
                                        Kebijakan Privasi
                                    </Link>
                                </span>
                            </label>
                            {errors.agreeTerms && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    {errors.agreeTerms}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">send</span>
                                    <span>Kirim Pendaftaran</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="font-bold text-amber-600 hover:text-amber-700 transition-colors">
                                Masuk
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
