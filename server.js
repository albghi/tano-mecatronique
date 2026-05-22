const express = require('express')
const path = require('path')
const https = require('https')

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

app.post('/api/chat', (req, res) => {
  const body = JSON.stringify(req.body)
  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  }
  const apiReq = https.request(options, (apiRes) => {
    let data = ''
    apiRes.on('data', chunk => data += chunk)
    apiRes.on('end', () => res.json(JSON.parse(data)))
  })
  apiReq.on('error', (e) => res.status(500).json({ error: e.message }))
  apiReq.write(body)
  apiReq.end()
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(10000, () => console.log('Live on port 10000'))
