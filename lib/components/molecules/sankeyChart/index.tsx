import { ResponsiveSankey } from '@nivo/sankey'

// caption: "A simple sankey diagram"
// chart_type: "sankey"
// children: {}
// dataset:
// asset:
// assetId: "f55f243a4fb0c228f775b75dedf9bc992d8c2670"
// extension: "json"
// mimeType: "application/json"
// originalFilename: "sankey-data.json"
// path: "files/xmrgv8k7/production/f55f243a4fb0c228f775b75dedf9bc992d8c2670.json"
// sha1hash: "f55f243a4fb0c228f775b75dedf9bc992d8c2670"
// size: 1377
// uploadId: "IfTKIi43cqqMasj973ipdM3Msus2TVVp"
// url: "https://cdn.sanity.io/files/xmrgv8k7/production/f55f243a4fb0c228f775b75dedf9bc992d8c2670.json"
// _createdAt: "2021-12-03T10:42:43Z"
// _id: "file-f55f243a4fb0c228f775b75dedf9bc992d8c2670-json"
// _rev: "lfjSY5hwzPVlAC2YphUQp2"
// _type: "sanity.fileAsset"
// _updatedAt: "2021-12-03T10:42:43Z"
// [[Prototype]]: Object
// _type: "file"
// [[Prototype]]: Object
// _key: "4e0c1f6e0d91"
// _type: "story.chart"

const SankeyChart = ({
  fetchedDataset = { nodes: null, links: null } /* , ...props */,
}) => {
  if (!fetchedDataset.nodes || !fetchedDataset.links) return null

  return (
    fetchedDataset && (
      <ResponsiveSankey
        data={fetchedDataset}
        animate={false}
        margin={{ top: 20, right: 160, bottom: 20, left: 20 }}
        align="justify"
        colors={{ scheme: 'category10' }}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="vertical"
        labelPadding={16}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            translateX: 130,
            itemWidth: 100,
            itemHeight: 14,
            itemDirection: 'right-to-left',
            itemsSpacing: 2,
            itemTextColor: '#999',
            symbolSize: 14,
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#000',
                },
              },
            ],
          },
        ]}
      />
    )
  )
}

export default SankeyChart
