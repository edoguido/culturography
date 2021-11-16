import { VizLayoutContext } from '@/context/vizLayoutContext'
import { useContext } from 'react'
import * as Styled from './styled'

const ModeSwitcher = () => {
  const [layout, setLayout] = useContext(VizLayoutContext)

  function handleChangeLayout() {
    setLayout((prev) => ({
      ...prev,
      read: !prev.read,
    }))
  }

  return (
    <Styled.ModeSwitcherWrapper onClick={handleChangeLayout}>
      Switcher
    </Styled.ModeSwitcherWrapper>
  )
}

export default ModeSwitcher
