export default {
  name: 'story.network',
  title: 'Networks',
  type: 'object',
  fields: [
    {
      name: 'source_network_name',
      type: 'string',
      title: 'Source Network Name',
    },
    {
      name: 'source_network_id',
      type: 'string',
      title: 'Source Network ID',
    },
    {
      name: 'source_network_shapefile',
      type: 'file',
      title: 'Source network shape-file',
    },
    {
      name: 'target_network_name',
      type: 'string',
      title: 'Target Network Name',
    },
    {
      name: 'target_network_id',
      type: 'string',
      title: 'Target Network ID',
    },
    {
      name: 'target_network_shapefile',
      type: 'file',
      title: 'Target network shape-file',
    },
  ],
}
