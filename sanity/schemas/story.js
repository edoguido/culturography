export default {
  name: 'story',
  type: 'document',
  title: 'Stories',
  fields: [
    {
      name: 'slug',
      type: 'slug',
      title: 'slug',
      description: 'A URL-friendly name for the project',
    },
    {
      name: 'title',
      type: 'string',
      title: 'Title',
    },
    {
      name: 'phase',
      type: 'string',
      title: 'Phase',
      initialValue: {
        title: 'Scoping',
      },
      options: {
        layout: 'dropdown',
        list: [
          { title: 'Scoping', value: 'scoping' },
          { title: 'Designing', value: 'designing' },
          { title: 'Evaluating', value: 'evaluating' },
        ],
      },
    },
    {
      name: 'abstract',
      type: 'text',
      title: 'Abstract',
      rows: 4,
    },
    {
      name: 'network_metadata',
      type: 'file',
      title: 'Network metadata',
      description: 'Information regarding clusters overlap',
      options: {
        accept: '.json',
      },
    },
    {
      name: 'story_chapters',
      type: 'array',
      of: [
        {
          type: 'story.chapter',
        },
      ],
    },
  ],
}
