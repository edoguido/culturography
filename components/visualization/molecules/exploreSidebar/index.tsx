import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'
import {
  AnimatePresence,
  motion,
  MotionConfig,
  Variants,
  Transition,
} from 'framer-motion'
import { getColor, getTextColor } from 'utils/scales'
import { useState } from 'react'
import { LAYOUT_MOTION_OPTIONS } from '@/const/motionProps'
// import { NETWORK_MAP } from '@/const/networks'

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
  animate: (c = 1) => ({ opacity: c, y: 0 }),
  exit: { opacity: 0, y: -10 },
}

const childrenVariantsTransition: Transition = {
  type: 'spring',
  stiffness: 2400,
  damping: 210,
}

interface ExploreSidebarClusterDetail {
  type:
    | ExploreSidebarTextContent['type']
    | ExploreSidebarInstagramContent['type']
}

interface ExploreSidebarTextContent extends ExploreSidebarClusterDetail {
  type: 'text'
  text: string[]
}

interface ExploreSidebarInstagramContent extends ExploreSidebarClusterDetail {
  type: 'instagram-embed'
  image: string
  caption: string
  text: ExploreSidebarTextContent['text']
}

const DUMMY_CONTENT: (
  | ExploreSidebarInstagramContent
  | ExploreSidebarTextContent
)[] = [
  {
    type: 'instagram-embed',
    image: '',
    caption: '',
    text: [],
  },
  {
    type: 'text',
    text: [],
  },
]

const ExploreSidebar = ({
  activeCluster,
}: {
  activeCluster: ClusterObjectProps
}) => {
  const [layout, dispatch] = useVizLayout()
  const { read, clusters } = layout

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

  return (
    <AnimatePresence>
      {!read && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={sidebarVariants}
          transition={LAYOUT_MOTION_OPTIONS}
          className="bg-black p-4 overflow-scroll w-[23.5%] rounded-lg absolute z-0 top-0 h-[calc(100vh-var(--nav-height)-8.5rem)] right-0 flex-1"
        >
          <CloseButton />
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
                    className="text-sm inline-flex items-center rounded-full hover:bg-white hover:bg-opacity-20 select-none"
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
                      <span className="px-1">←</span> All communities
                    </button>
                  </motion.div>
                  <AnimatePresence>
                    {layout.clusters.map(
                      (c: ClusterObjectProps) =>
                        activeCluster.name === c.name && (
                          <ActiveClusterDetails
                            activeCluster={activeCluster}
                            allClustersID={allClustersID}
                            onClick={handleClick}
                          />
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
                    className="font-medium text-2xl mb-1"
                    variants={childVariants}
                  >
                    Choose a community
                  </motion.h2>
                  <motion.div
                    className="text-sm font-light text-slate-500 mb-1 pb-1"
                    variants={childVariants}
                  >
                    Click on a community in the network or in the list below to
                    explore its overlaps with other clusters and get more
                    information about it
                  </motion.div>
                  {layout.clusters.map((c: ClusterObjectProps, i) => {
                    const { cluster_id, cluster_original, network } = c

                    const clusterColor = getColor({
                      id: cluster_id,
                      activeCluster,
                      allClustersID,
                    })

                    // const networkName = NETWORK_MAP[network]

                    return (
                      <ClusterButton
                        key={i}
                        label={c.name}
                        network={network}
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

const ActiveClusterDetails = ({
  activeCluster,
  allClustersID,
  onClick,
}: {
  activeCluster: ClusterObjectProps
  allClustersID: number[]
  onClick: (p) => void
}) => {
  const [layout] = useVizLayout()
  const { clusters } = layout

  const activeClusterSimilarities = activeCluster
    ? Object.entries(activeCluster?.similarities)
        .filter(([_, value]) => value > 0)
        .slice(0, 3)
        .sort(([k1, a], [k2, b]) => b - a)
    : null

  const hasSimilarities = activeClusterSimilarities.length > 0

  const details = DUMMY_CONTENT['instagram-post']

  return (
    <>
      <motion.div className="mt-1 pt-1">
        <motion.h2
          className="sidebar-section-heading text-2xl"
          variants={childVariants}
        >
          {activeCluster.name}
        </motion.h2>
        {activeCluster.description && (
          <motion.div className="text-sm opacity-50" variants={childVariants}>
            {activeCluster.description}
          </motion.div>
        )}
      </motion.div>
      {hasSimilarities ? (
        <>
          <Divider />
          <motion.div
            className="text-sm opacity-50 my-2"
            variants={childVariants}
            custom={0.5}
          >
            Strongest overlapping communities
          </motion.div>
          <motion.div variants={childVariants}>
            {activeClusterSimilarities.map(([clusterKey], i) => {
              const clusterData: ClusterObjectProps = clusters.find(
                (c: ClusterObjectProps) =>
                  c.cluster_id.toString() === clusterKey.toString()
              )

              const { name, cluster_id, cluster_original, network } =
                clusterData

              const clusterColor = getColor({
                id: cluster_id,
                activeCluster,
                allClustersID,
              })

              return (
                <ClusterButton
                  key={i}
                  label={name}
                  network={network}
                  color={clusterColor}
                  onClick={() => onClick({ cluster_id, cluster_original })}
                />
              )
            })}
          </motion.div>
        </>
      ) : (
        <NoClusterSimilarities />
      )}
      {activeCluster.details && (
        <motion.div layout>
          <Divider />
          <motion.div className="my-4" variants={childVariants}>
            <motion.h2 className="text-lg font-display tracking-wide">
              Insights about this community
            </motion.h2>
            {/* <motion.div>Description here</motion.div> */}
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

const NoClusterSimilarities = () => {
  const [layout, dispatch] = useVizLayout()

  function setRandomCluster() {
    const randomIndex = Math.round(Math.random() * layout.clusters.length - 1)
    const randomCluster: ClusterObjectProps = layout.clusters[randomIndex]

    dispatch({
      type: 'UPDATE_NETWORK_STATE',
      payload: {
        networks: {
          highlight: randomCluster.cluster_original,
          nameHighlight: randomCluster.cluster_id,
        },
      },
    })
  }

  return (
    <>
      <motion.div
        className="text-sm opacity-50"
        variants={childVariants}
        custom={0.5}
      >
        This community of users is not represented in the other network.
      </motion.div>
      <motion.button
        className="my-4 px-4 py-2 bg-accent text-text font-display font-medium rounded-full"
        variants={childVariants}
        onClick={setRandomCluster}
      >
        Try another one?
      </motion.button>
    </>
  )
}

const ClusterButton = ({ label, network, color, onClick }) => {
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
      className={`${textColor} relative rounded-full my-1 flex items-baseline justify-between w-full p-4 hover:py-6 text-clip transition-all ease-out duration-300 select-none`}
      variants={childVariants}
      style={{
        backgroundColor: color,
      }}
      onClick={handleClick}
      onPointerEnter={hoverIn}
      onPointerLeave={hoverOut}
    >
      <span className="text-sm uppercase opacity-80">{network}</span>
      <span className="flex-grow">{label}</span>
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

const Divider = () => {
  return (
    <motion.div
      className="w-full h-[1px] bg-white opacity-20 my-3"
      variants={childVariants}
      custom={0.2}
    />
  )
}

export default ExploreSidebar
