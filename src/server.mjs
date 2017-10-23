import express from 'express'
import MarketData from './models/MarketData'
import UpdateOrders from './server/UpdateOrders'

const app = express()
app.disable('etag')

const updateOrders = new UpdateOrders()
const marketData = new MarketData()

const port = process.env.PORT || 8000
const updateKey = process.env.UPDATE_KEY || 'test'

app.get('/status', (req, res) => {
  res.type('json')
  res.send(marketData.status)
})

app.get('/update/:id', (req, res) => {
  if(req.params.id === updateKey) {
    // updateOrders.updater()
    // res.send(updateOrders.status)
    marketData.update()
    res.type('json')
    res.send(marketData.status)
  } else {
    res.status(404)
  }
})

app.get('/cache', (req, res) => {
  res.send(marketData.cache)
})

app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
