import AWS from 'aws-sdk'

const s3Upload = orders => {
  const s3 = new AWS.S3()
  const bucket = process.env.S3_BUCKET

  const s3Params = {
    Bucket: bucket,
    Key: 'orders',
    CacheControl: 'max-age=30,public',
    ContentType: 'application/json',
    ACL: 'public-read',
    Body: JSON.stringify(orders),
    StorageClass: 'REDUCED_REDUNDANCY',
  }

  s3.putObject(s3Params, err => {
    if(err) {
      console.log(err)
    } else {
      console.log('Successfully uploaded')
    }
  })
}

export default s3Upload