import styled from 'styled-components'
import { motion } from 'framer-motion'
import { getColor } from 'utils/theme'

export const SidebarChapterSelectorChapterNameOption = styled(motion.div)`
  padding: 1rem;
`

export const SidebarChapterSelectorChapterNameOptionsList = styled(motion.div)`
  position: absolute;
  z-index: 0;
  overflow: hidden;
  background-color: white;

  left: 0;
  top: 0;
  right: 0;
`

export const SidebarChapterSelectorCurrentChapterName = styled(motion.div)`
  /* border: none; */
  height: var(--nav-height);
  padding: 1rem;
  width: 100%;
  z-index: 10;

  background-color: ${getColor('palette:orange')};
`

export const SidebarChapterSelectorContent = styled.div`
  position: relative;
  width: 100%;

  ${SidebarChapterSelectorCurrentChapterName}, ${SidebarChapterSelectorChapterNameOption} {
    display: flex;
    align-items: center;
  }
`

export const SidebarChapterSelectorWrapper = styled.div`
  z-index: 10;

  display: flex;
  align-items: center;

  user-select: none;
  cursor: pointer;

  font-size: 1.5rem;
`
