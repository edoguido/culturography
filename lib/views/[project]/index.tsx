import { useEffect, useState } from 'react'

import DefaultLayout from 'components/layout/main'
import Sidebar from 'components/organisms/sidebar'
import NetworkComparison from 'components/organisms/networkComparison'
import Nav from 'components/molecules/nav'
import * as Styled from './styled'

import { VizLayoutContext } from '@/context/vizLayoutContext'
import { globalCSSVarToPixels } from 'utils/theme'

const ProjectPage = () => {
  const [layoutState, setLayoutState] = useState(null)

  useEffect(() => {
    setLayoutState({
      sidebarWidth: globalCSSVarToPixels('--sidebar-width'),
      read: true,
    })
  }, [])

  return (
    layoutState && (
      <DefaultLayout>
        <VizLayoutContext.Provider value={[layoutState, setLayoutState]}>
          <Styled.ProjectPageWrapper>
            <Nav />
            <Sidebar />
            <NetworkComparison />
          </Styled.ProjectPageWrapper>
        </VizLayoutContext.Provider>
      </DefaultLayout>
    )
  )
}

export default ProjectPage
