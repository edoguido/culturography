export default {
  name: 'block.collapsibleSections',
  type: 'object',
  title: 'Collapsible Sections',
  fields: [
    {
      name: 'blocks',
      title: 'Collapsible Sections',
      type: 'array',
      of: [
        {
          name: 'singleCollapsibleSection',
          type: 'object',
          title: 'Section',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Title',
            },
            // {
            //   name: 'hash',
            //   type: 'hash',
            // },
            {
              name: 'blocks',
              type: 'richText',
            },
          ],
        },
      ],
    },
  ],
}
