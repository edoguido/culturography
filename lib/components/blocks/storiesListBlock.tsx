import { useMemo } from 'react'
import Link from 'next/link'

interface ProjectPhaseType {
  title: string
  value: string
  order: number
}

const StoriesListBlock = (props) => {
  const {
    title,
    hash,
    sections,
  }: { title: string; hash: string; sections: ProjectPhaseType } = props

  const memoizedSections = useMemo(
    () => Object.values(sections).sort((a, b) => a.order - b.order),
    []
  )

  return (
    <div id={hash} className="my-8 px-6 p-6">
      <h2 className="text-6xl">{title}</h2>
      <div>
        {memoizedSections.map(({ title, description, stories }, i) => {
          const hasStories = stories?.length > 0

          return (
            <div key={i} className="my-4 py-4 border-t-2 border-gray-500">
              <h3 className="text-4xl py-2 my2">
                {title}
                {!hasStories && ' — Coming soon'}
              </h3>
              <div className="lg:grid grid-cols-2">
                {hasStories ? (
                  <div className="py-6">
                    {stories.map(({ title, slug }) => {
                      return (
                        <Link key={slug.current} href={slug.current}>
                          <a className="text-4xl px-4 p-2 whitespace-nowrap rounded-full bg-roskildeOrange">
                            {title}
                          </a>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div />
                )}
                <div className="text-xl">{description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StoriesListBlock
