import { useVizLayout } from '@/context/vizLayoutContext'
import { AnimatePresence } from 'framer-motion'

import * as Styled from './styled'

const variants = {
  initial: {
    y: '100%',
  },
  animate: {
    y: '0%',
  },
  exit: {
    y: '100%',
  },
}

const networkKeys = [
  {
    label: 'Left network',
    key: 'left_network_shapefile',
  },
  {
    label: 'Right network',
    key: 'right_network_shapefile',
  },
]

const ProjectTimeline = () => {
  const [state] = useVizLayout()

  const isExploreMode = !state.read

  const chapters = state.story.data.story_chapters
  // console.log(chapters)

  return (
    <AnimatePresence>
      {isExploreMode && (
        <Styled.ProjectTimelineWrapper
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: 'spring',
            stiffness: 800,
            damping: 60,
          }}
          variants={variants}
        >
          <Styled.ProjectTimelineContent>
            {chapters.map((chapter, i) => {
              const {
                left_network_shapefile,
                left_network_name,
                right_network_shapefile,
                right_network_name,
              } = chapter

              return (
                (left_network_shapefile || right_network_shapefile) && (
                  <Styled.ProjectTimelineDataSnapshot key={i}>
                    <Styled.ProjectTimelineDataSnapshotNetworkDraggableTiles>
                      {networkKeys.map((n) => {
                        const dataFile = chapter[n.key]

                        console.log(dataFile)

                        return (
                          <Styled.ProjectTimelineDataSnapshotNetworkDraggableSingleTile
                            key={n.key}
                          >
                            <Styled.ProjectTimelineDataSnapshotNetworkDraggableIcon />
                            {n.label}
                          </Styled.ProjectTimelineDataSnapshotNetworkDraggableSingleTile>
                        )
                      })}
                    </Styled.ProjectTimelineDataSnapshotNetworkDraggableTiles>
                    <Styled.ProjectTimelineDataSnapshotDate>
                      {chapter.snapshot_date}
                    </Styled.ProjectTimelineDataSnapshotDate>
                  </Styled.ProjectTimelineDataSnapshot>
                )
              )
            })}
          </Styled.ProjectTimelineContent>
        </Styled.ProjectTimelineWrapper>
      )}
    </AnimatePresence>
  )
}

export default ProjectTimeline
