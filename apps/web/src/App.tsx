import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, ProtectedRoute } from './contexts/AuthContext'

import LandingPage from './pages/LandingPage'

import LoginPage from './pages/auth/LoginPage'
import RegisterStudentPage from './pages/auth/RegisterStudentPage'
import RegisterTeacherPage from './pages/auth/RegisterTeacherPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

import StudentDashboard from './pages/student/StudentDashboard'
import LearningPathPage from './pages/student/LearningPathPage'
import AITutorPage from './pages/student/AITutorPage'
import RankingPage from './pages/student/RankingPage'
import QuizPage from './pages/student/QuizPage'
import MaterialPage from './pages/student/MaterialPage'
import QuizResultPage from './pages/student/QuizResultPage'
import ProfilePage from './pages/student/ProfilePage'
import ChatHistoryPage from './pages/student/ChatHistoryPage'

import TeacherDashboard from './pages/teacher/TeacherDashboard'
import BankSoalPage from './pages/teacher/BankSoalPage'
import TambahSoalPage from './pages/teacher/TambahSoalPage'
import EditSoalPage from './pages/teacher/EditSoalPage'
import MonitoringPage from './pages/teacher/MonitoringPage'
import AuditPage from './pages/teacher/AuditPage'
import AuditDetailPage from './pages/teacher/AuditDetailPage'
import KelasPage from './pages/teacher/KelasPage'
import KelasDetailPage from './pages/teacher/KelasDetailPage'
import CreateKelasPage from './pages/teacher/CreateKelasPage'
import AssignBabPage from './pages/teacher/AssignBabPage'
import KKMSettingsPage from './pages/teacher/KKMSettingsPage'
import StrugglePage from './pages/teacher/StrugglePage'
import StudentDetailPage from './pages/teacher/StudentDetailPage'
import ReviewContentPage from './pages/teacher/ReviewContentPage'
import TeacherProfilePage from './pages/teacher/TeacherProfilePage'
import BankMateriPage from './pages/teacher/BankMateriPage'
import TambahMateriPage from './pages/teacher/TambahMateriPage'
import ContentEditorPage from './pages/teacher/ContentEditorPage'

import NotificationPage from './pages/shared/NotificationPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import UsersPage from './pages/admin/UsersPage'
import MasterDataPage from './pages/admin/MasterDataPage'
import CurriculumPage from './pages/admin/CurriculumPage'
import ChapterContentPage from './pages/admin/ChapterContentPage'
import MaterialEditorPage from './pages/admin/MaterialEditorPage'
import QuizEditorPage from './pages/admin/QuizEditorPage'
import AllMaterialsPage from './pages/admin/AllMaterialsPage'
import AllQuestionsPage from './pages/admin/AllQuestionsPage'
import AdminTambahSoalPage from './pages/admin/AdminTambahSoalPage'
import AdminEditSoalPage from './pages/admin/AdminEditSoalPage'
import AdminTambahMateriPage from './pages/admin/AdminTambahMateriPage'
import AdminContentEditorPage from './pages/admin/AdminContentEditorPage'
import ApiLogsPage from './pages/admin/ApiLogsPage'
import SchoolManagementPage from './pages/admin/SchoolManagementPage'
import SchoolDetailPage from './pages/admin/SchoolDetailPage'

import NotFoundPage from './pages/errors/NotFoundPage'
import UnauthorizedPage from './pages/errors/UnauthorizedPage'

import DashboardLayout from './components/layouts/DashboardLayout'

function App() {
    const { user } = useAuth()

    return (
            <Routes>
                {/* Public Pages */}
                <Route path="/" element={
                    user
                        ? <Navigate to={user.role === 'STUDENT' ? '/siswa' : user.role === 'TEACHER' ? '/guru' : '/admin'} replace />
                        : <LandingPage />
                } />

                {/* Auth Pages — redirect to dashboard if already logged in */}
                <Route path="/login" element={user ? <Navigate to={user.role === 'STUDENT' ? '/siswa' : user.role === 'TEACHER' ? '/guru' : '/admin'} replace /> : <LoginPage />} />
                <Route path="/register" element={user ? <Navigate to="/siswa" replace /> : <RegisterStudentPage />} />
                <Route path="/register/teacher" element={user ? <Navigate to="/guru" replace /> : <RegisterTeacherPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Student Dashboard Routes */}
                <Route path="/siswa" element={<ProtectedRoute allowedRoles={['STUDENT']}><DashboardLayout role="student" userName={user?.name ?? ''} /></ProtectedRoute>}>
                    <Route index element={<StudentDashboard />} />
                    <Route path="belajar" element={<LearningPathPage />} />
                    <Route path="belajar/:chapterId/lesson/:lessonId" element={<MaterialPage />} />
                    <Route path="ai-tutor" element={<AITutorPage />} />
                    <Route path="ai-tutor/history/:id" element={<ChatHistoryPage />} />
                    <Route path="ranking" element={<RankingPage />} />
                    <Route path="quiz/:id" element={<QuizPage />} />
                    <Route path="quiz/:id/result" element={<QuizResultPage />} />
                    <Route path="profil" element={<ProfilePage />} />
                    <Route path="notifikasi" element={<NotificationPage />} />
                </Route>

                {/* Teacher Dashboard Routes */}
                <Route path="/guru" element={<ProtectedRoute allowedRoles={['TEACHER']}><DashboardLayout role="teacher" userName={user?.name ?? ''} /></ProtectedRoute>}>
                    <Route index element={<TeacherDashboard />} />
                    <Route path="bank-soal" element={<BankSoalPage />} />
                    <Route path="bank-soal/create" element={<TambahSoalPage />} />
                    <Route path="bank-soal/:id/edit" element={<EditSoalPage />} />
                    <Route path="bank-materi" element={<BankMateriPage />} />
                    <Route path="bank-materi/create" element={<TambahMateriPage />} />
                    <Route path="monitoring" element={<MonitoringPage />} />
                    <Route path="monitoring/struggle" element={<StrugglePage />} />
                    <Route path="monitoring/siswa/:studentId" element={<StudentDetailPage />} />
                    <Route path="audit" element={<AuditPage />} />
                    <Route path="audit/:id" element={<AuditDetailPage />} />
                    <Route path="kelas" element={<KelasPage />} />
                    <Route path="kelas/create" element={<CreateKelasPage />} />
                    <Route path="kelas/:id" element={<KelasDetailPage />} />
                    <Route path="kelas/:id/assign-bab" element={<AssignBabPage />} />
                    <Route path="kelas/:id/kkm" element={<KKMSettingsPage />} />
                    <Route path="kelas/:id/siswa/:studentId" element={<StudentDetailPage />} />
                    <Route path="kelas/:id/content/create" element={<ContentEditorPage />} />
                    <Route path="kelas/:chapterId/content/:contentId/review" element={<ReviewContentPage />} />
                    <Route path="profil" element={<TeacherProfilePage />} />
                    <Route path="notifikasi" element={<NotificationPage />} />
                </Route>

                {/* Admin Dashboard Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout role="admin" userName={user?.name ?? ''} /></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="master-data" element={<MasterDataPage />} />
                    <Route path="master-data/curriculum" element={<CurriculumPage />} />
                    <Route path="master-data/chapters/:id/content" element={<ChapterContentPage />} />
                    <Route path="master-data/chapters/:chapterId/material/:contentId" element={<MaterialEditorPage />} />
                    <Route path="master-data/chapters/:chapterId/quiz/:contentId" element={<QuizEditorPage />} />
                    <Route path="master-data/materials" element={<AllMaterialsPage />} />
                    <Route path="master-data/materials/create" element={<AdminTambahMateriPage />} />
                    <Route path="master-data/questions" element={<AllQuestionsPage />} />
                    <Route path="master-data/questions/create" element={<AdminTambahSoalPage />} />
                    <Route path="master-data/questions/:id/edit" element={<AdminEditSoalPage />} />
                    <Route path="master-data/content/create" element={<AdminContentEditorPage />} />
                    <Route path="api-logs" element={<ApiLogsPage />} />
                    <Route path="sekolah" element={<SchoolManagementPage />} />
                    <Route path="sekolah/:id" element={<SchoolDetailPage />} />
                    <Route path="notifikasi" element={<NotificationPage />} />
                </Route>

                {/* Error Pages */}
                <Route path="/403" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
    )
}

export default App

