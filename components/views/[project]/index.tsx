import { useEffect, useReducer } from 'react'

import { VizLayoutContext, vizLayoutReducer } from '@/context/vizLayoutContext'
import client from 'utils/cms'
import { PROJECT_QUERY, ALL_PROJECTS_QUERY } from 'utils/cms/queries'
import { globalCSSVarToPixels } from 'utils/theme'

import Nav from 'components/molecules/nav'
import DefaultLayout from 'components/layout/main'
import Sidebar from 'components/organisms/sidebar'
import NetworkComparison from 'components/organisms/networkComparison'

import { Leva } from 'leva'
import { hideUiControls } from 'utils/index'
import { MotionConfig } from 'framer-motion'

const ProjectPage = ({ data }) => {
  const { title } = data

  const [state, dispatch] = useReducer(vizLayoutReducer, null)

  useEffect(() => {
    dispatch({
      type: 'SET',
      payload: {
        // read this from localStorage
        read: true,
        sidebarWidth: globalCSSVarToPixels('--sidebar-width'),
      },
    })
  }, [])

  return (
    state && (
      <DefaultLayout>
        <Leva hidden={true} />
        <VizLayoutContext.Provider value={[state, dispatch]}>
          <MotionConfig
            transition={{
              // type: 'spring',
              // stiffness: 2000,
              // damping: 300,
              type: 'ease',
              ease: [0.8, 0, 0, 1],
              duration: 1.25,
            }}
          >
            <div className="overflow-hidden fixed inset-0 bg-secondary">
              <Nav title={title} />
              <Sidebar data={data} />
              {state.story && <NetworkComparison data={data} />}
            </div>
          </MotionConfig>
        </VizLayoutContext.Provider>
      </DefaultLayout>
    )
  )
}

//

export async function getStaticPaths() {
  const query = ALL_PROJECTS_QUERY
  const data = await client.fetch(query)

  return {
    paths: data.map(({ slug }) => ({
      params: { project: slug.current },
    })),
    fallback: false,
  }
}

// import Graph from 'graphology'
// import gexf from 'graphology-gexf'

export async function getStaticProps({ params: { project } }) {
  const query = PROJECT_QUERY(project)
  const params = {}

  const [data] = await client.fetch(query, params)

  // const rawData = await fetch(
  //   'https://apicdn.sanity.io/files/xmrgv8k7/production/53c8661ad8ad2c7331512b7eb47ec6f58f5cd6b0.gexf'
  // ).then((t) => t.text())
  // const graph = JSON.stringify(gexf.parse(Graph, rawData))

  // data.story_chapters[0].dataset = graph

  return {
    props: {
      data: data,
    },
  }
}

export default ProjectPage
