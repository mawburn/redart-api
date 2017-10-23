import request from 'request-promise-native'
import esi from '../util/esiEndpoints'

const getRegionMarketPage = (regionId, page, retryCount = 0) => {
  if(retryCount > 15) {
    return new Error(`Error retrieving ${regionId} page ${page}`)
  }

  return request({
    uri: esi.market.orders(regionId, page),
    method: 'GET',
    json: true,
    transform: ((body, response) => {
      return {headers: response.headers, body}
    }),
  }).then(response => {
    return {
      pages: response.headers['x-pages'],
      expires: response.headers.expires,
      body: response.body,
    }
  }).catch(err => {
    console.log(err)
    console.log(`Failed: retrying ${regionId} page ${page}`)

    return getRegionMarketPage(regionId, page, retryCount + 1)
  })
}

const getRegionMarket = regionId => {
  console.log(`Getting ${regionId}`)

  return getRegionMarketPage(regionId, 1)
    .then(response => {
      const regionMarket = [...response.body]

      if(response.pages === 1) {
        return [...regionMarket]
      }

      const pages = []

      for(let i = 2; i < response.pages; ++i) {
        pages.push(getRegionMarketPage(regionId, i))
      }

      return Promise.all(pages)
        .then(responses => {
          responses.forEach(pageData => {
            regionMarket.concat([...pageData.body])
          })

          return [...regionMarket]
        })
    })
}

export default getRegionMarket