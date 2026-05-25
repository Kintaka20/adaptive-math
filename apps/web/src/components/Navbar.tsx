import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-nav h-20 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>calculate</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AdaptiveMath</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">Features</a>
                        <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">How it Works</a>
                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">For Schools</a>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-primary px-4 py-2 transition-colors dark:text-white">
                            Log in
                        </Link>
                        <button className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
                        >
                            <span className="material-symbols-outlined">
                                {isMobileMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 py-4 px-4 shadow-lg">
                        <div className="flex flex-col gap-4">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">Features</a>
                            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">How it Works</a>
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">For Schools</a>
                            <hr className="border-slate-200 dark:border-slate-700" />
                            <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-primary transition-colors dark:text-white">
                                Log in
                            </Link>
                            <button className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all w-full">
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
