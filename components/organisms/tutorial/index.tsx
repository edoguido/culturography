import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
//
import Spinner from 'components/atoms/spinner'

const embedUrl =
  'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2F38IPI1qJGKVA1ORVF8zYPf%2FCultural-Impact-Index%3Fpage-id%3D405%253A2895%26node-id%3D642%253A3312%26viewport%3D241%252C48%252C0.07%26scaling%3Dcontain%26starting-point-node-id%3D642%253A3312%26hotspot-hints%3D0'

const Tutorial = ({ onClose }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const ref = useRef<HTMLIFrameElement>()

  return (
    <motion.div
      className="fixed z-50 top-0 left-0 bottom-0 right-0 w-full flex justify-center items-center"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: {
          opacity: 0,
          transition: {
            when: 'beforeChildren',
          },
        },
        animate: {
          opacity: 1,
          transition: {
            when: 'beforeChildren',
          },
        },
        exit: {
          opacity: 0,
          transition: {
            when: 'afterChildren',
          },
        },
      }}
    >
      <div className="relative z-10 flex flex-col justify-center w-full h-full">
        <button
          className="relative z-10 text-white h-[var(--nav-height)]"
          onClick={onClose}
        >
          Close
        </button>
        <motion.div
          className="relative z-10 w-full h-full rounded-lg flex justify-center items-center"
          variants={{
            initial: {
              opacity: 0,
              y: 80,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            exit: {
              opacity: 0,
              y: 80,
            },
          }}
          transition={{
            type: 'ease',
            ease: [1, 0, 0, 1],
          }}
        >
          {!isLoaded && <Spinner />}
          <iframe
            ref={ref}
            width="100%"
            height="100%"
            src={embedUrl}
            allowFullScreen
            onLoad={() => setIsLoaded(true)}
          ></iframe>
        </motion.div>
      </div>
      <div className="absolute inset-0 bg-[#000000e0]" />
    </motion.div>
  )
}

export default Tutorial
