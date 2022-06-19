import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { motion, MotionConfig } from 'framer-motion'

import client from 'utils/cms'
import {
  ALL_PROJECTS_QUERY,
  FOOTER_QUERY,
  LANDING_QUERY,
} from 'utils/cms/queries'
import { StoriesProvider } from '@/context/storiesContext'
import BlockSerializer from 'components/landing/blocks/blockSerializer'

const Splashes = dynamic(() => import('components/landing/atoms/splashes'), {
  ssr: false,
})

const strings = {
  contact: [
    'Andreas Groth Clausen',
    'Head of Partnerships, Roskilde Festival',
    'partnerskaber[at]roskilde-festival.dk',
  ],
}

export default function Home({ data, stories, footer }) {
  const { project_information, blocks } = data
  const { project_title, project_subtitle, abstract } = project_information
  const { title: footer_title, blocks: footer_blocks } = footer

  return (
    <>
      <Head>
        <title>Culturography</title>
        <meta
          name="description"
          content="A digital method that helps brands engage in meaningful partnerships
          with communities that matter to them"
        />
        <meta
          name="og:description"
          content="A digital method that helps brands engage in meaningful partnerships
          with communities that matter to them"
        />
        <meta name="url" content="https://culturography.com" />
        <meta name="image" content="/media_banner_b.png" />
        <meta name="og:image" content="/media_banner_b.png" />
      </Head>
      <StoriesProvider value={stories}>
        <MotionConfig
        // transition={{
        //   initial: { type: 'ease', ease: [0.7, 0, 0, 1], duration: 2 },
        //   animate: { type: 'ease', ease: [0.7, 0, 0, 1], duration: 4 },
        //   exit: { type: 'ease', ease: [0, 0, 0, 1], duration: 10 },
        // }}
        >
          {/*  */}
          <motion.main
            className="bg-secondary text-text dark:bg-text dark:text-[#dddddd] min-h-screen"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.5,
                },
              },
            }}
          >
            <div className="relative hero min-h-[80vh] md:h-[90vh]">
              <div className="relative z-10">
                <div className="mx-auto flex justify-center items-center decoration-accent bg-gradient-to-b from-accent to-transparent">
                  <Title label={project_title} />
                </div>
                <div className="p-2 lg:p-6">
                  <Subtitle lines={project_subtitle} />
                </div>
              </div>
              {/* <Gradient /> */}
              <Splashes />
              {/*  */}
            </div>

            {/* <motion.div
              className=""
              // variants={{
              //   animate: { transition: { staggerChildren: 0.1 } },
              // }}
            >
              {abstract.map((paragraph, i) => (
                <motion.div
                  key={i}
                  className="portable-text grow w-full font-light lg:first:mr-6 tracking-tight"
                  variants={{
                    initial: { opacity: 0, y: 50 },
                    animate: { opacity: 1, y: 0 },
                  }}
                  transition={{
                    type: 'ease',
                    ease: [0.7, 0, 0, 1],
                    duration: 1.75,
                  }}
                >
              <div className="max-w-6xl"></div>
              </motion.div>
              ))}
            </motion.div> */}

            <div className="portable-text px-6 py-4 my-3 w-full text-3xl md:text-5xl lg:flex items-baseline justify-between relative z-10">
              <div>
                <h2 className="font-display text-left">
                  What is Culturography?
                </h2>
              </div>
              <h3 className="leading-[1.25] font-sans font-light text-2xl md:text-4xl max-w-5xl">
                <PortableText value={abstract} />
              </h3>
            </div>

            <div className="px-6 pt-4">
              <BlockSerializer blocks={blocks} accessor={(b) => b._type} />

              <div className="py-4 border-t-2 border-text">
                <div className="shrink py-4">
                  Curious to know more about the project and the method? ↘
                </div>
                <div className="leading-[1.25] text-2xl lg:text-3xl lg:flex lg:justify-between">
                  {strings.contact.map((line, i) => (
                    <p key={i} className="w-full py-1">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <footer className="relative w-full bg-accent text-text p-4 md:p-6 py-6 items-center">
              <h3 className="font-normal text-2xl">{footer_title}</h3>
              <div className="relative flex flex-wrap justify-around">
                {footer_blocks.map(({ image, url, description }, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center m-auto my-3 py-6 w-1/2 lg:w-48"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-1/2 lg:w-64 h-28"
                    >
                      <Image
                        src={image.asset.url}
                        layout="fill"
                        objectFit="contain"
                        alt={description}
                      />
                    </a>
                  </div>
                ))}
              </div>
            </footer>
          </motion.main>
        </MotionConfig>
      </StoriesProvider>
    </>
  )
}

const Title = ({ label }) => (
  <motion.h1
    className="text-[13.8vw] leading-none"
    variants={{
      animate: {
        transition: {
          staggerChildren: 0.01,
          staggerDirection: -1,
        },
      },
    }}
  >
    {label.split('').map((letter, i) => (
      <motion.span
        key={i}
        className="inline-block"
        variants={{
          initial: { y: '50%', scale: 0.8, opacity: 0 },
          animate: { y: ['50%', '0%'], scale: 1, opacity: 1 },
        }}
        transition={{ type: 'ease', ease: [0.7, 0, 0, 1], duration: 1.75 }}
      >
        {letter}
      </motion.span>
    ))}
  </motion.h1>
)

const Subtitle = ({ lines }) => (
  <motion.h2
    className="text-[5vw] leading-none md:text-[5vw]"
    variants={{
      animate: {
        transition: {
          staggerChildren: 0.15,
        },
      },
    }}
  >
    {lines.map((line, i) => (
      <motion.div key={i} className="overflow-hidden">
        <motion.span
          className="block"
          variants={{
            initial: { y: 200 },
            animate: { y: 0 },
          }}
          transition={{ type: 'ease', ease: [0.5, 0, 0, 1], duration: 1.25 }}
        >
          {line}
        </motion.span>
      </motion.div>
    ))}
  </motion.h2>
)

export async function getServerSideProps() {
  const query = ALL_PROJECTS_QUERY

  const [data] = await client.fetch(LANDING_QUERY)
  const allProjects = await client.fetch(query)
  const [footer] = await client.fetch(FOOTER_QUERY)

  const stories = {
    scoping: [],
    designing: [],
    monitoring: [],
  }

  allProjects.forEach((story) => {
    const { phase } = story
    stories[phase].push(story)
  })

  return {
    props: {
      data: data,
      stories: stories,
      footer: footer,
    },
  }
}
