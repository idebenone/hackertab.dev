import { SUPPORTED_SEARCH_ENGINES } from 'src/config'
import { useUserPreferences } from 'src/stores/preferences'
import { SearchBar } from '../SearchBar/SearchBar'

export const SearchBarWithLogo = () => {
  const { searchEngine } = useUserPreferences()
  const userSearchEngine = SUPPORTED_SEARCH_ENGINES.find(
    (srchEngn) => srchEngn.label === searchEngine
  )

  return (
    <div className="searchBarWithLogo">
      {userSearchEngine && userSearchEngine.logo && (
        <div className="searchEngineLogo">
          <userSearchEngine.logo />
        </div>
      )}
      <SearchBar />
    </div>
  )
}
