const sections = [
  { title: 'scoping', value: 'scoping', order: 0 },
  { title: 'designing', value: 'designing', order: 1 },
  { title: 'evaluating', value: 'evaluating', order: 2 },
]

export default {
  name: 'block.storiesList',
  type: 'object',
  title: 'Stories List',
  description:
    'The list is automagically generated from the Stories, grouped by phase',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
    },
    // {
    //   name: 'hash',
    //   type: 'hash',
    //   readOnly: true,
    //   initialValue: 'stories',
    // },
    {
      name: 'sections',
      type: 'object',
      fields: sections.map(({ title, value, order }) => ({
        name: value,
        type: 'object',
        title: title,
        fields: [
          {
            name: 'order',
            type: 'number',
            title: 'Order',
            readOnly: true,
            hidden: true,
            initialValue: order,
          },
          {
            name: 'title',
            type: 'string',
            title: 'Title',
          },
          {
            name: 'phase_slug',
            type: 'string',
            title: 'Slug',
            readOnly: true,
            hidden: true,
            initialValue: value,
          },
          {
            name: 'description',
            type: 'text',
            title: 'Description',
          },
          {
            name: 'stories',
            type: 'array',
            of: [
              {
                type: 'reference',
                to: [
                  {
                    type: 'story',
                  },
                ],
              },
            ],
            options: {
              disableNew: true,
            },
          },
        ],
      })),
    },
  ],
}
