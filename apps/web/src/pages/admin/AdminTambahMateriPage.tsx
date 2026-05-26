import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LatexRenderer from '../../components/LatexRenderer'

const chapters = ['Trigonometri', 'Turunan', 'Integral', 'Limit', 'Logaritma', 'Persamaan Kuadrat', 'Fungsi Linear']

export default function AdminTambahMateriPage() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

    const [formData, setFormData] = useState({
        title: '',
        chapter: '',
        grade: '',
        duration: '',
        content: '',
        videoUrl: '',
        pdfUrl: '',
    })

    const [isUploadingVideo, setIsUploadingVideo] = useState(false)
    const [isUploadingPdf, setIsUploadingPdf] = useState(false)
    const [isUploadingImageContent, setIsUploadingImageContent] = useState(false)

    const { uploadApi } = require('../../lib/api')

    const insertLatex = (latex: string) => {
        const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newText = formData.content.substring(0, start) + latex + formData.content.substring(end)
            setFormData(prev => ({ ...prev, content: newText }))
            setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(start + latex.length, start + latex.length)
            }, 0)
        }
    }

    const latexButtons = [
        { label: 'Σ', value: '$\\sum_{}^{}$' },
        { label: '√', value: '$\\sqrt{}$' },
        { label: '∫', value: '$\\int_{}^{}$' },
        { label: 'π', value: '$\\pi$' },
        { label: '∞', value: '$\\infty$' },
        { label: 'frac', value: '$\\frac{}{}$' },
        { label: 'x²', value: '$x^{2}$' },
        { label: 'xₙ', value: '$x_{n}$' },
        { label: '≤', value: '$\\leq$' },
        { label: '≥', value: '$\\geq$' },
    ]

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            navigate('/admin/master-data/materials')
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/admin/master-data/materials" className="hover:text-primary">Bank Materi</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">Tambah Materi Sistem</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">add_circle</span>
                    Tambah Materi Sistem
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Materi yang ditambahkan akan menjadi Materi Sistem</p>
            </div>

            <div className="space-y-6">
                {/* Info Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">info</span>
                        Informasi Dasar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelas *</label>
                            <select value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <option value="">Pilih Kelas</option>
                                <option value="X">Kelas X</option>
                                <option value="XI">Kelas XI</option>
                                <option value="XII">Kelas XII</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bab *</label>
                            <select value={formData.chapter} onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <option value="">Pilih Bab</option>
                                {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Judul Materi *</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estimasi Waktu (Menit)</label>
                            <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
                        </div>
                    </div>
                </div>

                {/* Main Media Upload */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <label className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">play_circle</span>
                        Media Utama (Video / Gambar) (Opsional)
                    </label>
                    <div className="flex gap-3">
                        <input type="url" value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="Tempel URL Video/Gambar atau upload file..."
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-purple-500 outline-none" />
                        <div className="relative">
                            <button type="button" disabled={isUploadingVideo} className="h-full px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">{isUploadingVideo ? 'hourglass_empty' : 'upload_file'}</span>
                                {isUploadingVideo ? 'Mengunggah...' : 'Pilih File'}
                            </button>
                            <input type="file" accept="video/*,image/*" disabled={isUploadingVideo}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    setIsUploadingVideo(true)
                                    try {
                                        const res = await uploadApi.uploadImage(file)
                                        setFormData({ ...formData, videoUrl: res.url })
                                    } catch (error: any) {
                                        alert('Gagal mengunggah media: ' + error.message)
                                    } finally {
                                        setIsUploadingVideo(false)
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                {/* PDF/Doc Upload */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <label className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">attach_file</span>
                        Lampiran Dokumen (PDF/Word) (Opsional)
                    </label>
                    <div className="flex gap-3">
                        <input type="url" value={formData.pdfUrl}
                            onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                            placeholder="Tempel URL Dokumen atau upload file..."
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-purple-500 outline-none" />
                        <div className="relative">
                            <button type="button" disabled={isUploadingPdf} className="h-full px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">{isUploadingPdf ? 'hourglass_empty' : 'upload_file'}</span>
                                {isUploadingPdf ? 'Mengunggah...' : 'Pilih File'}
                            </button>
                            <input type="file" accept=".pdf,.doc,.docx" disabled={isUploadingPdf}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    setIsUploadingPdf(true)
                                    try {
                                        const res = await uploadApi.uploadImage(file)
                                        setFormData({ ...formData, pdfUrl: res.url })
                                    } catch (error: any) {
                                        alert('Gagal mengunggah dokumen: ' + error.message)
                                    } finally {
                                        setIsUploadingPdf(false)
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                {/* Content Editor */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">article</span>
                            Konten Materi
                        </h2>
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                            <button onClick={() => setActiveTab('edit')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'edit' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>✏️ Editor</button>
                            <button onClick={() => setActiveTab('preview')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'preview' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>👁️ Preview</button>
                        </div>
                    </div>

                    {activeTab === 'edit' ? (
                        <>
                            <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <button type="button" onClick={() => insertLatex('# ')} className="px-3 py-1.5 rounded-lg hover:bg-slate-200 font-bold">H1</button>
                                <button type="button" onClick={() => insertLatex('## ')} className="px-3 py-1.5 rounded-lg hover:bg-slate-200 font-bold">H2</button>
                                <button type="button" onClick={() => insertLatex('**teks**')} className="px-3 py-1.5 rounded-lg hover:bg-slate-200 font-bold">B</button>
                                <div className="w-px bg-slate-300 dark:bg-slate-600"></div>
                                {latexButtons.map(btn => (
                                    <button key={btn.label} type="button" onClick={() => insertLatex(btn.value)} className="px-2 py-1.5 rounded-lg hover:bg-purple-100 text-purple-700 text-sm font-mono">{btn.label}</button>
                                ))}
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2" />
                                
                                {/* Image to Markdown Upload */}
                                <div className="relative">
                                    <button type="button" disabled={isUploadingImageContent} className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">
                                        <span className="material-symbols-outlined text-sm">{isUploadingImageContent ? 'hourglass_empty' : 'add_photo_alternate'}</span>
                                        {isUploadingImageContent ? 'Upload...' : 'Sisipkan Gambar'}
                                    </button>
                                    <input type="file" accept="image/*" disabled={isUploadingImageContent}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            setIsUploadingImageContent(true)
                                            try {
                                                const res = await uploadApi.uploadImage(file)
                                                const imageMarkdown = `\n![Gambar](${res.url})\n`
                                                insertLatex(imageMarkdown)
                                            } catch (error: any) {
                                                alert('Gagal mengunggah gambar: ' + error.message)
                                            } finally {
                                                setIsUploadingImageContent(false)
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                                </div>
                            </div>
                            <textarea id="content-textarea" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Tulis konten materi dengan Markdown + LaTeX..." rows={12}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm" />
                        </>
                    ) : (
                        <div className="min-h-[300px] p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            {formData.content ? <LatexRenderer content={formData.content} /> : <p className="text-slate-400 text-center py-12">Belum ada konten</p>}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 sticky bottom-4">
                    <Link to="/admin/master-data/materials" className="px-4 py-2 text-slate-600 hover:text-slate-900">Batal</Link>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => handleSubmit()} disabled={isSubmitting}
                            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50">
                            💾 Simpan Draft
                        </button>
                        <button type="button" onClick={() => handleSubmit()} disabled={isSubmitting}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2">
                            {isSubmitting ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg><span>Menyimpan...</span></> : <><span className="material-symbols-outlined">publish</span>Simpan & Publikasi</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
