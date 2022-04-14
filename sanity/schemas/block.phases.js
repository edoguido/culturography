import { PHASES } from '../const'

export default {
  name: 'block.phases',
  type: 'object',
  title: 'Project Phases',
  description:
    'The list is automagically generated from the Stories, grouped by phase',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
    },
    {
      name: 'description',
      type: 'richText',
      title: 'Description',
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
      fields: PHASES.map(({ title, value, order }) => ({
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
            readOnly: true,
            initialValue: title,
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
          // {
          //   name: 'stories',
          //   type: 'array',
          //   of: [
          //     {
          //       type: 'reference',
          //       to: [
          //         {
          //           type: 'story',
          //         },
          //       ],
          //     },
          //   ],
          //   options: {
          //     disableNew: true,
          //   },
          // },
        ],
      })),
    },
  ],
}
