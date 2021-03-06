import ClustersList from '../components/clustersList.jsx'

export default {
  name: 'story.networkControl',
  type: 'object',
  title: 'Network Control',
  fields: [
    {
      name: 'show_source_network',
      type: 'boolean',
      title: 'Show source network',
      initialValue: true,
    },
    {
      name: 'show_target_network',
      type: 'boolean',
      title: 'Show target network',
      initialValue: true,
    },
    {
      name: 'network_cluster_highlight',
      type: 'string',
      title: 'Cluster highlight',
      description: 'Which cluster should be highighted?',
      inputComponent: ClustersList,
    },
    {
      name: 'zoom_source_level',
      type: 'string',
      title: 'Source Network Zoom Level',
      description:
        "Level of zoom. If set to 'Auto', the zoom will be determined automagically based on the highlighted cluster(s)",
      initialValue: 'auto',
      options: {
        list: [
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
        ],
        layout: 'dropdown',
      },
    },
    {
      name: 'zoom_target_level',
      type: 'string',
      title: 'Target Network Zoom Level',
      description:
        "Level of zoom. If set to 'Auto', the zoom will be determined automagically based on the highlighted cluster(s)",
      initialValue: 'auto',
      options: {
        list: [
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
        ],
        layout: 'dropdown',
      },
    },
  ],
}
