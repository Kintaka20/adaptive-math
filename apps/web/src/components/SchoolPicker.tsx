import { useState, useEffect } from 'react'
import { authApi } from '../lib/api'

interface SchoolOption {
    id: string
    name: string
    city: string
}

interface SchoolPickerProps {
    value: string
    onChange: (schoolId: string, school: SchoolOption) => void
    disabled?: boolean
    accentColor?: 'emerald' | 'amber' | 'primary'
    label?: string
}

export default function SchoolPicker({
    value,
    onChange,
    disabled = false,
    accentColor = 'primary',
    label = 'Sekolah',
}: SchoolPickerProps) {
    const [schools, setSchools] = useState<SchoolOption[]>([])
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        authApi.schools()
            .then((data: any) => setSchools(data))
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [])

    const selected = schools.find(s => s.id === value)
    const filtered = schools.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase())
    )

    const ringColor = {
        emerald: 'focus:ring-emerald-500/20 border-emerald-400',
        amber: 'focus:ring-amber-500/20 border-amber-400',
        primary: 'focus:ring-primary/20 border-primary',
    }[accentColor]

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">school</span>
                    {label}
                </span>
            </label>
            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setOpen(prev => !prev)}
                    className={`w-full px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between text-left
                        ${disabled
                            ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-default'
                            : `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:${ringColor} cursor-pointer`
                        }`}
                >
                    {isLoading ? (
                        <span className="text-slate-400 text-sm">Memuat daftar sekolah...</span>
                    ) : selected ? (
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{selected.name}</p>
                            <p className="text-xs text-slate-500">{selected.city}</p>
                        </div>
                    ) : (
                        <span className="text-slate-400 text-sm">Pilih sekolah...</span>
                    )}
                    {!disabled && (
                        <span className="material-symbols-outlined text-slate-400 text-sm">
                            {open ? 'expand_less' : 'expand_more'}
                        </span>
                    )}
                </button>

                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-auto">
                            <div className="sticky top-0 bg-white dark:bg-slate-800 p-2 border-b border-slate-200 dark:border-slate-700">
                                <input
                                    type="text"
                                    placeholder="Cari sekolah..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
                                    autoFocus
                                />
                            </div>
                            {filtered.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    {search ? 'Sekolah tidak ditemukan' : 'Belum ada sekolah terdaftar'}
                                </div>
                            ) : (
                                filtered.map(school => (
                                    <button
                                        key={school.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(school.id, school)
                                            setOpen(false)
                                            setSearch('')
                                        }}
                                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${value === school.id ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
                                    >
                                        <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary text-sm">domain</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{school.name}</p>
                                            <p className="text-xs text-slate-500">{school.city}</p>
                                        </div>
                                        {value === school.id && (
                                            <span className="material-symbols-outlined text-primary text-sm ml-auto">check</span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
            <p className="mt-1 text-xs text-slate-400">
                Sekolah tidak terdaftar? Hubungi admin.
            </p>
        </div>
    )
}
