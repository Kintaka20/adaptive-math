import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { classApi } from '../../lib/api'

interface KKMSetting {
    chapterId: string
    name: string
    kkm: number
    remedialEnabled: boolean
}

interface ClassInfo {
    id: string
    name: string
    grade: string
    kkmScore?: number
    autoRemedial?: boolean
    chapters?: any[]
}

export default function KKMSettingsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [settings, setSettings] = useState<KKMSetting[]>([])
    const [globalKKM, setGlobalKKM] = useState(70)
    const [autoRemedial, setAutoRemedial] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        const load = async () => {
            setIsLoading(true)
            try {
                const cls = await classApi.get(id) as ClassInfo
                setClassInfo(cls)
                if (cls.kkmScore) setGlobalKKM(cls.kkmScore)
                if (cls.autoRemedial !== undefined) setAutoRemedial(cls.autoRemedial)
                
                const classChapters = cls.chapters?.map((cc: any) => cc.chapter) || []
                
                setSettings(classChapters.map((c: any) => ({
                    chapterId: c.id,
                    name: c.name,
                    kkm: cls.kkmScore || 70,
                    remedialEnabled: true,
                })))
            } catch (err) {
                console.error('Failed to load KKM settings', err)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id])

    const updateKKM = (chapterId: string, value: number) => {
        setSettings(prev => prev.map(s =>
            s.chapterId === chapterId ? { ...s, kkm: Math.min(100, Math.max(0, value)) } : s
        ))
    }

    const applyGlobalKKM = () => {
        setSettings(prev => prev.map(s => ({ ...s, kkm: globalKKM })))
    }

    const handleSave = async () => {
        if (!id) return
        setIsSaving(true)
        try {
            await classApi.update(id, { kkmScore: globalKKM, autoRemedial })
            navigate(`/guru/kelas/${id}`)
        } catch (err) {
            console.error('Failed to save KKM', err)
            alert('Gagal menyimpan. Silakan coba lagi.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/guru/kelas" className="hover:text-primary">Manajemen Kelas</Link>
                    <span>/</span>
                    <Link to={`/guru/kelas/${id}`} className="hover:text-primary">{classInfo?.name || 'Kelas'}</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Pengaturan KKM</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">tune</span>
                    Pengaturan Adaptif (KKM)
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Atur ambang batas nilai untuk jalur Remedial/Reguler</p>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                <div className="flex items-start gap-4">
                    <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">route</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg mb-1">Tentang Sistem Adaptif</h2>
                        <p className="text-white/90 text-sm">Sistem akan otomatis menentukan jalur belajar siswa berdasarkan hasil Post-Test:</p>
                        <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <span className="size-6 bg-white/20 rounded-full flex items-center justify-center text-sm">🟢</span>
                                <span className="text-sm">Nilai ≥ KKM = Jalur Reguler</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-6 bg-white/20 rounded-full flex items-center justify-center text-sm">🔴</span>
                                <span className="text-sm">Nilai &lt; KKM = Jalur Remedial</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global KKM & Auto Remedial */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Terapkan KKM Global</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input type="number" value={globalKKM} onChange={(e) => setGlobalKKM(Number(e.target.value))}
                                min={0} max={100}
                                className="w-24 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center font-bold outline-none focus:border-primary" />
                            <span className="text-slate-500">untuk semua bab</span>
                        </div>
                        <button onClick={applyGlobalKKM}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                            Terapkan ke Semua
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Sistem Remedial Otomatis</h3>
                            <p className="text-sm text-slate-500 mt-1">Jika aktif, siswa yang gagal kuis akan langsung dibuatkan remedial oleh AI.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer mt-1">
                            <input type="checkbox" className="sr-only peer" checked={autoRemedial} onChange={(e) => setAutoRemedial(e.target.checked)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                        </label>
                    </div>
                </div>
            </div>

            {/* KKM per Chapter */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white">KKM per Bab</h3>
                    <p className="text-sm text-slate-500">Sesuaikan nilai KKM untuk masing-masing bab</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50">
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Bab</th>
                                <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-32">Nilai KKM</th>
                                <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-40">Jalur Remedial</th>
                                <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-32">Preview</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {settings.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    Belum ada bab yang ditambahkan ke kelas ini.
                                </td></tr>
                            ) : settings.map((s) => (
                                <tr key={s.chapterId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900 dark:text-white">{s.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => updateKKM(s.chapterId, s.kkm - 5)}
                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <input type="number" value={s.kkm} onChange={(e) => updateKKM(s.chapterId, Number(e.target.value))}
                                                min={0} max={100}
                                                className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center font-bold outline-none" />
                                            <button onClick={() => updateKKM(s.chapterId, s.kkm + 5)}
                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center">
                                            {autoRemedial ? (
                                                <span className="text-emerald-500 font-medium text-sm flex items-center gap-1"><span className="material-symbols-outlined text-sm">smart_toy</span> Otomatis</span>
                                            ) : (
                                                <span className="text-amber-500 font-medium text-sm flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span> Manual</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${autoRemedial
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                                                {autoRemedial ? `≥ ${s.kkm} = Lulus` : 'Manual'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-xs font-medium">
                                                &lt; {s.kkm} = Gagal
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                    <div>
                        <p className="font-medium text-amber-700 dark:text-amber-400">Tips Pengaturan KKM</p>
                        <ul className="text-sm text-amber-600 dark:text-amber-300 mt-1 space-y-1">
                            <li>• Nilai KKM default adalah 70 (standar nasional)</li>
                            <li>• Bab yang sulit bisa memiliki KKM lebih rendah</li>
                            <li>• Nonaktifkan jalur remedial jika belum ada materi remedial tersedia</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Save */}
            <div className="flex justify-end gap-3">
                <Link to={`/guru/kelas/${id}`} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium">
                    Batal
                </Link>
                <button onClick={handleSave} disabled={isSaving}
                    className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50">
                    {isSaving ? (
                        <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
                    ) : (
                        <><span className="material-symbols-outlined text-sm">save</span>Simpan Pengaturan</>
                    )}
                </button>
            </div>
        </div>
    )
}
