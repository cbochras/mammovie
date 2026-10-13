# MAMMOVIE 🎗️

A prototype web/mobile app for breast cancer awareness, risk assessment, and
early orientation for women — built with React + Vite as an installable PWA.

> **Prototype only.** Mock data, no backend, client-side storage. Not a medical
> device and **does not provide a diagnosis**.

## Live demo

- **Web:** https://mammovie.netlify.app
- **Android:** installable `.apk` generated via [PWABuilder](https://www.pwabuilder.com)

## Features

- **3 modules:** risk-assessment questionnaire, educational articles
  (video/audio/text), and an exchange space with health professionals (messages)
- **3 languages:** French, English, Arabic (with RTL support)
- **Two roles:**
  - *Users* sign up instantly (no approval)
  - *Professionals* sign up with a diploma upload + experiences, then require approval
- Installable PWA (offline-capable), splash screen, favorites, profile

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| User | `user@mammovie.com` | `demo1234` |
| Professional (approved) | `pro@mammovie.com` | `demo1234` |

## Development

```bash
npm install
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build into dist/
npm run preview    # preview the production build
```

Regenerate the app icons (optional):

```bash
node gen-icons.cjs
```

## Tech

- React 19 + Vite
- No backend — accounts, answers, and favorites are stored in `localStorage`
- i18n via a simple dictionary (`src/i18n.js`)

## Project structure

```
src/
  App.jsx          screen router + bottom nav
  AppContext.jsx   state: language, auth, favorites, demo accounts
  screens.jsx      all screens (welcome, auth, questionnaire, articles, ...)
  components.jsx   shared UI (logo, language switch, top bar, nav)
  data.js          mock articles, centers, conversations
  i18n.js          FR / EN / AR translations
public/
  manifest.webmanifest, sw.js, icons
```

## Possible future enhancements

- Real backend + database; secure authentication; social login
- **Automatic professional verification via third parties** (medical board,
  diploma checks) instead of manual approval
- Real-time messaging, interactive care-center map, professional-managed content
- Self-exam reminders, personalized tracking, medically validated content
