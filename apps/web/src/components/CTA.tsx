export default function CTA() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
            <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600"></div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>

                <div className="relative z-10 py-16 px-8 text-center">
                    <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                        Ready to improve your grades?
                    </h2>
                    <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
                        Join the AI revolution in education. Start your free trial today and experience the difference of personalized tutoring.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="bg-white text-primary text-lg font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-slate-50 hover:shadow-2xl hover:-translate-y-1 transition-all">
                            Get Started Now
                        </button>
                        <button className="bg-primary-dark/30 backdrop-blur-md text-white border border-white/20 text-lg font-bold px-8 py-4 rounded-xl hover:bg-primary-dark/50 transition-all">
                            Schedule Demo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
