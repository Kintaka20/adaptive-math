import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { notificationApi } from '../../lib/api'


interface Notification {
    id: string
    title: string
    message: string
    type: string
    link?: string | null
    isRead: boolean
    createdAt: string
}

type FilterType = 'all' | 'unread' | 'read'

export default function NotificationPage() {
    const location = useLocation()
    const [filter, setFilter] = useState<FilterType>('all')
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const role = location.pathname.startsWith('/siswa') ? 'student'
        : location.pathname.startsWith('/guru') ? 'teacher'
            : 'admin'

    useEffect(() => {
        loadNotifications()
    }, [])

    const loadNotifications = async () => {
        setIsLoading(true)
        try {
            const data = await notificationApi.list()
            setNotifications(data)
        } catch (err) {
            console.error('Gagal memuat notifikasi', err)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead
        if (filter === 'read') return n.isRead
        return true
    })

    const unreadCount = notifications.filter(n => !n.isRead).length

    const markAsRead = async (id: string) => {
        try {
            await notificationApi.markAsRead(id)
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ))
        } catch (err) {
            console.error('Gagal menandai notifikasi', err)
        }
    }

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (err) {
            console.error('Gagal menandai semua notifikasi', err)
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return { icon: 'warning', color: 'amber' }
            case 'INFO': return { icon: 'info', color: 'blue' }
            case 'SUCCESS': return { icon: 'check_circle', color: 'emerald' }
            case 'comment': return { icon: 'comment', color: 'blue' }
            case 'deadline': return { icon: 'schedule', color: 'red' }
            case 'reminder': return { icon: 'notifications', color: 'amber' }
            case 'achievement': return { icon: 'emoji_events', color: 'yellow' }
            case 'system': return { icon: 'settings', color: 'slate' }
            case 'schedule': return { icon: 'calendar_month', color: 'purple' }
            case 'approval': return { icon: 'pending_actions', color: 'emerald' }
            default: return { icon: 'notifications', color: 'slate' }
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Baru saja'
        if (diffMins < 60) return `${diffMins} menit lalu`
        if (diffHours < 24) return `${diffHours} jam lalu`
        if (diffDays < 7) return `${diffDays} hari lalu`
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const roleColor = role === 'student' ? 'emerald' : role === 'teacher' ? 'amber' : 'red'
    const basePath = role === 'student' ? '/siswa' : role === 'teacher' ? '/guru' : '/admin'

    if (isLoading) {
        return (
            <div className="space-y-6 pb-20 lg:pb-0">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                        <div className="h-5 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
                    </div>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className={`material-symbols-outlined text-${roleColor}-500`}>notifications</span>
                        Notifikasi
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">done_all</span>
                        Tandai Semua Dibaca
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {([
                    { value: 'all' as FilterType, label: 'Semua' },
                    { value: 'unread' as FilterType, label: 'Belum Dibaca' },
                    { value: 'read' as FilterType, label: 'Sudah Dibaca' },
                ]).map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === opt.value
                                ? `bg-${roleColor}-500 text-white`
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        {opt.label}
                        {opt.value === 'unread' && unreadCount > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">notifications_off</span>
                        <p className="text-slate-500 mt-2">
                            {filter === 'unread' ? 'Tidak ada notifikasi yang belum dibaca' : 'Tidak ada notifikasi'}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => {
                        const { icon, color } = getTypeIcon(notification.type)
                        const content = (
                            <div className={`flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border transition-all hover:shadow-md ${notification.isRead
                                    ? 'border-slate-200 dark:border-slate-700'
                                    : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
                                }`}>
                                <div className={`size-10 bg-${color}-100 dark:bg-${color}-900/30 rounded-full flex items-center justify-center flex-shrink-0`}>
                                    <span className={`material-symbols-outlined text-${color}-500`}>{icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`font-medium ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                            {notification.title}
                                        </p>
                                        {!notification.isRead && (
                                            <span className={`size-2 bg-${roleColor}-500 rounded-full flex-shrink-0 mt-2`}></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                                    <p className="text-xs text-slate-400 mt-2">{formatTime(notification.createdAt)}</p>
                                </div>
                                {notification.link && (
                                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                                )}
                            </div>
                        )

                        if (notification.link) {
                            return (
                                <Link
                                    key={notification.id}
                                    to={notification.link}
                                    onClick={() => markAsRead(notification.id)}
                                    className="block"
                                >
                                    {content}
                                </Link>
                            )
                        }

                        return (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className="cursor-pointer"
                            >
                                {content}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Back Link */}
            <div className="text-center">
                <Link
                    to={basePath}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Kembali ke Dashboard
                </Link>
            </div>
        </div>
    )
}
