export default {
  name: 'story.chart',
  type: 'object',
  title: 'Story chart',
  fields: [
    {
      name: 'caption',
      type: 'string',
      title: 'Caption',
    },
    {
      name: 'chart_type',
      type: 'string',
      title: 'Chart type',
      options: {
        list: [
          {
            title: 'Sankey',
            value: 'sankey',
          },
          {
            title: 'Bar chart',
            value: 'barchart',
          },
        ],
      },
    },
    {
      name: 'dataset',
      type: 'file',
      title: 'Dataset',
      options: {
        accept: '.json',
        list: [
          {
            title: 'Sankey',
            value: 'sankey',
          },
          {
            title: 'Bar chart',
            value: 'barchart',
          },
        ],
      },
    },
  ],
}
