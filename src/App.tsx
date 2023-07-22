import React, { Suspense, useEffect, useLayoutEffect, useState } from 'react'
import 'react-contexify/dist/ReactContexify.css'
import 'src/assets/App.css'
import { DNDLayout, Header } from 'src/components/Layout'
import { MarketingBanner } from 'src/features/MarketingBanner'
import { BookmarksSidebar } from 'src/features/bookmarks'
import { setupAnalytics, setupIdentification, trackPageView } from 'src/lib/analytics'
import { useUserPreferences } from 'src/stores/preferences'
import { diffBetweenTwoDatesInDays } from 'src/utils/DateUtils'
import { AppContentLayout } from './components/Layout'
import { isWebOrExtensionVersion } from './utils/Environment'
import { getAppVersion } from './utils/Os'

const OnboardingModal = React.lazy(() =>
  import('src/features/onboarding').then((module) => ({ default: module.OnboardingModal }))
)

const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      document.documentElement.classList.remove('dndState')
    } else {
      document.documentElement.classList.add('dndState')
    }
  })
}

export const App = () => {
  const [showSideBar, setShowSideBar] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const {
    onboardingCompleted,
    firstSeenDate,
    markOnboardingAsCompleted,
    maxVisibleCards,
    isDNDModeActive,
    DNDDuration,
    setDNDDuration,
  } = useUserPreferences()

  useLayoutEffect(() => {
    const appVersion = getAppVersion()
    if (!onboardingCompleted && appVersion && appVersion <= '1.15.9') {
      const usageDays = diffBetweenTwoDatesInDays(firstSeenDate, Date.now())
      if (usageDays > 0) {
        markOnboardingAsCompleted(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingCompleted, firstSeenDate])

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--max-visible-cards', maxVisibleCards.toString())
  }, [maxVisibleCards])

  useEffect(() => {
    document.body.classList.remove('preload')
    setupAnalytics()
    setupIdentification()
  }, [])

  useEffect(() => {
    trackPageView('home', isDNDModeActive())
    if (!isDNDModeActive() && DNDDuration !== 'never') {
      setDNDDuration('never')
    }
  }, [DNDDuration, isDNDModeActive, setDNDDuration])

  useLayoutEffect(() => {
    let dndContent = document.querySelector('.DNDContent')
    let observer = new IntersectionObserver(intersectionCallback, {
      threshold: 0.1,
    })

    if (dndContent) {
      observer.observe(dndContent)
    } else {
      document.documentElement.classList.remove('dndState')
    }

    return () => {
      observer.disconnect()
    }
  }, [DNDDuration])

  return (
    <>
      <MarketingBanner />

      <div className="App">
        {!onboardingCompleted && isWebOrExtensionVersion() === 'extension' && (
          <Suspense fallback={null}>
            <OnboardingModal
              showOnboarding={showOnboarding}
              setShowOnboarding={setShowOnboarding}
            />
          </Suspense>
        )}
        <Header
          setShowSideBar={setShowSideBar}
          showSideBar={showSideBar}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />

        <div className="layoutLayers hideScrollBar">
          {isDNDModeActive() && <DNDLayout />}
          <AppContentLayout setShowSettings={setShowSettings} />
        </div>
        <BookmarksSidebar showSidebar={showSideBar} onClose={() => setShowSideBar(false)} />
      </div>
    </>
  )
}
