import Image from 'next/image'

import { motion, useTransform, useViewportScroll } from 'framer-motion'

const Splashes = () => {
  const { scrollY } = useViewportScroll()

  const fold = (window.innerHeight / 10) * 7

  const yShift = useTransform(scrollY, [0, fold], [0, -100])
  const opacity = useTransform(scrollY, [0, fold], [1, 0])

  const splashOneSrc = '/splashes/flash_3.png'
  const splashTwoSrc = '/splashes/flash_5.png'

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      className="absolute pointer-events-none inset-0 h-[200vh] overflow-hidden"
    >
      <motion.div className="relative w-full h-full">
        <motion.div
          className="absolute w-full h-full top-[50vh] origin-center"
          variants={{
            initial: {
              y: '10%',
              // rotateZ: -30,
              width: '100%',
              right: '0%',
            },
            animate: {
              y: '0%',
              rotateZ: 0,
              width: '50%',
              right: '0%',
            },
          }}
          style={{
            y: yShift,
            opacity: opacity,
          }}
          transition={{
            type: 'ease',
            ease: [0.7, 0, 0, 1],
            duration: 1.75,
            delay: 2,
          }}
        >
          <Image
            src={splashOneSrc}
            layout="intrinsic"
            width={1920}
            height={1920}
          />
        </motion.div>
        <motion.div
          className="absolute w-full h-full top-[50vh] right-0 origin-center"
          variants={{
            initial: {
              y: '10%',
              // rotateZ: 30,
              width: '100%',
              left: '0%',
            },
            animate: {
              y: '0%',
              rotateZ: 0,
              width: '50%',
              left: '0%',
            },
          }}
          style={{
            y: yShift,
            opacity: opacity,
          }}
          transition={{
            type: 'ease',
            ease: [0.7, 0, 0, 1],
            duration: 1.75,
            delay: 2,
          }}
        >
          <Image
            src={splashTwoSrc}
            layout="intrinsic"
            width={1920}
            height={1920}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Splashes
