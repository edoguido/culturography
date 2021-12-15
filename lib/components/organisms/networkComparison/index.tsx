import dynamic from 'next/dynamic'

const SingleNetwork = dynamic(
  () => import('components/molecules/singleNetwork'),
  { ssr: false }
)

// import SingleNetwork from 'components/molecules/singleNetwork'
import * as Styled from './styled'

import { globalCSSVarToPixels } from 'utils/theme'
import { motionOptions } from '@/const/motionProps'
import { useVizLayout } from '@/context/vizLayoutContext'

const NetworkComparison = () => {
  const [layout] = useVizLayout()

  return (
    <Styled.NetworkComparisonWrapper
      initial={false}
      animate={{
        right: layout.read ? layout.sidebarWidth.value : 0,
        bottom: layout.read
          ? 0
          : globalCSSVarToPixels('--timeline-height').value,
      }}
      transition={motionOptions}
    >
      <Styled.NetworkComparisonContent>
        <Styled.NetworkComparisonSingleNetworkWrapper>
          {layout.clusters.left.shapefile && <SingleNetwork accessor="left" />}
        </Styled.NetworkComparisonSingleNetworkWrapper>
        {/* <Styled.NetworkComparisonSingleNetworkWrapper>
          {layout.clusters.right.shapefile && (
            <SingleNetwork accessor="right" />
          )}
        </Styled.NetworkComparisonSingleNetworkWrapper> */}
        <ProjectTimeline />
      </Styled.NetworkComparisonContent>
    </Styled.NetworkComparisonWrapper>
  )
}

export default NetworkComparison
