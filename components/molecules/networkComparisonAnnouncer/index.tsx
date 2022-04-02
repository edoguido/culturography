import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'
import { AnimatePresence, motion } from 'framer-motion'

const NetworkComparisonAnnouncer = () => {
  const [layout] = useVizLayout()

  if (!layout.networks) return null

  const isHighlighting =
    layout.networks.nameHighlight != 'undefined' &&
    layout.networks.nameHighlight != 'null'

  const { target } = layout.networks

  if (!isHighlighting) return null

  const highlightedSourceNetworkCluster: ClusterObjectProps =
    layout.clusters?.find(
      (c: ClusterObjectProps) => c.cluster_id == +layout.networks.nameHighlight
    )

  return (
    <motion.div
      initial={{
        y: 10,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      exit={{
        y: 20,
        opacity: 0,
      }}
      transition={{
        type: 'ease',
        ease: [0, 0, 0, 1],
        duration: 0.35,
      }}
      className="relative p-0 flex items-center"
    >
      <motion.div className="flex items-baseline">
        <motion.span>Observing the</motion.span>
        <AnimatePresence
          key={highlightedSourceNetworkCluster?.name}
          exitBeforeEnter
        >
          {highlightedSourceNetworkCluster && (
            <motion.div
              id={highlightedSourceNetworkCluster.name}
              key={highlightedSourceNetworkCluster.name}
              layout
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{
                type: 'ease',
                ease: [0, 0, 0, 1],
                duration: 0.35,
              }}
              className="text-accent mx-1 py-1 px-2 rounded-full my-1"
            >
              {highlightedSourceNetworkCluster.name}
            </motion.div>
          )}
        </AnimatePresence>
        {/* <motion.span>community</motion.span> */}
      </motion.div>
      {isHighlighting && (
        <AnimatePresence key={target.name}>
          <motion.div
            key={target.name}
            className="flex items-baseline mx-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
          >
            <span>community correspondences in the</span>
            <span className="text-accent mx-1 py-1 px-2 rounded-full my-1">
              {target.name}
            </span>
            <span>network</span>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}

export default NetworkComparisonAnnouncer
