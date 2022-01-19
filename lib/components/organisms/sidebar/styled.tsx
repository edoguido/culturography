import { motion } from 'framer-motion'
import styled from 'styled-components'
import { getColor } from 'utils/theme'

export const SidebarStoryBlockContent = styled.div`
  :not(:last-child) {
    margin-bottom: 1.5rem;
  }
`

export const SidebarStoryBlockTitle = styled.h3``

export const SidebarStoryBlockWrapper = styled.div``

export const SidebarStoryChapterTitle = styled.h2``

export const SidebarStoryChapterWrapper = styled.div``

export const SidebarStoryContent = styled.div`
  padding: 0.85rem;
  padding-bottom: calc(50vh - var(--nav-height));
`

export const SidebarStoryWrapper = styled.div`
  max-width: var(--sidebar-width);
  max-height: 100%;

  flex: 1 0 auto;

  overflow-x: hidden;
  overflow-y: auto;
`

export const SidebarContent = styled.div`
  /* padding-top: var(--nav-height); */
  height: 100%;
  display: grid;
  grid-template-column: 1fr auto;
`

export const SidebarWrapper = styled(motion.div)`
  z-index: 100;

  position: fixed;
  right: 0;
  top: var(--nav-height);
  bottom: 0;

  width: var(--sidebar-width);
  max-height: 100vh;

  background-color: ${getColor('lightBackground')};
`
