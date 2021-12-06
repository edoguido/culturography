import { useVizLayout, VizLayoutContext } from '@/context/vizLayoutContext'
import { useContext } from 'react'
import * as Styled from './styled'

const ModeSwitcher = () => {
  const [state, dispatch] = useVizLayout()

  function handleChangeLayout() {
    dispatch({ type: 'TOGGLE_READ_MODE' })
  }

  return (
    <Styled.ModeSwitcherWrapper onClick={handleChangeLayout}>
      Switcher
    </Styled.ModeSwitcherWrapper>
  )
}

export default ModeSwitcher
