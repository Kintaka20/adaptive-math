import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ApiError } from '../../lib/api'

interface FormData {
    email: string
    password: string
    rememberMe: boolean
}

interface FormErrors {
    email?: string
    password?: string
    general?: string
}

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        rememberMe: false,
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.email) {
            newErrors.email = 'Email wajib diisi'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid'
        }

        if (!formData.password) {
            newErrors.password = 'Password wajib diisi'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password minimal 8 karakter'
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
            await login(formData.email, formData.password)
            navigate('/')  // App.tsx will redirect authenticated user away from /login
        } catch (error) {
            if (error instanceof ApiError) {
                setErrors({ general: error.message })
            } else {
                setErrors({ general: 'Email atau password salah. Silakan coba lagi.' })
            }
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

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-indigo-900 relative overflow-hidden">
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
                            Belajar matematika<br />
                            lebih <span className="text-yellow-300">menyenangkan</span><br />
                            dengan AI Tutor
                        </h2>

                        <p className="text-white/80 text-lg max-w-md">
                            Sistem pembelajaran adaptif yang menyesuaikan dengan kemampuanmu.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 mt-12">
                        <div className="flex items-center gap-3">
                            <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-white">school</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">50+</div>
                                <div className="text-white/60 text-sm">Sekolah</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-white">group</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">10,000+</div>
                                <div className="text-white/60 text-sm">Siswa</div>
                            </div>
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
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">calculate</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">AdaptiveMath</span>
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                            Selamat Datang Kembali! 👋
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Masuk ke akun Anda untuk melanjutkan pembelajaran.
                        </p>
                    </div>

                    {/* Error Alert */}
                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <div>
                                <p className="text-red-700 dark:text-red-400 font-medium text-sm">Login Gagal</p>
                                <p className="text-red-600 dark:text-red-300 text-sm">{errors.general}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">mail</span>
                                    Email
                                </span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="email@example.com"
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                                    ${errors.email
                                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/20'
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
                                    placeholder="••••••••"
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
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    className="size-4 rounded border-2 border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    Ingat saya
                                </span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                            >
                                Lupa Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-indigo-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
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
                                    <span className="material-symbols-outlined text-xl">login</span>
                                    <span>Masuk</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">atau</span>
                        </div>
                    </div>

                    {/* Google Login */}
                    <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                        <svg className="size-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Masuk dengan Google</span>
                    </button>

                    {/* Register Links */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            Belum punya akun?{' '}
                            <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
                                Daftar Siswa
                            </Link>
                            {' '}|{' '}
                            <Link to="/register/teacher" className="font-bold text-amber-600 hover:text-amber-700 transition-colors">
                                Daftar Guru
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
