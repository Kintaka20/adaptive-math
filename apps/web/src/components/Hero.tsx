export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[100px] opacity-50"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 border border-primary/20">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            NEW: AI Socratic Tutor 2.0
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
                            Belajar Matematika Lebih{' '}
                            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                                CERDAS
                            </span>{' '}
                            dengan AI Personal Tutor
                        </h1>

                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Personalized learning paths that adapt to your pace. Join thousands of students mastering algebra, calculus, and geometry today with our AI-driven platform.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <button className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-glow hover:scale-[1.02] flex items-center justify-center gap-2 group">
                                Start Learning for Free
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                            <button className="w-full sm:w-auto h-12 px-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:border-slate-300 shadow-sm">
                                <span className="material-symbols-outlined">school</span>
                                For Schools
                            </button>
                        </div>

                        <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
                            <div className="flex -space-x-2">
                                <div
                                    className="size-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500"
                                    title="User avatar 1"
                                ></div>
                                <div
                                    className="size-8 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-teal-500"
                                    title="User avatar 2"
                                ></div>
                                <div
                                    className="size-8 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-red-500"
                                    title="User avatar 3"
                                ></div>
                            </div>
                            <p>Trusted by 10,000+ students</p>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="flex-1 w-full relative">
                        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                            {/* Decorative blurred blob behind image */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-blue-300/30 rounded-full blur-3xl transform scale-90"></div>

                            {/* Main 3D Illustration */}
                            <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white/20 backdrop-blur-sm">
                                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center relative overflow-hidden">
                                    {/* Floating Math Icons */}
                                    <div className="absolute top-10 right-10 text-primary/20 animate-bounce">
                                        <span className="material-symbols-outlined text-6xl">functions</span>
                                    </div>
                                    <div className="absolute bottom-20 left-10 text-purple-400/30 animate-pulse">
                                        <span className="material-symbols-outlined text-5xl">calculate</span>
                                    </div>
                                    <div className="absolute top-1/2 left-10 text-blue-400/20 rotate-12">
                                        <span className="text-4xl font-bold">π</span>
                                    </div>

                                    {/* Central Figure Representation */}
                                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-white/60 relative z-20 max-w-[280px]">
                                        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                                            <span className="material-symbols-outlined text-4xl">smart_toy</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">AI Tutor</div>
                                            <div className="text-slate-800 font-bold text-lg">Solving Quadratic Eq...</div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                            <div className="bg-primary h-2 rounded-full w-[75%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card Element */}
                            <div className="absolute -bottom-6 -right-6 z-20 bg-white p-4 rounded-xl shadow-card-hover border border-slate-100 hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold">Daily Goal</p>
                                        <p className="text-sm font-bold text-slate-900">Completed!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
