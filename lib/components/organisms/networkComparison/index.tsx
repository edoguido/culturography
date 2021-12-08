import { motionOptions } from '@/const/motionProps'
import { useVizLayout } from '@/context/vizLayoutContext'
import { globalCSSVarToPixels } from 'utils/theme'
import * as Styled from './styled'

const NetworkComparison = () => {
  const [layout] = useVizLayout()

  const leftNetworkAssetConfig = JSON.stringify(layout.clusters.left, null, 2)
  const rightNetworkAssetConfig = JSON.stringify(layout.clusters.right, null, 2)

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
          <pre>{leftNetworkAssetConfig}</pre>
        </Styled.NetworkComparisonSingleNetworkWrapper>
        <Styled.NetworkComparisonSingleNetworkWrapper>
          <pre>{rightNetworkAssetConfig}</pre>
        </Styled.NetworkComparisonSingleNetworkWrapper>
      </Styled.NetworkComparisonContent>
    </Styled.NetworkComparisonWrapper>
  )
}

export default NetworkComparison
