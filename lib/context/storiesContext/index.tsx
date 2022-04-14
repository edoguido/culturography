import { createContext, useContext } from 'react'

const StoriesContext = createContext(null)
const StoriesProvider = StoriesContext.Provider
const useStories = () => useContext(StoriesContext)

export { StoriesProvider }
export default useStories
