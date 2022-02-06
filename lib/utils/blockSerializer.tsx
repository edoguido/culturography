import React, { createElement, Fragment, ReactChild } from 'react'
import dynamic from 'next/dynamic'

const StoriesListBlock = dynamic(
  () => import('../components/blocks/storiesListBlock'),
  { ssr: false }
)
const TextBlock = dynamic(() => import('../components/blocks/textBlock'), {
  ssr: false,
})
const CollapsibleTextBlock = dynamic(
  () => import('../components/blocks/collapsibleTextBlock'),
  { ssr: false }
)

// block-component mapping
const MODELS = {
  'block.text': TextBlock,
  'block.collapsibleSections': CollapsibleTextBlock,
  'block.storiesList': StoriesListBlock,
}

interface BlockSerializerProps {
  data: any
  modelKey: (arg0: any) => string
  index: Number
  forwardRef?: React.RefObject<HTMLElement>
  children?: ReactChild | ReactChild[]
}

const BlockSerializer = (props: BlockSerializerProps) => {
  const { data, modelKey, index, forwardRef, children } = props

  let blockTypeKey = modelKey(data)
  const blockComponent = MODELS[blockTypeKey]

  if (!blockTypeKey) {
    console.groupCollapsed(
      `%cUnknown model for block number ${index}`,
      'font-weight: 700; font-size: .9rem; color: red;'
    )
    console.error(JSON.stringify(props, null, 2))
    console.groupEnd()

    return <Fragment />
  }

  if (!blockComponent) {
    console.groupCollapsed(
      `Component with key %c${blockTypeKey} %cnot found!`,
      'font-weight: 700; font-size: .9rem; color: blue;',
      'font-weight: 500;'
    )
    console.log('Its data looks like this:')
    console.log(JSON.stringify(data, null, 2))
    console.groupEnd()
    return <Fragment />
  }

  return createElement(blockComponent, { ...data, forwardRef }, children)
}

export default BlockSerializer
