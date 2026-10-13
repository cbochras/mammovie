import { useApp } from './AppContext'
import { LANGUAGES } from './i18n'

export function Logo({ small }) {
  return (
    <div className="logo" style={small ? { fontSize: 14 } : undefined}>
      <span className="ribbon">🎗️</span>
      <b>MAMMO<span>VIE</span></b>
    </div>
  )
}

export function LangSwitch() {
  const { lang, setLang } = useApp()
  return (
    <div className="lang-switch">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={lang === l.code ? 'active' : ''}
          onClick={() => setLang(l.code)}
          aria-label={l.label}
        >
          <span>{l.flag}</span>
          <span>{l.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}

export function TopBar({ title, onBack }) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="back" onClick={onBack} aria-label="Back">←</button>
      )}
      <h2>{title}</h2>
      <LangSwitch />
    </div>
  )
}

export function BottomNav({ current, go, items }) {
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button
          key={it.key}
          className={current === it.key ? 'active' : ''}
          onClick={() => go(it.key)}
        >
          <span className="nic">{it.icon}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  )
}
