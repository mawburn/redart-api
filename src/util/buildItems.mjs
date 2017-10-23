import fs from 'fs'
import request from 'request-promise-native'
import esi from './esiEndpoints' 

const options = item => {
  return {
    uri: esi.type(item),
    method: 'GET', 
    json: true,
  }
}

const getItem = item => request(options(item))

const updateItems = () => {
  const itemList = JSON.parse(fs.readFileSync('./eveData/itemsList.json', 'utf8'))
  const itemInfo = JSON.parse(fs.readFileSync('./eveData/itemInfo.json', 'utf8'))

  const itemsLength = itemList.length < 100 ? itemList.length : 100
  console.log(itemList.length)

  if(itemsLength === 0) {
    return null
  }

  const getItemList = [] 

  for(let i = 0; i < itemsLength; i++) {
    getItemList.push(getItem(itemList.pop()))
  }

  Promise.all(getItemList)
    .then(data => {
      data.forEach(item => {
        itemInfo[item.type_id] = {
          name: item.name,
          vol: item.packaged_volume,
        }
      })
      fs.writeFileSync('./eveData/itemsList.json', JSON.stringify(itemList))
      fs.writeFileSync('./eveData/itemInfo.json', JSON.stringify(itemInfo), err => console.log(err))
      updateItems()
    })
    .catch(err => {
      console.log(err)
      updateItems()
    })
} 

updateItems()
