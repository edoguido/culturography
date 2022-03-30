import S from '@sanity/desk-tool/structure-builder'

export default () =>
  S.list()
    .title('Base')
    .items([
      S.listItem()
        .title('Landing page')
        .child(
          S.document()
            .title('Landing page')
            .schemaType('landing')
            .documentId('landing')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (e) => !['settings'].includes(e.getId())
      ),
    ])
