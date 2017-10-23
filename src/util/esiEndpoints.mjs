const url = 'https://esi.tech.ccp.is/latest'

const esi = {
  url,
  character: {
    location: charId => `${url}/characters/${charId}/location`,
    ship: charId => `${url}/characters/${charId}/ship`,
  },
  constellations: constellationId => `${url}/universe/constellations/${constellationId}/`,
  location: {
    system: systemId => `${url}/universe/systems/${systemId}`,
    station: stationId => `${url}/stations/${stationId}`,
  },
  market: {
    orders: (regionId, page = 1, type = 'all') => `${url}/markets/${regionId}/orders?order_type=${type}&page=${page}`,
  },
  region: {
    search: query => `${url}/search?categories=region&search=${query}`,
    info: regionId => `${url}/universe/regions/${regionId}/`,
  },
  route: (origin, destination) => `${url}/route/${origin}/${destination}`,
  search: (type, query) => `${url}/search?categories=${type}&search=${query}`,
  type: typeId => `${url}/universe/types/${typeId}`,
} 

export default esi