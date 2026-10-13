import { useState, useEffect } from 'react'
import { useApp, DEMO_ACCOUNTS } from './AppContext'
import { Logo, LangSwitch, TopBar } from './components'
import { articles, warningSigns, centers, sampleConversation, APPROVAL_EMAIL } from './data'

/* ---------------- Splash / intro ---------------- */
export function Splash({ go }) {
  const { t } = useApp()
  useEffect(() => {
    const timer = setTimeout(() => go('welcome'), 2600)
    return () => clearTimeout(timer)
  }, [go])
  return (
    <div className="screen no-nav splash" onClick={() => go('welcome')}>
      <div className="splash-inner">
        <div className="big-ribbon pulse">🎗️</div>
        <h1 className="splash-title">MAMMO<span>VIE</span></h1>
        <p className="muted center">{t('tagline')}</p>
      </div>
      <button className="link splash-skip" onClick={(e) => { e.stopPropagation(); go('welcome') }}>{t('skip')} →</button>
    </div>
  )
}

/* ---------------- End page (hope message) ---------------- */
export function EndPage({ go }) {
  const { t } = useApp()
  return (
    <div className="screen no-nav endpage">
      <TopBar title="" onBack={() => go('home')} />
      <div className="end-inner">
        <div className="big-ribbon">🎗️</div>
        <h2 className="end-quote">{t('endQuote')}</h2>
        <Logo />
        <p className="muted center" style={{ marginTop: 6 }}>{t('endSub')}</p>
        <div className="end-pillars">
          <span>💗 {t('end1')}</span>
          <span>🔎 {t('end2')}</span>
          <span>📍 {t('end3')}</span>
        </div>
        <p className="end-slogan">{t('endSlogan')} 🎗️</p>
      </div>
    </div>
  )
}

/* ---------------- Welcome ---------------- */
export function Welcome({ go }) {
  const { t } = useApp()
  return (
    <div className="screen no-nav">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo />
        <LangSwitch />
      </div>
      <div className="hero">
        <div className="big-ribbon">🎗️</div>
        <h1>MAMMOVIE</h1>
        <p className="muted">{t('tagline')}</p>
      </div>
      <div className="banner">
        <b>{t('bannerTitle')}</b>
        <p>{t('bannerSub')}</p>
      </div>
      <p className="center muted" style={{ fontSize: 12 }}>{t('pillars')}</p>
      <div style={{ marginTop: 20 }}>
        <button className="btn" onClick={() => go('signup')}>{t('start')} →</button>
        <div className="center" style={{ marginTop: 12 }}>
          <button className="link" onClick={() => go('login')}>{t('haveAccount')}</button>
        </div>
      </div>
      <div className="disclaimer">{t('disclaimer')}</div>
    </div>
  )
}

/* ---------------- Reusable form bits ---------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ label, children }) {
  return (<><label className="field">{label}</label>{children}</>)
}

function ErrorMsg({ children }) {
  if (!children) return null
  return <p style={{ color: '#c62828', fontSize: 13, margin: '10px 0 0' }}>⚠️ {children}</p>
}

function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} style={{ paddingInlineEnd: 44 }} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label="toggle password"
        style={{ position: 'absolute', insetInlineEnd: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  )
}

function RoleToggle({ role, setRole, t }) {
  return (
    <div className="role-toggle">
      <button className={role === 'user' ? 'active' : ''} onClick={() => setRole('user')}>
        👩 {t('roleUser')}
      </button>
      <button className={role === 'pro' ? 'active' : ''} onClick={() => setRole('pro')}>
        🩺 {t('rolePro')}
      </button>
    </div>
  )
}

/* ---------------- Unified Auth (login + signup, role toggle) ---------------- */
export function Auth({ go, mode: initialMode }) {
  const { t, login, register, authenticate, approveAccount } = useApp()
  const [mode, setMode] = useState(initialMode || 'login') // 'login' | 'signup'
  const [role, setRole] = useState('user')                 // 'user' | 'pro'
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '', terms: false,
    specialty: '', degree: '', experiences: ['', ''],
  })
  const [diploma, setDiploma] = useState(null)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false) // pro signup confirmation
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  const onFile = (e) => {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED.includes(file.type)) return setError(t('errFileType'))
    if (file.size > 5 * 1024 * 1024) return setError(t('errFileSize'))
    const reader = new FileReader()
    reader.onload = () => setDiploma({ name: file.name, type: file.type, dataUrl: reader.result })
    reader.readAsDataURL(file)
  }

  const filledExp = form.experiences.filter((x) => x.trim()).length

  const mailto = () => {
    const subject = encodeURIComponent(`[MAMMOVIE] Demande de validation professionnel — ${form.name}`)
    const lines = [
      `Nom: ${form.name}`, `E-mail: ${form.email}`, `Spécialité: ${form.specialty}`, `Diplôme: ${form.degree}`,
      ...form.experiences.filter((x) => x.trim()).map((x, i) => `Expérience ${i + 1}: ${x}`),
      '', `Justificatif: ${diploma?.name || '—'} (${t('diplomaAttachedNote')})`,
    ]
    return `mailto:${APPROVAL_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines.join('\n'))}`
  }

  const submit = () => {
    setError('')
    // ----- LOGIN -----
    if (mode === 'login') {
      if (!form.email.trim() || !form.password) return setError(t('errRequired'))
      const res = authenticate(form.email, form.password, role)
      if (!res.ok) return setError(t(res.error))
      login(role, res.account.name)
      go(role === 'pro' ? 'proHome' : 'home')
      return
    }
    // ----- SIGNUP: common validation -----
    if (!form.name.trim() || !form.email.trim() || !form.password) return setError(t('errRequired'))
    if (!EMAIL_RE.test(form.email)) return setError(t('errEmail'))
    if (form.password.length < 6) return setError(t('errPassword'))
    if (form.password !== form.confirm) return setError(t('errMatch'))
    if (!form.terms) return setError(t('errTerms'))

    if (role === 'user') {
      const res = register({ role: 'user', name: form.name, email: form.email, phone: form.phone, password: form.password })
      if (!res.ok) return setError(t(res.error))
      login('user', form.name)
      go('home')
    } else {
      // Pro signup extra requirements
      if (!form.degree.trim() || filledExp < 2) return setError(t('proRequire'))
      if (!diploma) return setError(t('errDiploma'))
      const res = register({
        role: 'pro', name: form.name, email: form.email, password: form.password,
        specialty: form.specialty, degree: form.degree,
        experiences: form.experiences.filter((x) => x.trim()),
        diploma,
      })
      if (!res.ok) return setError(t(res.error))
      setSent(true)
    }
  }

  // Pro signup confirmation screen
  if (sent) {
    return (
      <div className="screen no-nav">
        <TopBar title={t('proSignupTitle')} onBack={() => go('welcome')} />
        <div className="result-box low" style={{ marginTop: 10 }}>
          <span className="ric">📨</span>
          <div>
            <b>{t('proPendingTitle')}</b>
            <p style={{ margin: '6px 0 0', fontSize: 13.5 }}>{t('proPendingDesc')} <b>{APPROVAL_EMAIL}</b></p>
          </div>
        </div>
        {diploma && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {diploma.type === 'application/pdf'
              ? <span className="upload-ic">📄</span>
              : <img src={diploma.dataUrl} alt={diploma.name} className="upload-thumb" />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{diploma.name}</b>
              <span className="muted" style={{ fontSize: 12 }}>{t('proDiploma')}</span>
            </div>
          </div>
        )}
        <a className="btn" href={mailto()} style={{ textDecoration: 'none' }}>{t('openEmail')} ✉️</a>
        <p className="muted" style={{ fontSize: 12 }}>📎 {t('diplomaAttachedNote')}</p>
        <div className="note">ℹ️ {t('proFutureNote')}</div>
        <div className="card" style={{ borderStyle: 'dashed', borderColor: 'var(--pink-300)' }}>
          <p className="muted" style={{ fontSize: 12.5, margin: '0 0 10px' }}>🧪 {t('approveDemoNote')}</p>
          <button className="btn secondary" onClick={() => { approveAccount(form.email); login('pro', form.name); go('proHome') }}>
            {t('approveDemo')}
          </button>
        </div>
        <button className="btn ghost" style={{ width: '100%' }} onClick={() => go('welcome')}>{t('backHome')}</button>
      </div>
    )
  }

  const isSignup = mode === 'signup'
  const isPro = role === 'pro'
  const title = isSignup ? t('signup') : t('login')

  return (
    <div className="screen no-nav">
      <TopBar title={title} onBack={() => go('welcome')} />
      <RoleToggle role={role} setRole={setRole} t={t} />
      <div className="note">💡 {t('demoHint')}</div>

      {!isSignup && (
        <div className="demo-box">
          <b style={{ fontSize: 13 }}>🧪 {t('demoAccountsTitle')}</b>
          <div style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.6 }}>
            <div>👩 <code>user@mammovie.com</code> · <code>demo1234</code></div>
            <div>🩺 <code>pro@mammovie.com</code> · <code>demo1234</code></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="chip" onClick={() => { setRole('user'); set('email', 'user@mammovie.com'); set('password', 'demo1234') }}>{t('demoFillUser')}</button>
            <button className="chip" onClick={() => { setRole('pro'); set('email', 'pro@mammovie.com'); set('password', 'demo1234') }}>{t('demoFillPro')}</button>
          </div>
        </div>
      )}

      {isSignup && (
        <Field label={t('fullName')}>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
      )}
      <Field label={t('email')}>
        <input type="email" placeholder={t('emailPlaceholder')} value={form.email} onChange={(e) => set('email', e.target.value)} />
      </Field>
      {isSignup && !isPro && (
        <Field label={t('phone')}>
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
      )}
      <Field label={t('password')}>
        <PasswordInput value={form.password} onChange={(e) => set('password', e.target.value)} />
      </Field>
      {isSignup && (
        <Field label={t('confirmPassword')}>
          <PasswordInput value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />
        </Field>
      )}

      {/* Professional-only signup fields */}
      {isSignup && isPro && (
        <>
          <Field label={t('proSpecialty')}>
            <input value={form.specialty} onChange={(e) => set('specialty', e.target.value)} />
          </Field>
          <Field label={t('proDegree')}>
            <input placeholder={t('proDegreePlaceholder')} value={form.degree} onChange={(e) => set('degree', e.target.value)} />
          </Field>

          <label className="field">{t('proDiploma')}</label>
          <p className="muted" style={{ fontSize: 12, margin: '0 0 8px' }}>{t('proDiplomaHint')}</p>
          <label className="upload-box">
            <input type="file" accept="image/*,application/pdf" onChange={onFile} style={{ display: 'none' }} />
            {!diploma ? (
              <span className="upload-cta">📎 {t('uploadFile')}</span>
            ) : (
              <div className="upload-preview">
                {diploma.type === 'application/pdf'
                  ? <span className="upload-ic">📄</span>
                  : <img src={diploma.dataUrl} alt={diploma.name} className="upload-thumb" />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{diploma.name}</b>
                  <span className="muted" style={{ fontSize: 12 }}>✓ {t('fileSelected')} — {t('changeFile')}</span>
                </div>
              </div>
            )}
          </label>

          <label className="field">{t('proExperience')}</label>
          {form.experiences.map((exp, i) => (
            <input key={i} style={{ marginBottom: 8 }} placeholder={t('proExpPlaceholder')} value={exp}
              onChange={(e) => set('experiences', form.experiences.map((x, j) => (j === i ? e.target.value : x)))} />
          ))}
          <button className="link" onClick={() => set('experiences', [...form.experiences, ''])}>{t('proAddExp')}</button>
          <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>⚠️ {t('proRequire')}</p>
          <div className="note" style={{ marginTop: 8 }}>ℹ️ {t('proFutureNote')}</div>
        </>
      )}

      {isSignup && (
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, margin: '14px 0 0' }}>
          <input type="checkbox" style={{ width: 'auto', marginTop: 2 }} checked={form.terms} onChange={(e) => set('terms', e.target.checked)} />
          <span>{t('acceptTerms')}</span>
        </label>
      )}
      {!isSignup && (
        <div style={{ textAlign: 'end', marginTop: 8 }}>
          <button className="link" onClick={() => alert(t('forgot'))}>{t('forgot')}</button>
        </div>
      )}

      <ErrorMsg>{error}</ErrorMsg>

      <div style={{ marginTop: 18 }}>
        <button className="btn" onClick={submit}>
          {isSignup ? (isPro ? t('submitRequest') : t('createAccount')) : t('login')} →
        </button>
        <div className="center" style={{ marginTop: 12 }}>
          <button className="link" onClick={() => { setError(''); setSent(false); setMode(isSignup ? 'login' : 'signup') }}>
            {isSignup ? t('yesAccount') : t('noAccount')}
          </button>
        </div>
      </div>
    </div>
  )
}


/* ---------------- User home / menu ---------------- */
export function Home({ go }) {
  const { t, user } = useApp()
  const items = [
    { key: 'questionnaire', ic: '📋', title: t('menuEvaluate'), sub: t('menuEvaluateSub') },
    { key: 'articles', ic: '🎬', title: t('menuKnow'), sub: t('menuKnowSub') },
    { key: 'change', ic: '🔎', title: t('menuChange'), sub: t('menuChangeSub') },
    { key: 'centers', ic: '📍', title: t('menuCenters'), sub: t('menuCentersSub') },
    { key: 'messages', ic: '💬', title: t('menuAsk'), sub: t('menuAskSub') },
  ]
  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h2 style={{ marginBottom: 0 }}>{t('greeting')} {user?.name} 💕</h2>
          <span className="muted">{t('takeCare')}</span>
        </div>
        <LangSwitch />
      </div>
      <div className="banner">
        <b>{t('bannerTitle')} 💗</b>
        <p>{t('bannerSub')}</p>
      </div>
      {items.map((it) => (
        <button key={it.key} className="menu-card" onClick={() => go(it.key)}>
          <span className="ic">{it.ic}</span>
          <span className="txt"><b>{it.title}</b><span>{it.sub}</span></span>
          <span className="chev">›</span>
        </button>
      ))}
      <div className="disclaimer">{t('disclaimer')}</div>
    </div>
  )
}

/* ---------------- Questionnaire ---------------- */
const QUESTIONS = [
  { key: 'familyHistory', labelKey: 'qFamilyHistory', weight: 2 },
  { key: 'personalHistory', labelKey: 'qPersonalHistory', weight: 2 },
  { key: 'smoking', labelKey: 'qSmoking', weight: 1 },
  { key: 'firstPeriod', labelKey: 'qFirstPeriod', weight: 1 },
  { key: 'lateMenopause', labelKey: 'qLateMenopause', weight: 1 },
]

export function Questionnaire({ go }) {
  const { t, setAnswers } = useApp()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ age: '', marital: '', familyHistory: null, personalHistory: null, smoking: null, firstPeriod: null, lateMenopause: null })
  const totalSteps = 3

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }))

  const YesNo = ({ k }) => (
    <div className="radio-row">
      <span className={`chip ${data[k] === true ? 'active' : ''}`} onClick={() => set(k, true)}>{t('qYes')}</span>
      <span className={`chip ${data[k] === false ? 'active' : ''}`} onClick={() => set(k, false)}>{t('qNo')}</span>
    </div>
  )

  const finish = () => {
    let score = 0
    QUESTIONS.forEach((q) => { if (data[q.key]) score += q.weight })
    const age = parseInt(data.age, 10)
    if (!isNaN(age) && age >= 50) score += 2
    else if (!isNaN(age) && age >= 40) score += 1
    const level = score >= 4 ? 'high' : score >= 2 ? 'moderate' : 'low'
    setAnswers({ ...data, score, level })
    go('result')
  }

  return (
    <div className="screen no-nav">
      <TopBar title={t('qTitle')} onBack={() => (step === 0 ? go('home') : setStep(step - 1))} />
      <div className="stepper">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'contents' }}>
            <div className={`dot ${i <= step ? 'active' : ''}`}>{i + 1}</div>
            {i < 2 && <div className="bar" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <>
          <h3>{t('qPersonal')}</h3>
          <label className="field">{t('qAge')}</label>
          <select value={data.age} onChange={(e) => set('age', e.target.value)}>
            <option value="">{t('qAgePlaceholder')}</option>
            {['< 30', '30-39', '40-49', '50-59', '≥ 60'].map((a, i) => {
              const val = [25, 35, 45, 55, 65][i]
              return <option key={a} value={val}>{a}</option>
            })}
          </select>
          <label className="field">{t('qMarital')}</label>
          <div className="radio-row">
            {[['single', 'qSingle'], ['married', 'qMarried'], ['divorced', 'qDivorced'], ['widowed', 'qWidowed']].map(([v, lk]) => (
              <span key={v} className={`chip ${data.marital === v ? 'active' : ''}`} onClick={() => set('marital', v)}>{t(lk)}</span>
            ))}
          </div>
          <div style={{ marginTop: 22 }}>
            <button className="btn" disabled={!data.age} onClick={() => setStep(1)}>{t('next')} →</button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h3>{t('qPersonal')}</h3>
          <label className="field">{t('qFamilyHistory')}</label>
          <YesNo k="familyHistory" />
          <label className="field">{t('qPersonalHistory')}</label>
          <YesNo k="personalHistory" />
          <label className="field">{t('qSmoking')}</label>
          <YesNo k="smoking" />
          <div style={{ marginTop: 22 }}>
            <button className="btn" onClick={() => setStep(2)}>{t('next')} →</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h3>{t('qPersonal')}</h3>
          <label className="field">{t('qFirstPeriod')}</label>
          <YesNo k="firstPeriod" />
          <label className="field">{t('qLateMenopause')}</label>
          <YesNo k="lateMenopause" />
          <div style={{ marginTop: 22 }}>
            <button className="btn" onClick={finish}>{t('seeResult')} →</button>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------- Result ---------------- */
export function Result({ go }) {
  const { t, answers } = useApp()
  const level = answers?.level || 'low'
  const high = level === 'high'
  const titleKey = level === 'high' ? 'resultHigh' : level === 'moderate' ? 'resultModerate' : 'resultLow'
  const descKey = level === 'high' ? 'resultHighDesc' : level === 'moderate' ? 'resultModerateDesc' : 'resultLowDesc'
  return (
    <div className="screen no-nav">
      <TopBar title={t('resultTitle')} onBack={() => go('home')} />
      <div className={`result-box ${high ? 'high' : 'low'}`}>
        <span className="ric">{high ? '⚠️' : '✅'}</span>
        <div>
          <b>{t(titleKey)}</b>
          <p style={{ margin: '6px 0 0', fontSize: 13.5 }}>{t(descKey)}</p>
        </div>
      </div>
      <button className="btn" onClick={() => go('centers')}>{t('seeCenters')} →</button>
      <div className="card" style={{ marginTop: 14 }}>
        <b>{t('adviceTitle')}</b>
        <div style={{ marginTop: 8 }}>
          {['advice1', 'advice2', 'advice3'].map((a) => (
            <div key={a} className="sign"><span className="ck">•</span>{t(a)}</div>
          ))}
        </div>
      </div>
      <div className="disclaimer">{t('noDiagnosis')}</div>
    </div>
  )
}

/* ---------------- Articles (shared by user + pro) ---------------- */
export function Articles({ go, isPro }) {
  const { t, lang, favorites, toggleFavorite } = useApp()
  const [open, setOpen] = useState(null)
  const typeLabel = (type) => (type === 'video' ? t('typeVideo') : type === 'audio' ? t('typeAudio') : t('typeText'))
  const icon = (type) => (type === 'video' ? '▶' : type === 'audio' ? '🎧' : '📄')
  const isFav = (id) => favorites.includes(id)

  if (open) {
    const a = open
    return (
      <div className="screen">
        <TopBar title={typeLabel(a.type)} onBack={() => setOpen(null)} />
        <div className="media">
          <div className="play">{icon(a.type)}</div>
          <span className="dur">{a.duration}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="tag">{typeLabel(a.type)}</span>
          {!isPro && (
            <button className="link" style={{ textDecoration: 'none', fontSize: 20 }}
              onClick={() => toggleFavorite(a.id)} aria-label={isFav(a.id) ? t('removeFav') : t('addFav')}>
              {isFav(a.id) ? '❤️' : '🤍'}
            </button>
          )}
        </div>
        <h3 style={{ marginTop: 8 }}>{a.title[lang]}</h3>
        <p className="muted" style={{ fontSize: 13 }}>{a.author}</p>
        <p>{a.body[lang]}</p>
      </div>
    )
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('articlesTitle')}</h2>
        <LangSwitch />
      </div>
      <p className="muted">{t('articlesSub')}</p>

      {isPro && (
        <button className="btn secondary" style={{ margin: '8px 0 14px' }}
          onClick={() => alert(t('proPublish'))}>+ {t('proPublish')}</button>
      )}

      {articles.map((a) => (
        <div key={a.id} className="menu-card" style={{ cursor: 'default' }}>
          <span className="ic" onClick={() => setOpen(a)} style={{ cursor: 'pointer' }}>{icon(a.type)}</span>
          <span className="txt" onClick={() => setOpen(a)} style={{ cursor: 'pointer' }}>
            <b>{a.title[lang]}</b><span>{typeLabel(a.type)} · {a.duration} · {a.author}</span>
          </span>
          {isPro ? (
            <span className="chev" onClick={() => setOpen(a)} style={{ cursor: 'pointer' }}>›</span>
          ) : (
            <button className="link" style={{ textDecoration: 'none', fontSize: 18 }}
              onClick={() => toggleFavorite(a.id)} aria-label={isFav(a.id) ? t('removeFav') : t('addFav')}>
              {isFav(a.id) ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      ))}

      <div className="card" style={{ marginTop: 8 }}>
        <b>{t('signsTitle')}</b>
        <div style={{ marginTop: 8 }}>
          {warningSigns[lang].map((s, i) => (
            <div key={i} className="sign"><span className="ck">✓</span>{s}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Change / symptoms ---------------- */
export function ChangeSymptoms({ go }) {
  const { t, lang, setAnswers } = useApp()
  const signs = warningSigns[lang]
  const [checked, setChecked] = useState([])
  const toggle = (i) => setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))
  const evaluate = () => {
    const level = checked.length >= 2 ? 'high' : checked.length === 1 ? 'moderate' : 'low'
    setAnswers({ symptoms: checked, level, score: checked.length })
    go('result')
  }
  return (
    <div className="screen no-nav">
      <TopBar title={t('changeTitle')} onBack={() => go('home')} />
      <p className="muted">{t('changeSub')}</p>
      {signs.map((s, i) => (
        <button key={i} className="menu-card" onClick={() => toggle(i)}
          style={checked.includes(i) ? { borderColor: 'var(--pink-500)', background: 'var(--pink-50)' } : undefined}>
          <span className="ic">{checked.includes(i) ? '✔️' : '○'}</span>
          <span className="txt"><b style={{ fontWeight: 500, fontSize: 14 }}>{s}</b></span>
        </button>
      ))}
      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={evaluate}>{t('seeResult')} →</button>
      </div>
      <div className="disclaimer">{t('noDiagnosis')}</div>
    </div>
  )
}

/* ---------------- Centers ---------------- */
export function Centers({ go }) {
  const { t, lang } = useApp()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const filters = [['all', 'filterAll'], ['screening', 'filterScreening'], ['mammo', 'filterMammo'], ['onco', 'filterOnco']]
  const list = centers.filter((c) =>
    (filter === 'all' || c.services.includes(filter)) &&
    (q === '' || c.name.toLowerCase().includes(q.toLowerCase()) || c.city.toLowerCase().includes(q.toLowerCase()))
  )
  return (
    <div className="screen">
      <TopBar title={t('centersTitle')} onBack={() => go('home')} />
      <input placeholder={t('centersSearch')} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="radio-row" style={{ margin: '12px 0' }}>
        {filters.map(([v, lk]) => (
          <span key={v} className={`chip ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{t(lk)}</span>
        ))}
      </div>
      <div className="media" style={{ height: 150, background: 'linear-gradient(135deg,#f8bbd0,#fce4ec)' }}>
        <span style={{ fontSize: 34 }}>🗺️📍</span>
      </div>
      {list.map((c) => (
        <div key={c.id} className="card">
          <b style={{ fontSize: 15 }}>{c.name}</b>
          <div className="muted" style={{ fontSize: 13, margin: '4px 0' }}>
            <span className="rating">★ {c.rating}</span> ({c.reviews}) · {c.city} · {c.distance}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
            {c.tags[lang].map((tg) => <span key={tg} className="pill-badge">{tg}</span>)}
          </div>
          <button className="btn" style={{ fontSize: 14, padding: '10px' }} onClick={() => alert(c.name)}>{t('seeDetails')}</button>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Messages ---------------- */
export function Messages({ go }) {
  const { t, lang } = useApp()
  const [msgs, setMsgs] = useState(sampleConversation[lang])
  const [text, setText] = useState('')
  const send = () => {
    if (!text.trim()) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMsgs((m) => [...m, { from: 'user', time, text }])
    setText('')
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'pro', time, text: sampleConversation[lang][1].text }])
    }, 900)
  }
  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => go('home')}>←</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 16, marginBottom: 0 }}>Dr. M. Benali 🩺</h2>
          <span className="muted" style={{ fontSize: 12, color: 'var(--ok-text)' }}>● {t('online')}</span>
        </div>
        <LangSwitch />
      </div>
      <div className="chat">
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.from}`}>
            {m.text}<span className="time">{m.time}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input placeholder={t('messagesPlaceholder')} value={text}
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button className="btn send" onClick={send}>➤</button>
      </div>
    </div>
  )
}

/* ---------------- Profile ---------------- */
export function Profile({ go }) {
  const { t, user, logout } = useApp()
  const [confirmOut, setConfirmOut] = useState(false)
  const isPro = user?.role === 'pro'
  const rows = isPro
    ? [['✉️', t('pMyMessages'), () => go('messages')], ['⚙️', t('pSettings'), null]]
    : [
        ['📝', t('pMyAnswers'), () => go('myAnswers')],
        ['📈', t('pMyFollow'), null],
        ['❤️', t('pMyFavorites'), () => go('favorites')],
        ['✉️', t('pMyMessages'), () => go('messages')],
        ['⚙️', t('pSettings'), null],
      ]
  return (
    <div className="screen">
      <TopBar title={t('profileTitle')} onBack={() => go(isPro ? 'proHome' : 'home')} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div className="avatar">{(user?.name || 'M')[0]}</div>
        <div>
          <b style={{ fontSize: 17 }}>{user?.name}</b>
          <div className="muted" style={{ fontSize: 13 }}>{t('profileSubtitle')} 💕</div>
        </div>
      </div>
      {rows.map(([ic, lbl, action]) => (
        <div key={lbl} className="row" onClick={() => (action ? action() : alert(lbl))}>
          <span className="ric">{ic}</span><span className="lbl">{lbl}</span><span className="chev">›</span>
        </div>
      ))}
      <div className="row" onClick={() => go('end')}>
        <span className="ric">🎗️</span><span className="lbl">{t('seeEnd')}</span><span className="chev">›</span>
      </div>
      <label className="field">{t('pLanguage')}</label>
      <LangSwitch />
      <div style={{ marginTop: 20 }}>
        <button className="btn secondary" onClick={() => setConfirmOut(true)}>{t('logout')}</button>
      </div>

      {confirmOut && (
        <div className="modal-overlay" onClick={() => setConfirmOut(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: 600, marginBottom: 16 }}>{t('logoutConfirm')}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn secondary" onClick={() => setConfirmOut(false)}>{t('cancel')}</button>
              <button className="btn" onClick={() => { logout(); go('welcome') }}>{t('confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- My answers ---------------- */
export function MyAnswers({ go }) {
  const { t, answers } = useApp()
  if (!answers) {
    return (
      <div className="screen">
        <TopBar title={t('pMyAnswers')} onBack={() => go('profile')} />
        <div className="card center">
          <p className="muted">{t('answersEmpty')}</p>
          <button className="btn" onClick={() => go('questionnaire')}>{t('doQuestionnaire')} →</button>
        </div>
      </div>
    )
  }
  const level = answers.level || 'low'
  const levelLabel = level === 'high' ? t('resultHigh') : level === 'moderate' ? t('resultModerate') : t('resultLow')
  const rows = [
    [t('qAge'), answers.age ? `${answers.age}` : '—'],
    [t('qMarital'), answers.marital || '—'],
    [t('qFamilyHistory'), answers.familyHistory == null ? '—' : answers.familyHistory ? t('qYes') : t('qNo')],
    [t('qPersonalHistory'), answers.personalHistory == null ? '—' : answers.personalHistory ? t('qYes') : t('qNo')],
    [t('qSmoking'), answers.smoking == null ? '—' : answers.smoking ? t('qYes') : t('qNo')],
  ].filter((r) => r[1] !== '—' || r[0] === t('qAge'))
  return (
    <div className="screen">
      <TopBar title={t('yourAnswers')} onBack={() => go('profile')} />
      <div className={`result-box ${level === 'high' ? 'high' : 'low'}`}>
        <span className="ric">{level === 'high' ? '⚠️' : '✅'}</span>
        <div><b>{t('riskLevel')}:</b> {levelLabel}</div>
      </div>
      <div className="card">
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 14 }}>
            <span className="muted">{k}</span><b>{v}</b>
          </div>
        ))}
      </div>
      <button className="btn secondary" onClick={() => go('questionnaire')}>{t('doQuestionnaire')}</button>
      <div className="disclaimer">{t('noDiagnosis')}</div>
    </div>
  )
}

/* ---------------- Favorites ---------------- */
export function Favorites({ go }) {
  const { t, lang, favorites } = useApp()
  const favArticles = articles.filter((a) => favorites.includes(a.id))
  const typeLabel = (type) => (type === 'video' ? t('typeVideo') : type === 'audio' ? t('typeAudio') : t('typeText'))
  const icon = (type) => (type === 'video' ? '▶' : type === 'audio' ? '🎧' : '📄')
  return (
    <div className="screen">
      <TopBar title={t('pMyFavorites')} onBack={() => go('profile')} />
      {favArticles.length === 0 ? (
        <div className="card center"><p className="muted">{t('favEmpty')}</p></div>
      ) : (
        favArticles.map((a) => (
          <button key={a.id} className="menu-card" onClick={() => go('articles')}>
            <span className="ic">{icon(a.type)}</span>
            <span className="txt"><b>{a.title[lang]}</b><span>{typeLabel(a.type)} · {a.author}</span></span>
            <span className="chev">❤️</span>
          </button>
        ))
      )}
    </div>
  )
}


/* ---------------- Professional home ---------------- */
export function ProHome({ go }) {
  const { t, user } = useApp()
  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h2 style={{ marginBottom: 0 }}>{t('greeting')} {user?.name} 🩺</h2>
          <span className="muted">{t('proHomeSub')}</span>
        </div>
        <LangSwitch />
      </div>
      <div className="note">ℹ️ {t('proOnlyModules')}</div>
      <button className="menu-card" onClick={() => go('articles')}>
        <span className="ic">🎬</span>
        <span className="txt"><b>{t('navArticles')}</b><span>{t('proMyContent')}</span></span>
        <span className="chev">›</span>
      </button>
      <button className="menu-card" onClick={() => go('messages')}>
        <span className="ic">💬</span>
        <span className="txt"><b>{t('navMessages')}</b><span>{t('proQuestions')}</span></span>
        <span className="chev">›</span>
      </button>
      <button className="menu-card" onClick={() => go('profile')}>
        <span className="ic">👤</span>
        <span className="txt"><b>{t('navProfile')}</b></span>
        <span className="chev">›</span>
      </button>
    </div>
  )
}
