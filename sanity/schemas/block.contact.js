export default {
  name: 'block.contact',
  type: 'object',
  title: 'Contact Block',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
    },
    // {
    //   name: 'hash',
    //   type: 'string',
    // },
    {
      name: 'blocks',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [{ name: 'content', title: 'Content', type: 'richText' }],
        },
      ],
    },
  ],
}
