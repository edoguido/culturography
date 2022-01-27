import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

const SingleNetwork = dynamic(
  () => import('components/molecules/singleNetwork'),
  { ssr: false }
)

import { motionOptions } from '@/const/motionProps'
import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'
// import ProjectTimeline from 'components/molecules/timeline'

import * as Styled from './styled'
import { AnimatePresence, motion } from 'framer-motion'

const networks = ['left', 'right']

const NetworkComparison = ({ data }) => {
  const [layout, dispatch] = useVizLayout()
  //
  // story properties
  const currentBlock = layout.story.block
  // networks properties
  const networksData = data.story_chapters[layout.story.chapter]
  const networksProperties = layout.networks
  const targetNetworkName = networksData.networks.right_network_name
  //
  // clusters properties
  const highlightedClusterIndex: number = isNaN(+layout.networks.highlight)
    ? null
    : +layout.networks.highlight - 1
  //
  const highlightedCluster: ClusterObjectProps =
    highlightedClusterIndex !== null
      ? layout?.clusters[highlightedClusterIndex]
      : null

  // layout properties
  const showBothNetworks =
    networksProperties.source.show && networksProperties.target.show

  useEffect(() => {
    const metadata = data.network_metadata.asset

    const fetchMetadata = async () => {
      let data

      try {
        data = await fetch(`https://api.sanity.io/${metadata.path}`).then((r) =>
          r.json()
        )
      } catch {
        const { source_network_id, target_network_id } = networksData.networks

        data =
          await require(`../../../../public/data/${source_network_id}_${target_network_id}_clusters.json`)
      }

      return data
    }

    const updateMetadata = (metadata) => {
      dispatch({
        type: 'UPDATE_STORY_METADATA',
        payload: { metadata },
      })
    }

    fetchMetadata().then(updateMetadata)
  }, [])

  const networkLayoutProperties = useCallback(
    (source) => {
      const show = source
        ? networksProperties.source.show
        : networksProperties.target.show

      const width = showBothNetworks ? '50%' : show ? '85%' : '50%'
      const zIndex = showBothNetworks ? 1 : show ? 2 : 1
      const scale = show ? 1 : 0.9
      const opacity = showBothNetworks || show ? 1 : 0.05
      const transformOrigin = source ? '100% 50% 0px' : '0% 50% 0px'
      const x = source ? (show ? 0 : -20) : show ? 0 : 0

      return {
        show: show,
        animate: {
          zIndex: zIndex,
          width: width,
          left: source ? '0%' : showBothNetworks ? '50%' : show ? '20%' : '50%',
          x: x,
          transformOrigin: transformOrigin,
          scale: scale,
          opacity: opacity,
        },
      }
    },
    [currentBlock]
  )

  return (
    <Styled.NetworkComparisonWrapper
      initial={false}
      animate={{
        right: layout.read ? layout.sidebarWidth.value : 0,
        // bottom: layout.read
        //   ? 0
        //   : globalCSSVarToPixels('--timeline-height').value,
      }}
      transition={motionOptions}
    >
      {layout.clusters && (
        <Styled.NetworkComparisonContent>
          {/*  */}
          {highlightedCluster && targetNetworkName && (
            <motion.div
              layout
              initial={{
                y: 10,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 20,
                opacity: 0,
              }}
              transition={{
                type: 'ease',
                ease: [0, 0, 0, 1],
                duration: 0.35,
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                zIndex: 99,
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                }}
              >
                <span>Observing the</span>
                <AnimatePresence key={highlightedCluster.name} exitBeforeEnter>
                  {layout.clusters.map((c: ClusterObjectProps) => {
                    return (
                      c.name === highlightedCluster.name && (
                        <motion.div
                          id={c.name}
                          key={c.name}
                          layout
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -30, opacity: 0 }}
                          transition={{
                            type: 'ease',
                            ease: [0, 0, 0, 1],
                            duration: 0.35,
                          }}
                          style={{
                            backgroundColor: 'white',
                            color: 'black',
                            padding: '.125rem .5rem',
                            margin: '0 .5rem',
                            borderRadius: '99rem',
                          }}
                        >
                          {highlightedCluster.name}
                        </motion.div>
                      )
                    )
                  })}
                </AnimatePresence>
                <span>cluster</span>
              </div>
              {showBothNetworks && (
                <AnimatePresence key={targetNetworkName}>
                  <motion.div
                    layout
                    key={targetNetworkName}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 1 }}
                    transition={{
                      type: 'ease',
                      ease: [0, 0, 0, 1],
                      duration: 0.35,
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      margin: '0 .3125rem',
                    }}
                  >
                    <span>correspondences in the</span>
                    <span
                      style={{
                        backgroundColor: 'white',
                        color: 'black',
                        padding: '.125rem .5rem',
                        borderRadius: '99rem',
                        margin: '0 0.3125rem',
                      }}
                    >
                      {targetNetworkName}
                    </span>
                    <span>network</span>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {networks.map((n) => {
            const isSource = n === 'left' || n === 'source'
            const { animate } = networkLayoutProperties(isSource)

            return (
              <Styled.NetworkComparisonSingleNetworkWrapper
                key={n}
                layout
                initial={false}
                animate={animate}
                transition={{
                  type: 'spring',
                  stiffness: 800,
                  damping: 60,
                }}
              >
                <SingleNetwork
                  data={networksData}
                  activeCluster={highlightedClusterIndex}
                  accessor={n}
                />
              </Styled.NetworkComparisonSingleNetworkWrapper>
            )
          })}
          {/* <ProjectTimeline /> */}
        </Styled.NetworkComparisonContent>
      )}
    </Styled.NetworkComparisonWrapper>
  )
}

export default NetworkComparison
