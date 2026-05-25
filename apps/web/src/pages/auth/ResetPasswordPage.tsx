import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../lib/api'

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

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
        const newErrors: typeof errors = {}

        if (!formData.password) {
            newErrors.password = 'Password baru wajib diisi'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password minimal 8 karakter'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password wajib diisi'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!validateForm()) return

        setIsLoading(true)

        try {
            await authApi.resetPassword(token!, formData.password)

            setIsSuccess(true)
        } catch {
            setErrors({ general: 'Gagal reset password. Link mungkin sudah expired.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
                <div className="max-w-md w-full text-center">
                    <div className="mb-8">
                        <div className="size-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-red-500">link_off</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                            Link Tidak Valid
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Link reset password tidak valid atau sudah expired. Silakan minta link baru.
                        </p>
                    </div>

                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Minta Link Baru
                    </Link>
                </div>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
                <div className="max-w-md w-full text-center">
                    <div className="mb-8">
                        <div className="size-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                            Password Berhasil Direset! 🎉
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Password Anda telah berhasil diubah. Silakan login dengan password baru.
                        </p>
                    </div>

                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-indigo-800 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/30"
                    >
                        <span className="material-symbols-outlined">login</span>
                        Masuk Sekarang
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
            <div className="max-w-md w-full">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">calculate</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">AdaptiveMath</span>
                </Link>

                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-primary">password</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            Buat Password Baru
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Masukkan password baru untuk akun Anda.
                        </p>
                    </div>

                    {/* Error Alert */}
                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <p className="text-red-600 dark:text-red-300 text-sm">{errors.general}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">lock</span>
                                    Password Baru
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
                                            : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/20'
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
                                    Konfirmasi Password Baru
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Ulangi password baru"
                                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 outline-none
                                        ${errors.confirmPassword
                                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                            : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/20'
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-indigo-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">save</span>
                                    <span>Simpan Password Baru</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
