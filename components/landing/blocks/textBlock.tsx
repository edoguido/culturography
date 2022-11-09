import { PortableText } from '@portabletext/react'

const TextBlock = (props) => {
  const { /* _type, */ title, hash, blocks } = props

  return (
    <>
      <div
        id={hash}
        className="portable-text py-4 pb-8 border-t-[1px] border-text"
      >
        <div className="font-display shrink py-4 text-3xl lg:text-5xl">
          {title} ↘
        </div>
        <div className="leading-[1.25] text-2xl lg:text-3xl lg:grid grid-cols-2 gap-16">
          <PortableText value={blocks} />
          {/* <p className="">
            The platform itself is open source and shared under a{' '}
            <a
              className="inline-link"
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC-BY-SA
            </a>{' '}
            license. This means that you are free to reuse the platform for your
            own datasets and adapt the code as you like, as long as you cite the
            Culturograhy project and share any adaptations you make under the
            same license for others to use.,
          </p> */}
        </div>
      </div>
      {/*  */}
    </>
  )
}

export default TextBlock
