import moment from 'moment'
import Orders from './Orders'
import regions from '../../data/regions'
import getRegionMarket from '../server/getRegionMarket'
import s3upload from '../server/s3upload'

export default class MarketData {
  constructor() {
    this.currentStatus = 'not started'
    this.expires = moment().subtract(10, 'seconds')
    this.regions = [...regions]
    this.fullOrders = []
    this.buy = {}
    this.sell = {}
    this.minMargin = 0.035
  }

  get status() {
    return {
      status: this.currentStatus,
      expires: this.expires,
    }
  }

  get cache() {
    return {
      expires: this.expires,
      status: this.currentStatus,
      orders: {
        buy: this.buy,
        sell: this.sell,
      },
    }
  }

  update() {
    if(this.currentStatus !== 'pending' && moment().isAfter(this.expires)) {
      this.expires = moment().add(300, 'seconds')
      this.getMarketData()
        .then(() => {
          console.log('start processing')
          this.processMarketData()
        })
        .catch(err => console.log(err))
    }
  }

  getMarketData(regionIndex = 0) {
    this.currentStatus = 'pending'

    return new Promise(resolve => {
      const regionId = this.regions[regionIndex]

      if(regionId === undefined) {
        resolve()
      }

      resolve(regionId)
    }).then(regionId => {
      if(regionId) {
        return getRegionMarket(regionId)
          .then(rawRegion => {
            const regionOrders = rawRegion.map(order => new Orders(order))

            this.fullOrders = this.fullOrders.concat([...regionOrders])

            return this.getMarketData(regionIndex + 1)
          })
      }
    })
  } 

  processMarketData() {
    const itemOrders = this.splitByItem([...this.fullOrders])
    const items = Object.keys(itemOrders)
    const sellLocations = {}
    const buyItems = {}

    items.forEach(item => {
      const itemBuy = itemOrders[item].buy.map(order => order.price).sort((a, b) => b - a)

      const filteredSells = itemOrders[item].sell.filter(order => {
        for(let i = 0; i < itemBuy.length; ++i) {
          if(order.price < itemBuy[i] * (1 - this.minMargin)) {
            return true
          }
        }
      }).sort((a, b) => a.price - b.price)
      
      const filteredBuys = itemOrders[item].buy.filter(order => {
        for(let i = 0; i < filteredSells.length; ++i) {
          if(order.price > filteredSells[i].price) {
            return true
          }
        }
      }).sort((a, b) => b.price - a.price)

      filteredSells.forEach(order => {
        const sellLoc = (sellLocations[order.loc]) ? [...sellLocations[order.loc]] : []

        sellLoc.push(order)        

        sellLocations[order.loc] = sellLoc
      })

      filteredBuys.forEach(order => {
        const buyItem = (buyItems[order.type]) ? [...buyItems[order.type]] : []

        buyItem.push(order)

        buyItems[order.type] = buyItem
      })
    })

    this.sell = {...sellLocations}
    this.buy = {...buyItems}
    this.fullOrders = []
    this.currentStatus = 'done'
    console.log('done')

    s3upload(this.cache)
  }

  splitByItem(orders) {
    const itemOrders = {}

    orders.forEach(order => {
      const item = itemOrders[order.type] ? {...itemOrders[order.type]} : {buy: [], sell: []}

      if(order.buy) {
        item.buy.push(order)
      } else {
        item.sell.push(order)
      }

      itemOrders[order.type] = {...item}
    })

    return itemOrders
  }
}