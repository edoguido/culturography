import { createElement, useEffect, useState } from 'react'

import BarChart from '../barChart'
import SankeyChart from '../sankeyChart'

import * as Styled from './styled'

const CHART_TYPES = {
  sankey: SankeyChart,
  barchart: BarChart,
}

const ChartSerializer = (props) => {
  const { node, children } = props
  const { dataset, chart_type } = node

  if (!CHART_TYPES[chart_type]) return null

  const [fetchedDataset, setFetchedDataset] = useState(null)

  useEffect(() => {
    const { path } = dataset.asset

    const fetchDataAndSet = async () => {
      const d = await fetch(`https://apicdn.sanity.io/${path}`).then((d) =>
        d.json()
      )

      setFetchedDataset(d)
    }

    fetchDataAndSet()
  }, [])

  return (
    fetchedDataset && (
      <Styled.ChartSerializerWrapper>
        <Styled.ChartSerializerContent>
          {createElement(
            CHART_TYPES[chart_type],
            { fetchedDataset, ...node },
            { ...children }
          )}
        </Styled.ChartSerializerContent>
      </Styled.ChartSerializerWrapper>
    )
  )
}

export default ChartSerializer
