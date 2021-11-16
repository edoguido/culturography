import { motion } from 'framer-motion'
import styled from 'styled-components'

export const SidebarWrapper = styled(motion.div)`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);

  padding-top: var(--nav-height);

  background-color: white;
`
