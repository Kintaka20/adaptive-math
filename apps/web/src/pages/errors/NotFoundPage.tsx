import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                {/* 404 Animation */}
                <div className="relative mb-8">
                    <div className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 leading-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl animate-bounce">📚</div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-black text-white mb-2">
                    Halaman Tidak Ditemukan
                </h1>
                <p className="text-slate-400 mb-8">
                    Sepertinya halaman yang Anda cari tidak ada atau telah dipindahkan.
                    Mungkin Anda salah ketik URL?
                </p>

                {/* Suggestions */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <p className="text-sm text-slate-300 mb-4">Mungkin Anda mencari:</p>
                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            to="/siswa"
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                        >
                            🎓 Dashboard Siswa
                        </Link>
                        <Link
                            to="/guru"
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                        >
                            👨‍🏫 Dashboard Guru
                        </Link>
                        <Link
                            to="/siswa/belajar"
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                        >
                            📖 Jalur Belajar
                        </Link>
                        <Link
                            to="/login"
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                        >
                            🔑 Login
                        </Link>
                    </div>
                </div>

                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined">home</span>
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    )
}
