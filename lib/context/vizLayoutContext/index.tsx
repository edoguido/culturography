import { createContext, useContext } from 'react'
import { rankedClusters } from 'utils/data'

// types

interface NetworkNode {
  id: string
  x: number
  y: number
  cluster_id: string | number
}

export interface ClusterObjectProps {
  network?: string
  cluster_original?: number
  cluster_id?: number
  name?: string
  centroid?: [number, number]
  pca_centroid?: [number, number]
  shape?: number[]
  similarities?: object
  nodes?: NetworkNode[]
}

export interface VizLayoutAction {
  type: string
}

export interface VizLayoutState extends VizLayoutAction {
  development?: boolean
  sidebarWidth?: { unit: string; value: number }
  read?: boolean
  story?: { phase: string; chapter: number | null; block: number | null }
  clusters?: object[]
  networks?: {
    highlight: string
    legend: string[]
    nameHighlight: string
    zoomLevel: number
    source: {
      name: string
      show: boolean
      zoom: string | null
    }
    target: {
      name: string
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
  const { title, phase } = source

  const chapter = source.story_chapters[chapterIndex]
  const block = chapter.blocks[blockIndex]

  if (!chapter.networks) {
    return { story: { title, phase, chapter: chapterIndex, block: blockIndex } }
  }

  const {
    source_network_name,
    // source_network_id,
    target_network_name,
    // target_network_id,
  } = chapter.networks

  const {
    highlight,
    network_cluster_highlight,
    zoom_source_level,
    zoom_target_level,
    show_source_network,
    show_target_network,
    // source_cluster_zoom,
    // target_cluster_zoom,
  } = block.network_control

  return {
    story: { title, phase, chapter: chapterIndex, block: blockIndex },
    networks: {
      highlight: highlight,
      nameHighlight: network_cluster_highlight,
      source: {
        // id: source_network_id,
        name: source_network_name,
        show: show_source_network,
        zoomLevel: zoom_source_level,
        // zoom: source_cluster_zoom,
      },
      target: {
        // id: target_network_id,
        name: target_network_name,
        show: show_target_network,
        zoomLevel: zoom_target_level,
        // zoom: target_cluster_zoom,
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

    case 'SET_LEGEND': {
      const { legend } = payload

      return {
        ...state,
        networks: {
          ...state.networks,
          legend,
        },
      }
    }

    case 'UPDATE_STORY_DATA': {
      const { story, networks } = payload

      const { phase, chapter, block } = story

      if (!networks) {
        return {
          story: {
            ...state.story,
            phase,
            chapter,
            block,
          },
        }
      }

      const { highlight, nameHighlight, source, target } = networks

      return {
        ...state,
        story: {
          ...state.story,
          phase,
          chapter,
          block,
        },
        networks: {
          ...state.networks,
          highlight,
          nameHighlight,
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
