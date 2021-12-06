export const PROJECT_QUERY = (project) => `
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
      chapter_content[] {
        ...,
        block_content[] {
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

export default PROJECT_QUERY
