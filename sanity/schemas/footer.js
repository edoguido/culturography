const StructuredImage = {
  type: 'object',
  fields: [
    { type: 'image', name: 'image' },
    { type: 'url', name: 'url', title: 'Website link' },
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
