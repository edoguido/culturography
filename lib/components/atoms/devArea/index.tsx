import { useVizLayout } from '@/context/vizLayoutContext'
import * as Styled from './styled'

const DevArea = () => {
  const [state] = useVizLayout()

  const displayValue = {
    ...state,
    story: {
      ...state.story,
      data: '[...]',
    },
  }

  return (
    state.development && (
      <Styled.DevAreaWrapper>
        <Styled.DevAreaContent>
          <pre>
            <code>{JSON.stringify(displayValue, null, 2)}</code>
          </pre>
        </Styled.DevAreaContent>
      </Styled.DevAreaWrapper>
    )
  )
}

export default DevArea
