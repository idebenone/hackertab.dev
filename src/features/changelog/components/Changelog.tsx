import { useEffect, useState } from 'react'
import { HiSparkles } from 'react-icons/hi'
import ReactMarkdown from 'react-markdown'
import BeatLoader from 'react-spinners/BeatLoader'
import ReactTooltip from 'react-tooltip'
import { trackChangeLogOpen } from 'src/lib/analytics'
import { getAppVersion } from 'src/utils/Os'
import { format } from 'timeago.js'
import { useGetVersions } from '../api/getVersions'
import { useChangelogStore } from '../stores/changelog'

export const Changelog = () => {
  const tooltipId = 'tl-1'
  const [tooltipShown, setTooltipShown] = useState(false)
  const {
    isLoading,
    isError,
    data: versions,
  } = useGetVersions({
    config: {
      enabled: tooltipShown,
    },
  })

  const { lastReadVersion, setVersionAsRead } = useChangelogStore()

  const isChangelogRead = (): boolean => {
    return lastReadVersion === getAppVersion()
  }

  useEffect(() => {
    const currentVersion = getAppVersion()
    if (tooltipShown) {
      trackChangeLogOpen()

      if (currentVersion) {
        setVersionAsRead(currentVersion)
      }
    }
  }, [tooltipShown, setVersionAsRead])

  return (
    <>
      <ReactTooltip
        id={tooltipId}
        event="click"
        scrollHide={false}
        afterShow={() => {
          setTooltipShown(true)
        }}
        place="bottom"
        className="changelogTooltip scrollable"
        globalEventOff="click">
        {isLoading ? (
          <div className="tooltipLoading">
            <BeatLoader color={'#A9B2BD'} loading={isLoading} size={15} />
          </div>
        ) : isError || !versions.length ? (
          <p className="tooltipErrorMsg">Failed to load the changelog</p>
        ) : (
          versions.map((item) => {
            return (
              <div key={item.name}>
                <div className="tooltipHeader">
                  <a
                    href="/#"
                    className="tooltipVersion"
                    onClick={() => window.open(item.html_url, '_blank')}>
                    {item.name}
                  </a>
                  <span className="tooltipDate">{format(new Date(item.published_at))}</span>
                </div>
                <div className="tooltipContent">
                  <ReactMarkdown children={item.body} />
                </div>
              </div>
            )
          })
        )}
      </ReactTooltip>
      <button
        aria-label="Open changelog"
        className={'changelogButton' + (!isChangelogRead() ? ' active' : '')}
        data-for={tooltipId}
        data-tip>
        <div className="changelogNewButton">
          <HiSparkles style={{ width: 14 }} /> {!isChangelogRead() && 'New'}
        </div>
      </button>
    </>
  )
}
