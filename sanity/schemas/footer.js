const StructuredImage = {
  type: 'object',
  fields: [
    { type: 'image', name: 'image' },
    { type: 'string', name: 'description', title: 'Description' },
  ],
}

export default {
  name: 'footer',
  type: 'object',
  title: 'Footer',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
    },
    {
      name: 'blocks',
      type: 'array',
      of: [StructuredImage],
    },
  ],
}
