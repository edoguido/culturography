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
  const networksData = data.story_chapters[layout.story.chapter]
  const networksProperties = layout.networks

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
          {networks.map((n) => {
            const isSource = n === 'left' || n === 'source'

            const show = isSource
              ? networksProperties.source.show
              : networksProperties.target.show

            return (
              <Styled.NetworkComparisonSingleNetworkWrapper
                key={n}
                layout
                initial={false}
                animate={{
                  opacity: showBothNetworks || show ? 1 : 0.2,
                  width: show ? '100%' : '20%',
                  flexBasis: show ? '100%' : '0%',
                  // backgroundColor: isSource ? 'red' : 'green',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 800,
                  damping: 60,
                }}
              >
                <SingleNetwork accessor={n} data={networksData} />
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
