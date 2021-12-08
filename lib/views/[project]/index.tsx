import { useCallback, useEffect, useReducer } from 'react'

import { VizLayoutContext, vizLayoutReducer } from '@/context/vizLayoutContext'
import { globalCSSVarToPixels } from 'utils/theme'
import client from 'utils/cms'
import PROJECT_QUERY from 'utils/cms/queries'

import DefaultLayout from 'components/layout/main'
import Sidebar from 'components/organisms/sidebar'
import NetworkComparison from 'components/organisms/networkComparison'
import Nav from 'components/molecules/nav'
import DevArea from 'components/atoms/devArea'
import * as Styled from './styled'

// function prepareStoryData(storyData) {
//   const { story_chapters, ...rest } = storyData

//   const storyChaptersWithRefs = story_chapters.map((chapter) => ({
//     ...chapter,
//     chapter_content: chapter.chapter_content.map((block) => ({
//       ...block,
//       ref: createRef(),
//     })),
//     ref: createRef(),
//   }))

//   return {
//     ...rest,
//     story_chapters: storyChaptersWithRefs,
//   }
// }

const ProjectPage = ({ data }) => {
  const [state, dispatch] = useReducer(vizLayoutReducer, null)

  const devKeyPress = useCallback(
    (e) => {
      switch (e.code) {
        case 'KeyD':
          dispatch({
            type: 'TOGGLE_DEV',
          })
          return
        case 'KeyS':
          dispatch({
            type: 'DEV_TOGGLE_READ_MODE',
          })
          return
        default:
          return
      }
    },
    [state]
  )

  useEffect(() => {
    dispatch({
      type: 'SET',
      payload: {
        development: false,
        sidebarWidth: globalCSSVarToPixels('--sidebar-width'),
        read: true,
        story: { chapter: null, block: null, data: data },
        clusters: {
          highlight: { type: null, id: null },
          left: { shapefile: null, zoom: null },
          right: { shapefile: null, zoom: null },
        },
      },
    })

    window.addEventListener('keypress', devKeyPress)
    return () => window.removeEventListener('keypress', devKeyPress)
  }, [])

  return (
    state && (
      <DefaultLayout>
        <VizLayoutContext.Provider value={[state, dispatch]}>
          <DevArea />
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

export async function getStaticPaths() {
  return {
    paths: [{ params: { project: 'test-story' } }],
    fallback: false,
  }
}

import Graph from 'graphology'
import gexf from 'graphology-gexf'

export async function getStaticProps({ params: { project } }) {
  const query = PROJECT_QUERY(project)
  const params = {}

  const [data] = await client.fetch(query, params)

  const rawData = await fetch(
    'https://apicdn.sanity.io/files/xmrgv8k7/production/53c8661ad8ad2c7331512b7eb47ec6f58f5cd6b0.gexf'
  ).then((t) => t.text())
  const graph = JSON.stringify(gexf.parse(Graph, rawData))

  data.story_chapters[0].dataset = graph

  return {
    props: {
      data: data,
    },
  }
}

export default ProjectPage
