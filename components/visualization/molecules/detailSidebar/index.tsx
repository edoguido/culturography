import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { getColor } from 'utils/scales'

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

const childVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
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
  const [layout, dispatch] = useVizLayout()
  const { read, clusters } = layout

  const activeClusterSimilarities = activeCluster
    ? Object.entries(activeCluster?.similarities)
        // .slice(0, 3)
        .filter(([_, value]) => value > 0)
        .sort(([k1, a], [k2, b]) => b - a)
    : null

  function handleClick({ cluster_id, cluster_original }) {
    const payload = {
      networks: {
        highlight: cluster_original,
        nameHighlight: cluster_id,
      },
    }

    dispatch({
      type: 'UPDATE_NETWORK_STATE',
      payload,
    })
  }

  const allClustersID: number[] = clusters.map(
    (c: ClusterObjectProps) => c.cluster_id
  )

  // TO-DO: make labels for overlap

  return (
    <>
      <AnimatePresence exitBeforeEnter>
        {activeCluster && !read && (
          <motion.div
            className="absolute z-0 top-0 h-[calc(100vh-var(--nav-height)-8.5rem)] right-0 p-4 overflow-scroll w-[23.5%] rounded-lg outline-hidden bg-black flex-1"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={detailVariants}
            transition={{
              type: 'spring',
              stiffness: 1800,
              damping: 220,
              staggerChildren: 0.25,
            }}
          >
            <motion.div className="text-sm" variants={childVariants}>
              Cluster overlaps and details
            </motion.div>
            {layout.clusters.map(
              (c: ClusterObjectProps) =>
                activeCluster.name === c.name && (
                  <>
                    <motion.h2
                      className="font-medium text-2xl my-2 py-2"
                      variants={childVariants}
                    >
                      {activeCluster.name}
                    </motion.h2>
                    <motion.div
                      className=" rounded-lg overflow-hidden"
                      variants={childVariants}
                    >
                      {activeClusterSimilarities.map(([key, value]) => {
                        const clusterData: ClusterObjectProps = clusters.find(
                          (c: ClusterObjectProps) =>
                            c.cluster_id.toString() === key.toString()
                        )

                        const { name, cluster_id, cluster_original } =
                          clusterData

                        const clusterColor = getColor({
                          id: cluster_id,
                          activeCluster,
                          allClustersID,
                        })

                        return (
                          <motion.button
                            className="border-b-black border-b-[1px] border-opacity-10 flex items-center w-full p-4 hover:py-8 text-left transition-all ease-out duration-300"
                            style={{
                              backgroundColor: clusterColor,
                            }}
                            onClick={() =>
                              handleClick({ cluster_id, cluster_original })
                            }
                          >
                            <motion.div>{name}</motion.div>
                            {/* <div>{value}</div> */}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  </>
                )
            )}
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
