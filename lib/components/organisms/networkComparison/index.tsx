import dynamic from 'next/dynamic'

const SingleNetwork = dynamic(
  () => import('components/molecules/singleNetwork'),
  { ssr: false }
)

// import SingleNetwork from 'components/molecules/singleNetwork'
import * as Styled from './styled'

// import { globalCSSVarToPixels } from 'utils/theme'
import { motionOptions } from '@/const/motionProps'
import { useVizLayout } from '@/context/vizLayoutContext'
import ProjectTimeline from 'components/molecules/timeline'

const networks = ['left', 'right']

const NetworkComparison = () => {
  const [layout] = useVizLayout()

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
      <Styled.NetworkComparisonContent>
        {networks.map((n) => (
          <Styled.NetworkComparisonSingleNetworkWrapper key={n}>
            {layout.clusters[n].shapefile && <SingleNetwork accessor={n} />}
          </Styled.NetworkComparisonSingleNetworkWrapper>
        ))}
        <ProjectTimeline />
      </Styled.NetworkComparisonContent>
    </Styled.NetworkComparisonWrapper>
  )
}

export default NetworkComparison
