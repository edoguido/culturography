import { createElement, useEffect, useState } from 'react'
import { apiFetch } from 'utils/cms'

import BarChart from './barChart'
import SankeyChart from './sankeyChart'

const CHART_TYPES = {
  sankey: SankeyChart,
  barchart: BarChart,
}

const ChartSerializer = (props) => {
  const { node, children } = props
  const { dataset, chart_type } = node

  const [fetchedDataset, setFetchedDataset] = useState(null)

  useEffect(() => {
    const fetchDataAndSet = async () => {
      const d = await apiFetch(dataset.asset.assetId)
      setFetchedDataset(d)
    }

    fetchDataAndSet()
  }, [])

  if (!CHART_TYPES[chart_type]) return null

  return (
    fetchedDataset && (
      <div>
        <div className="relative min-h-[320px]">
          <div className="absolute inset-0 z-0">
            {createElement(
              CHART_TYPES[chart_type],
              { fetchedDataset, ...node },
              { ...children }
            )}
          </div>
        </div>
      </div>
    )
  )
}

export default ChartSerializer
