import { Link } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../../lib/api'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const validateEmail = (): boolean => {
        if (!email) {
            setError('Email wajib diisi')
            return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Format email tidak valid')
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!validateEmail()) return

        setIsLoading(true)

        try {
            await authApi.forgotPassword(email)

            setIsSuccess(true)
            startCountdown()
        } catch {
            setError('Gagal mengirim email. Silakan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleResend = async () => {
        if (countdown > 0) return

        setIsLoading(true)
        try {
            await authApi.forgotPassword(email)
            startCountdown()
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
                <div className="max-w-md w-full text-center">
                    <div className="mb-8">
                        <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-primary">mark_email_read</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                            Email Terkirim! 📧
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                            Kami telah mengirim link reset password ke:
                        </p>
                        <p className="text-primary font-semibold mb-6">{email}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 mb-8">
                        <div className="space-y-4 text-left">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">inbox</span>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Cek inbox email</p>
                                    <p className="text-sm text-slate-500">Klik link yang kami kirimkan</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">folder</span>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Tidak ada di inbox?</p>
                                    <p className="text-sm text-slate-500">Cek folder spam atau junk</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Link expired</p>
                                    <p className="text-sm text-slate-500">Link valid selama 1 jam</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleResend}
                        disabled={countdown > 0 || isLoading}
                        className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                        {countdown > 0
                            ? `Kirim ulang dalam ${countdown}s`
                            : isLoading
                                ? 'Mengirim...'
                                : 'Kirim Ulang Email'
                        }
                    </button>

                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Kembali ke Login
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
                            <span className="material-symbols-outlined text-3xl text-primary">lock_reset</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            Lupa Password?
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setError('')
                                }}
                                placeholder="email@example.com"
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                                    ${error
                                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/20'
                                    }
                                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400`}
                            />
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
                                    <span>Mengirim...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">send</span>
                                    <span>Kirim Link Reset</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Kembali ke Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
