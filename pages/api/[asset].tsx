import Cors from 'cors'
import initMiddleware from 'utils/init-middleware'
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const cors = initMiddleware(
  Cors({
    methods: ['GET'],
  })
)

export default async function handler(req, res) {
  const { asset } = req.query

  await cors(req, res)

  const data = await fetch(
    'https://apicdn.sanity.io/files/xmrgv8k7/production/53c8661ad8ad2c7331512b7eb47ec6f58f5cd6b0.gexf'
  ).then((r) => r.text())

  return res.send(data)
}
