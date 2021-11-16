import { motionOptions } from '@/const/motionProps'
import { useVizLayout } from '@/context/vizLayoutContext'
import { globalCSSVarToPixels } from 'utils/theme'
import * as Styled from './styled'

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
          Network
        </Styled.NetworkComparisonSingleNetworkWrapper>
        <Styled.NetworkComparisonSingleNetworkWrapper>
          Network
        </Styled.NetworkComparisonSingleNetworkWrapper>
      </Styled.NetworkComparisonContent>
    </Styled.NetworkComparisonWrapper>
  )
}

export default NetworkComparison
