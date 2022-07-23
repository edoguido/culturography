import React, { createElement, Fragment, ReactChild } from 'react'
import dynamic from 'next/dynamic'

const TextBlock = dynamic(() => import('./textBlock'), {
  ssr: false,
})
const ProjectPhasesBlock = dynamic(() => import('./projectPhasesBlock'), {
  ssr: false,
})

// block-component mapping
const MODELS = {
  'block.text': TextBlock,
  'block.phases': ProjectPhasesBlock,
}

interface SingleBlockSerializerProps {
  data: any
  accessor: (arg0: any) => string
  index: Number
  forwardRef?: React.RefObject<HTMLElement>
  children?: ReactChild | ReactChild[]
}

const SingleSerializer = (props: SingleBlockSerializerProps) => {
  const { data, accessor, index, forwardRef, children } = props

  let blockTypeKey = accessor(data)
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

const BlockSerializer = ({ blocks, accessor }) =>
  blocks.map((b, i) => (
    <SingleSerializer key={i} data={b} accessor={accessor} index={i} />
  ))

export default BlockSerializer
