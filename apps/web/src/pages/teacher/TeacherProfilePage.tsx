import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { teacherApi, questionApi, classApi } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import SchoolPicker from '../../components/SchoolPicker'

interface TeacherProfile {
    id: string
    nip?: string
    user: { name: string; email: string; avatar?: string; phone?: string; createdAt: string }
    school?: { id: string; name: string; city: string }
    _count?: { classes: number }
}

type Tab = 'overview' | 'questions' | 'classes' | 'settings'

export default function TeacherProfilePage() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState<Tab>('overview')
    const [profile, setProfile] = useState<TeacherProfile | null>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        nip: '',
        schoolId: '',
    })

    useEffect(() => {
        const tabParam = searchParams.get('tab') as Tab | null
        if (tabParam && ['overview', 'questions', 'classes', 'settings'].includes(tabParam)) {
            setActiveTab(tabParam)
        }
    }, [searchParams])

    useEffect(() => {
        Promise.all([
            teacherApi.profile(),
            questionApi.list(),
            classApi.list(),
        ])
            .then(([profileData, questionsData, classesData]) => {
                const p = profileData as TeacherProfile
                setProfile(p)
                setEditForm({
                    name: p.user.name,
                    phone: p.user.phone ?? '',
                    nip: p.nip ?? '',
                    schoolId: p.school?.id ?? '',
                })
                setQuestions(questionsData as any[])
                setClasses(classesData as any[])
            })
            .catch(err => console.error('Failed to load teacher profile', err))
            .finally(() => setIsLoading(false))
    }, [])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setAvatarPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveMsg(null)
        try {
            await teacherApi.updateProfile({
                name: editForm.name,
                phone: editForm.phone,
                nip: editForm.nip,
                schoolId: editForm.schoolId,
            })
            const updated = await teacherApi.profile() as TeacherProfile
            setProfile(updated)
            setIsEditing(false)
            setSaveMsg({ type: 'success', text: 'Profil berhasil disimpan!' })
            setTimeout(() => setSaveMsg(null), 3000)
        } catch (err: any) {
            setSaveMsg({ type: 'error', text: err?.message || 'Gagal menyimpan profil' })
        } finally {
            setIsSaving(false)
        }
    }

    const tabs = [
        { key: 'overview', label: 'Ringkasan', icon: 'dashboard' },
        { key: 'questions', label: 'Soal Saya', icon: 'quiz' },
        { key: 'classes', label: 'Kelas', icon: 'school' },
        { key: 'settings', label: 'Pengaturan', icon: 'settings' },
    ]

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">Mudah</span>
            case 'medium': return <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-medium rounded-full">Sedang</span>
            case 'hard': return <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-medium rounded-full">Sulit</span>
            default: return null
        }
    }

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="size-12 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
    )

    const displayName = profile?.user.name ?? user?.name ?? 'Guru'
    const displayEmail = profile?.user.email ?? user?.email ?? ''
    const displaySchool = profile?.school?.name ?? '-'
    const displayNIP = profile?.nip ?? '-'
    const joinDate = profile?.user.createdAt
        ? new Date(profile.user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '-'

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header Profile */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                        <div className="size-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : profile?.user.avatar ? (
                                <img src={profile.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                displayName.charAt(0)
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl font-black">{displayName}</h1>
                        <p className="opacity-90">{displayEmail}</p>
                        <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">🏫 {displaySchool}</span>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">📐 Matematika</span>
                            {profile?.nip && <span className="px-3 py-1 bg-white/20 rounded-full text-sm">🆔 NIP: {displayNIP}</span>}
                        </div>
                    </div>
                    <Link
                        to="/guru/notifikasi"
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        Notifikasi
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Kelas', value: profile?._count?.classes ?? classes.length, icon: 'school', color: 'blue' },
                    { label: 'Total Siswa', value: classes.reduce((a: number, c: any) => a + (c._count?.enrollments ?? 0), 0), icon: 'groups', color: 'emerald' },
                    { label: 'Soal Dibuat', value: questions.filter((q: any) => !q.isSystem).length, icon: 'quiz', color: 'amber' },
                    { label: 'Bergabung', value: joinDate, icon: 'calendar_today', color: 'purple' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className={`size-10 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-${stat.color}-500`}>{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as Tab)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Informasi Profil</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Nama Lengkap', value: displayName },
                                { label: 'Email', value: displayEmail },
                                { label: 'NIP', value: displayNIP },
                                { label: 'Sekolah', value: displaySchool },
                                { label: 'Kota', value: profile?.school?.city ?? '-' },
                                { label: 'Bergabung Sejak', value: joinDate },
                            ].map(item => (
                                <div key={item.label}>
                                    <p className="text-sm text-slate-500 mb-1">{item.label}</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-8">Soal Terbaru Dibuat</h2>
                        {questions.filter((q: any) => !q.isSystem).length === 0 ? (
                            <p className="text-slate-500 text-sm">Belum ada soal yang dibuat.</p>
                        ) : (
                            <div className="space-y-3">
                                {questions.filter((q: any) => !q.isSystem).slice(0, 3).map((q: any) => (
                                    <div key={q.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">{q.text}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-500">{(q as any).chapter?.name ?? q.chapterId}</span>
                                                {getDifficultyBadge(q.difficulty)}
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400">⭐ {q.usageCount ?? 0} penggunaan</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link to="/guru/bank-soal" className="text-amber-600 font-medium text-sm hover:underline">
                            Lihat semua soal →
                        </Link>
                    </div>
                )}

                {/* Questions */}
                {activeTab === 'questions' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Soal yang Saya Buat ({questions.filter((q: any) => !q.isSystem).length})
                            </h2>
                            <Link to="/guru/bank-soal/create" className="px-4 py-2 bg-amber-500 text-white font-medium rounded-xl flex items-center gap-2 hover:bg-amber-600">
                                <span className="material-symbols-outlined text-sm">add</span>
                                Buat Soal
                            </Link>
                        </div>
                        {questions.filter((q: any) => !q.isSystem).length === 0 ? (
                            <p className="text-slate-500 text-sm py-4 text-center">Belum ada soal yang dibuat.</p>
                        ) : (
                            <div className="space-y-3">
                                {questions.filter((q: any) => !q.isSystem).map((q: any) => (
                                    <div key={q.id} className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white">{q.text}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">{(q as any).chapter?.name ?? q.chapterId ?? '-'}</span>
                                                {getDifficultyBadge(q.difficulty)}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-slate-400">⭐ {q.usageCount ?? 0} penggunaan</p>
                                            <Link to={`/guru/bank-soal/${q.id}/edit`} className="mt-2 block px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-center">
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Classes */}
                {activeTab === 'classes' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kelas Saya ({classes.length})</h2>
                            <Link to="/guru/kelas/create" className="px-4 py-2 bg-amber-500 text-white font-medium rounded-xl flex items-center gap-2 hover:bg-amber-600">
                                <span className="material-symbols-outlined text-sm">add</span>
                                Buat Kelas
                            </Link>
                        </div>
                        {classes.length === 0 ? (
                            <p className="text-slate-500 text-sm py-4 text-center">Belum ada kelas yang dibuat.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {classes.map((kelas: any) => (
                                    <Link key={kelas.id} to={`/guru/kelas/${kelas.id}`}
                                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-slate-900 dark:text-white">{kelas.name}</h3>
                                            <span className="text-sm text-slate-500">{kelas._count?.enrollments ?? 0} siswa</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full">{kelas.grade}</span>
                                            {kelas.joinCode && <span className="text-xs text-slate-400">Kode: {kelas.joinCode}</span>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pengaturan Profil</h2>
                            <button
                                onClick={() => {
                                    if (isEditing) {
                                        setEditForm({
                                            name: profile?.user.name ?? '',
                                            phone: profile?.user.phone ?? '',
                                            nip: profile?.nip ?? '',
                                            schoolId: profile?.school?.id ?? '',
                                        })
                                    }
                                    setIsEditing(!isEditing)
                                }}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                {isEditing ? 'Batal' : 'Edit Profil'}
                            </button>
                        </div>

                        {saveMsg && (
                            <div className={`p-3 rounded-xl text-sm font-medium ${saveMsg.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200'}`}>
                                {saveMsg.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 disabled:bg-slate-50 dark:disabled:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={profile?.user.email ?? ''}
                                    disabled
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">No. Telepon / WhatsApp</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="08123456789"
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 disabled:bg-slate-50 dark:disabled:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">NIP</label>
                                <input
                                    type="text"
                                    value={editForm.nip}
                                    onChange={e => setEditForm({ ...editForm, nip: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Nomor Induk Pegawai"
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 disabled:bg-slate-50 dark:disabled:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>

                            {/* School Picker */}
                            <SchoolPicker
                                value={editForm.schoolId}
                                onChange={(schoolId) => setEditForm({ ...editForm, schoolId })}
                                disabled={!isEditing}
                                accentColor="amber"
                                label="Sekolah"
                            />

                            {isEditing && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <><div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Menyimpan...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-sm">save</span>Simpan Perubahan</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
