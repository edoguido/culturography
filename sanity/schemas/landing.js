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
          title: 'Title',
          type: 'string',
        },
        {
          name: 'project_subtitle',
          title: 'Subtitle',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'abstract',
          title: 'Abstract',
          type: 'richText',
          description: 'Max 200 characters',
        },
      ],
    },
    {
      name: 'blocks',
      type: 'array',
      of: [
        {
          type: 'block.phases',
        },
        {
          type: 'block.contact',
        },
        {
          type: 'block.text',
        },
        {
          type: 'block.collapsibleSections',
        },
      ],
    },
  ],
}
