import { motion } from 'framer-motion'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'

import useStories from '@/context/storiesContext'

interface PhaseObject {
  description: string
  order: number
  phase_slug: string
  title: string
}

const ProjectPhasesBlock = (props) => {
  const { title, description, sections } = props
  const stories = useStories()
  const phases = Object.values(sections).sort(
    (a: PhaseObject, b: PhaseObject) => a.order - b.order
  )

  return (
    <>
      <div className="py-4 my-3 w-full text-3xl md:text-5xl lg:flex items-baseline justify-between">
        <div className="font-display w-full">{title}</div>
        <h3 className="leading-[1.25] font-sans font-light text-2xl md:text-4xl max-w-5xl text-right">
          <PortableText value={description} />
        </h3>

        {/* <h3 className="leading-[1.25] font-sans font-light text-2xl md:text-4xl max-w-5xl text-right">
          Culturograpy builds upon three analytical phases of a partnership
          between a brand and cultural institution. This{' '}
          <a
            className="inline-link"
            href="https://github.com/edoguido/cultural-impact-index"
            target="_blank"
            rel="noopener noreferrer"
          >
            open-source
          </a>{' '}
          digital universe allows you to explore the method on your own and read
          about specific partnerships analyzed by Backscatter and Roskilde
          Festival.
        </h3> */}
      </div>
      <motion.div
        className="lg:flex items-baseline font-normal"
        variants={{ animate: { transition: { staggerChildren: 0.2 } } }}
      >
        {phases.map(
          (
            { phase_slug, title: phase_title, description: phase_description },
            i
          ) => {
            const storiesOfPhase = stories[phase_slug]

            return (
              <motion.div
                key={i}
                className="relative w-full mb-12 lg:mx-4 first:ml-0 last:ml-0 border-t-2 border-accent"
              >
                <div className="shrink my-2">{phase_title} ↘</div>
                <h3 className="my-2 text-4xl">{phase_description}</h3>
                {/* <div className="shrink my-2">{label}</div> */}
                <div>
                  {storiesOfPhase.map(({ slug, title }) => (
                    <Link key={slug.current} href={slug.current}>
                      <a className="inline-block bg-accent rounded-full text-xl px-4 py-2 my-2">
                        <h3 className="font-medium">{title} →</h3>
                      </a>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )
          }
        )}
      </motion.div>
    </>
  )
}

export default ProjectPhasesBlock
