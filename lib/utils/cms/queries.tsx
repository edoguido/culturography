export const ALL_PROJECTS_QUERY = `
  *[ _type == 'story' ] { slug }
`

export const PROJECT_QUERY = (project) => `
*[
    _type == 'story' && slug.current == '${project}'
  ]{
    slug {
      current
    },
    title,
    network_metadata {
      asset ->
    },
    story_chapters[] {
      chapter_title,
      snapshot_date,
      networks {
        source_network_id,
        left_network_name,
        left_network_shapefile {
          asset ->
        },
        target_network_id,
        right_network_name,
        right_network_shapefile {
          asset ->
        }
      },
      blocks[] {
        network_control,
        block_title,
        block_content[] {
          ...,
          _type == 'story.chart' => {
            ...,
            dataset {
              ...,
              asset ->
            }
          }
        },
      }
    }
  }
`

export default PROJECT_QUERY
