export default {
  name: 'landing',
  type: 'object',
  title: 'Landing page',
  fields: [
    {
      name: 'project_information',
      type: 'object',
      title: 'Project Information',
      fields: [
        {
          name: 'project_title',
          type: 'string',
          title: 'Title',
        },
        {
          name: 'project_subtitle',
          type: 'string',
          title: 'Subtitle',
        },
        {
          name: 'abstract',
          type: 'richText',
          title: 'Abstract',
          description: 'Max 200 characters',
        },
      ],
    },
    {
      name: 'blocks',
      type: 'array',
      of: [
        {
          type: 'block.text',
        },
        {
          type: 'block.collapsibleSections',
        },
        {
          type: 'block.storiesList',
        },
      ],
    },
  ],
}
