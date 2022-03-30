// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'

// We import object and document schemas
import storyNetworkControl from './story.networkControl'
import storyNetwork from './story.network'
import storyChart from './story.chart'
import story from './story'
import storyBlock from './story.block'
import storyChapter from './story.chapter'
//
import landing from './landing'
import blockCollapsibleSections from './block.collapsibleSections'
import blockStoriesList from './block.storiesList'
import blockText from './block.text'
import richText from './richText'

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'default',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    // The following are document types which will appear
    // in the studio.
    // Stories
    story,
    storyChapter,
    storyBlock,
    storyNetwork,
    storyNetworkControl,
    storyChart,
    // Landing page
    landing,
    blockText,
    blockCollapsibleSections,
    blockStoriesList,
    richText,
    // When added to this list, object types can be used as
    // { type: 'typename' } in other document schemas
  ]),
})
