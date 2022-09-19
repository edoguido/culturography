import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

//
import { motionOptions } from '@/const/motionProps'
import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'

import Legend from 'components/visualization/molecules/legend'
import { motion } from 'framer-motion'
import { NetworkName } from '@/types/visualization'
import { SOURCE_NETWORK_NAME, TARGET_NETWORK_NAME } from '@/const/visualization'
import DetailSidebar from 'components/visualization/molecules/exploreSidebar'

const SingleNetwork = dynamic(
  () => import('components/visualization/molecules/singleNetwork'),
  { ssr: false }
)

// Network viz layout props
const HALF_WIDTH = '49.75%'
const HALF_WIDTH_READ = '37.75%'
const EXPANDED_WIDTH = '75%'
const HALF_LEFT = '50.25%'
const HALF_LEFT_READ = '38.25%'

//

const networkNames: [NetworkName, NetworkName] = [
  SOURCE_NETWORK_NAME,
  TARGET_NETWORK_NAME,
]

const NetworkComparison = ({ data }) => {
  const [layout, dispatch] = useVizLayout()
  const { read } = layout
  const { block, chapter } = layout.story
  //
  const currentChapterData = data.story_chapters[chapter]
  const metadataPath = currentChapterData.network_metadata.asset.path
  //
  useEffect(() => {
    if (!layout.networks) return null

    const fetchMetadata = async () => {
      const clusterMetadata = await fetch(
        `https://api.sanity.io/${metadataPath}`
      ).then((r) => r.json())

      return clusterMetadata
    }

    const dispatchClustersState = (metadata) => {
      dispatch({
        type: 'UPDATE_STORY_METADATA',
        payload: { metadata },
      })
    }

    fetchMetadata().then(dispatchClustersState)
  }, [metadataPath])

  const computeNetworkLayoutProperties = useCallback(
    ({ source, visible }) => {
      const width = (() => {
        if (!read) return HALF_WIDTH_READ
        if (showBothNetworks) return HALF_WIDTH
        if (visible) return EXPANDED_WIDTH
        return HALF_WIDTH
      })()

      const left = (() => {
        if (source) return '0%'
        if (!read && source) return '0%'
        if (!read && !source) return HALF_LEFT_READ
        if (showBothNetworks) return HALF_LEFT
        if (visible) return '25%'
        return HALF_LEFT
      })()

      const opacity = (() => {
        if (showBothNetworks || visible || !read) return 1
        return 0.05
      })()

      const zIndex = (() => {
        if (showBothNetworks) return 1
        if (visible) return 2
        return 1
      })()

      const transformOrigin = source ? '100% 50% 0px' : '0% 50% 0px'

      return {
        show: visible,
        animate: {
          zIndex: zIndex,
          width: width,
          left: left,
          opacity: opacity,
        },
        style: {
          transformOrigin: transformOrigin,
        },
      }
    },
    [block, read]
  )
  //
  // if we don't have data about the networks, we simply don't render
  if (!layout.networks) return null
  //
  // story properties
  const { networks: networksVisibility } = layout
  //
  // net properties
  const networksData = data.story_chapters[layout.story.chapter]
  //
  // clusters properties
  const rawClusterId = layout.networks.nameHighlight
    ? JSON.parse(layout.networks.nameHighlight)
    : null
  const isHighlighting = !isNaN(rawClusterId)
  const activeClusterId = isHighlighting ? rawClusterId : null
  //
  const clusterIdMatch = (c: ClusterObjectProps) =>
    c.cluster_id == activeClusterId

  const activeCluster: ClusterObjectProps =
    layout.clusters?.find(clusterIdMatch) || null

  // layout properties
  const showBothNetworks =
    networksVisibility.source.show && networksVisibility.target.show

  return (
    <motion.div
      className="fixed inset-0 top-[calc(var(--nav-height)*1.5)] bottom-2 mx-2"
      initial={false}
      transition={motionOptions}
    >
      {layout.clusters && (
        <div className="absolute right-0 bottom-0 left-0 top-0 flex">
          {/*  */}
          <Legend />
          {/*  */}
          {networkNames.map((n: NetworkName) => {
            const { animate, style } = computeNetworkLayoutProperties({
              source: n === SOURCE_NETWORK_NAME,
              visible: networksVisibility[n].show,
            })
            return (
              <motion.div
                key={n}
                className="absolute z-10 inset-0 w-1/2 rounded-lg overflow-hidden bg-black flex flex-1 justify-center items-center"
                layout
                initial={false}
                animate={animate}
                style={style}
                transition={{
                  type: 'spring',
                  stiffness: 1800,
                  damping: 280,
                }}
              >
                <SingleNetwork
                  accessor={n}
                  data={networksData.networks}
                  activeCluster={activeCluster}
                />
              </motion.div>
            )
          })}
          <DetailSidebar activeCluster={activeCluster} />
        </div>
      )}
    </motion.div>
  )
}

export default NetworkComparison
