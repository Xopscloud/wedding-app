/*
 Simple S3 connectivity test script using AWS SDK v3.
 - Checks required env vars
 - Calls HeadBucket to verify access
 - Generates a presigned PUT URL and attempts a small PUT

 Usage: node test-s3.js
*/

(async function(){
  const { S3Client, HeadBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

  const S3_BUCKET = process.env.S3_BUCKET || ''
  const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || ''
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ''
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ''

  if (!S3_BUCKET || !AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.error('Missing S3 environment variables. Please set S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY')
    process.exitCode = 2
    return
  }

  const s3 = new S3Client({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } })

  console.log('S3 connectivity test — bucket:', S3_BUCKET, 'region:', AWS_REGION)

  // 1) HeadBucket
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }))
    console.log('HeadBucket: OK — bucket exists and credentials can access it')
  } catch (err) {
    console.error('HeadBucket failed:', err && err.name ? `${err.name}: ${err.message}` : err)
    // don't exit yet — show presign attempt below
  }

  // 2) Generate presigned PUT URL
  try {
    const testKey = `s3-connect-test-${Date.now()}.txt`
    const putCmd = new PutObjectCommand({ Bucket: S3_BUCKET, Key: testKey, ContentType: 'text/plain', ACL: 'public-read' })
    const uploadUrl = await getSignedUrl(s3, putCmd, { expiresIn: 60 })
    console.log('Presigned PUT URL generated (will attempt upload):')
    console.log(uploadUrl)

    // 3) Attempt a small PUT using fetch (Node 18+ has global fetch)
    const payload = 's3 connectivity test - hello'
    let fetchFn = global.fetch
    if (!fetchFn) {
      // Try dynamic import of node-fetch as fallback
      try {
        const nodeFetch = await import('node-fetch')
        fetchFn = nodeFetch.default
      } catch (e) {
        console.error('No global fetch and node-fetch not available; skipping actual PUT. Install node-fetch or run on Node 18+')
        return
      }
    }

    const resp = await fetchFn(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: payload
    })
    console.log('PUT response status:', resp.status)
    if (resp.ok) {
      console.log('PUT succeeded — uploaded to key:', testKey)
      console.log(`Public URL (may be accessible if bucket/object ACL/policy allows): https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${testKey}`)
    } else {
      const txt = await resp.text().catch(() => '')
      console.error('PUT failed status/text:', resp.status, txt)
    }
  } catch (err) {
    console.error('Presign or PUT attempt failed:', err && err.name ? `${err.name}: ${err.message}` : err)
  }

})()
