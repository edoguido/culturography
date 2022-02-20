import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

const SingleNetwork = dynamic(
  () => import('components/molecules/singleNetwork'),
  { ssr: false }
)
const NetworkComparisonAnnouncer = dynamic(
  () => import('components/molecules/networkComparisonAnnouncer'),
  { ssr: false }
)

//
import { motionOptions } from '@/const/motionProps'
import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'

import * as Styled from './styled'
import Legend from 'components/molecules/legend'

const networks = ['source', 'target']

const NetworkComparison = ({ data }) => {
  const [layout, dispatch] = useVizLayout()
  //
  // story properties
  const currentBlock = layout.story.block
  // networks properties
  const networksData = data.story_chapters[layout.story.chapter]
  const networksProperties = layout.networks
  const targetNetworkName = networksData.networks.target_network_name
  //
  // clusters properties
  const rawClusterId = +layout.networks.nameHighlight
  const activeClusterId: number = isNaN(rawClusterId) ? null : rawClusterId
  //
  const clusterIdMatch = (c: ClusterObjectProps) =>
    c.cluster_id == activeClusterId

  const activeCluster: ClusterObjectProps = activeClusterId
    ? layout?.clusters.find(clusterIdMatch)
    : null

  // layout properties
  const showBothNetworks =
    networksProperties.source.show && networksProperties.target.show

  useEffect(() => {
    const fetchMetadata = async () => {
      let data

      try {
        const metadata = data.network_metadata.asset

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
  }, [data.network_metadata.asset])

  const networkLayoutProperties = useCallback(
    (source) => {
      const show = source
        ? networksProperties.source.show
        : networksProperties.target.show

      const width = showBothNetworks ? '49.5%' : show ? '85%' : '49.5%'
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
          left: source
            ? '0%'
            : showBothNetworks
            ? '50.5%'
            : show
            ? '20%'
            : '50.5%',
          x: x,
          scale: scale,
          opacity: opacity,
        },
        style: {
          transformOrigin: transformOrigin,
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
      <div className="relative h-full px-2">
        {layout.clusters && (
          <Styled.NetworkComparisonContent>
            {activeCluster && targetNetworkName && (
              <NetworkComparisonAnnouncer
                data={layout.clusters}
                highlightedClusterName={activeCluster.name}
                targetNetworkName={targetNetworkName}
                showingBothNetworks={showBothNetworks}
              />
            )}
            {activeCluster && targetNetworkName && <Legend />}
            {networks.map((n) => {
              const isSource = n === 'source'
              const { animate, style } = networkLayoutProperties(isSource)
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
                  style={style}
                >
                  <SingleNetwork
                    data={networksData}
                    activeCluster={activeCluster}
                    activeClusterId={activeClusterId}
                    accessor={n}
                  />
                </Styled.NetworkComparisonSingleNetworkWrapper>
              )
            })}
          </Styled.NetworkComparisonContent>
        )}
      </div>
    </Styled.NetworkComparisonWrapper>
  )
}

export default NetworkComparison
