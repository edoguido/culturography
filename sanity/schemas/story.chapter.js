export default {
  name: 'story.chapter',
  type: 'object',
  title: 'Story Chapter',
  fields: [
    {
      name: 'chapter_title',
      type: 'string',
      title: 'Chapter title',
    },
    {
      name: 'networks',
      type: 'story.network',
      title: 'Networks',
    },
    {
      name: 'blocks',
      type: 'array',
      title: 'Blocks',
      description:
        'Blocks can be paragraphs, charts, or any rich content type.',
      of: [
        {
          type: 'story.block',
        },
      ],
    },
  ],
}
