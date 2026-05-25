import { Link, useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                {/* 403 Animation */}
                <div className="relative mb-8">
                    <div className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 leading-none">
                        403
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl animate-pulse">🔒</div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-black text-white mb-2">
                    Akses Ditolak
                </h1>
                <p className="text-slate-400 mb-8">
                    Anda tidak memiliki izin untuk mengakses halaman ini.
                    Pastikan Anda sudah login dengan akun yang tepat.
                </p>

                {/* Info Card */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-3 text-left">
                        <span className="material-symbols-outlined text-red-400">shield</span>
                        <div>
                            <p className="font-medium text-red-400 mb-1">Mengapa ini terjadi?</p>
                            <ul className="text-sm text-slate-400 space-y-1">
                                <li>• Anda mencoba mengakses halaman untuk role lain</li>
                                <li>• Sesi login Anda mungkin sudah berakhir</li>
                                <li>• Akun Anda belum diverifikasi admin</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Kembali
                    </button>
                    <Link
                        to="/login"
                        className="flex-1 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">login</span>
                        Login Ulang
                    </Link>
                </div>

                {/* Help Link */}
                <p className="mt-6 text-sm text-slate-500">
                    Butuh bantuan?{' '}
                    <Link to="/" className="text-primary hover:underline">Hubungi Admin</Link>
                </p>
            </div>
        </div>
    )
}
