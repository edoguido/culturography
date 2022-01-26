import { createContext, useContext } from 'react'
import { rankedClusters } from 'utils/dataManipulations'

// types

export interface ClusterObjectProps {
  network?: string
  cluster_original?: number
  cluster_id?: number
  name?: string
  centroid?: [number, number] | null
  shape?: number[]
  similarities?: object
}

export interface VizLayoutAction {
  type: string
}

export interface VizLayoutState extends VizLayoutAction {
  development?: boolean
  sidebarWidth?: { unit: string; value: number }
  read?: boolean
  story?: { chapter: number | null; block: number | null }
  clusters?: object[]
  networks?: {
    highlight: string
    source: {
      show: boolean
      zoom: string | null
    }
    target: {
      show: boolean
      zoom: string | null
    }
  }
}

export interface VizLayoutContextUpdater {
  stateSetter: (newState: VizLayoutState) => void
}

export interface VizLayoutContextInterface {
  state: VizLayoutState
  stateSetter: VizLayoutContextUpdater
}

// utils

export const makeStoryPayload = ({ source, chapterIndex, blockIndex }) => {
  const { title } = source

  const chapter = source.story_chapters[chapterIndex]
  const block = chapter.blocks[blockIndex]

  // const {
  //   left_network_name,
  //   source_network_id,
  //   right_network_name,
  //   target_network_id,
  // } = chapter.networks

  const {
    highlight,
    show_left_network,
    show_right_network,
    left_cluster_zoom,
    right_cluster_zoom,
  } = block.network_control

  return {
    story: { title, chapter: chapterIndex, block: blockIndex },
    networks: {
      highlight: highlight,
      source: {
        // id: source_network_id,
        // name: left_network_name,
        show: show_left_network,
        zoom: left_cluster_zoom,
      },
      target: {
        // id: target_network_id,
        // name: right_network_name,
        show: show_right_network,
        zoom: right_cluster_zoom,
      },
    },
  }
}

// hook

export const VizLayoutContext = createContext(null)

export const useVizLayout = () => {
  const vizLayout: [a: VizLayoutState, b: any] = useContext(VizLayoutContext)
  return vizLayout
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

    case 'TOGGLE_READ_MODE':
      return {
        ...state,
        read: !state.read,
      }

    case 'UPDATE_STORY_DATA': {
      const { story, networks } = payload

      const { chapter, block } = story
      const { highlight, source, target } = networks

      return {
        ...state,
        story: {
          ...state.story,
          chapter,
          block,
        },
        networks: {
          ...state.networks,
          highlight,
          source,
          target,
        },
      }
    }

    case 'UPDATE_STORY_METADATA': {
      const { metadata } = payload

      return {
        ...state,
        clusters: rankedClusters(metadata),
      }
    }

    default: {
      return state
    }
  }
}
