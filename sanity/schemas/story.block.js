import clustersList from '../components/clustersList'

export default {
  name: 'story.block',
  type: 'object',
  title: 'Story block',
  fields: [
    {
      name: 'block_title',
      type: 'string',
      title: 'Block Title',
      validation: (Rule) => Rule.required(),
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
      name: 'network_cluster_highlight',
      type: 'string',
      title: 'Cluster highlight',
      description: 'Which cluster should be highighted?',
      inputComponent: clustersList,
    },
    {
      name: 'network_control',
      type: 'story.networkControl',
      title: 'Network control',
    },
  ],
}
