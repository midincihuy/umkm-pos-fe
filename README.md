# Dompet Keluargaku — Frontend

Frontend aplikasi keuangan rumah tangga. Dibangun dengan **React + Vite + TypeScript + Tailwind CSS**.

## Tech Stack

| | |
|--|--|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (Google OAuth) |
| Router | React Router v6 |
| Icons | Lucide React |
| Font | Sora + Plus Jakarta Sans |

## Fitur

- ✅ Login dengan Google (Supabase Auth)
- ✅ Dashboard — ringkasan bulan ini, stat cards, rekening, transaksi terbaru
- ✅ Halaman Transaksi — list per bulan, filter tipe, pencarian, pagination
- ✅ Responsive (mobile + desktop)
- ✅ Loading skeleton & error state
- ✅ Rekening, Budget, Laporan

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
```

Isi `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:8080/v1
```

Ambil dari **Supabase Dashboard → Settings → API**.

### 3. Aktifkan Google OAuth di Supabase

1. Buka **Supabase Dashboard → Authentication → Providers → Google**
2. Enable, isi Client ID & Secret dari [Google Cloud Console](https://console.cloud.google.com)
3. Tambahkan Authorized redirect URI di Google Cloud:
   ```
   https://xxxxxxxxxxxx.supabase.co/auth/v1/callback
   ```

### 4. Jalankan

```bash
npm run dev
# → http://localhost:3000
```

## Struktur Folder

```
src/
├── pages/
│   ├── HomePage.tsx         # Halaman Landing Page
│   ├── LoginPage.tsx        # Halaman login Google
│   ├── DashboardPage.tsx    # Dashboard utama
│   └── TransactionsPage.tsx # List transaksi
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx    # Sidebar + layout
│   └── ui/
│       ├── StatCard.tsx     # Kartu statistik
│       └── Skeleton.tsx     # Loading skeleton
├── hooks/
│   ├── useAuth.ts           # Supabase auth state
│   └── useApi.ts            # Generic data fetching
├── lib/
│   ├── api.ts               # HTTP client ke backend Go
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Format rupiah, tanggal, dll
└── App.tsx                  # Router setup
```
