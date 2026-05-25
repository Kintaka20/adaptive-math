import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                            <span className="material-symbols-outlined text-primary">calculate</span>
                            <span className="text-xl font-bold">AdaptiveMath</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Empowering students and teachers with AI-driven tools for a smarter, personalized learning experience.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                            >
                                <span className="font-bold text-xs">Fb</span>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                            >
                                <span className="font-bold text-xs">Tw</span>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                            >
                                <span className="font-bold text-xs">In</span>
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Product</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">For Schools</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">For Students</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">AI Research</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Resources</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Case Studies</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Teacher Guide</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p>© 2024 AdaptiveMath Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link>
                        <Link to="/teacher/login" className="hover:text-white transition-colors">Teacher Login</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
