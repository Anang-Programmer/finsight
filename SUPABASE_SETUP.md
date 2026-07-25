# Finsight — Supabase Setup Guide

## Langkah-langkah Setup

### 1. Buat Project di Supabase
1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Nama project: `finsight`
3. Set password database (simpan baik-baik)
4. Region: pilih yang terdekat (Singapore)

### 2. Ambil Keys
Setelah project dibuat, buka **Settings → API**:

| Key | Lokasi | Untuk apa |
|-----|--------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (atas) | Koneksi ke Supabase dari browser & server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key | Koneksi publik (aman karena dilindungi RLS) |

Tambahkan ke file `.env`:
```env
GROQ_API_KEY="gsk_xxx..."
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
```

### 3. Jalankan SQL Berikut

Buka **SQL Editor** di Supabase Dashboard, lalu jalankan query berikut **satu per satu** secara berurutan:

---

#### 3.1 — Tabel `profiles`
```sql
-- Tabel profil pengguna, terhubung ke auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger: auto-create profile saat user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

#### 3.2 — Tabel `categories`
```sql
-- Kategori transaksi (default + custom per user)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL DEFAULT '📦',
  color TEXT NOT NULL DEFAULT '#505a63',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Users bisa lihat kategori default (user_id IS NULL) + milik sendiri
CREATE POLICY "Users can view own and default categories"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);
```

---

#### 3.3 — Seed Kategori Default
```sql
-- Kategori pengeluaran default
INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
  (NULL, 'Makanan & Minuman', 'expense', 'utensils', '#e61e49', true),
  (NULL, 'Transportasi', 'expense', 'car', '#007bc2', true),
  (NULL, 'Belanja', 'expense', 'shopping-bag', '#ec7e00', true),
  (NULL, 'Tagihan & Utilitas', 'expense', 'zap', '#b09000', true),
  (NULL, 'Hiburan', 'expense', 'film', '#936d62', true),
  (NULL, 'Kesehatan', 'expense', 'heart-pulse', '#e23b4a', true),
  (NULL, 'Pendidikan', 'expense', 'book-open', '#00a87e', true),
  (NULL, 'Rumah Tangga', 'expense', 'home', '#936d62', true),
  (NULL, 'Pakaian', 'expense', 'shirt', '#e61e49', true),
  (NULL, 'Lainnya', 'expense', 'more-horizontal', '#505a63', true);

-- Kategori pemasukan default
INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
  (NULL, 'Gaji', 'income', 'briefcase', '#00a87e', true),
  (NULL, 'Freelance', 'income', 'laptop', '#376cd5', true),
  (NULL, 'Investasi', 'income', 'trending-up', '#494fdf', true),
  (NULL, 'Hadiah', 'income', 'gift', '#e61e49', true),
  (NULL, 'Lainnya', 'income', 'more-horizontal', '#505a63', true);
```

---

#### 3.4 — Tabel `transactions`
```sql
-- Pencatatan transaksi keuangan
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL DEFAULT '',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index untuk performa query
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, type);

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);
```

---

#### 3.5 — Tabel `budgets`
```sql
-- Anggaran per kategori per periode
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount_limit NUMERIC(15,2) NOT NULL CHECK (amount_limit > 0),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- Index
CREATE INDEX idx_budgets_user_period ON public.budgets(user_id, period_start, period_end);

-- RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);
```

---

#### 3.6 — Tabel `savings_goals`
```sql
-- Target tabungan
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE,
  icon TEXT NOT NULL DEFAULT '🎯',
  color TEXT NOT NULL DEFAULT '#494fdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_savings_goals_user ON public.savings_goals(user_id);

-- RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings goals"
  ON public.savings_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals"
  ON public.savings_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals"
  ON public.savings_goals FOR DELETE
  USING (auth.uid() = user_id);
```

---

#### 3.7 — Tabel `savings_deposits`
```sql
-- Riwayat setoran ke target tabungan
CREATE TABLE public.savings_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_savings_deposits_goal ON public.savings_deposits(goal_id);

-- RLS
ALTER TABLE public.savings_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposits"
  ON public.savings_deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposits"
  ON public.savings_deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger: auto-update current_amount di savings_goals saat deposit
CREATE OR REPLACE FUNCTION public.update_savings_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.savings_goals
  SET current_amount = current_amount + NEW.amount,
      updated_at = now()
  WHERE id = NEW.goal_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_savings_deposit
  AFTER INSERT ON public.savings_deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_savings_goal_amount();
```

---

#### 3.8 — Tabel `ai_insights` (Cache)
```sql
-- Cache hasil insight AI
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}',
  period TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_ai_insights_user_period ON public.ai_insights(user_id, period);

-- RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON public.ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON public.ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON public.ai_insights FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 4. Konfigurasi Auth

Di Supabase Dashboard → **Authentication → Settings**:
1. **Email Auth**: Pastikan sudah enabled (default)
2. **Confirm email**: Untuk development, bisa dimatikan dulu (**Settings → Email → Enable email confirmations** → OFF) supaya tidak perlu verifikasi email saat testing

---

### 5. Ringkasan Environment Variables

Tambahkan semua ini ke file `.env` di project:

```env
# Groq AI (sudah ada)
GROQ_API_KEY="gsk_xxx..."

# Supabase (ambil dari Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
```

> **Catatan**: `NEXT_PUBLIC_` prefix artinya key ini bisa diakses dari browser. Ini aman karena semua tabel dilindungi oleh Row Level Security (RLS) — tanpa login, tidak ada data yang bisa diakses.
