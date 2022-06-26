import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'
import {
  AnimatePresence,
  motion,
  MotionConfig,
  Variants,
  Transition,
} from 'framer-motion'
import { getColor } from 'utils/scales'
import * as chroma from 'chroma-js'

const sidebarVariants: Variants = {
  initial: { opacity: 1, x: '110%' },
  animate: { opacity: 1, x: '0%' },
  exit: { opacity: 1, x: '105%' },
}

const detailVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const childVariants: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const childrenVariantsTransition: Transition = {
  type: 'spring',
  stiffness: 2400,
  damping: 210,
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

const textColor = (color) =>
  chroma(color).luminance() > 0.28 ? 'text-text' : 'text-white'

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

  const motionKey = activeCluster ? 'active' : 'non-active'

  // TO-DO: make labels for overlap

  return (
    <AnimatePresence>
      {!read && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={sidebarVariants}
          transition={{
            type: 'spring',
            stiffness: 1800,
            damping: 280,
            staggerChildren: 0.15,
          }}
          className="bg-black p-4 overflow-scroll w-[23.5%] rounded-lg absolute z-0 top-0 h-[calc(100vh-var(--nav-height)-8.5rem)] right-0 flex-1"
        >
          <MotionConfig transition={childrenVariantsTransition}>
            <AnimatePresence key={motionKey} exitBeforeEnter>
              {motionKey === 'active' && (
                <motion.div
                  variants={detailVariants}
                  transition={{
                    type: 'spring',
                    stiffness: 1800,
                    damping: 220,
                    staggerChildren: 0.05,
                  }}
                >
                  <motion.div
                    className="text-sm inline-flex items-center rounded-full hover:bg-white hover:bg-opacity-20"
                    variants={childVariants}
                  >
                    <button
                      className="mr-2 p-2"
                      onClick={() =>
                        handleClick({
                          cluster_id: null,
                          cluster_original: null,
                        })
                      }
                    >
                      <span className="px-1">←</span> All clusters
                    </button>
                  </motion.div>
                  <AnimatePresence>
                    {layout.clusters.map(
                      (c: ClusterObjectProps) =>
                        activeCluster.name === c.name && (
                          <>
                            <motion.h2
                              className="font-medium text-2xl mt-1 pt-1 mb-2 pb-2"
                              variants={childVariants}
                            >
                              {activeCluster.name}
                            </motion.h2>
                            <motion.div variants={childVariants}>
                              {activeClusterSimilarities.map(([clusterKey]) => {
                                const clusterData: ClusterObjectProps =
                                  clusters.find(
                                    (c: ClusterObjectProps) =>
                                      c.cluster_id.toString() ===
                                      clusterKey.toString()
                                  )

                                const { name, cluster_id, cluster_original } =
                                  clusterData

                                const clusterColor = getColor({
                                  id: cluster_id,
                                  activeCluster,
                                  allClustersID,
                                })

                                const color = textColor(clusterColor)

                                return (
                                  <motion.button
                                    className={`${color} rounded-lg my-2 flex items-center w-full p-4 hover:py-8 text-left transition-all ease-out duration-300`}
                                    variants={childVariants}
                                    style={{
                                      backgroundColor: clusterColor,
                                    }}
                                    onClick={() =>
                                      handleClick({
                                        cluster_id,
                                        cluster_original,
                                      })
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
                  </AnimatePresence>
                </motion.div>
              )}
              {motionKey === 'non-active' && (
                <motion.div
                  variants={detailVariants}
                  transition={{
                    type: 'spring',
                    stiffness: 1800,
                    damping: 220,
                    staggerChildren: 0.015,
                  }}
                >
                  <motion.h2
                    className="font-medium text-3xl mb-1"
                    variants={childVariants}
                  >
                    Choose a cluster
                  </motion.h2>
                  <motion.div
                    className="text-sm font-light text-slate-500 mb-1 pb-1"
                    variants={childVariants}
                  >
                    Click on a cluster in the network or in the list below to
                    explore its overlaps with other clusters and get more
                    information about it
                  </motion.div>
                  {layout.clusters.map((c: ClusterObjectProps) => {
                    const { cluster_id, cluster_original } = c

                    const clusterColor = getColor({
                      id: cluster_id,
                      activeCluster,
                      allClustersID,
                    })

                    return (
                      <ClusterButton
                        key={i}
                        label={c.name}
                        color={clusterColor}
                        onClick={() =>
                          handleClick({ cluster_id, cluster_original })
                        }
                      />
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </MotionConfig>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ClusterButton = ({ label, color, onClick }) => {
  const [hovering, setHovering] = useState(false)

  const textColor = getTextColor(color)

  function hoverIn() {
    setHovering(true)
  }

  function hoverOut() {
    setHovering(false)
  }

  function handleClick() {
    onClick()
  }

  return (
    <motion.button
      className={`${textColor} relative rounded-full my-1 text-center w-full p-4 hover:py-6 text-clip transition-all ease-out duration-300 select-none`}
      variants={childVariants}
      style={{
        backgroundColor: color,
      }}
      onClick={handleClick}
      onPointerEnter={hoverIn}
      onPointerLeave={hoverOut}
    >
      <span>{label}</span>
      <AnimatePresence>
        {hovering && (
          <motion.div
            className="absolute top-1/3 right-0 px-4"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
              initial: { opacity: 0, x: -40 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -40 },
            }}
          >
            →
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

const CloseButton = () => {
  const [_, dispatch] = useVizLayout()

  function handleClick() {
    dispatch({ type: 'TOGGLE_READ_MODE' })
  }

  return (
    <button
      className="absolute right-4 top-4 w-auto h-8 hover:bg-neutral-700 text-sm flex justify-center items-center px-3 rounded-full select-none"
      onClick={handleClick}
    >
      Close
    </button>
  )
}

export default DetailSidebar
