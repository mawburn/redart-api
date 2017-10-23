import bs from 'binary-search'
import moment from 'moment'
import highSecStations from '../../data/highSecStations'

export default class Order {
  constructor(rawOrder) {
    this.id = rawOrder.order_id
    this.type = rawOrder.type_id
    this.price = rawOrder.price
    this.amt = rawOrder.volume_remain
    this.loc = rawOrder.location_id
    this.ends = moment(rawOrder.issued)
      .add(rawOrder.duration, 'days')
      .utc()
      .format()

    if(rawOrder.min_volume !== 1) {
      this.min = rawOrder.min_volume
    }

    if(rawOrder.is_buy_order) {
      this.buy = rawOrder.is_buy_order

      if(rawOrder.range !== 'station') {
        this.range = rawOrder.range
      }
    }

    if(this.isLowSec(rawOrder.location_id)) {
      this.lowSec = true
    }
  }

  isLowSec(location) {
    return bs(highSecStations, location, (a,b) => a - b) < 0
  }
}