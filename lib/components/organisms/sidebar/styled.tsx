import { motion } from 'framer-motion'
import styled from 'styled-components'

export const SidebarStoryBlockContent = styled.div`
  margin-bottom: 1.5rem;
`

export const SidebarStoryBlockTitle = styled.h3``

export const SidebarStoryBlockWrapper = styled.div``

export const SidebarStoryChapterTitle = styled.h2``

export const SidebarStoryChapterWrapper = styled.div``

export const SidebarStoryContent = styled.div`
  max-width: var(--sidebar-width);
  overflow-x: auto;

  padding: 0.85rem;
`

export const SidebarContent = styled.div`
  /* padding-top: var(--nav-height); */
`

export const SidebarWrapper = styled(motion.div)`
  z-index: 100;

  position: fixed;
  right: 0;
  top: var(--nav-height);
  bottom: 0;

  width: var(--sidebar-width);
  max-height: 100vh;

  background-color: white;
  overflow-y: auto;
`
