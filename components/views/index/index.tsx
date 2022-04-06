import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import { motion, MotionConfig } from 'framer-motion'

const Splashes = dynamic(() => import('components/atoms/splashes'), {
  ssr: false,
})

import client from 'utils/cms'
import { ALL_PROJECTS_QUERY } from 'utils/cms/queries'

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
  more: [
    'This project helps brands and cultural institutions position their core values and strategies in the right communities and tracks how these are reacting to the partnership. By doing so we set out to challenge the traditional way in which we calculate the value of partnerships between cultural institutions and commercial partners. We replace traditional quantitative goals - as for example a degree of exposure among specific target group segments - with a qualitative understanding of developments in brand affiliations to communities.',
  ],
  contact: [
    'Andreas Groth Clausen',
    'Head of Partnerships, Roskilde Festival',
    'partnerskaber[at]roskilde-festival.dk',
  ],
}

const phases = [
  {
    id: 'scoping',
    name: 'Scoping',
    question:
      'How are different communities interacting around a chosen societal issue?',
    // label: 'Establishing a common ground for the partnership',
  },
  {
    id: 'designing',
    name: 'Designing',
    question:
      "How are the two partners' target groups interacting around that societal issue?",
    // label:
    //   "Designing a joint intervention to activate each other's target groups",
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    question: 'How is the public reacting to the joint intervention?',
    // label: 'Measuring the impact of the activation on different communities',
  },
]

export default function Home({ stories }) {
  // const { project_information, blocks } = data
  // const { project_title, project_subtitle, abstract } = project_information

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
                <Title label={strings.title} />
              </div>
              <div className="p-2 lg:p-6">
                <Subtitle lines={strings.subtitle} />
              </div>
            </div>
            {/* <Gradient /> */}
            <Splashes />
            {/*  */}
          </div>

          <motion.div
            className="relative z-10 p-4 md:p-6 text-2xl md:text-4xl lg:flex"
            variants={{
              animate: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {strings.about.map((paragraph, i) => (
              <motion.p
                key={i}
                className="grow w-full font-light lg:first:mr-6 lg:last:ml-6 tracking-tight"
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
                {paragraph}
              </motion.p>
            ))}
          </motion.div>

          <div className="px-6 pt-4">
            {/* <div>Phases</div> */}
            <div className="py-4 my-3 w-full text-3xl md:text-5xl lg:flex items-baseline justify-between">
              <div className="font-display w-full">
                Phases of the method and case studies
              </div>
              <h3 className="leading-[1.25] font-sans font-light text-2xl md:text-4xl max-w-5xl text-right">
                Culturograpy builds upon three analytical phases of a
                partnership between a brand and cultural institution. This{' '}
                <a
                  className="inline-link"
                  href="https://github.com/edoguido/cultural-impact-index"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  open-source
                </a>{' '}
                digital universe allows you to explore the method on your own
                and read about specific partnerships analyzed by Backscatter and
                Roskilde Festival.
              </h3>
            </div>
            <motion.div
              className="lg:flex items-baseline font-normal"
              variants={{ animate: { transition: { staggerChildren: 0.2 } } }}
            >
              {phases.map(({ id, name, question }, i) => {
                const storiesOfPhase = stories[id]

                return (
                  <motion.div
                    key={i}
                    className="relative w-full mb-12 lg:mx-4 first:ml-0 last:ml-0 border-t-2 border-accent"
                  >
                    <div className="shrink my-2">{name} ↘</div>
                    <h3 className="my-2 text-4xl">{question}</h3>
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
              })}
            </motion.div>
            {/*  */}
            <div className="py-4 border-t-2 border-text">
              <div className="shrink py-4">More on the project ↘</div>
              <div className="leading-[1.25] text-2xl lg:text-3xl lg:grid grid-cols-2 gap-16">
                <p className="">{strings.more}</p>
                <p className="">
                  The platform itself is open source and shared under a{' '}
                  <a
                    className="inline-link"
                    href="https://creativecommons.org/licenses/by-sa/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CC-BY-SA
                  </a>{' '}
                  license. This means that you are free to reuse the platform
                  for your own datasets and adapt the code as you like, as long
                  as you cite the Culturograhy project and share any adaptations
                  you make under the same license for others to use.,
                </p>
              </div>
            </div>
            {/*  */}
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

          <div className="relative w-full bg-accent text-text p-4 md:p-6 py-6 lg:grid grid-cols-3 items-center">
            <h3 className="font-normal text-2xl">
              This project was made possible by
            </h3>
            <div className="flex justify-center my-3 py-6">
              <Image
                src="/roskilde_logo.png"
                layout="intrinsic"
                width={96}
                height={96}
              />
            </div>
            <div className="flex justify-center my-3 py-6">
              <Image
                src="/backscatter_logo.png"
                layout="intrinsic"
                width={96}
                height={96}
              />
            </div>
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
      </MotionConfig>
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

// const Gradient = () => {
//   const fxSize = '400%'
//   const fxOffset = '-100%'

//   return (
//     <motion.div
//       className="absolute inset-0"
//       initial="initial"
//       animate="animate"
//       exit="exit"
//     >
//       <svg
//         className="z-0 overflow-visible"
//         xmlns="http://www.w3.org/2000/svg"
//         version="1.1"
//         xmlns-xlink="http://www.w3.org/1999/xlink"
//         xmlns-svgjs="http://svgjs.dev/svgjs"
//         viewBox="0 0 1280 1280"
//         preserveAspectRatio="xMinYMin meet"
//         width="100%"
//         height="100%"
//       >
//         <defs>
//           <radialGradient id="gggrain-gradient" r="1">
//             <stop offset="0%" stopColor="#93FF0020"></stop>
//             <stop offset="50%" stopColor="rgba(255,255,255,0)"></stop>
//             <stop offset="100%" stopColor="rgba(255,255,255,0)"></stop>
//           </radialGradient>
//           <filter
//             id="gggrain-filter"
//             x={fxOffset}
//             y={fxOffset}
//             width={fxSize}
//             height={fxSize}
//             filterUnits="objectBoundingBox"
//             primitiveUnits="userSpaceOnUse"
//             colorInterpolationFilters="sRGB"
//           >
//             <feTurbulence
//               type="fractalNoise"
//               baseFrequency="0.63"
//               numOctaves="2"
//               seed="2"
//               stitchTiles="stitch"
//               x={fxOffset}
//               y={fxOffset}
//               width={fxSize}
//               height={fxSize}
//               result="turbulence"
//             ></feTurbulence>
//             <feColorMatrix
//               type="saturate"
//               values="0"
//               x={fxOffset}
//               y={fxOffset}
//               width={fxSize}
//               height={fxSize}
//               in="turbulence"
//               result="colormatrix"
//             ></feColorMatrix>
//             <feComponentTransfer
//               x={fxOffset}
//               y={fxOffset}
//               width={fxSize}
//               height={fxSize}
//               in="colormatrix"
//               result="componentTransfer"
//             >
//               <feFuncR type="linear" slope="3"></feFuncR>
//               <feFuncG type="linear" slope="3"></feFuncG>
//               <feFuncB type="linear" slope="3"></feFuncB>
//             </feComponentTransfer>
//             <feColorMatrix
//               x={fxOffset}
//               y={fxOffset}
//               width={fxSize}
//               height={fxSize}
//               in="componentTransfer"
//               result="colormatrix2"
//               type="matrix"
//               values="1 0 0 0 0
// 0 1 0 0 0
// 0 0 1 0 0
// 0 0 0 18 -10"
//             ></feColorMatrix>
//           </filter>
//         </defs>
//         <g>
//           <motion.rect
//             height="100%"
//             fill="url(#gggrain-gradient)"
//             variants={{
//               initial: {
//                 x: '-100%',
//                 y: '80%',
//                 width: '250%',
//               },
//               animate: {
//                 x: '-50%',
//                 y: '25%',
//                 width: '250%',
//                 transition: {
//                   ease: [0, 0, 0, 1],
//                   duration: 3,
//                   delay: 2,
//                 },
//               },
//             }}
//           />
//           <motion.rect
//             height="100%"
//             fill="url(#gggrain-gradient)"
//             variants={{
//               initial: {
//                 x: '100%',
//                 y: '80%',
//                 width: '250%',
//               },
//               animate: {
//                 x: '50%',
//                 y: '15%',
//                 width: '150%',
//                 transition: {
//                   ease: [0, 0, 0, 1],
//                   duration: 3,
//                   delay: 2,
//                 },
//               },
//             }}
//           />
//           <rect
//             width="100%"
//             height="100%"
//             fill="transparent"
//             filter="url(#gggrain-filter)"
//             opacity="0.64"
//             style={{ mixBlendMode: 'soft-light' }}
//           />
//         </g>
//       </svg>
//     </motion.div>
//   )
// }

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
