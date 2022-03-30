export default {
  name: 'block.text',
  type: 'object',
  title: 'Text Block',
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
      type: 'richText',
    },
  ],
}
