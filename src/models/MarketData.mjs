import moment from 'moment'
import Orders from './Orders'
import regions from '../../data/regions'
import getRegionMarket from '../server/getRegionMarket'

export default class MarketData {
  constructor() {
    this.currentStatus = 'not started'
    this.expires = moment().subtract(10, 'seconds')
    this.regions = [...regions]
    this.orders = []
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
      orders: this.orders,
    }
  }

  update() {
    if(this.currentStatus !== 'pending' && moment().isAfter(this.expires)) {
      this.expires = moment().add(300, 'seconds')
      this.getMarketData()
        .catch(err => console.log(err))
    }
  }

  getMarketData(regionIndex = 0) {
    this.currentStatus = 'pending'

    return new Promise(resolve => {
      const regionId = this.regions[regionIndex]

      if(regionId === undefined) {
        console.log('done')
        this.currentStatus = 'done'
        resolve()
        return true
      }

      return getRegionMarket(regionId)
        .then(rawRegion => {
          const regionOrders = rawRegion.map(order => new Orders(order))

          this.orders = this.orders.concat([...regionOrders])

          return this.getMarketData(regionIndex + 1)
        })
    })
  }
}