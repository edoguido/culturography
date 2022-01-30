import { ClusterObjectProps } from '@/context/vizLayoutContext'
import { AnimatePresence, motion } from 'framer-motion'

const NetworkComparisonAnnouncer = ({
  data,
  highlightedClusterName,
  targetNetworkName,
  showingBothNetworks,
}: {
  data: any[]
  highlightedClusterName: string
  targetNetworkName: string
  showingBothNetworks: boolean
}) => {
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
      style={{
        position: 'absolute',
        bottom: 0,
        zIndex: 99,
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          marginRight: '.125rem',
        }}
      >
        <motion.span>Observing the</motion.span>
        <AnimatePresence key={highlightedClusterName} exitBeforeEnter>
          {data.map((c: ClusterObjectProps) => {
            return (
              c.name === highlightedClusterName && (
                <motion.div
                  id={c.name}
                  key={c.name}
                  layout
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{
                    type: 'ease',
                    ease: [0, 0, 0, 1],
                    duration: 0.35,
                  }}
                  style={{
                    color: 'white',
                    backgroundColor: '#333',
                    padding: '.125rem .5rem',
                    margin: '0 .5rem',
                    borderRadius: '99rem',
                  }}
                >
                  {highlightedClusterName}
                </motion.div>
              )
            )
          })}
        </AnimatePresence>
        <motion.span>cluster</motion.span>
      </motion.div>
      {showingBothNetworks && (
        <AnimatePresence key={targetNetworkName}>
          <motion.div
            key={targetNetworkName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              margin: '0 .3125rem',
            }}
          >
            <span>correspondences in the</span>
            <span
              style={{
                backgroundColor: '#ffffff30',
                color: 'white',
                padding: '.125rem .5rem',
                borderRadius: '99rem',
                margin: '0 0.3125rem',
              }}
            >
              {targetNetworkName}
            </span>
            <span>network</span>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}

export default NetworkComparisonAnnouncer
