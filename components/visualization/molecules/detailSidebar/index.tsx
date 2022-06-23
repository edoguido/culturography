import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'
import { AnimatePresence, motion, Variants } from 'framer-motion'

const detailVariants: Variants = {
  initial: { opacity: 1, x: '100%' },
  animate: { opacity: 1, x: '0%' },
  exit: { opacity: 1, x: '110%' },
}

const emptyStateVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const DUMMY_CONTENT = {
  'instagram-post': {
    url: '',
    text: {
      content: ['', ''],
    },
  },
  text: {
    content: ['', ''],
  },
}

const DetailSidebar = ({
  activeCluster,
}: {
  activeCluster: ClusterObjectProps
}) => {
  const [layout] = useVizLayout()
  const { read } = layout

  return (
    <>
      <AnimatePresence>
        {activeCluster && !read && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={detailVariants}
            transition={{
              type: 'spring',
              stiffness: 1800,
              damping: 220,
            }}
            className="absolute z-10 top-0 bottom-0 right-0 overflow-scroll w-[23.5%] rounded-lg outline-hidden bg-black flex flex-1"
          >
            <pre>
              {JSON.stringify(
                {
                  name: activeCluster.name,
                  network: activeCluster.network,
                  similarities: activeCluster.similarities,
                },
                null,
                2
              )}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!activeCluster && !read && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={emptyStateVariants}
            transition={{
              type: 'ease',
              ease: [0, 0, 0, 1],
            }}
            className="absolute top-0 bottom-0 right-0 overflow-scroll w-[23.5%] rounded-lg outline-hidden flex flex-1 justify-center items-center"
          >
            Click on a cluster to know more
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DetailSidebar
