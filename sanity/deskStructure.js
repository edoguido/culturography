import S from '@sanity/desk-tool/structure-builder'

const LandingPage = S.listItem()
  .title('Landing page')
  .child(
    S.document()
      .title('Landing page')
      .schemaType('landing')
      .documentId('landing')
  )

const Footer = S.listItem()
  .title('Footer')
  .child(S.document().title('Footer').schemaType('footer').documentId('footer'))

const Divider = S.divider()

const Documents = S.documentTypeListItems().filter(
  (e) => !['settings'].includes(e.getId())
)

export default () =>
  S.list()
    .title('Base')
    .items([LandingPage, Footer, Divider, ...Documents])
