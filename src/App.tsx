import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import AccountsPage from './pages/AccountsPage'
import BudgetPage from './pages/BudgetPage'
import ReportsPage from './pages/ReportsPage'
import TransfersPage from './pages/TransfersPage'
import DebtsPage from './pages/DebtsPage'
import CategoriesPage from './pages/CategoriesPage'
import ReconciliationsPage from './pages/ReconciliationsPage'
import OnboardingPage from './pages/OnboardingPage'
import AppLayout from './components/layout/AppLayout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
        <p className="text-sm text-gray-400 font-body">Memuat...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/" element={
            <ProtectedRoute><AppLayout /></ProtectedRoute>
          }>
            <Route path="dashboard"       element={<DashboardPage />} />
            <Route path="transactions"    element={<TransactionsPage />} />
            <Route path="accounts"        element={<AccountsPage />} />
            <Route path="budgets"         element={<BudgetPage />} />
            <Route path="reports"         element={<ReportsPage />} />
            <Route path="transfers"       element={<TransfersPage />} />
            <Route path="debts"           element={<DebtsPage />} />
            <Route path="categories"      element={<CategoriesPage />} />
            <Route path="reconciliations" element={<ReconciliationsPage />} />
            <Route path="spreadsheet"      element={<OnboardingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
