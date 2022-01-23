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

        data = await fetch(
          `/data/${source_network_id}_${target_network_id}_nodes.json`
        ).then((r) => r.json())
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
          {networks.map((n) => (
            <Styled.NetworkComparisonSingleNetworkWrapper key={n}>
              <SingleNetwork accessor={n} data={networksData} />
            </Styled.NetworkComparisonSingleNetworkWrapper>
          ))}
          {/* <ProjectTimeline /> */}
        </Styled.NetworkComparisonContent>
      )}
    </Styled.NetworkComparisonWrapper>
  )
}

export default NetworkComparison
