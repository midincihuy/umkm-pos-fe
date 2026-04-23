import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, PiggyBank,
  BarChart3, LogOut, Menu, X, MonitorCheck,
  ArrowUpDown, Tag, HandCoins, RefreshCw, ChevronRight, ChevronLeft,
  FileSpreadsheet
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { theme } from '../../lib/theme'

const navGroups = [
  {
    label: 'Utama',
    items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/transactions', icon: ArrowLeftRight,  label: 'Transaksi' },
      { to: '/reports',      icon: BarChart3,       label: 'Laporan' },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { to: '/accounts',  icon: CreditCard,  label: 'Rekening' },
      { to: '/transfers', icon: ArrowUpDown, label: 'Transfer' },
      { to: '/debts',     icon: HandCoins,   label: 'Hutang & Piutang' },
      { to: '/budgets',   icon: PiggyBank,   label: 'Budget' },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { to: '/categories',      icon: Tag,              label: 'Kategori' },
      { to: '/reconciliations', icon: RefreshCw,        label: 'Rekonsiliasi' },
      { to: '/spreadsheet',     icon: FileSpreadsheet,  label: 'Spreadsheet' },
    ],
  },
]

// ── Tooltip wrapper (hanya muncul saat sidebar collapsed) ─────────────────────
function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className={cn(
        'pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50',
        'px-2.5 py-1.5 rounded-lg text-white text-xs font-medium whitespace-nowrap',
        'opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 shadow-lg',
        theme.tooltipBg,
      )}>
        {label}
        <div className={cn('absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent', `border-r-[inherit]`)} />
      </div>
    </div>
  )
}

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [sidebarOpen,  setSidebarOpen]  = useState(true)   // desktop collapse state

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const avatarUrl    = user?.picture as string | undefined
  const displayName  = (user?.name as string | undefined)
    ?? user?.email?.split('@')[0] ?? 'User'

  // ── Sidebar inner content (shared desktop + mobile) ───────────────────────
  // collapsed=true → icon-only mode (desktop only)
  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* Logo + toggle button */}
      <div className={cn(
        'flex items-center border-b',
        theme.sidebarBorder,
        collapsed ? 'justify-center py-4 px-2' : 'justify-between p-4 pl-5',
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: theme.logoBg }}
            >
              <MonitorCheck size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-gray-900 text-sm leading-none">Point of Sales</h1>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">UMKM</p>
            </div>
          </div>
        )}

        {/* Desktop collapse toggle — hidden on mobile sidebar */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className={cn(
            'hidden md:flex items-center justify-center rounded-xl transition-colors flex-shrink-0',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            collapsed ? 'w-9 h-9' : 'w-7 h-7',
          )}
          title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        >
          {
          collapsed
            ? 
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: theme.logoBg }}
            >
              <MonitorCheck size={15} className="text-white" />
            </div>
            : <ChevronLeft size={15} />
          }
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {navGroups.map(group => (
          <div key={group.label} className={cn(collapsed ? 'px-2' : 'px-3')}>
            {/* Group label — hide when collapsed */}
            {!collapsed && (
              <p className={cn('px-3 mb-1 text-[10px] font-bold uppercase tracking-widest', theme.navGroupLabel)}>
                {group.label}
              </p>
            )}
            {collapsed && (
              <div className="my-1 h-px bg-gray-100" />
            )}

            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => {
                const linkEl = (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => cn(
                      'flex items-center rounded-xl transition-all duration-150 group',
                      collapsed
                        ? 'justify-center w-10 h-10 mx-auto'
                        : 'gap-3 px-3 py-2.5',
                      isActive
                        ? cn(theme.navActiveBg, theme.navActiveText)
                        : cn('text-gray-500', theme.navHoverBg, theme.navHoverText),
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={17}
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            isActive ? theme.navActiveIcon : 'group-hover:text-gray-700',
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="font-body text-sm font-medium">{label}</span>
                            {isActive && <div className={cn('ml-auto w-1.5 h-1.5 rounded-full', theme.navActiveDot)} />}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                )

                return collapsed
                  ? <NavTooltip key={to} label={label}>{linkEl}</NavTooltip>
                  : <div key={to}>{linkEl}</div>
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className={cn('border-t', theme.sidebarBorder, collapsed ? 'p-2' : 'p-3')}>
        {collapsed ? (
          // Icon-only: avatar + logout stacked
          <div className="flex flex-col items-center gap-1">
            <NavTooltip label={displayName}>
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 cursor-default">
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className={cn('w-full h-full object-cover ring-2 rounded-full', theme.avatarRing)} />
                  : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-ocean-400 flex items-center justify-center text-white text-sm font-bold"
                   style={{ background: theme.avatarFallback }}
                  >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                }
              </div>
            </NavTooltip>
            <NavTooltip label="Keluar">
              <button
                onClick={handleSignOut}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
              </button>
            </NavTooltip>
          </div>
        ) : (
          <>
            <div className={cn('flex items-center gap-3 p-3 rounded-xl transition-colors', theme.navHoverBg)}>
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className={cn('w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2', theme.avatarRing)}  />
                : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-ocean-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                   style={{ background: theme.avatarFallback }}
                >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
            >
              <LogOut size={16} /><span className="font-body">Keluar</span>
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className={cn('flex h-screen overflow-hidden', theme.pageBg)}>

      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r flex-shrink-0 shadow-sm',
          'transition-[width] duration-300 ease-in-out overflow-hidden',
          theme.sidebarBg, theme.sidebarBorder,
          sidebarOpen ? 'w-60' : 'w-[60px]',
        )}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* ── Mobile overlay sidebar ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className={cn('absolute left-0 top-0 bottom-0 w-64 shadow-xl overflow-y-auto', theme.sidebarBg)}>
            <div className={cn('flex items-center justify-between p-4 border-b', theme.sidebarBorder)}>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <header className={cn('md:hidden flex items-center gap-3 px-4 py-3 border-b', theme.mobileHeaderBg, theme.sidebarBorder)}>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: theme.logoBg }}
            >
              <MonitorCheck size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-gray-900 text-sm">UMKM POS</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
