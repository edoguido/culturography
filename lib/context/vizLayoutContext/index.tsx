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

// actions

export interface VizLayoutAction {
  type: string
}

export interface VizLayoutSetAction extends VizLayoutAction {
  payload: {
    development: boolean
    sidebarWidth: object
    read: true
    story: { chapter: number | null; block: number | null; data: any }
    clusters: {
      highlight: { type: string | null; id: number | null }
      left: { shapefile: object | null; zoom: string | number | null }
      right: { shapefile: object | null; zoom: string | number | null }
    }
  }
}

// utils

export const VizLayoutContext = createContext(null)

export const useVizLayout = () => {
  const vizLayoutState = useContext(VizLayoutContext)

  return vizLayoutState
}

// reducer

export const vizLayoutReducer = (state, action) => {
  const { payload, type } = action

  switch (type.toUpperCase()) {
    case 'SET':
      return { ...action.payload }

    case 'TOGGLE_DEV':
      return {
        ...state,
        development: !state.development,
      }

    case 'DEV_TOGGLE_READ_MODE':
      if (state.development === false) return { ...state }
      return {
        ...state,
        read: !state.read,
      }

    case 'TOGGLE_READ_MODE':
      return {
        ...state,
        read: !state.read,
      }

    case 'UPDATE_VIZ': {
      const { highlight, left, right } = payload.clusters

      return {
        ...state,
        clusters: {
          ...state.clusters,
          highlight,
          left,
          right,
        },
      }
    }
    case 'UPDATE_VIZ_FEATURES': {
      const { highlight, left, right } = payload.clusters

      return {
        ...state,
        clusters: {
          ...state.clusters,
          highlight,
          left: {
            ...left,
            zoom: left.zoom,
          },
          right: {
            ...right,
            zoom: right.zoom,
          },
        },
      }
    }

    case 'UPDATE_STORY_CHAPTER': {
      const {
        story: { chapter },
        clusters: { left, right },
      } = payload

      return {
        ...state,
        story: {
          ...state.story,
          chapter,
        },
        clusters: {
          ...state.clusters,
          left,
          right,
        },
      }
    }

    default: {
      return state
    }
  }
}
