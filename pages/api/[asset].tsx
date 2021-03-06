// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Cors from 'cors'
import initMiddleware from 'utils/init-middleware'

const cors = initMiddleware(
  Cors({
    methods: ['GET'],
  })
)

export default async function handler(req, res) {
  const { asset } = req.query

  await cors(req, res)

  const data = await fetch(
    `https://apicdn.sanity.io/files/xmrgv8k7/production/${asset}.json`
  ).then((res) => res.json())

  res.status(200).json(data)
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
