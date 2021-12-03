import { useEffect, useState } from 'react'

import DefaultLayout from 'components/layout/main'
import Sidebar from 'components/organisms/sidebar'
import NetworkComparison from 'components/organisms/networkComparison'
import Nav from 'components/molecules/nav'
import * as Styled from './styled'

import { VizLayoutContext } from '@/context/vizLayoutContext'
import { globalCSSVarToPixels } from 'utils/theme'
import client from 'utils/cms'

const ProjectPage = ({ data }) => {
  const [layoutState, setLayoutState] = useState(null)

  useEffect(() => {
    setLayoutState({
      sidebarWidth: globalCSSVarToPixels('--sidebar-width'),
      read: true,
      data,
    })

    console.log(data)
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

export async function getStaticPaths() {
  return {
    paths: [{ params: { project: 'test-story' } }],
    fallback: false,
  }
}

export async function getStaticProps({ params: { project } }) {
  const query = `
  *[
      _type == 'story' && slug.current == '${project}'
    ]{
      ...,
      network_json {
        ...,
        asset ->
      },
      story_chapters[] {
        ...,
        left_network_shapefile {
          asset ->
        },
        right_network_shapefile {
          asset ->
        },
        content[] {
          ...,
          content[] {
            ...,
            _type == 'story.chart' => {
              ...,
              dataset {
                ...,
                asset ->
              }
            }
          }
        }
      }
    }
  `

  const params = {}

  const [data] = await client.fetch(query, params)

  return {
    props: {
      data: data,
    },
  }
}

export default ProjectPage
