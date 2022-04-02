import { PortableText } from '@portabletext/react'

const TextBlock = (props) => {
  const { /* _type, */ title, hash, blocks } = props

  return (
    <div id={hash} className="mx-6 p-6 border-t-2 border-black overflow-hidden">
      <h3 className="text-6xl py-6">{title}</h3>
      <div className="text-3xl max-w-4xl ml-auto">
        <PortableText value={blocks} />
      </div>
    </div>
  )
}

export default TextBlock
