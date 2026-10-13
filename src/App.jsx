import { useState } from 'react'
import { useApp } from './AppContext'
import { BottomNav } from './components'
import {
  Splash, Welcome, Auth, Home, Questionnaire, Result, Articles,
  ChangeSymptoms, Centers, Messages, Profile, MyAnswers, Favorites, ProHome, EndPage,
} from './screens'

export default function App() {
  const { t, user } = useApp()
  const [screen, setScreen] = useState('splash')
  const go = (s) => setScreen(s)

  // Screens that show the bottom navigation (logged-in app area)
  const userNav = [
    { key: 'home', icon: '🏠', label: t('navHome') },
    { key: 'articles', icon: '📚', label: t('navArticles') },
    { key: 'messages', icon: '💬', label: t('navMessages') },
    { key: 'profile', icon: '👤', label: t('navProfile') },
  ]
  const proNav = [
    { key: 'proHome', icon: '🏠', label: t('navHome') },
    { key: 'articles', icon: '📚', label: t('navArticles') },
    { key: 'messages', icon: '💬', label: t('navMessages') },
    { key: 'profile', icon: '👤', label: t('navProfile') },
  ]

  const navScreens = ['home', 'proHome', 'articles', 'messages', 'profile', 'centers', 'myAnswers', 'favorites']
  const showNav = user && navScreens.includes(screen)
  const navItems = user?.role === 'pro' ? proNav : userNav
  // map current screen to a nav key for highlight
  const navCurrent = screen === 'proHome' ? 'proHome' : screen

  const render = () => {
    switch (screen) {
      case 'splash': return <Splash go={go} />
      case 'welcome': return <Welcome go={go} />
      case 'login': return <Auth go={go} mode="login" />
      case 'signup': return <Auth go={go} mode="signup" />
      case 'proHome': return <ProHome go={go} />
      case 'home': return <Home go={go} />
      case 'questionnaire': return <Questionnaire go={go} />
      case 'result': return <Result go={go} />
      case 'articles': return <Articles go={go} isPro={user?.role === 'pro'} />
      case 'change': return <ChangeSymptoms go={go} />
      case 'centers': return <Centers go={go} />
      case 'messages': return <Messages go={go} />
      case 'profile': return <Profile go={go} />
      case 'myAnswers': return <MyAnswers go={go} />
      case 'favorites': return <Favorites go={go} />
      case 'end': return <EndPage go={go} />
      default: return <Splash go={go} />
    }
  }

  return (
    <div className="app-shell">
      <div className="phone">
        {render()}
        {showNav && <BottomNav current={navCurrent} go={go} items={navItems} />}
      </div>
    </div>
  )
}
