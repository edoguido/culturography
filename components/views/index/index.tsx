import { motion, MotionConfig } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'

import client from 'utils/cms'
import { ALL_PROJECTS_QUERY, LANDING_QUERY } from 'utils/cms/queries'

// import BlockSerializer from 'components/blocks/blockSerializer'
// import { PortableText } from '@portabletext/react'

const strings = {
  title: 'Culturography',
  subtitle: [
    'A digital method that helps brands ',
    'engage in meaningful partnerships ',
    'with communities that matter to them',
  ],
  about: [
    `People are increasingly expecting brands to take a stand on societal issues.
    Companies who want to create a strong emotional bond with their target groups will have to show real commitment to agendas that are important to them.
    `,
    'Culturography is the study of how the public engages in different communities and interacts around different societal issues online. The method gives brands and cultural institutions a data-driven approach to engage in meaningful partnerships and strengthen brand affiliation to each other’s communities by engaging in important agendas.',
  ],
  phases: `Culturograpy builds upon three analytical phases that will inform
  the three phases of the collaboration, namely: scoping the
  partnership between a brand and a cultural institution; designing a
  joint intervention; measuring the effect of the partnership. This
  open-source digital universe allows you to explore the
  method on your own and read about specific cases analyzed by
  Backscatter and Roskilde Festival.`,
}

const phases = [
  {
    id: 'scoping',
    name: 'Scoping',
    question:
      'How are different communities interacting around a chosen societal issue?',
    label: 'Establishing a common ground for the partnership',
  },
  {
    id: 'designing',
    name: 'Designing',
    question:
      "How are the two partners' target groups interacting around that societal issue?",
    label:
      "Designing a joint intervention to activate each other's target groups",
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    question: 'How is the public reacting to the joint intervention?',
    label: 'Measuring the impact of the activation on different communities',
  },
]

export default function Home({ stories }) {
  // const { project_information, blocks } = data
  // const { project_title, project_subtitle, abstract } = project_information

  return (
    <>
      <Head>
        {/* <title>
          {project_title} | {project_subtitle}
        </title>
        <meta name="description" content={project_subtitle} />
        <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      {/*  */}
      <motion.main
        className="bg-secondary text-text min-h-screen"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="relative hero h-[80vh]">
          <div className="relative z-10">
            <div className="mx-auto flex justify-center items-center bg-gradient-to-b from-accent to-transparent">
              <Title label={strings.title} />
            </div>
            <div className="p-6">
              <Subtitle lines={strings.subtitle} />
            </div>
          </div>
          <Gradient />
          {/*  */}
        </div>

        <div className="relative p-6 text-3xl lg:flex">
          {strings.about.map((paragraph, i) => (
            <p
              key={i}
              className="grow w-full lg:first:mr-4 lg:last:ml-4 tracking-tight"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="px-6 pt-12">
          {/* <div>Phases</div> */}
          <div className="lg:flex items-baseline font-normal">
            {phases.map(({ id, name, question, label }, i) => {
              const storiesOfPhase = stories[id]

              return (
                <div
                  key={i}
                  className="relative w-full mb-12 lg:mx-4 first:ml-0 last:ml-0"
                >
                  <div className="shrink">{name} ↘</div>
                  <h3 className="my-2 py-2 text-3xl">{question}</h3>
                  <div className="shrink">{label}</div>
                  <div>
                    {storiesOfPhase.map(({ slug, title }) => (
                      <Link key={slug.current} href={slug.current}>
                        <a className="inline-block bg-accent rounded-full text-xl px-4 py-2 my-2">
                          <h3 className="font-medium">{title} →</h3>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mx-6 py-4 text-4xl lg:text-6xl leading-[1.15] border-t-2 border-text">
          <h3>{strings.phases}</h3>
        </div>

        {/* <div className="flex">
          <div className="richText p-6 text-2xl max-w-6xl">
            <PortableText value={abstract} />
            <style>
              {`
                .richText p {
                  margin: 1rem 0;
                }
              `}
            </style>
          </div>
        </div> */}

        {/* <div>
          {blocks.map((b, i) => (
            <BlockSerializer
              key={i}
              data={b}
              modelKey={() => b._type}
              index={i}
            />
          ))}
        </div> */}

        {/* <footer></footer> */}
      </motion.main>
    </>
  )
}

const Title = ({ label }) => (
  <motion.h1
    className="text-[14vw] leading-none"
    variants={{
      animate: {
        transition: {
          staggerChildren: 0.01,
          duration: 3,
        },
      },
    }}
  >
    {label.split('').map((letter, i) => (
      <motion.span
        key={i}
        className="inline-block"
        variants={{
          initial: { y: 0, scale: 0.8, opacity: 0 },
          animate: {
            y: 0,
            scale: 1,
            opacity: 1,
          },
        }}
        transition={{
          type: 'ease',
          ease: [0.7, 0, 0, 1],
          duration: 1.25,
        }}
      >
        {letter}
      </motion.span>
    ))}
  </motion.h1>
)

const Subtitle = ({ lines }) => (
  <motion.h2
    className="text-4xl md:text-6xl"
    variants={{
      animate: {
        transition: {
          staggerChildren: 0.05,
          delayChildren: 1,
        },
      },
    }}
  >
    {lines.map((line, i) => (
      <motion.div key={i} className="h-[6vw] lg:h-[4.5vw] overflow-hidden">
        <motion.span
          className="block text-[4.5vw]"
          variants={{
            initial: { y: 200 },
            animate: { y: 0 },
          }}
          transition={{
            type: 'spring',
            stiffness: 1200,
            damping: 200,
          }}
        >
          {line}
        </motion.span>
      </motion.div>
    ))}
  </motion.h2>
)

const Gradient = () => {
  const fxSize = '400%'
  const fxOffset = '-100%'

  return (
    <div className="absolute inset-0">
      <svg
        className="z-0 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        xmlns-xlink="http://www.w3.org/1999/xlink"
        xmlns-svgjs="http://svgjs.dev/svgjs"
        viewBox="0 0 1280 1280"
        preserveAspectRatio="xMinYMin meet"
        width="100%"
        height="100%"
      >
        <defs>
          <radialGradient id="gggrain-gradient" r="1">
            <stop offset="0%" stopColor="#93FF0080"></stop>
            <stop offset="50%" stopColor="rgba(255,255,255,0)"></stop>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"></stop>
          </radialGradient>
          <radialGradient id="gggrain-gradient-red" r="1">
            <stop offset="0%" stopColor="#95ff0080"></stop>
            <stop offset="50%" stopColor="rgba(255,255,255,0)"></stop>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"></stop>
          </radialGradient>
          <filter
            id="gggrain-filter"
            x={fxOffset}
            y={fxOffset}
            width={fxSize}
            height={fxSize}
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.63"
              numOctaves="2"
              seed="2"
              stitchTiles="stitch"
              x={fxOffset}
              y={fxOffset}
              width={fxSize}
              height={fxSize}
              result="turbulence"
            ></feTurbulence>
            <feColorMatrix
              type="saturate"
              values="0"
              x={fxOffset}
              y={fxOffset}
              width={fxSize}
              height={fxSize}
              in="turbulence"
              result="colormatrix"
            ></feColorMatrix>
            <feComponentTransfer
              x={fxOffset}
              y={fxOffset}
              width={fxSize}
              height={fxSize}
              in="colormatrix"
              result="componentTransfer"
            >
              <feFuncR type="linear" slope="3"></feFuncR>
              <feFuncG type="linear" slope="3"></feFuncG>
              <feFuncB type="linear" slope="3"></feFuncB>
            </feComponentTransfer>
            <feColorMatrix
              x={fxOffset}
              y={fxOffset}
              width={fxSize}
              height={fxSize}
              in="componentTransfer"
              result="colormatrix2"
              type="matrix"
              values="1 0 0 0 0
0 1 0 0 0
0 0 1 0 0
0 0 0 18 -10"
            ></feColorMatrix>
          </filter>
        </defs>
        <g>
          <motion.rect
            x={'0%'}
            y={'0%'}
            width="100%"
            height="100%"
            fill="url(#gggrain-gradient)"
            variants={{
              initial: {
                x: '0%',
                y: '0%',
                width: '250%',
              },
              animate: {
                x: '-50%',
                y: '25%',
                width: '250%',
                transition: {
                  ease: [0.8, 0, 0, 1],
                  duration: 3,
                },
              },
            }}
          />
          <motion.rect
            x={'0%'}
            y={'0%'}
            width="100%"
            height="100%"
            fill="url(#gggrain-gradient-red)"
            variants={{
              initial: {
                x: '0%',
                y: '0%',
                width: '250%',
              },
              animate: {
                x: '50%',
                y: '15%',
                width: '150%',
                transition: {
                  ease: [0.8, 0, 0, 1],
                  duration: 3,
                },
              },
            }}
          />
          <rect
            width="100%"
            height="100%"
            fill="transparent"
            filter="url(#gggrain-filter)"
            opacity="0.64"
            style={{ mixBlendMode: 'soft-light' }}
          />
        </g>
      </svg>
    </div>
  )
}

export async function getStaticProps() {
  const query = ALL_PROJECTS_QUERY

  const data = await client.fetch(query)

  const stories = {
    scoping: [],
    designing: [],
    monitoring: [],
  }

  data.forEach((story) => {
    const { phase } = story
    stories[phase].push(story)
  })

  return {
    props: {
      stories: stories,
    },
  }
}
