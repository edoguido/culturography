import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const SingleNetwork = dynamic(
  () => import('components/molecules/singleNetwork'),
  { ssr: false }
)

import { motionOptions } from '@/const/motionProps'
import { useVizLayout } from '@/context/vizLayoutContext'
// import ProjectTimeline from 'components/molecules/timeline'

import * as Styled from './styled'

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
      const x = source ? (show ? 0 : -20) : show ? 0 : 40

      return {
        show: show,
        animate: {
          zIndex: zIndex,
          width: width,
          left: source ? '0%' : '50%',
          right: source ? '50%' : '0%',
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
          {highlightedCluster && targetNetworkName && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                zIndex: 99,
                padding: '1rem',
              }}
            >
              Observing the{' '}
              <span
                style={{
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '.125rem .5rem',
                  borderRadius: '99rem',
                }}
              >
                {highlightedCluster.name}
              </span>{' '}
              cluster{' '}
              {showBothNetworks && (
                <>
                  correspondences in the{' '}
                  <span
                    style={{
                      backgroundColor: 'white',
                      color: 'black',
                      padding: '.125rem .5rem',
                      borderRadius: '99rem',
                    }}
                  >
                    {targetNetworkName}
                  </span>{' '}
                  network
                </>
              )}
            </div>
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
