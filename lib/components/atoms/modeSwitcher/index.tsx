import { useVizLayout } from '@/context/vizLayoutContext'
import { useControls } from 'leva'
import { useEffect, useRef } from 'react'
import * as Styled from './styled'

const ModeSwitcher = () => {
  const [state, dispatch] = useVizLayout()

  const [{ sidebar }, set] = useControls(() => ({
    sidebar: state.read,
  }))

  const useControlsRef = useRef(null)

  useEffect(() => {
    // used to skip first render
    // otherwise we toggle sidebar already
    if (!useControlsRef.current) {
      useControlsRef.current = sidebar
      return
    }

    dispatch({ type: 'TOGGLE_READ_MODE' })
  }, [sidebar])

  function handleChangeLayout() {
    set({ sidebar: !sidebar })
  }

  return (
    <Styled.ModeSwitcherWrapper onClick={handleChangeLayout}>
      <Styled.ModeSwitcherLabel>Read</Styled.ModeSwitcherLabel>
      <Styled.ModeSwitcherToggle>
        <Styled.ModeSwitcherToggleRail />
        <Styled.ModeSwitcherToggleThumb
          initial={false}
          animate={{
            left: state.read ? 0 : '100%',
            x: '-50%',
            transition: {
              type: 'spring',
              stiffness: 400,
              damping: 30,
            },
          }}
          whileHover={{
            scale: 1,
          }}
          whileTap={{
            scale: 0.8,
          }}
        />
      </Styled.ModeSwitcherToggle>
      <Styled.ModeSwitcherLabel>Explore</Styled.ModeSwitcherLabel>
    </Styled.ModeSwitcherWrapper>
  )
}

export default ModeSwitcher
