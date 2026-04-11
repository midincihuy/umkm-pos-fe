import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  ArrowRight, BarChart2, Wallet, ArrowLeftRight, CreditCard, PiggyBank,
  HandCoins, RefreshCw,
  TrendingUp, Shield, Zap, CheckCircle, Sprout,
  BarChart3, ArrowUpDown, LayoutDashboard,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { theme } from '../lib/theme'

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Section({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} style={style} className={cn('transition-all duration-700', inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8', className)}>
      {children}
    </div>
  )
}

function AnimatedStat({ value, label, prefix = '' }: { value: string; label: string; prefix?: string }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={cn('text-center transition-all duration-700', inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
      <p className={cn('font-display text-4xl font-bold mb-1', theme.statsHeadingText)}>{prefix}{value}</p>
      <p className={cn('text-sm', theme.statsBodyText)}>{label}</p>
    </div>
  )
}
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
]
// ── Tooltip wrapper (hanya muncul saat sidebar collapsed) ─────────────────────
function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="
        pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
        px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap
        opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150
        shadow-lg
      ">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
      </div>
    </div>
  )
}
// const [sidebarOpen,  setSidebarOpen]  = useState(false)   // desktop collapse state
const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {navGroups.map(group => (
          <div key={group.label} className={cn(collapsed ? 'px-2' : 'px-3')}>
            {/* Group label — hide when collapsed */}
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
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
                    key={'#'}
                    to={'#'}
                    className={({ isActive }) => cn(
                      'flex items-center rounded-xl transition-all duration-150 group',
                      collapsed
                        ? 'justify-center w-10 h-10 mx-auto'
                        : 'gap-3 px-3 py-2.5',
                      isActive
                        ? 'bg-gradient-to-r from-brand-500/10 to-ocean-400/10 text-brand-600'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={17}
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            isActive ? 'text-brand-500' : 'group-hover:text-gray-700',
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="font-body text-sm font-medium">{label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
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

    </div>
  )
// ── Dashboard Mockup ──────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      <div className="rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.12),0_20px_40px_rgba(0,0,0,0.08)]" style={{ border: `1px solid ${theme.mockupChromeBorder}` }}>
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: theme.mockupChromeBg, borderColor: theme.mockupChromeBorder }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full" style={{ background: theme.heroDotColor }} />
          </div>
          <div className="flex-1 mx-4 rounded-md px-3 py-1 text-xs font-mono" style={{ background: theme.mockupUrlBg, color: theme.mockupUrlText }}>
            dompet.midin.my.id/dashboard
          </div>
        </div>

        {/* App shell */}
        <div className="flex" style={{ height: '380px', background: theme.mockupAppBg }}>

          {/* Sidebar */}
          <SidebarContent collapsed={true} />

          {/* Main */}
          <div className="flex-1 p-5 overflow-hidden">
            <p className={cn('text-xs mb-0.5', theme.accentText, 'opacity-60')}>Maret 2025</p>
            <p className="text-base font-bold text-gray-900 mb-4">Halo, Budi 👋</p>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Pemasukan',    val: 'Rp8,2jt',  slot: theme.statPositive, icon: '📈' },
                { label: 'Pengeluaran', val: 'Rp5,1jt',  slot: theme.statNegative, icon: '📉' },
                { label: 'Surplus',     val: 'Rp3,1jt',  slot: theme.statNeutral,  icon: '✨' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm" style={{ border: `1px solid ${theme.mockupChromeBorder}` }}>
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-sm mb-2', s.slot.iconBg)}>{s.icon}</div>
                  <p className="text-[9px] text-gray-400">{s.label}</p>
                  <p className="text-xs font-bold text-gray-900 font-mono">{s.val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-3 bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: `1px solid ${theme.mockupChromeBorder}` }}>
                <div className="px-3 py-2 flex justify-between" style={{ borderBottom: `1px solid ${theme.mockupChromeBorder}` }}>
                  <p className="text-[10px] font-semibold text-gray-700">Transaksi Terbaru</p>
                  <p className={cn('text-[9px]', theme.linkText)}>Lihat semua →</p>
                </div>
                {[
                  { icon: '🍽️', name: 'Makan siang', cat: 'Makanan',  amt: '-Rp45.000',    pos: false },
                  { icon: '💰', name: 'Gaji Maret',  cat: 'Gaji',     amt: '+Rp8.200.000', pos: true },
                  { icon: '📱', name: 'Netflix',     cat: 'Langganan', amt: '-Rp54.000',   pos: false },
                ].map(tx => (
                  <div key={tx.name} className="flex items-center gap-2 px-3 py-2">
                    <span className="text-sm">{tx.icon}</span>
                    <div className="flex-1 min-w-0"><p className="text-[10px] font-semibold text-gray-700 truncate">{tx.name}</p><p className="text-[9px] text-gray-400">{tx.cat}</p></div>
                    <p className={cn('text-[10px] font-mono font-bold', tx.pos ? theme.txIncomeText : theme.txExpenseText)}>{tx.amt}</p>
                  </div>
                ))}
              </div>
              <div className="col-span-2 bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: `1px solid ${theme.mockupChromeBorder}` }}>
                <div className="px-3 py-2" style={{ borderBottom: `1px solid ${theme.mockupChromeBorder}` }}><p className="text-[10px] font-semibold text-gray-700">Rekening</p></div>
                {[{ icon: '🏦', name: 'BCA', bal: 'Rp28,3jt' }, { icon: '👛', name: 'Tunai', bal: 'Rp1,2jt' }, { icon: '📱', name: 'GoPay', bal: 'Rp450rb' }].map(acc => (
                  <div key={acc.name} className="flex items-center gap-2 px-3 py-2"><span className="text-xs">{acc.icon}</span><p className="flex-1 text-[10px] text-gray-600">{acc.name}</p><p className="text-[10px] font-mono font-bold text-gray-800">{acc.bal}</p></div>
                ))}
                <div className={cn('mx-2 mb-2 p-2 rounded-lg', theme.bannerBg)}>
                  <p className="text-[9px] text-gray-400">Net Worth</p>
                  <p className={cn('text-xs font-bold font-mono', theme.bannerText)}>Rp42.500.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className={cn('absolute -left-8 top-16 rounded-2xl px-4 py-3 animate-float hidden md:block', theme.floatBadgeBg)}
        style={{ border: theme.floatBadgeBorder, boxShadow: theme.floatBadgeShadow }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: theme.floatIconBg }}>
            <TrendingUp size={14} className={theme.accentText} />
          </div>
          <div>
            <p className={cn('text-xs font-bold', theme.sectionHeadText)}>Surplus Bulan Ini</p>
            <p className={cn('text-sm font-mono font-bold', theme.accentText)}>+Rp3.100.000</p>
          </div>
        </div>
      </div>
      <div className={cn('absolute -right-8 bottom-20 rounded-2xl px-4 py-3 animate-float hidden md:block', theme.floatBadgeBg)}
        style={{ border: theme.floatBadgeBorder, boxShadow: theme.floatBadgeShadow, animationDelay: '2s' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: theme.floatIconBg }}>
            <PiggyBank size={14} className={theme.linkText} />
          </div>
          <div>
            <p className={cn('text-xs font-bold', theme.sectionHeadText)}>Budget Aman</p>
            <p className={cn('text-xs', theme.linkText)}>82% terealisasi</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reports Mockup ─────────────────────────────────────────────────────────────
function ReportsMockup() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg w-full" style={{ background: theme.mockupAppBg, border: `1px solid ${theme.mockupChromeBorder}` }}>
      <div className="bg-white px-5 py-4" style={{ borderBottom: `1px solid ${theme.mockupChromeBorder}` }}>
        <p className={cn('font-bold text-sm', theme.sectionHeadText)}>Laporan — Maret 2025</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pemasukan',  bg: theme.txIncomeBg,   text: theme.txIncomeText,   val: 'Rp8,2jt' },
            { label: 'Pengeluaran', bg: theme.txExpenseBg,  text: theme.txExpenseText,  val: 'Rp5,1jt' },
            { label: 'Surplus',   bg: theme.bannerBg,     text: theme.bannerText,     val: 'Rp3,1jt' },
          ].map(k => (
            <div key={k.label} className={cn('rounded-xl p-3 border border-white', k.bg)}>
              <p className="text-xs text-gray-400">{k.label}</p>
              <p className={cn('font-mono font-bold text-sm', k.text)}>{k.val}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-4" style={{ border: `1px solid ${theme.mockupChromeBorder}` }}>
          <p className="text-xs font-semibold text-gray-600 mb-3">Trend 6 Bulan</p>
          <div className="flex items-end gap-2" style={{ height: '80px' }}>
            {[{ inc: 70, exp: 55 }, { inc: 85, exp: 60 }, { inc: 65, exp: 70 }, { inc: 90, exp: 50 }, { inc: 75, exp: 65 }, { inc: 100, exp: 62 }].map((b, i) => (
              <div key={i} className="flex-1 flex items-end gap-0.5" style={{ height: '100%' }}>
                <div className="flex-1 rounded-t-sm" style={{ height: `${b.inc * 0.8}px`, background: theme.heroDotColor, opacity: i === 5 ? 1 : 0.5 }} />
                <div className="flex-1 rounded-t-sm bg-red-300" style={{ height: `${b.exp * 0.8}px`, opacity: i === 5 ? 1 : 0.5 }} />
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: theme.heroDotColor }} /><p className="text-[9px] text-gray-400">Pemasukan</p></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-300" /><p className="text-[9px] text-gray-400">Pengeluaran</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ border: `1px solid ${theme.mockupChromeBorder}` }}>
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="12" fill="none" stroke={theme.mockupUrlBg} strokeWidth="6" />
              <circle cx="18" cy="18" r="12" fill="none" stroke={theme.heroDotColor} strokeWidth="6" strokeDasharray="45 55" strokeLinecap="round" />
              <circle cx="18" cy="18" r="12" fill="none" stroke={theme.starFill} strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-45" strokeLinecap="round" />
              <circle cx="18" cy="18" r="12" fill="none" stroke={theme.mockupUrlText} strokeWidth="6" strokeDasharray="18 82" strokeDashoffset="-70" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 space-y-1.5">
            {[{ label: 'Makanan', pct: '45%' }, { label: 'Transport', pct: '25%' }, { label: 'Hiburan', pct: '18%' }].map((item, i) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i === 0 ? theme.heroDotColor : i === 1 ? theme.starFill : theme.mockupUrlText }} />
                <p className="text-[10px] text-gray-600 flex-1">{item.label}</p>
                <p className="text-[10px] font-mono font-bold text-gray-700">{item.pct}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Budget Mockup ──────────────────────────────────────────────────────────────
function BudgetMockup() {
  const items = [
    { label: 'Makanan & Minuman', icon: '🍽️', pct: 72,  plan: 'Rp2.000.000', actual: 'Rp1.440.000', status: 'safe' },
    { label: 'Transport',         icon: '🚗', pct: 95,  plan: 'Rp800.000',   actual: 'Rp760.000',   status: 'warning' },
    { label: 'Langganan',         icon: '📱', pct: 110, plan: 'Rp500.000',   actual: 'Rp550.000',   status: 'over' },
    { label: 'Belanja',           icon: '🛒', pct: 40,  plan: 'Rp1.200.000', actual: 'Rp480.000',   status: 'safe' },
  ]
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg w-full" style={{ background: theme.mockupAppBg, border: `1px solid ${theme.mockupChromeBorder}` }}>
      <div className="bg-white px-5 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${theme.mockupChromeBorder}` }}>
        <p className={cn('font-bold text-sm', theme.sectionHeadText)}>Budget Maret 2025</p>
        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', theme.badgeBg, theme.badgeText)}>4 kategori</span>
      </div>
      <div className="p-4 space-y-3">
        {items.map(item => (
          <div key={item.label} className="bg-white rounded-xl p-3" style={{ border: `1px solid ${theme.mockupChromeBorder}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{item.icon}</span>
              <p className={cn('text-xs font-semibold flex-1', theme.sectionHeadText)}>{item.label}</p>
              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-bold',
                item.status === 'safe' ? cn(theme.badgeBg, theme.badgeText) :
                item.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
              )}>
                {item.status === 'safe' ? 'Aman' : item.status === 'warning' ? 'Hampir' : 'Melebihi'}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: theme.mockupUrlBg }}>
              <div className="h-full rounded-full" style={{
                width: `${Math.min(item.pct, 100)}%`,
                background: item.status === 'safe' ? theme.heroDotColor : item.status === 'warning' ? '#d97706' : '#dc2626',
              }} />
            </div>
            <div className="flex justify-between"><p className="text-[9px] text-gray-400">Aktual: {item.actual}</p><p className="text-[9px] text-gray-400">Plan: {item.plan}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: BarChart2, title: 'Laporan Visual', desc: 'Grafik trend 6–12 bulan, breakdown pengeluaran per kategori dengan donut chart, dan ringkasan net worth secara real-time.', mockup: <ReportsMockup /> },
  { icon: PiggyBank, title: 'Budget Cerdas',  desc: 'Atur batas pengeluaran per kategori tiap bulan. Sistem otomatis memperingatkan saat mendekati atau melebihi budget.',      mockup: <BudgetMockup /> },
]
const MINI = [
  { icon: ArrowLeftRight, emoji: '↔️', title: 'Transfer Antar Rekening', desc: 'Pindahkan saldo dengan mudah, termasuk pencatatan biaya admin.' },
  { icon: HandCoins,      emoji: '🤝', title: 'Hutang & Piutang',         desc: 'Lacak pinjaman dengan progress cicilan, jatuh tempo, dan status lunas.' },
  { icon: Wallet,         emoji: '🏦', title: 'Multi Rekening',           desc: 'Bank, tunai, e-wallet, investasi — semua di satu tempat.' },
  { icon: RefreshCw,      emoji: '⚖️', title: 'Rekonsiliasi Saldo',       desc: 'Cocokkan saldo sistem dengan rekening koran. Selisih dicatat otomatis.' },
  { icon: Shield,         emoji: '🔒', title: 'Login Aman via Google',    desc: 'Autentikasi Google OAuth + Supabase JWT. Data kamu terenkripsi.' },
  { icon: Zap,            emoji: '⚡', title: 'Cepat & Responsif',        desc: 'Dibuat dengan React + Go. Ringan, cepat, nyaman di HP maupun desktop.' },
]

// ── Sub-components ────────────────────────────────────────────────────────────
function FeatureCard({ feat, index }: { feat: typeof FEATURES[number]; index: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={cn('grid md:grid-cols-2 gap-12 items-center transition-all duration-700', inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}>
      <div className={cn(index % 2 === 1 ? 'md:order-2' : '')}>
        <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-6 text-sm font-semibold', theme.badgeBg, theme.badgeBorder, theme.accentText)}>
          <feat.icon size={16} />{feat.title}
        </div>
        <h3 className={cn('font-display font-bold text-3xl mb-4', theme.sectionHeadText)}>{feat.title}</h3>
        <p className={cn('text-lg leading-relaxed', theme.sectionBodyText)}>{feat.desc}</p>
      </div>
      <div className={cn(index % 2 === 1 ? 'md:order-1' : '')}>{feat.mockup}</div>
    </div>
  )
}

function MiniCard({ f, index }: { f: typeof MINI[number]; index: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={cn('p-6 rounded-2xl border transition-all duration-300 cursor-default', theme.miniCardBg, theme.miniCardBorder, theme.miniCardHover, inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}
      style={{ transitionDelay: `${index * 60}ms` }}>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4', theme.badgeBg)}>{f.emoji}</div>
      <h4 className={cn('font-display font-bold text-base mb-2', theme.sectionHeadText)}>{f.title}</h4>
      <p className={cn('text-sm leading-relaxed', theme.sectionBodyText)}>{f.desc}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()

  const goToLogin = () => navigate('/login')

  return (
    <div className="min-h-screen font-body" style={{ background: theme.heroBg }}>

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-60 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-40" style={{ background: theme.heroGlow1 }} />
        <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full blur-[130px] opacity-30" style={{ background: theme.heroGlow2 }} />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full blur-[110px] opacity-20" style={{ background: theme.heroGlow3 }} />
        <div className="absolute inset-0 opacity-[0.3]" style={{
          backgroundImage: `radial-gradient(circle, ${theme.heroDotColor} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 backdrop-blur-md"
        style={{ background: `${theme.heroBg}ee`, borderBottom: `1px solid ${theme.mockupChromeBorder}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: theme.logoBg }}>
            <Wallet size={17} className="text-white" />
          </div>
          <span className={cn('font-display font-bold text-lg', theme.heroHeadingText)}>Dompet Keluargaku</span>
        </div>
        <div className={cn('hidden md:flex items-center gap-8 text-sm', theme.sectionBodyText)}>
          {[['#fitur', 'Fitur'], ['#testimoni', 'Testimoni'], ['#mulai', 'Mulai']].map(([h, l]) => (
            <a key={h} href={h} className={cn('transition-colors', theme.navHoverText)}>{l}</a>
          ))}
        </div>
        <button onClick={goToLogin}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-sm"
          style={{ background: theme.btnBg }}>
          Masuk <ArrowRight size={15} />
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 px-6 md:px-16 pt-20 pb-12 max-w-7xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-8 animate-fade-up">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border"
            style={{ background: theme.heroBadgeBg, color: theme.heroBadgeText, borderColor: theme.heroBadgeBorder }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.heroDotColor }} />
            Gratis selamanya untuk kebutuhan pribadi
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className={cn('font-display font-bold text-5xl md:text-7xl leading-tight tracking-tight animate-fade-up', theme.heroHeadingText)}
            style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
            Kendalikan{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-clip-text text-transparent" style={{ backgroundImage: theme.heroAccentGrad }}>
                Keuangan
              </span>
              <span className="absolute inset-x-0 bottom-0 h-3 -z-0 rounded-sm opacity-20" style={{ background: theme.heroUnderline }} />
            </span>{' '}
            Rumah Tangga
          </h1>
          <p className={cn('mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-up', theme.heroBodyText)}
            style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
            Dompet Keluargaku membantu kamu mencatat pemasukan & pengeluaran, mengatur budget, melacak hutang, dan memvisualisasikan kondisi keuangan keluarga — semua dalam satu aplikasi.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up"
          style={{ animationDelay: '180ms', animationFillMode: 'both' }}>
          <button onClick={goToLogin}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:-translate-y-0.5"
            style={{ background: theme.btnBg, boxShadow: theme.btnShadow }}>
            Daftar Sekarang — Gratis
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <a href="#fitur"
            className={cn('flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm transition-all', theme.btnOutlineText, theme.btnOutlineHover)}
            style={{ border: `1px solid ${theme.mockupChromeBorder}`, background: 'rgba(255,255,255,0.5)' }}>
            Lihat Fitur ↓
          </a>
        </div>

        {/* Social proof */}
        <div className={cn('flex items-center justify-center gap-6 text-xs mb-20 animate-fade-up', theme.sectionBodyText)}
          style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
          {['Tanpa kartu kredit', 'Login dengan Google', 'Data terenkripsi'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle size={13} className={theme.accentText} /><span>{t}</span>
            </div>
          ))}
        </div>

        {/* Mockup */}
        <div className="animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <DashboardMockup />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <Section className={cn('relative z-10 py-20 px-6', theme.statsBg, theme.statsBorder)}
        style={{ borderTopWidth: '1px', borderBottomWidth: '1px', borderStyle: 'solid' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <AnimatedStat value="100%" label="Gratis untuk personal" />
          <AnimatedStat value="10+"  label="Fitur lengkap" />
          <AnimatedStat value="<1s"  label="Waktu respons API" />
          <AnimatedStat value="SSL"  label="Enkripsi end-to-end" prefix="🔒 " />
        </div>
      </Section>

      {/* ── Features ── */}
      <section id="fitur" className="relative z-10 px-6 md:px-16 py-24 max-w-7xl mx-auto">
        <Section className="text-center mb-16">
          <p className={cn('text-sm font-bold uppercase tracking-widest mb-4', theme.sectionLabelText)}>Fitur Unggulan</p>
          <h2 className={cn('font-display font-bold text-4xl md:text-5xl mb-4', theme.sectionHeadText)}>Semua yang kamu butuhkan</h2>
          <p className={cn('text-lg max-w-xl mx-auto', theme.sectionBodyText)}>Dari pencatatan harian hingga analisis bulanan — Dompet Keluargaku punya semua fitur yang kamu butuhkan.</p>
        </Section>
        <div className="space-y-24">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} feat={f} index={i} />)}
        </div>
        <div className="mt-24 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {MINI.map((f, i) => <MiniCard key={f.title} f={f} index={i} />)}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="mulai" className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[110px] opacity-15 pointer-events-none"
          style={{ background: theme.ctaGlow }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Section>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border mb-8"
              style={{ background: theme.heroBadgeBg, color: theme.heroBadgeText, borderColor: theme.heroBadgeBorder }}>
              🚀 Mulai dalam 30 detik
            </div>
            <h2 className={cn('font-display font-bold text-5xl md:text-6xl mb-6 leading-tight', theme.ctaHeadText)}>
              Mulai catat keuangan<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: theme.heroAccentGrad }}>
                kamu hari ini
              </span>
            </h2>
            <p className={cn('text-lg mb-10 max-w-xl mx-auto', theme.ctaBodyText)}>
              Gratis selamanya untuk penggunaan personal. Tidak perlu kartu kredit. Cukup login dengan Google dan langsung mulai.
            </p>
            <button onClick={goToLogin}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-lg transition-all hover:-translate-y-1"
              style={{ background: theme.btnBg, boxShadow: theme.btnShadow }}>
              Daftar Sekarang — Gratis
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className={cn('flex items-center justify-center gap-6 mt-8 text-xs', theme.sectionBodyText, 'opacity-60')}>
              {['Login Google dalam 1 klik', 'Tidak ada iklan', 'Data tersimpan aman'].map(t => (
                <div key={t} className="flex items-center gap-1.5"><CheckCircle size={13} className={theme.accentText} /><span>{t}</span></div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={cn('relative z-10 px-6 md:px-16 py-10', theme.footerBg)}
        style={{ borderTop: `1px solid ${theme.mockupChromeBorder}` }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: theme.logoBg }}>
                <Wallet size={13} className="text-white" />
              </div>
              <span className={cn('font-display font-bold', theme.heroHeadingText)}>Dompet Keluargaku</span>
            </div>
            <p className={cn('text-sm', theme.footerText)}>© {new Date().getFullYear()} Dompet Keluargaku. Dibuat dengan ❤️ untuk keluarga Indonesia.</p>
            <div className={cn('flex items-center gap-2', theme.footerText)}>
              <Sprout size={13} className={theme.accentText} />
              <span className="text-xs">Catat · Analisis · Kontrol</span>
            </div>
          </div>
          {/* Support email */}
          <div className="flex justify-center">
            <a
              href="mailto:dompet@midin.my.id"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all',
                'hover:opacity-80',
                theme.badgeBg, theme.badgeText,
              )}
              style={{ border: `1px solid ${theme.mockupChromeBorder}` }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Butuh bantuan? Hubungi kami di dompet@midin.my.id
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}