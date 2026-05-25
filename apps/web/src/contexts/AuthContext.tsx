import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '../lib/types'
import { authApi, getToken, setToken, removeToken } from '../lib/api'

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => void
}

interface RegisterData {
    name: string
    email: string
    password: string
    role: 'STUDENT' | 'TEACHER'
    grade?: string
    nip?: string
    schoolId?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setTokenState] = useState<string | null>(getToken())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadUser = async () => {
            const storedToken = getToken()
            if (!storedToken) {
                setIsLoading(false)
                return
            }

            try {
                const userData = await authApi.me()
                setUser(userData)
                setTokenState(storedToken)
            } catch {
                removeToken()
                setTokenState(null)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        loadUser()
    }, [])

    const login = async (email: string, password: string) => {
        const { user: userData, token: newToken } = await authApi.login(email, password)
        setToken(newToken)
        setTokenState(newToken)
        setUser(userData)
    }

    const register = async (data: RegisterData) => {
        const { user: userData, token: newToken } = await authApi.register(data)
        setToken(newToken)
        setTokenState(newToken)
        setUser(userData)
    }

    const logout = () => {
        authApi.logout().catch(() => { }) // fire-and-forget
        removeToken()
        setTokenState(null)
        setUser(null)
        window.location.href = '/login'
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user && !!token,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            navigate('/login', { replace: true })
            return
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            navigate('/403', { replace: true })
        }
    }, [isAuthenticated, isLoading, user, allowedRoles, navigate])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Memuat...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) return null

    if (allowedRoles && user && !allowedRoles.includes(user.role)) return null

    return <>{children}</>
}
