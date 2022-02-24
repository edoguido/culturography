import Head from 'next/head'
import Image from 'next/image'

import client from 'utils/cms'
import { LANDING_QUERY } from 'utils/cms/queries'

import BlockSerializer from 'utils/blockSerializer'
import { PortableText } from '@portabletext/react'

export default function Home({ data }) {
  const { project_information, blocks } = data
  const { project_title, project_subtitle, abstract } = project_information

  return (
    <div className="dark:bg-black dark:text-gray-200 bg-gray-200 text-black">
      <Head>
        <title>
          {project_title} | {project_subtitle}
        </title>
        <meta name="description" content={project_subtitle} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="z-10">
        <div className="mx-auto flex justify-center items-center bg-gradient-to-b from-roskildeOrange to-transparent">
          <h1 className="" style={{ fontSize: '12vw' }}>
            {project_title}
          </h1>
        </div>
        <div className="p-6 max-w-6xl text-roskildeOrange flex justify-center items-center">
          <h2 className="text-6xl">{project_subtitle}</h2>
        </div>
      </div>

      <div className="flex">
        <div className="richText p-6 text-2xl max-w-6xl">
          <PortableText value={abstract} />
          <style>{`
          .richText p {
            margin: 1rem 0;
          }
        `}</style>
        </div>

        {/* <div className="absolute right-0 h-screen">
          <div className="relative w-[100vh] h-[100vh]">
            <div className="absolute right-0 min-w-full min-h-full aspect-square translate-x-1/2">
              <Image src="/splashes/000.png" layout="fill" />
            </div>
            <div className="absolute right-0 min-w-full min-h-full aspect-square translate-x-1/2">
              <Image src="/splashes/101.png" layout="fill" />
            </div>
          </div>
        </div> */}
      </div>

      <div>
        {blocks.map((b, i) => (
          <BlockSerializer
            key={i}
            data={b}
            modelKey={() => b._type}
            index={i}
          />
        ))}
      </div>

      <footer></footer>
    </div>
  )
}

export async function getStaticProps() {
  const query = LANDING_QUERY

  const [data] = await client.fetch(query)

  return {
    props: {
      data: data,
    },
  }
}
