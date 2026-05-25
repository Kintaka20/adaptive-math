import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function MaterialEditorPage() {
    const { contentId, chapterId } = useParams()
    const navigate = useNavigate()
    const isNew = contentId === 'new'

    const [material, setMaterial] = useState({
        id: '',
        type: 'text' as const,
        title: '',
        description: '',
        chapterId: chapterId || '',
        chapterName: '',
        grade: '',
        order: 1,
        status: 'draft',
        content: '',
        videoUrl: '',
        pdfUrl: '',
        duration: '',
    })
    const [loading, setLoading] = useState(!isNew)

    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview')
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    useEffect(() => {
        if (isNew || !contentId) return

        const token = localStorage.getItem('auth_token')
        fetch(`${API_BASE}/materials/${contentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const m = data.data
                    setMaterial({
                        id: m.id,
                        type: 'text',
                        title: m.title || '',
                        description: m.description || '',
                        chapterId: m.chapterId || chapterId || '',
                        chapterName: m.chapter?.name || '',
                        grade: m.chapter?.grade || '',
                        order: m.order || 1,
                        status: m.status?.toLowerCase() || 'draft',
                        content: m.content || '',
                        videoUrl: m.videoUrl || '',
                        pdfUrl: m.pdfUrl || '',
                        duration: m.duration || '',
                    })
                }
            })
            .catch(err => console.error('Failed to load material:', err))
            .finally(() => setLoading(false))
    }, [contentId, isNew, chapterId])

    const latexButtons = [
        { label: 'Σ', value: '$\\\\sum_{}^{}$' },
        { label: '√', value: '$\\\\sqrt{}$' },
        { label: '∫', value: '$\\\\int_{}^{}$' },
        { label: 'π', value: '$\\\\pi$' },
        { label: 'frac', value: '$\\\\frac{}{}$' },
        { label: 'x²', value: '$x^{2}$' },
        { label: 'xₙ', value: '$x_{n}$' },
        { label: '≤', value: '$\\\\leq$' },
        { label: '≥', value: '$\\\\geq$' },
        { label: '∞', value: '$\\\\infty$' },
    ]

    const insertLatex = (latex: string) => {
        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newText = material.content.substring(0, start) + latex + material.content.substring(end)
            setMaterial(prev => ({ ...prev, content: newText }))
            setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(start + latex.length, start + latex.length)
            }, 0)
        }
    }

    const handleSave = async (publish = false) => {
        setIsSaving(true)
        try {
            const token = localStorage.getItem('auth_token')
            const body: any = {
                title: material.title,
                content: material.content,
                duration: material.duration,
                status: publish ? 'PUBLISHED' : material.status.toUpperCase(),
            }
            if (material.description) body.description = material.description
            if (material.videoUrl) body.videoUrl = material.videoUrl

            if (isNew) {
                body.chapterId = chapterId
                const res = await fetch(`${API_BASE}/materials`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(body),
                })
                const data = await res.json()
                if (data.success) {
                    setSaveSuccess(true)
                    setTimeout(() => navigate(`/admin/master-data/chapters/${chapterId}/content`), 1000)
                }
            } else {
                const res = await fetch(`${API_BASE}/materials/${contentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(body),
                })
                const data = await res.json()
                if (data.success) {
                    setSaveSuccess(true)
                    if (publish) setMaterial(prev => ({ ...prev, status: 'published' }))
                }
            }
        } catch (err) {
            console.error('Save error:', err)
        } finally {
            setIsSaving(false)
            setTimeout(() => setSaveSuccess(false), 2000)
        }
    }

    const handleBack = () => {
        navigate(`/admin/master-data/chapters/${chapterId}/content`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <span className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin inline-block mb-3" />
                    <p className="text-slate-500">Memuat materi...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/admin/master-data" className="hover:text-primary">Master Data</Link>
                    <span>/</span>
                    <Link to="/admin/master-data/curriculum" className="hover:text-primary">Kurikulum</Link>
                    <span>/</span>
                    <Link to={`/admin/master-data/chapters/${chapterId}/content`} className="hover:text-primary">
                        {material.chapterName || 'Bab'}
                    </Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">{isNew ? 'Materi Baru' : material.title}</span>
                </div>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">edit_document</span>
                            {isNew ? 'Buat Materi Baru' : 'Edit Materi'}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Kelas {material.grade} • {material.chapterName}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-medium flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Kembali
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="px-4 py-2 border border-primary text-primary rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <span className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-sm">save</span>
                            )}
                            Simpan Draft
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving}
                            className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">publish</span>
                            Publish
                        </button>
                    </div>
                </div>
                {saveSuccess && (
                    <div className="mt-2 text-emerald-600 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Materi berhasil disimpan!
                    </div>
                )}
            </div>

            {/* Material Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4">Informasi Materi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Judul Materi *
                        </label>
                        <input
                            type="text"
                            value={material.title}
                            onChange={(e) => setMaterial(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Contoh: Konsep Bilangan Berpangkat"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Estimasi Durasi Baca
                        </label>
                        <input
                            type="text"
                            value={material.duration}
                            onChange={(e) => setMaterial(prev => ({ ...prev, duration: e.target.value }))}
                            placeholder="Contoh: 15 menit"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Deskripsi Singkat
                        </label>
                        <input
                            type="text"
                            value={material.description}
                            onChange={(e) => setMaterial(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Deskripsi singkat materi..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        />
                    </div>
                </div>
            </div>

            {/* Video URL (Optional) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">play_circle</span>
                    Video Pembelajaran (Opsional)
                </h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        URL Video (YouTube, Vimeo, dll)
                    </label>
                    <input
                        type="url"
                        value={material.videoUrl}
                        onChange={(e) => setMaterial(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">Video akan ditampilkan di awal materi</p>
                </div>
            </div>

            {/* Content Editor - Preview First */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">article</span>
                        Konten Materi (Markdown + LaTeX)
                    </h2>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'preview'
                                ? 'bg-white dark:bg-slate-600 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            👁️ Preview
                        </button>
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'edit'
                                ? 'bg-white dark:bg-slate-600 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            ✏️ Edit
                        </button>
                    </div>
                </div>

                {activeTab === 'preview' ? (
                    <div className="p-6 min-h-[400px]">
                        {material.content ? (
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                                <LatexRenderer content={material.content} />
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-8 text-center text-slate-500">
                                <span className="material-symbols-outlined text-5xl mb-3 block">article</span>
                                <p className="text-lg font-medium mb-2">Belum ada konten</p>
                                <p className="text-sm mb-4">Klik tombol "Edit" untuk mulai menulis materi</p>
                                <button
                                    onClick={() => setActiveTab('edit')}
                                    className="bg-primary text-white px-4 py-2 rounded-xl font-medium"
                                >
                                    ✏️ Mulai Menulis
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-4">
                        {/* LaTeX Toolbar */}
                        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            {latexButtons.map(btn => (
                                <button
                                    key={btn.label}
                                    type="button"
                                    onClick={() => insertLatex(btn.value)}
                                    className="px-2 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-mono"
                                    title={`Insert ${btn.label}`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="mb-2 text-xs text-slate-500 flex items-center gap-4">
                            <span>💡 Gunakan Markdown untuk format</span>
                            <span>📐 Gunakan $...$ untuk LaTeX inline, $$...$$ untuk block</span>
                        </div>
                        <textarea
                            id="content-editor"
                            value={material.content}
                            onChange={(e) => setMaterial(prev => ({ ...prev, content: e.target.value }))}
                            placeholder={`Tulis konten materi di sini...

# Judul
## Sub Judul

Paragraf teks biasa.

Rumus inline: $x^2 + y^2 = z^2$

Rumus block:
$$\\\\sum_{i=1}^{n} i = \\\\frac{n(n+1)}{2}$$
`}
                            rows={20}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm"
                        />
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={() => setActiveTab('preview')}
                                className="text-primary font-medium flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                Lihat Preview
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Formatting Help */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined">help</span>
                    Panduan Format
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">Markdown</p>
                        <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                            <li><code># Judul</code> → Heading 1</li>
                            <li><code>## Sub Judul</code> → Heading 2</li>
                            <li><code>**bold**</code> → <strong>bold</strong></li>
                            <li><code>*italic*</code> → <em>italic</em></li>
                            <li><code>- item</code> → Bullet list</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">LaTeX Inline</p>
                        <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                            <li><code>$x^2$</code> → x²</li>
                            <li><code>$\frac&#123;a&#125;&#123;b&#125;$</code> → a/b</li>
                            <li><code>$\sqrt&#123;x&#125;$</code> → √x</li>
                            <li><code>$\sin(x)$</code> → sin(x)</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">LaTeX Block</p>
                        <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                            <li><code>$$...$$</code> → Rumus di tengah</li>
                            <li><code>\sum</code> → Sigma</li>
                            <li><code>\int</code> → Integral</li>
                            <li><code>\lim</code> → Limit</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
