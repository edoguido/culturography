import { useVizLayout } from '@/context/vizLayoutContext'
import { useCallback, useEffect } from 'react'
import * as Styled from './styled'

const DevArea = () => {
  const [state, dispatch] = useVizLayout()

  const devKeyPress = useCallback(
    (e) => {
      switch (e.code) {
        case 'KeyD':
          dispatch({
            type: 'TOGGLE_DEV',
          })
          return
        case 'KeyS':
          dispatch({
            type: 'DEV_TOGGLE_READ_MODE',
          })
          return
        default:
          return
      }
    },
    [state]
  )

  useEffect(() => {
    window.addEventListener('keypress', devKeyPress)
    return () => window.removeEventListener('keypress', devKeyPress)
  }, [])

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
