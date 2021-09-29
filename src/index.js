const dotenv = require('dotenv')
const http = require('http')
const scraper = require('./scraper')

dotenv.config()

// Start the scraper
let resolved
scraper('eib')
  .then(items => { resolved = items })

// Create an http server
http.createServer(function (req, res) {
  writeResults(res)
  res.end()
}).listen(8080)

// Check for data and send response
const writeResults = (res) => {
  if (!resolved) {
    res.write('Scraping!')
    return
  }
  const item = resolved[0]
  res.write(`RESULTS:${item.name}\n`)
  res.write(`URL:${item.url}\n`)
  item.data.forEach((item, index) => {
    res.write(`${index}: ${JSON.stringify(item)}\n`)
  })
}
