import * as Styled from './styled'

import { useVizLayout } from '@/context/vizLayoutContext'
import { motionOptions } from '@/const/motionProps'

const Sidebar = () => {
  const [layout] = useVizLayout()

  return (
    <Styled.SidebarWrapper
      animate={{
        x: layout.read ? 0 : layout.sidebarWidth.value,
      }}
      transition={motionOptions}
    >
      Sidebar
    </Styled.SidebarWrapper>
  )
}

export default Sidebar
