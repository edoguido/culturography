import styled from 'styled-components'
import { motion } from 'framer-motion'
import { getColor } from 'utils/theme'

export const ProjectTimelineDataSnapshotNetworkDraggableIcon = styled.div``

export const ProjectTimelineDataSnapshotNetworkDraggableSingleTile = styled.div`
  padding: 0.5rem 1rem;

  :not(:last-child) {
    border-bottom: 1px solid lightgray;
  }
`

export const ProjectTimelineDataSnapshotNetworkDraggableTiles = styled.div`
  background-color: ${getColor('background')};
  text-align: center;

  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
`

export const ProjectTimelineDataSnapshotDate = styled.span`
  display: block;
  text-align: center;
`

export const ProjectTimelineDataSnapshot = styled.div``

export const ProjectTimelineContent = styled.div`
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  background: linear-gradient(transparent, ${getColor('palette:white')} 70%);

  padding-bottom: 0.5rem;
`

export const ProjectTimelineWrapper = styled(motion.div)`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  min-height: 80px;

  user-select: none;
`

export default ProjectTimelineWrapper
