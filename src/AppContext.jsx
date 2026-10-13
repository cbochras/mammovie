import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LANGUAGES, translations } from './i18n'

const AppContext = createContext(null)

// Pre-seeded demo accounts so testers can log in instantly without signing up.
// Demo only — plain-text passwords, no real security.
export const DEMO_ACCOUNTS = [
  {
    role: 'user',
    name: 'Amina (démo)',
    email: 'user@mammovie.com',
    password: 'demo1234',
    phone: '',
    status: 'active',
  },
  {
    role: 'pro',
    name: 'Dr. Démo',
    email: 'pro@mammovie.com',
    password: 'demo1234',
    specialty: 'Oncologie',
    degree: 'Doctorat en médecine, 2015',
    experiences: ['CHU — Oncologue (4 ans)', 'Centre de dépistage (2 ans)'],
    status: 'active', // already approved so the pro dashboard is reachable immediately
  },
]


export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('mv_lang') || 'fr')
  // user: null (logged out) or { role: 'user' | 'pro', name }
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('mv_user')
    return raw ? JSON.parse(raw) : null
  })
  // stores last questionnaire answers for the profile screen
  const [answers, setAnswers] = useState(() => {
    const raw = localStorage.getItem('mv_answers')
    return raw ? JSON.parse(raw) : null
  })

  // favorite article IDs
  const [favorites, setFavorites] = useState(() => {
    const raw = localStorage.getItem('mv_favorites')
    return raw ? JSON.parse(raw) : []
  })

  // role chosen during the auth flow ('user' | 'pro')
  const [authRole, setAuthRole] = useState('user')

  useEffect(() => {
    if (answers) localStorage.setItem('mv_answers', JSON.stringify(answers))
  }, [answers])

  useEffect(() => {
    localStorage.setItem('mv_favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (id) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  // Mock account store (persisted in localStorage). Demo only — passwords are NOT secured.
  const [accounts, setAccounts] = useState(() => {
    const raw = localStorage.getItem('mv_accounts')
    const existing = raw ? JSON.parse(raw) : []
    // Merge in demo accounts if they aren't already present (so testers can log in instantly).
    const withSeeds = [...existing]
    DEMO_ACCOUNTS.forEach((seed) => {
      if (!withSeeds.some((a) => a.email.toLowerCase() === seed.email.toLowerCase())) {
        withSeeds.push(seed)
      }
    })
    return withSeeds
  })

  useEffect(() => {
    localStorage.setItem('mv_accounts', JSON.stringify(accounts))
  }, [accounts])

  useEffect(() => {
    localStorage.setItem('mv_lang', lang)
    const meta = LANGUAGES.find((l) => l.code === lang)
    document.documentElement.lang = lang
    document.documentElement.dir = meta?.dir || 'ltr'
  }, [lang])

  useEffect(() => {
    if (user) localStorage.setItem('mv_user', JSON.stringify(user))
    else localStorage.removeItem('mv_user')
  }, [user])

  const t = useMemo(() => {
    const dict = translations[lang] || translations.fr
    return (key) => dict[key] ?? translations.fr[key] ?? key
  }, [lang])

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || 'ltr'

  // --- Mock auth helpers (demo only) ---
  const findAccount = (email) =>
    accounts.find((a) => a.email.toLowerCase() === String(email).toLowerCase().trim())

  // register returns { ok, error }
  const register = (acc) => {
    if (findAccount(acc.email)) return { ok: false, error: 'errExists' }
    const record = {
      ...acc,
      email: acc.email.trim(),
      // pros start pending until manual approval; users are active immediately
      status: acc.role === 'pro' ? 'pending' : 'active',
    }
    setAccounts((list) => [...list, record])
    return { ok: true, account: record }
  }

  // authenticate returns { ok, error, account }
  const authenticate = (email, password, role) => {
    const acc = findAccount(email)
    if (!acc || acc.role !== role) return { ok: false, error: 'errNoUser' }
    if (acc.password !== password) return { ok: false, error: 'errWrongPass' }
    if (acc.role === 'pro' && acc.status !== 'active') return { ok: false, error: 'errPending' }
    return { ok: true, account: acc }
  }

  // Demo-only: flip a pending pro account to active so the pro view can be shown on stage.
  const approveAccount = (email) =>
    setAccounts((list) => list.map((a) => (a.email.toLowerCase() === String(email).toLowerCase().trim() ? { ...a, status: 'active' } : a)))

  const value = {
    lang,
    setLang,
    dir,
    t,
    user,
    setUser,
    login: (role, name) => setUser({ role, name: name || (role === 'pro' ? 'Dr. Benali' : 'Meriem') }),
    logout: () => setUser(null),
    answers,
    setAnswers,
    favorites,
    toggleFavorite,
    authRole,
    setAuthRole,
    accounts,
    register,
    authenticate,
    approveAccount,
    findAccount,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
