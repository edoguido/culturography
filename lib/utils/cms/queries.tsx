export const ALL_PROJECTS_QUERY = `
  *[ _type == 'story' ] { slug { current }, title, phase }
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
    phase,
    story_chapters[] {
      chapter_title,
      snapshot_date,
      networks {
        source_network_id,
        source_network_name,
        source_network_shapefile {
          asset ->
        },
        target_network_id,
        target_network_name,
        target_network_shapefile {
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

export const LANDING_QUERY = `
  *[ _type == 'landing' ] {
    project_information,
    blocks[] {
      ...,
      sections {
        scoping_section {
          ...,
          stories[] -> {
            title, slug
          }
        },
        designing_section {
          ...,
          stories[] -> {
            title, slug
          }
        },
        evaluating_section {
          ...,
          stories[] -> {
            title, slug
          }
        },
      }
    }
  }
`

export const STORIES = ``
