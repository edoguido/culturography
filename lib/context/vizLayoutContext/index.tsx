import { createContext, useContext } from 'react'

// interface VizLayoutContextProperties {
//   state: [
//     layout: {
//       sidebarWidth?: { value: number; unit: string }
//       read?: boolean
//     },
//     setter: () => void
//   ]
// }

export const VizLayoutContext = createContext(null)

export const useVizLayout = () => {
  const vizLayoutState = useContext(VizLayoutContext)

  return vizLayoutState
}
