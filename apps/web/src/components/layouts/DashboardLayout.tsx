import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { notificationApi } from '../../lib/api'

interface NavItem {
    path: string
    label: string
    icon: string
}

interface DashboardLayoutProps {
    role: 'student' | 'teacher' | 'admin'
    userName: string
    userAvatar?: string
}

const navItems: Record<string, NavItem[]> = {
    student: [
        { path: '/siswa', label: 'Dashboard', icon: 'dashboard' },
        { path: '/siswa/belajar', label: 'Belajar', icon: 'auto_stories' },
        { path: '/siswa/ai-tutor', label: 'AI Tutor', icon: 'smart_toy' },
        { path: '/siswa/ranking', label: 'Ranking', icon: 'leaderboard' },
        { path: '/siswa/profil', label: 'Profil', icon: 'person' },
    ],
    teacher: [
        { path: '/guru', label: 'Dashboard', icon: 'dashboard' },
        { path: '/guru/kelas', label: 'Kelas Saya', icon: 'class' },
        { path: '/guru/bank-soal', label: 'Bank Soal', icon: 'quiz' },
        { path: '/guru/bank-materi', label: 'Bank Materi', icon: 'article' },
        { path: '/guru/monitoring', label: 'Monitoring', icon: 'monitoring' },
        { path: '/guru/audit', label: 'Audit AI', icon: 'fact_check' },
        { path: '/guru/profil', label: 'Profil', icon: 'person' },
    ],
    admin: [
        { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/users', label: 'Pengguna', icon: 'group' },
        { path: '/admin/sekolah', label: 'Sekolah', icon: 'school' },
        { path: '/admin/master-data', label: 'Master Data', icon: 'database' },
        { path: '/admin/api-logs', label: 'API Logs', icon: 'article' },
    ],
}

const roleColors = {
    student: 'from-primary to-indigo-600',
    teacher: 'from-amber-500 to-orange-500',
    admin: 'from-slate-600 to-slate-800',
}

const roleBadgeColors = {
    student: 'bg-primary/10 text-primary',
    teacher: 'bg-amber-500/10 text-amber-600',
    admin: 'bg-slate-500/10 text-slate-600',
}

export default function DashboardLayout({ role, userName, userAvatar }: DashboardLayoutProps) {
    const { logout } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const location = useLocation()
    const items = navItems[role]

    useEffect(() => {
        const fetchCount = () => {
            notificationApi.list()
                .then(data => {
                    const count = Array.isArray(data) ? data.filter((n: any) => !n.isRead).length : 0
                    setUnreadCount(count)
                })
                .catch(() => { /* silent */ })
        }
        fetchCount()
        const interval = setInterval(fetchCount, 30000) // refresh every 30s
        return () => clearInterval(interval)
    }, [location.pathname])

    const isActive = (path: string) => {
        if (path === `/${role === 'student' ? 'siswa' : role === 'teacher' ? 'guru' : 'admin'}`) {
            return location.pathname === path
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-700">
                    <div className={`size-9 bg-gradient-to-r ${roleColors[role]} rounded-xl flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-white">calculate</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">AdaptiveMath</span>

                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden ml-auto text-slate-400 hover:text-slate-600"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {items.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                                ${isActive(item.path)
                                    ? `bg-gradient-to-r ${roleColors[role]} text-white shadow-lg shadow-primary/25`
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                }
                            `}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-medium">Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    {/* Search (desktop) */}
                    <div className="hidden md:flex items-center flex-1 max-w-md">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Cari materi, soal, atau bantuan..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <Link
                            to={`/${role === 'student' ? 'siswa' : role === 'teacher' ? 'guru' : 'admin'}/notifikasi`}
                            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>

                        {/* Profile dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userName} className="size-8 rounded-full object-cover" />
                                ) : (
                                    <div className={`size-8 rounded-full bg-gradient-to-r ${roleColors[role]} flex items-center justify-center text-white font-bold text-sm`}>
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{userName}</p>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeColors[role]}`}>
                                        {role === 'student' ? 'Siswa' : role === 'teacher' ? 'Guru' : 'Admin'}
                                    </span>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 hidden md:block">expand_more</span>
                            </button>

                            {/* Dropdown menu */}
                            {profileDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setProfileDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                                        <Link
                                            to={`/${role === 'student' ? 'siswa' : role === 'teacher' ? 'guru' : 'admin'}/profil`}
                                            className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            <span className="material-symbols-outlined">person</span>
                                            <span>Profil Saya</span>
                                        </Link>
                                        <Link
                                            to={`/${role === 'student' ? 'siswa' : role === 'teacher' ? 'guru' : 'admin'}/profil?tab=settings`}
                                            className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            <span className="material-symbols-outlined">settings</span>
                                            <span>Pengaturan</span>
                                        </Link>
                                        <hr className="my-2 border-slate-200 dark:border-slate-700" />
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={() => {
                                                setProfileDropdownOpen(false)
                                                logout()
                                            }}
                                        >
                                            <span className="material-symbols-outlined">logout</span>
                                            <span>Keluar</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile bottom navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-30">
                <div className="flex items-center justify-around py-2">
                    {items.slice(0, 5).map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors
                                ${isActive(item.path)
                                    ? 'text-primary'
                                    : 'text-slate-400 hover:text-slate-600'
                                }
                            `}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}
