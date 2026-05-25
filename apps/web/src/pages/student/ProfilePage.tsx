import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { studentApi } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import SchoolPicker from '../../components/SchoolPicker'

interface BadgeItem {
    id: string
    name: string
    icon: string
    description?: string
    unlocked?: boolean
    earnedAt?: string
}

type Tab = 'profile' | 'achievements' | 'settings'

export default function ProfilePage() {
    const { user, logout } = useAuth()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [badges, setBadges] = useState<{ earned: BadgeItem[]; locked: BadgeItem[] }>({ earned: [], locked: [] })
    const [formData, setFormData] = useState({ name: user?.name || '', phone: '', schoolId: '' })
    const [dashboard, setDashboard] = useState<any>(null)

    useEffect(() => {
        const tabParam = searchParams.get('tab') as Tab | null
        if (tabParam && ['profile', 'achievements', 'settings'].includes(tabParam)) {
            setActiveTab(tabParam)
        }
    }, [searchParams])

    useEffect(() => {
        studentApi.dashboard().then(d => setDashboard(d)).catch(console.error)
        studentApi.badges().then(b => setBadges(b)).catch(console.error)
    }, [])

    useEffect(() => {
        if (user) {
            const schoolId = (user as any)?.student?.schoolId ?? (user as any)?.schoolId ?? ''
            setFormData(f => ({ ...f, name: user.name, schoolId }))
        }
    }, [user])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setAvatarPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
        await studentApi.updateProfile({ name: formData.name, phone: formData.phone, schoolId: formData.schoolId })
            setIsEditing(false)
            window.location.reload()
        } catch (err) {
            console.error('Failed to update profile', err)
            alert('Gagal menyimpan profil')
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const stats = dashboard?.stats ?? { totalXP: 0, currentLevel: 1, streakDays: 0 }
    const xpToNextLevel = stats.currentLevel * 1000

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'profile', label: 'Profil', icon: 'person' },
        { key: 'achievements', label: 'Pencapaian', icon: 'emoji_events' },
        { key: 'settings', label: 'Pengaturan', icon: 'settings' },
    ]

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/siswa')}>Dashboard</span>
                <span>/</span>
                <span className="text-slate-900 dark:text-white">Profil</span>
            </div>

            {/* Profile Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="size-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black overflow-hidden">
                            {avatarPreview
                                ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                : <span>{user?.name?.charAt(0) || '?'}</span>
                            }
                        </div>
                        <button onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white">photo_camera</span>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black">{user?.name}</h1>
                        <p className="text-white/80">{user?.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">⭐ Level {stats.currentLevel}</span>
                            <span className="flex items-center gap-1">🔥 {stats.streakDays} hari streak</span>
                        </div>
                    </div>
                </div>

                {/* XP Progress */}
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>XP: {stats.totalXP.toLocaleString()}</span>
                        <span>Level {stats.currentLevel + 1}: {xpToNextLevel.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${Math.min((stats.totalXP / xpToNextLevel) * 100, 100)}%` }} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === tab.key
                            ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900 dark:text-white">Informasi Profil</h2>
                        <button onClick={() => setIsEditing(!isEditing)} className="text-primary hover:underline text-sm">
                            {isEditing ? 'Batal' : 'Edit'}
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">Nama Lengkap</label>
                            {isEditing ? (
                                <input type="text" value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-primary" />
                            ) : (
                                <p className="font-medium text-slate-900 dark:text-white">{user?.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">Email</label>
                            <p className="font-medium text-slate-900 dark:text-white">{user?.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">Kelas</label>
                            <p className="font-medium text-slate-900 dark:text-white">{(user as any)?.grade || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">Sekolah</label>
                            {isEditing ? (
                                <SchoolPicker
                                    value={formData.schoolId}
                                    onChange={(schoolId) => setFormData(p => ({ ...p, schoolId }))}
                                    accentColor="primary"
                                    label=""
                                />
                            ) : (
                                <p className="font-medium text-slate-900 dark:text-white">{(user as any)?.student?.school?.name ?? (user as any)?.school?.name ?? '-'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">Bergabung Sejak</label>
                            <p className="font-medium text-slate-900 dark:text-white">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>
                    {isEditing && (
                        <button onClick={handleSaveProfile} disabled={isSaving}
                            className="mt-6 w-full bg-primary text-white font-bold py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : 'Simpan Perubahan'}
                        </button>
                    )}
                </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
                <div className="space-y-4">
                    {badges.earned.length === 0 && badges.locked.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2">emoji_events</span>
                            <p>Belum ada pencapaian. Mulai belajar untuk meraih badge!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[...badges.earned.map(b => ({ ...b, unlocked: true })), ...badges.locked.map(b => ({ ...b, unlocked: false }))].map(achievement => (
                                <div key={achievement.id}
                                    className={`bg-white dark:bg-slate-800 rounded-xl border p-4 text-center ${achievement.unlocked
                                        ? 'border-amber-200 dark:border-amber-800' : 'border-slate-200 dark:border-slate-700 opacity-50'}`}>
                                    <div className={`text-4xl mb-2 ${!achievement.unlocked && 'grayscale'}`}>{achievement.icon}</div>
                                    <p className="font-bold text-slate-900 dark:text-white">{achievement.name}</p>
                                    <p className="text-xs text-slate-500">{achievement.description}</p>
                                    {achievement.unlocked && (
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs rounded-full">
                                            ✓ Unlocked
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Pengaturan Akun</h2>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Notifikasi Email</p>
                            <p className="text-sm text-slate-500">Terima update via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full mt-4 py-2.5 border border-red-200 dark:border-red-800 text-red-500 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        Keluar dari Akun
                    </button>
                </div>
            )}
        </div>
    )
}
