import { PortableText } from '@portabletext/react'
import { motion } from 'framer-motion'
import { createRef, useMemo, useState } from 'react'

const CustomLink = ({ value, children }) => {
  const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
  return (
    <a
      href={value?.href}
      target={target}
      rel={target === '_blank' && 'noindex nofollow'}
    >
      {children}
    </a>
  )
}

const SERIALIZERS = {
  marks: {
    link: CustomLink,
  },
}

const CollapsibleTextBlock = (props) => {
  const { /* _type, */ title, hash, blocks } = props

  const [open, setOpen] = useState(null)
  const [hovering, setHovering] = useState(null)

  const memoizedBlocks = useMemo(
    () => blocks.map((b) => ({ ref: createRef(), ...b })),
    []
  )

  function toggle(index) {
    setOpen((prev) => {
      const isToBeNulled = prev === index

      if (!isToBeNulled) {
        const top = +memoizedBlocks[index].ref.current.offsetTop
        setTimeout(() => {
          window.scrollTo({ top, behavior: 'smooth' })
        }, 100)
      }

      return isToBeNulled ? null : index
    })
  }

  function handleEnter(index) {
    setHovering(index)
  }

  function handleLeave() {
    setHovering(null)
  }

  return (
    <div>
      {memoizedBlocks.map((b, i) => (
        <div
          key={i}
          id={hash}
          ref={b.ref}
          className="mx-6 p-6 border-t-2 border-black overflow-hidden"
        >
          <button
            className="block w-full text-left cursor-pointer"
            onPointerEnter={() => handleEnter(i)}
            onPointerLeave={handleLeave}
            onClick={() => toggle(i)}
          >
            <h3 className="text-6xl py-6">
              {b.title}
              {b.title && ' ↘'}
            </h3>
          </button>
          <div className="richTextBlock">
            <motion.div
              className="text-3xl max-w-4xl ml-auto"
              animate={{
                height: open === i ? 'auto' : hovering === i ? 120 : 0,
                opacity: open === i ? 1 : hovering === i ? 0.05 : 0,
              }}
              transition={{
                type: 'ease',
                ease: [0.35, 0, 0, 1],
                duration: 0.5,
              }}
            >
              {/* @ts-ignore */}
              <PortableText value={b.blocks} components={SERIALIZERS} />
            </motion.div>
          </div>
          <style>
            {`
              .richTextBlock p {
                --margin: 1.85rem;
                margin-top: var(--margin);
                margin-bottom: var(--margin);
              }
              .richTextBlock p:first-child {
                margin-top: 0;
              }

              .richTextBlock a {
                font-weight: bold;
                text-decoration: underline;
              }
              .richTextBlock a::after {
                content: '↗';
              }
            `}
          </style>
        </div>
      ))}
    </div>
  )
}

export default CollapsibleTextBlock
