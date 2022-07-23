export default {
  name: 'story.block',
  type: 'object',
  title: 'Story block',
  fields: [
    {
      name: 'block_title',
      type: 'string',
      title: 'Block Title',
    },
    {
      name: 'block_content',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'story.exploreButton',
        },
        {
          type: 'story.chart',
        },
      ],
    },
    {
      name: 'network_control',
      type: 'story.networkControl',
      title: 'Network control',
    },
  ],
}
