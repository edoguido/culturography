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

export async function getStaticProps({ params: { project } }) {
  const query = PROJECT_QUERY(project)
  const params = {}

  const [data] = await client.fetch(query, params)

  return {
    props: {
      data: data,
    },
  }
}

export default ProjectPage
