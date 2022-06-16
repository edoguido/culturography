import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

const SingleNetwork = dynamic(
  () => import('components/molecules/singleNetwork'),
  { ssr: false }
)

//
import { motionOptions } from '@/const/motionProps'
import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'

import Legend from 'components/molecules/legend'
import { motion } from 'framer-motion'

// Network viz layout props
const HALF_WIDTH = '49.75%'
const EXPANDED_WIDTH = '75%'
const HALF_LEFT = '50.25%'

const networkNames = ['source', 'target']

const NetworkComparison = ({ data }) => {
  const [layout, dispatch] = useVizLayout()
  const { read } = layout
  const { block } = layout.story
  //
  useEffect(() => {
    if (!layout.networks) return null

    const fetchMetadata = async () => {
      let clusterMetadata

      const clustersMetadataPath = data.network_metadata.asset.path

      clusterMetadata = await fetch(
        `https://api.sanity.io/${clustersMetadataPath}`
      ).then((r) => r.json())

      return clusterMetadata
    }

    const updateMetadata = (metadata) => {
      dispatch({
        type: 'UPDATE_STORY_METADATA',
        payload: { metadata },
      })
    }

    fetchMetadata().then(updateMetadata)
  }, [data.network_metadata?.asset])

  const networkLayoutProperties = useCallback(
    ({ source, visible }) => {
      const show = visible

      const width = (() => {
        if (!read) return HALF_WIDTH
        if (showBothNetworks) return HALF_WIDTH
        if (show) return EXPANDED_WIDTH
        return HALF_WIDTH
      })()

      const left = (() => {
        if (source) return '0%'
        if (!read && source) return '0%'
        if (!read && !source) return HALF_LEFT
        if (showBothNetworks) return HALF_LEFT
        if (show) return '25%'
        return HALF_LEFT
      })()

      const opacity = (() => {
        if (showBothNetworks || show || !read) return 1
        return 0.05
      })()

      const zIndex = (() => {
        if (showBothNetworks) return 1
        if (show) return 2
        return 1
      })()

      const transformOrigin = source ? '100% 50% 0px' : '0% 50% 0px'

      return {
        show: show,
        animate: {
          zIndex: zIndex,
          width: width,
          left: left,
          // x: x,
          // scale: scale,
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
  // if we don't have data about the networks, we simply don't show the comparison
  if (!layout.networks) return null
  //
  // story properties
  const { networks: networksVisibility } = layout
  //
  // net properties
  const networksData = data.story_chapters[layout.story.chapter]
  // const targetNetworkName = networksData.networks.target_network_name
  //
  // clusters properties
  const rawClusterId = +layout.networks?.nameHighlight
  const activeClusterId: number = isNaN(rawClusterId) ? null : rawClusterId
  //
  const clusterIdMatch = (c: ClusterObjectProps) =>
    c.cluster_id == activeClusterId

  const activeCluster: ClusterObjectProps = activeClusterId
    ? layout?.clusters?.find(clusterIdMatch)
    : null

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
          {networkNames.map((n) => {
            const isSource = n === 'source'
            const isVisible = networksVisibility[n].show
            const { animate, style } = networkLayoutProperties({
              source: isSource,
              visible: isVisible,
            })
            return (
              <motion.div
                key={n}
                className="absolute inset-0 w-1/2 rounded-lg overflow-hidden bg-black flex flex-1 justify-center items-center"
                layout
                initial={false}
                animate={animate}
                style={style}
                transition={{
                  type: 'spring',
                  stiffness: 1800,
                  damping: 220,
                }}
              >
                <SingleNetwork
                  data={networksData}
                  activeCluster={activeCluster}
                  activeClusterId={activeClusterId}
                  accessor={n}
                />
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default NetworkComparison
