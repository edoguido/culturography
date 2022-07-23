import { useVizLayout } from '@/context/vizLayoutContext'
import { motion } from 'framer-motion'
import { useControls } from 'leva'
import { useEffect, useRef } from 'react'

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
    <motion.button
      className="appearance-none bg-transparent text-white border-none flex justify-between items-center cursor-pointer select-none"
      onClick={handleChangeLayout}
    >
      <span>Read</span>
      <div className="relative w-full h-full mx-4 flex justify-center items-center">
        <div className="bg-white w-9 h-3 rounded-full" />
        <motion.div
          className="absolute w-6 h-6 bg-orange-500 rounded-full"
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
      </div>
      <span>Explore</span>
    </motion.button>
  )
}

export default ModeSwitcher
