// ─────────────────────────────────────────────────────────────────────────────
// src/lib/theme.ts
//
// ✏️  UBAH HANYA SATU BARIS INI untuk mengganti tema seluruh aplikasi:
//
//     export const ACTIVE_THEME: ThemeName = 'green-lime'
//
// Pilihan tema:
//   'green-lime'  — Lime hijau segar, background terang (aktif sekarang)
//   'purple'      — Ungu + Ocean blue (default asal)
//   'navy-cyan'   — Navy gelap + Cyan elektrik
//   'orange'      — Orange + Kuning hangat
//   'rose'        — Rose pink + putih bersih
//   'earth'       — Terracotta + coklat hangat
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeName = 'green-lime' | 'purple' | 'navy-cyan' | 'orange' | 'rose' | 'earth'

// ✏️ UBAH DI SINI
export const ACTIVE_THEME: ThemeName = 'purple'

// ─────────────────────────────────────────────────────────────────────────────
// Tipe token
// ─────────────────────────────────────────────────────────────────────────────
export interface StatColor {
  iconBg:  string   // Tailwind class untuk gradient box icon
  lightBg: string   // Tailwind class bg muda (badge, hover)
  text:    string   // Tailwind class teks aksen
}

export interface Theme {
  // Layout
  pageBg:           string
  sidebarBg:        string
  sidebarBorder:    string
  mobileHeaderBg:   string

  // Logo
  logoBg:           string   // CSS value (inline style)

  // Nav aktif
  navActiveBg:      string
  navActiveText:    string
  navActiveIcon:    string
  navActiveDot:     string

  // Nav hover
  navHoverBg:       string
  navHoverText:     string

  // Nav group label
  navGroupLabel:    string

  // Avatar
  avatarFallback:   string   // CSS value (inline style)
  avatarRing:       string

  // Tombol utama
  btnBg:            string   // CSS value (inline style)
  btnShadow:        string   // CSS value (inline style)

  // Tombol outline
  btnOutlineBorder: string
  btnOutlineText:   string
  btnOutlineHover:  string

  // StatCard — 5 slot warna
  statPrimary:      StatColor
  statPositive:     StatColor
  statNegative:     StatColor
  statNeutral:      StatColor
  statExtra:        StatColor

  // Badge / pill
  badgeBg:          string
  badgeText:        string
  badgeBorder:      string

  // Input
  inputBorder:      string
  inputFocusBorder: string
  inputFocusRing:   string

  // Teks aksen
  linkText:         string
  accentText:       string

  // Banner (net worth di sidebar, dll)
  bannerBg:         string
  bannerText:       string
  bannerBorder:     string

  // Error state
  errorBg:          string
  errorText:        string
  errorBorder:      string

  // Tipe transaksi
  txIncomeBg:       string
  txIncomeText:     string
  txExpenseBg:      string
  txExpenseText:    string
  txTransferBg:     string
  txTransferText:   string

  // Tooltip sidebar collapsed
  tooltipBg:        string

  // Trend badge (naik/turun)
  trendPosBg:       string
  trendPosText:     string
  trendNegBg:       string
  trendNegText:     string

  // ── Homepage ──────────────────────────────────────────────────────────────
  heroBg:            string   // CSS: background halaman landing
  heroGlow1:         string   // CSS: radial-gradient blob 1
  heroGlow2:         string   // CSS: radial-gradient blob 2
  heroGlow3:         string   // CSS: radial-gradient blob 3
  heroDotColor:      string   // CSS hex: warna dot pattern
  heroHeadingText:   string   // class: warna heading
  heroBodyText:      string   // class: warna teks body
  heroAccentGrad:    string   // CSS: gradient teks aksen headline
  heroUnderline:     string   // CSS: bg garis bawah highlight
  heroBadgeBg:       string   // CSS: badge "Gratis selamanya"
  heroBadgeText:     string   // CSS: warna teks badge
  heroBadgeBorder:   string   // CSS: border badge
  statsBg:           string   // class: bg strip stats
  statsBorder:       string   // class: border atas/bawah stats
  statsHeadingText:  string   // class: warna angka stats
  statsBodyText:     string   // class: warna label stats
  sectionLabelText:  string   // class: label kecil section ("Fitur Unggulan")
  sectionHeadText:   string   // class: h2 section
  sectionBodyText:   string   // class: teks body section
  miniCardBg:        string   // class: bg mini feature card
  miniCardBorder:    string   // class: border mini card
  miniCardHover:     string   // class: hover mini card
  testimonialBg:     string   // CSS: bg section testimoni
  testimonialCardBg: string   // class: bg kartu testimoni
  testimonialBorder: string   // class: border kartu testimoni
  starFill:          string   // CSS hex: fill bintang
  starClass:         string   // class: teks bintang
  dotActive:         string   // CSS: dot carousel aktif
  dotInactive:       string   // CSS: dot carousel non-aktif
  ctaGlow:           string   // CSS: radial-gradient glow CTA
  ctaHeadText:       string   // class: heading CTA
  ctaBodyText:       string   // class: body CTA
  footerBg:          string   // class
  footerBorder:      string   // class
  footerText:        string   // class
  mockupChromeBg:    string   // CSS: bg browser chrome
  mockupChromeBorder:string   // CSS: border chrome
  mockupUrlBg:       string   // CSS: bg URL bar
  mockupUrlText:     string   // CSS: teks URL bar
  mockupAppBg:       string   // CSS: bg app dalam mockup
  floatBadgeBg:      string   // class: bg floating badge
  floatBadgeBorder:  string   // CSS: border floating badge
  floatBadgeShadow:  string   // CSS: shadow floating badge
  floatIconBg:       string   // CSS: bg icon floating badge
}

// ─────────────────────────────────────────────────────────────────────────────
// Semua tema
// ─────────────────────────────────────────────────────────────────────────────
const themes: Record<ThemeName, Theme> = {

  'green-lime': {
    pageBg:           'bg-[#f4fbf0]',
    sidebarBg:        'bg-white',
    sidebarBorder:    'border-[#d4e8c8]',
    mobileHeaderBg:   'bg-white',
    logoBg:           'linear-gradient(135deg, #65a30d, #16a34a)',
    navActiveBg:      'bg-[#f0fae8]',
    navActiveText:    'text-lime-700',
    navActiveIcon:    'text-lime-600',
    navActiveDot:     'bg-lime-600',
    navHoverBg:       'hover:bg-lime-50',
    navHoverText:     'hover:text-lime-900',
    navGroupLabel:    'text-stone-300',
    avatarFallback:   'linear-gradient(135deg, #65a30d, #16a34a)',
    avatarRing:       'ring-[#d4e8c8]',
    btnBg:            'linear-gradient(135deg, #65a30d, #16a34a)',
    btnShadow:        '0 6px 20px rgba(101,163,13,0.28)',
    btnOutlineBorder: 'border-[#c6deb4]',
    btnOutlineText:   'text-lime-700',
    btnOutlineHover:  'hover:bg-lime-50',
    statPrimary:  { iconBg:'bg-gradient-to-br from-lime-600 to-green-700',    lightBg:'bg-[#f0fae8]',  text:'text-lime-700'    },
    statPositive: { iconBg:'bg-gradient-to-br from-green-500 to-emerald-500', lightBg:'bg-emerald-50', text:'text-emerald-600' },
    statNegative: { iconBg:'bg-gradient-to-br from-red-400 to-red-500',       lightBg:'bg-red-50',     text:'text-red-500'     },
    statNeutral:  { iconBg:'bg-gradient-to-br from-lime-500 to-green-500',    lightBg:'bg-[#f0fae8]',  text:'text-lime-600'    },
    statExtra:    { iconBg:'bg-gradient-to-br from-teal-500 to-green-600',    lightBg:'bg-teal-50',    text:'text-teal-600'    },
    badgeBg:          'bg-[#f0fae8]',
    badgeText:        'text-lime-700',
    badgeBorder:      'border-[#c6deb4]',
    inputBorder:      'border-[#d4e8c8]',
    inputFocusBorder: 'focus:border-lime-400',
    inputFocusRing:   'focus:ring-lime-100',
    linkText:         'text-lime-700',
    accentText:       'text-lime-600',
    bannerBg:         'bg-[#f0fae8]',
    bannerText:       'text-lime-700',
    bannerBorder:     'border-[#c6deb4]',
    errorBg:          'bg-red-50',
    errorText:        'text-red-500',
    errorBorder:      'border-red-200',
    txIncomeBg:       'bg-emerald-50',
    txIncomeText:     'text-emerald-600',
    txExpenseBg:      'bg-red-50',
    txExpenseText:    'text-red-500',
    txTransferBg:     'bg-[#f0fae8]',
    txTransferText:   'text-lime-600',
    tooltipBg:        'bg-lime-900',
    trendPosBg:       'bg-emerald-50',
    trendPosText:     'text-emerald-600',
    trendNegBg:       'bg-red-50',
    trendNegText:     'text-red-500',
    heroBg:            '#f4fbf0',
    heroGlow1:         'radial-gradient(circle, #bbf7d0 0%, transparent 70%)',
    heroGlow2:         'radial-gradient(circle, #d9f99d 0%, transparent 70%)',
    heroGlow3:         'radial-gradient(circle, #a3e635 0%, transparent 70%)',
    heroDotColor:      '#65a30d',
    heroHeadingText:   'text-lime-900',
    heroBodyText:      'text-lime-800/60',
    heroAccentGrad:    'linear-gradient(135deg, #4d7c0f, #16a34a)',
    heroUnderline:     'linear-gradient(90deg, #a3e635, #4ade80)',
    heroBadgeBg:       '#f0fae8',
    heroBadgeText:     '#4d7c0f',
    heroBadgeBorder:   '#c6deb4',
    statsBg:           'bg-white/70',
    statsBorder:       'border-[#d4e8c8]',
    statsHeadingText:  'text-lime-800',
    statsBodyText:     'text-lime-700/60',
    sectionLabelText:  'text-lime-600',
    sectionHeadText:   'text-lime-900',
    sectionBodyText:   'text-lime-800/50',
    miniCardBg:        'bg-white',
    miniCardBorder:    'border-[#d4e8c8]',
    miniCardHover:     'hover:border-lime-300 hover:shadow-md',
    testimonialBg:     '#edf7e8',
    testimonialCardBg: 'bg-white',
    testimonialBorder: 'border-[#d4e8c8]',
    starFill:          '#65a30d',
    starClass:         'text-lime-600',
    dotActive:         '#65a30d',
    dotInactive:       '#c6deb4',
    ctaGlow:           'radial-gradient(circle, #a3e635 0%, #16a34a 50%, transparent 70%)',
    ctaHeadText:       'text-lime-900',
    ctaBodyText:       'text-lime-800/50',
    footerBg:          'bg-white/50',
    footerBorder:      'border-[#d4e8c8]',
    footerText:        'text-lime-700/40',
    mockupChromeBg:    '#e8f5e0',
    mockupChromeBorder:'#d4e8c8',
    mockupUrlBg:       '#d6eccc',
    mockupUrlText:     '#7a9a5e',
    mockupAppBg:       '#f4fbf0',
    floatBadgeBg:      'bg-white',
    floatBadgeBorder:  '1px solid #c6deb4',
    floatBadgeShadow:  '0 8px 24px rgba(77,124,15,0.12)',
    floatIconBg:       '#f0fae8',
  },

  'purple': {
    pageBg:           'bg-[#f8f7ff]',
    sidebarBg:        'bg-white',
    sidebarBorder:    'border-gray-100',
    mobileHeaderBg:   'bg-white',
    logoBg:           'linear-gradient(135deg, #c62af5, #45aaf2)',
    navActiveBg:      'bg-purple-50',
    navActiveText:    'text-purple-700',
    navActiveIcon:    'text-purple-600',
    navActiveDot:     'bg-purple-500',
    navHoverBg:       'hover:bg-gray-50',
    navHoverText:     'hover:text-gray-800',
    navGroupLabel:    'text-gray-300',
    avatarFallback:   'linear-gradient(135deg, #c62af5, #45aaf2)',
    avatarRing:       'ring-purple-100',
    btnBg:            'linear-gradient(135deg, #c62af5, #a808d9)',
    btnShadow:        '0 6px 20px rgba(198,42,245,0.28)',
    btnOutlineBorder: 'border-gray-200',
    btnOutlineText:   'text-gray-600',
    btnOutlineHover:  'hover:bg-gray-50',
    statPrimary:  { iconBg:'bg-gradient-to-br from-purple-500 to-purple-700',  lightBg:'bg-purple-50',  text:'text-purple-600' },
    statPositive: { iconBg:'bg-gradient-to-br from-emerald-400 to-teal-500',   lightBg:'bg-emerald-50', text:'text-emerald-500' },
    statNegative: { iconBg:'bg-gradient-to-br from-red-400 to-red-500',        lightBg:'bg-red-50',     text:'text-red-500'    },
    statNeutral:  { iconBg:'bg-gradient-to-br from-blue-400 to-blue-500',      lightBg:'bg-blue-50',    text:'text-blue-500'   },
    statExtra:    { iconBg:'bg-gradient-to-br from-violet-500 to-purple-600',  lightBg:'bg-violet-50',  text:'text-violet-600' },
    badgeBg:          'bg-purple-50',
    badgeText:        'text-purple-700',
    badgeBorder:      'border-purple-200',
    inputBorder:      'border-gray-200',
    inputFocusBorder: 'focus:border-purple-400',
    inputFocusRing:   'focus:ring-purple-100',
    linkText:         'text-purple-600',
    accentText:       'text-purple-500',
    bannerBg:         'bg-purple-50',
    bannerText:       'text-purple-700',
    bannerBorder:     'border-purple-100',
    errorBg:          'bg-red-50',
    errorText:        'text-red-500',
    errorBorder:      'border-red-200',
    txIncomeBg:       'bg-emerald-50',
    txIncomeText:     'text-emerald-500',
    txExpenseBg:      'bg-red-50',
    txExpenseText:    'text-red-500',
    txTransferBg:     'bg-blue-50',
    txTransferText:   'text-blue-500',
    tooltipBg:        'bg-gray-900',
    trendPosBg:       'bg-emerald-50',
    trendPosText:     'text-emerald-500',
    trendNegBg:       'bg-red-50',
    trendNegText:     'text-red-500',
    heroBg:            '#0a0614',
    heroGlow1:         'radial-gradient(circle, rgba(198,42,245,0.18) 0%, transparent 70%)',
    heroGlow2:         'radial-gradient(circle, rgba(69,170,242,0.15) 0%, transparent 70%)',
    heroGlow3:         'radial-gradient(circle, rgba(198,42,245,0.08) 0%, transparent 70%)',
    heroDotColor:      '#c62af5',
    heroHeadingText:   'text-white',
    heroBodyText:      'text-gray-400',
    heroAccentGrad:    'linear-gradient(90deg, #c62af5, #45aaf2, #c62af5)',
    heroUnderline:     'linear-gradient(90deg, #c62af5, #45aaf2)',
    heroBadgeBg:       'rgba(198,42,245,0.08)',
    heroBadgeText:     '#e879f9',
    heroBadgeBorder:   'rgba(198,42,245,0.25)',
    statsBg:           'bg-white/[0.02]',
    statsBorder:       'border-white/5',
    statsHeadingText:  'text-white',
    statsBodyText:     'text-gray-400',
    sectionLabelText:  'text-purple-400',
    sectionHeadText:   'text-purple-400',
    sectionBodyText:   'text-gray-400',
    miniCardBg:        'bg-white/[0.04]',
    miniCardBorder:    'border-white/5',
    miniCardHover:     'hover:bg-white/[0.07]',
    testimonialBg:     'rgba(255,255,255,0.015)',
    testimonialCardBg: 'bg-transparent',
    testimonialBorder: 'border-white/10',
    starFill:          '#c62af5',
    starClass:         'text-purple-400',
    dotActive:         '#c62af5',
    dotInactive:       'rgba(255,255,255,0.2)',
    ctaGlow:           'radial-gradient(circle, rgba(198,42,245,0.2) 0%, transparent 70%)',
    ctaHeadText:       'text-white',
    ctaBodyText:       'text-gray-400',
    footerBg:          'bg-transparent',
    footerBorder:      'border-white/5',
    footerText:        'text-gray-600',
    mockupChromeBg:    '#1a0f2e',
    mockupChromeBorder:'rgba(255,255,255,0.08)',
    mockupUrlBg:       'rgba(255,255,255,0.05)',
    mockupUrlText:     '#6b21a8',
    mockupAppBg:       '#f8f7ff',
    floatBadgeBg:      'bg-white',
    floatBadgeBorder:  '1px solid rgba(198,42,245,0.2)',
    floatBadgeShadow:  '0 8px 24px rgba(0,0,0,0.3)',
    floatIconBg:       'rgba(198,42,245,0.15)',
  },

  'navy-cyan': {
    pageBg:           'bg-[#f0f6ff]',
    sidebarBg:        'bg-white',
    sidebarBorder:    'border-blue-100',
    mobileHeaderBg:   'bg-white',
    logoBg:           'linear-gradient(135deg, #0891b2, #2563eb)',
    navActiveBg:      'bg-cyan-50',
    navActiveText:    'text-cyan-700',
    navActiveIcon:    'text-cyan-600',
    navActiveDot:     'bg-cyan-500',
    navHoverBg:       'hover:bg-blue-50',
    navHoverText:     'hover:text-blue-900',
    navGroupLabel:    'text-gray-300',
    avatarFallback:   'linear-gradient(135deg, #0891b2, #2563eb)',
    avatarRing:       'ring-cyan-100',
    btnBg:            'linear-gradient(135deg, #0891b2, #2563eb)',
    btnShadow:        '0 6px 20px rgba(6,182,212,0.28)',
    btnOutlineBorder: 'border-blue-200',
    btnOutlineText:   'text-cyan-700',
    btnOutlineHover:  'hover:bg-cyan-50',
    statPrimary:  { iconBg:'bg-gradient-to-br from-cyan-500 to-blue-600',     lightBg:'bg-cyan-50',    text:'text-cyan-700'   },
    statPositive: { iconBg:'bg-gradient-to-br from-emerald-400 to-teal-500',  lightBg:'bg-emerald-50', text:'text-emerald-600' },
    statNegative: { iconBg:'bg-gradient-to-br from-red-400 to-red-500',       lightBg:'bg-red-50',     text:'text-red-500'    },
    statNeutral:  { iconBg:'bg-gradient-to-br from-blue-400 to-blue-500',     lightBg:'bg-blue-50',    text:'text-blue-600'   },
    statExtra:    { iconBg:'bg-gradient-to-br from-indigo-500 to-blue-600',   lightBg:'bg-indigo-50',  text:'text-indigo-600' },
    badgeBg:          'bg-cyan-50',
    badgeText:        'text-cyan-700',
    badgeBorder:      'border-cyan-200',
    inputBorder:      'border-blue-200',
    inputFocusBorder: 'focus:border-cyan-400',
    inputFocusRing:   'focus:ring-cyan-100',
    linkText:         'text-cyan-700',
    accentText:       'text-cyan-600',
    bannerBg:         'bg-cyan-50',
    bannerText:       'text-cyan-700',
    bannerBorder:     'border-cyan-200',
    errorBg:          'bg-red-50',
    errorText:        'text-red-500',
    errorBorder:      'border-red-200',
    txIncomeBg:       'bg-emerald-50',
    txIncomeText:     'text-emerald-600',
    txExpenseBg:      'bg-red-50',
    txExpenseText:    'text-red-500',
    txTransferBg:     'bg-cyan-50',
    txTransferText:   'text-cyan-600',
    tooltipBg:        'bg-blue-900',
    trendPosBg:       'bg-emerald-50',
    trendPosText:     'text-emerald-600',
    trendNegBg:       'bg-red-50',
    trendNegText:     'text-red-500',
    heroBg:            '#030b1a',
    heroGlow1:         'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
    heroGlow2:         'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
    heroGlow3:         'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
    heroDotColor:      '#06b6d4',
    heroHeadingText:   'text-white',
    heroBodyText:      'text-blue-200/60',
    heroAccentGrad:    'linear-gradient(90deg, #06b6d4, #60a5fa, #06b6d4)',
    heroUnderline:     'linear-gradient(90deg, #06b6d4, #60a5fa)',
    heroBadgeBg:       'rgba(6,182,212,0.08)',
    heroBadgeText:     '#67e8f9',
    heroBadgeBorder:   'rgba(6,182,212,0.25)',
    statsBg:           'bg-white/[0.02]',
    statsBorder:       'border-white/5',
    statsHeadingText:  'text-white',
    statsBodyText:     'text-blue-300/60',
    sectionLabelText:  'text-cyan-400',
    sectionHeadText:   'text-cyan-400',
    sectionBodyText:   'text-blue-200/50',
    miniCardBg:        'bg-white/[0.04]',
    miniCardBorder:    'border-white/5',
    miniCardHover:     'hover:bg-white/[0.07]',
    testimonialBg:     'rgba(255,255,255,0.015)',
    testimonialCardBg: 'bg-transparent',
    testimonialBorder: 'border-white/10',
    starFill:          '#06b6d4',
    starClass:         'text-cyan-400',
    dotActive:         '#06b6d4',
    dotInactive:       'rgba(255,255,255,0.15)',
    ctaGlow:           'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
    ctaHeadText:       'text-white',
    ctaBodyText:       'text-blue-200/50',
    footerBg:          'bg-transparent',
    footerBorder:      'border-white/5',
    footerText:        'text-blue-900/60',
    mockupChromeBg:    '#060d1f',
    mockupChromeBorder:'rgba(255,255,255,0.06)',
    mockupUrlBg:       'rgba(255,255,255,0.05)',
    mockupUrlText:     '#1e3a5f',
    mockupAppBg:       '#f0f6ff',
    floatBadgeBg:      'bg-white',
    floatBadgeBorder:  '1px solid rgba(6,182,212,0.2)',
    floatBadgeShadow:  '0 8px 24px rgba(0,0,0,0.4)',
    floatIconBg:       'rgba(6,182,212,0.15)',
  },

  'orange': {
    pageBg:           'bg-[#fffbf5]',
    sidebarBg:        'bg-white',
    sidebarBorder:    'border-orange-100',
    mobileHeaderBg:   'bg-white',
    logoBg:           'linear-gradient(135deg, #f97316, #eab308)',
    navActiveBg:      'bg-orange-50',
    navActiveText:    'text-orange-700',
    navActiveIcon:    'text-orange-600',
    navActiveDot:     'bg-orange-500',
    navHoverBg:       'hover:bg-amber-50',
    navHoverText:     'hover:text-orange-900',
    navGroupLabel:    'text-gray-300',
    avatarFallback:   'linear-gradient(135deg, #f97316, #eab308)',
    avatarRing:       'ring-orange-100',
    btnBg:            'linear-gradient(135deg, #f97316, #eab308)',
    btnShadow:        '0 6px 20px rgba(249,115,22,0.28)',
    btnOutlineBorder: 'border-orange-200',
    btnOutlineText:   'text-amber-700',
    btnOutlineHover:  'hover:bg-orange-50',
    statPrimary:  { iconBg:'bg-gradient-to-br from-orange-500 to-amber-600',  lightBg:'bg-orange-50',  text:'text-orange-700' },
    statPositive: { iconBg:'bg-gradient-to-br from-emerald-400 to-green-500', lightBg:'bg-emerald-50', text:'text-emerald-600' },
    statNegative: { iconBg:'bg-gradient-to-br from-red-400 to-red-500',       lightBg:'bg-red-50',     text:'text-red-500'    },
    statNeutral:  { iconBg:'bg-gradient-to-br from-amber-400 to-yellow-500',  lightBg:'bg-amber-50',   text:'text-amber-600'  },
    statExtra:    { iconBg:'bg-gradient-to-br from-yellow-500 to-orange-500', lightBg:'bg-yellow-50',  text:'text-yellow-700' },
    badgeBg:          'bg-orange-50',
    badgeText:        'text-orange-700',
    badgeBorder:      'border-orange-200',
    inputBorder:      'border-orange-200',
    inputFocusBorder: 'focus:border-orange-400',
    inputFocusRing:   'focus:ring-orange-100',
    linkText:         'text-orange-600',
    accentText:       'text-orange-500',
    bannerBg:         'bg-orange-50',
    bannerText:       'text-orange-700',
    bannerBorder:     'border-orange-200',
    errorBg:          'bg-red-50',
    errorText:        'text-red-500',
    errorBorder:      'border-red-200',
    txIncomeBg:       'bg-emerald-50',
    txIncomeText:     'text-emerald-600',
    txExpenseBg:      'bg-red-50',
    txExpenseText:    'text-red-500',
    txTransferBg:     'bg-amber-50',
    txTransferText:   'text-amber-600',
    tooltipBg:        'bg-orange-900',
    trendPosBg:       'bg-emerald-50',
    trendPosText:     'text-emerald-600',
    trendNegBg:       'bg-red-50',
    trendNegText:     'text-red-500',
    heroBg:            '#fffbf5',
    heroGlow1:         'radial-gradient(circle, #fed7aa 0%, transparent 70%)',
    heroGlow2:         'radial-gradient(circle, #fef08a 0%, transparent 70%)',
    heroGlow3:         'radial-gradient(circle, #fdba74 0%, transparent 70%)',
    heroDotColor:      '#f97316',
    heroHeadingText:   'text-gray-900',
    heroBodyText:      'text-amber-800/70',
    heroAccentGrad:    'linear-gradient(135deg, #f97316, #eab308, #f97316)',
    heroUnderline:     'linear-gradient(90deg, #f97316, #eab308)',
    heroBadgeBg:       '#fff7ed',
    heroBadgeText:     '#c2410c',
    heroBadgeBorder:   '#fed7aa',
    statsBg:           'bg-white/60',
    statsBorder:       'border-orange-100',
    statsHeadingText:  'text-gray-900',
    statsBodyText:     'text-amber-700/70',
    sectionLabelText:  'text-orange-500',
    sectionHeadText:   'text-gray-900',
    sectionBodyText:   'text-amber-800/60',
    miniCardBg:        'bg-white/70',
    miniCardBorder:    'border-orange-100',
    miniCardHover:     'hover:bg-white hover:border-orange-200 hover:shadow-md',
    testimonialBg:     'linear-gradient(135deg, #fff7ed 0%, #fef9e7 100%)',
    testimonialCardBg: 'bg-white',
    testimonialBorder: 'border-orange-100',
    starFill:          '#f97316',
    starClass:         'text-orange-500',
    dotActive:         '#f97316',
    dotInactive:       '#fed7aa',
    ctaGlow:           'radial-gradient(circle, #f97316 0%, #eab308 50%, transparent 70%)',
    ctaHeadText:       'text-gray-900',
    ctaBodyText:       'text-amber-800/60',
    footerBg:          'bg-white/50',
    footerBorder:      'border-orange-100',
    footerText:        'text-amber-700/40',
    mockupChromeBg:    '#fff7ed',
    mockupChromeBorder:'#ffe4c4',
    mockupUrlBg:       '#ffe9d0',
    mockupUrlText:     '#a1836a',
    mockupAppBg:       '#fffbf5',
    floatBadgeBg:      'bg-white',
    floatBadgeBorder:  '1px solid #ffe4c4',
    floatBadgeShadow:  '0 8px 24px rgba(249,115,22,0.12)',
    floatIconBg:       '#fff7ed',
  },

  'rose': {
    pageBg:           'bg-white',
    sidebarBg:        'bg-white',
    sidebarBorder:    'border-rose-100',
    mobileHeaderBg:   'bg-white',
    logoBg:           'linear-gradient(135deg, #f43f5e, #ec4899)',
    navActiveBg:      'bg-rose-50',
    navActiveText:    'text-rose-700',
    navActiveIcon:    'text-rose-600',
    navActiveDot:     'bg-rose-500',
    navHoverBg:       'hover:bg-rose-50',
    navHoverText:     'hover:text-rose-900',
    navGroupLabel:    'text-gray-300',
    avatarFallback:   'linear-gradient(135deg, #f43f5e, #ec4899)',
    avatarRing:       'ring-rose-100',
    btnBg:            'linear-gradient(135deg, #f43f5e, #ec4899)',
    btnShadow:        '0 6px 20px rgba(244,63,94,0.25)',
    btnOutlineBorder: 'border-rose-200',
    btnOutlineText:   'text-rose-600',
    btnOutlineHover:  'hover:bg-rose-50',
    statPrimary:  { iconBg:'bg-gradient-to-br from-rose-500 to-pink-600',     lightBg:'bg-rose-50',     text:'text-rose-600'    },
    statPositive: { iconBg:'bg-gradient-to-br from-emerald-400 to-green-500', lightBg:'bg-emerald-50',  text:'text-emerald-600' },
    statNegative: { iconBg:'bg-gradient-to-br from-red-400 to-red-500',       lightBg:'bg-red-50',      text:'text-red-500'     },
    statNeutral:  { iconBg:'bg-gradient-to-br from-pink-400 to-rose-400',     lightBg:'bg-pink-50',     text:'text-pink-600'    },
    statExtra:    { iconBg:'bg-gradient-to-br from-fuchsia-500 to-pink-600',  lightBg:'bg-fuchsia-50',  text:'text-fuchsia-600' },
    badgeBg:          'bg-rose-50',
    badgeText:        'text-rose-600',
    badgeBorder:      'border-rose-200',
    inputBorder:      'border-rose-200',
    inputFocusBorder: 'focus:border-rose-400',
    inputFocusRing:   'focus:ring-rose-100',
    linkText:         'text-rose-600',
    accentText:       'text-rose-500',
    bannerBg:         'bg-rose-50',
    bannerText:       'text-rose-600',
    bannerBorder:     'border-rose-200',
    errorBg:          'bg-red-50',
    errorText:        'text-red-500',
    errorBorder:      'border-red-200',
    txIncomeBg:       'bg-emerald-50',
    txIncomeText:     'text-emerald-600',
    txExpenseBg:      'bg-red-50',
    txExpenseText:    'text-red-500',
    txTransferBg:     'bg-pink-50',
    txTransferText:   'text-pink-600',
    tooltipBg:        'bg-rose-900',
    trendPosBg:       'bg-emerald-50',
    trendPosText:     'text-emerald-600',
    trendNegBg:       'bg-red-50',
    trendNegText:     'text-red-500',
    heroBg:            '#ffffff',
    heroGlow1:         'radial-gradient(circle, #fecdd3 0%, transparent 70%)',
    heroGlow2:         'radial-gradient(circle, #fbcfe8 0%, transparent 70%)',
    heroGlow3:         'radial-gradient(circle, #fda4af 0%, transparent 70%)',
    heroDotColor:      '#f43f5e',
    heroHeadingText:   'text-gray-900',
    heroBodyText:      'text-rose-900/50',
    heroAccentGrad:    'linear-gradient(135deg, #f43f5e, #ec4899)',
    heroUnderline:     'linear-gradient(90deg, #f43f5e, #ec4899)',
    heroBadgeBg:       '#fff5f7',
    heroBadgeText:     '#be123c',
    heroBadgeBorder:   '#fecdd3',
    statsBg:           'bg-white/70',
    statsBorder:       'border-rose-100',
    statsHeadingText:  'text-gray-900',
    statsBodyText:     'text-rose-400/70',
    sectionLabelText:  'text-rose-500',
    sectionHeadText:   'text-gray-900',
    sectionBodyText:   'text-rose-900/50',
    miniCardBg:        'bg-white',
    miniCardBorder:    'border-rose-100',
    miniCardHover:     'hover:border-rose-200 hover:shadow-md',
    testimonialBg:     'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 100%)',
    testimonialCardBg: 'bg-white',
    testimonialBorder: 'border-rose-100',
    starFill:          '#f43f5e',
    starClass:         'text-rose-500',
    dotActive:         '#f43f5e',
    dotInactive:       '#fecdd3',
    ctaGlow:           'radial-gradient(circle, #f43f5e 0%, #ec4899 50%, transparent 70%)',
    ctaHeadText:       'text-gray-900',
    ctaBodyText:       'text-rose-900/50',
    footerBg:          'bg-white/60',
    footerBorder:      'border-rose-100',
    footerText:        'text-rose-400/50',
    mockupChromeBg:    '#fff5f7',
    mockupChromeBorder:'#fecdd3',
    mockupUrlBg:       '#ffe4e8',
    mockupUrlText:     '#e4809a',
    mockupAppBg:       '#fff5f7',
    floatBadgeBg:      'bg-white',
    floatBadgeBorder:  '1px solid #fecdd3',
    floatBadgeShadow:  '0 8px 24px rgba(244,63,94,0.1)',
    floatIconBg:       '#fff5f7',
  },

  'earth': {
    pageBg:           'bg-[#faf7f2]',
    sidebarBg:        'bg-white',
    sidebarBorder:    'border-[#e7e0d5]',
    mobileHeaderBg:   'bg-white',
    logoBg:           'linear-gradient(135deg, #c2410c, #92400e)',
    navActiveBg:      'bg-[#fef3eb]',
    navActiveText:    'text-orange-800',
    navActiveIcon:    'text-orange-700',
    navActiveDot:     'bg-orange-700',
    navHoverBg:       'hover:bg-amber-50',
    navHoverText:     'hover:text-stone-800',
    navGroupLabel:    'text-stone-300',
    avatarFallback:   'linear-gradient(135deg, #c2410c, #92400e)',
    avatarRing:       'ring-orange-100',
    btnBg:            'linear-gradient(135deg, #c2410c, #92400e)',
    btnShadow:        '0 6px 20px rgba(194,65,12,0.28)',
    btnOutlineBorder: 'border-[#e7e0d5]',
    btnOutlineText:   'text-stone-600',
    btnOutlineHover:  'hover:bg-amber-50',
    statPrimary:  { iconBg:'bg-gradient-to-br from-orange-700 to-amber-700',  lightBg:'bg-[#fef3eb]',  text:'text-orange-800' },
    statPositive: { iconBg:'bg-gradient-to-br from-emerald-500 to-green-600', lightBg:'bg-emerald-50', text:'text-emerald-700' },
    statNegative: { iconBg:'bg-gradient-to-br from-red-500 to-red-600',       lightBg:'bg-red-50',     text:'text-red-600'    },
    statNeutral:  { iconBg:'bg-gradient-to-br from-amber-600 to-orange-600',  lightBg:'bg-amber-50',   text:'text-amber-700'  },
    statExtra:    { iconBg:'bg-gradient-to-br from-stone-500 to-amber-600',   lightBg:'bg-stone-100',  text:'text-stone-700'  },
    badgeBg:          'bg-[#fef3eb]',
    badgeText:        'text-orange-800',
    badgeBorder:      'border-orange-200',
    inputBorder:      'border-[#e7e0d5]',
    inputFocusBorder: 'focus:border-orange-400',
    inputFocusRing:   'focus:ring-orange-100',
    linkText:         'text-orange-700',
    accentText:       'text-orange-600',
    bannerBg:         'bg-[#fef3eb]',
    bannerText:       'text-orange-800',
    bannerBorder:     'border-orange-200',
    errorBg:          'bg-red-50',
    errorText:        'text-red-600',
    errorBorder:      'border-red-200',
    txIncomeBg:       'bg-emerald-50',
    txIncomeText:     'text-emerald-700',
    txExpenseBg:      'bg-red-50',
    txExpenseText:    'text-red-600',
    txTransferBg:     'bg-amber-50',
    txTransferText:   'text-amber-700',
    tooltipBg:        'bg-stone-800',
    trendPosBg:       'bg-emerald-50',
    trendPosText:     'text-emerald-700',
    trendNegBg:       'bg-red-50',
    trendNegText:     'text-red-600',
    heroBg:            '#faf7f2',
    heroGlow1:         'radial-gradient(circle, #fed7aa 0%, transparent 70%)',
    heroGlow2:         'radial-gradient(circle, #fde68a 0%, transparent 70%)',
    heroGlow3:         'radial-gradient(circle, #fdba74 0%, transparent 70%)',
    heroDotColor:      '#c2410c',
    heroHeadingText:   'text-stone-800',
    heroBodyText:      'text-stone-500',
    heroAccentGrad:    'linear-gradient(135deg, #c2410c, #d97706)',
    heroUnderline:     'linear-gradient(90deg, #c2410c, #d97706)',
    heroBadgeBg:       '#fef3eb',
    heroBadgeText:     '#9a3412',
    heroBadgeBorder:   '#fdba74',
    statsBg:           'bg-white/60',
    statsBorder:       'border-[#e7e0d5]',
    statsHeadingText:  'text-stone-800',
    statsBodyText:     'text-stone-500',
    sectionLabelText:  'text-orange-700',
    sectionHeadText:   'text-stone-800',
    sectionBodyText:   'text-stone-400',
    miniCardBg:        'bg-white',
    miniCardBorder:    'border-[#e7e0d5]',
    miniCardHover:     'hover:shadow-md',
    testimonialBg:     '#f5f0e8',
    testimonialCardBg: 'bg-white',
    testimonialBorder: 'border-[#e7e0d5]',
    starFill:          '#c2410c',
    starClass:         'text-orange-700',
    dotActive:         '#c2410c',
    dotInactive:       '#d6c5b4',
    ctaGlow:           'radial-gradient(circle, #c2410c 0%, #d97706 50%, transparent 70%)',
    ctaHeadText:       'text-stone-800',
    ctaBodyText:       'text-stone-400',
    footerBg:          'bg-white/50',
    footerBorder:      'border-[#e7e0d5]',
    footerText:        'text-stone-400',
    mockupChromeBg:    '#f0e8dc',
    mockupChromeBorder:'#e7ddd0',
    mockupUrlBg:       '#e7ddd0',
    mockupUrlText:     '#a1836a',
    mockupAppBg:       '#f7f3ed',
    floatBadgeBg:      'bg-white',
    floatBadgeBorder:  '1px solid #e7e0d5',
    floatBadgeShadow:  '0 8px 24px rgba(194,65,12,0.1)',
    floatIconBg:       '#fef3eb',
  },
}

export const theme = themes[ACTIVE_THEME]
export default theme