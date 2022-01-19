import { createContext, useContext } from 'react'
import { globalCSSVarToPixels } from 'utils/theme'

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
    case 'SET': {
      return { ...payload }
    }

    case 'UPDATE_SIDEBAR_WIDTH': {
      return {
        ...state,
        sidebarWidth: payload,
      }
    }

    case 'TOGGLE_DEV': {
      return {
        ...state,
        development: !state.development,
      }
    }

    case 'DEV_TOGGLE_READ_MODE': {
      if (state.development === false) return { ...state }
      return {
        ...state,
        read: !state.read,
      }
    }

    case 'SET_APP_STATE': {
      return {
        ...state,
        appState: payload.appState,
      }
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
            zoom: left.zoom,
          },
          right: {
            zoom: right.zoom,
          },
        },
      }
    }

    case 'UPDATE_STORY_DATA': {
      const {
        story,
        clusters: { left_network_shapefile, right_network_shapefile },
        block,
      } = payload

      return {
        ...state,
        story: {
          ...state.story,
          chapter: story.chapter,
          block: story.block,
        },
        //
        clusters: {
          ...state.clusters,
          metadata: state.clusters.metadata,
          //
          highlight: block?.network_control.highlight || null,
          //
          left: {
            ...state.clusters.left,
            shapefile: left_network_shapefile || state.clusters.left.shapefile,
            zoom:
              block?.network_control.left_cluster_zoom ||
              state.clusters.left.zoom,
          },
          //
          right: {
            ...state.clusters.right,
            shapefile:
              right_network_shapefile || state.clusters.right.shapefile,
            zoom:
              block?.network_control.right_cluster_zoom ||
              state.clusters.right.zoom,
          },
        },
      }
    }

    case 'UPDATE_STORY_METADATA': {
      const { metadata } = payload

      return {
        ...state,
        clusters: {
          ...state.clusters,
          metadata: metadata,
        },
      }
    }

    default: {
      return state
    }
  }
}
