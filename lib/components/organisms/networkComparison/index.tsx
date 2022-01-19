import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const SingleNetwork = dynamic(
  () => import('components/molecules/singleNetwork'),
  { ssr: false }
)

import { motionOptions } from '@/const/motionProps'
import { useVizLayout } from '@/context/vizLayoutContext'
import ProjectTimeline from 'components/molecules/timeline'

import * as Styled from './styled'

const networks = ['left', 'right']

const NetworkComparison = () => {
  const [layout, dispatch] = useVizLayout()
  const metadata = layout.story.data.network_metadata.asset

  useEffect(() => {
    const fetchMetadata = async () => {
      const data = await fetch(`https://api.sanity.io/${metadata.path}`).then(
        (r) => r.json()
      )
      return data
    }

    const updateMetadata = (metadata) => {
      dispatch({
        type: 'UPDATE_STORY_METADATA',
        payload: { metadata },
      })
    }

    fetchMetadata().then(updateMetadata)
  }, [metadata])

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
      {layout.clusters.metadata && (
        <Styled.NetworkComparisonContent>
          {networks.map((n) => (
            <Styled.NetworkComparisonSingleNetworkWrapper key={n}>
              {layout.clusters[n].shapefile && <SingleNetwork accessor={n} />}
            </Styled.NetworkComparisonSingleNetworkWrapper>
          ))}
          <ProjectTimeline />
        </Styled.NetworkComparisonContent>
      )}
    </Styled.NetworkComparisonWrapper>
  )
}

export default NetworkComparison
