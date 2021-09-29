const Apify = require('apify')
const sources = require('./sources')

const scraper = async (sourceName) => {
  // Apify.utils contains various utilities, e.g. for logging.
  // Here we use debug level of logging to improve the debugging experience.
  // This functionality is optional!
  const { log } = Apify.utils
  log.setLevel(log.LEVELS.DEBUG)

  const { request, handler } = sources[sourceName]

  // Apify.openRequestQueue() creates a preconfigured RequestQueue instance.
  // We add our first request to it - the initial page the crawler will visit.
  const requestQueue = await Apify.openRequestQueue()
  await requestQueue.addRequest(request)

  // Create an instance of the PuppeteerCrawler class - a crawler
  // that automatically loads the URLs in headless Chrome / Puppeteer.
  const crawler = new Apify.PuppeteerCrawler({
    requestQueue,

    // Puppeteer settings
    launchContext: {
      launchOptions: {
        headless: true
      }
    },

    // The crawler downloads and processes the web pages in parallel, with a concurrency
    // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
    // Here we define some hard limits for the concurrency.
    minConcurrency: 10,
    maxConcurrency: 50,

    // On error, retry each page at most once.
    maxRequestRetries: 2,

    // Increase the timeout for processing of each page.
    handlePageTimeoutSecs: 30,

    // Limit to 10 requests per one crawl
    maxRequestsPerCrawl: 10,

    // This function will be called for each URL to crawl.
    handlePageFunction: async ({ request, page }) => {
      log.info(`Processing ${request.userData.name}:${request.url}...`)

      const data = await handler(page)

      // Store the results to the default dataset. In local configuration,
      // the data will be stored as JSON files in ./apify_storage/datasets/default
      await Apify.pushData({
        url: request.url,
        name: request.userData.name,
        data
      })
    },

    // This function is called if the page processing failed more than maxRequestRetries+1 times.
    handleFailedRequestFunction: async ({ request }) => {
      log.error(`Request ${request.url} failed twice.`)
    }
  })

  // Run the crawler and wait for it to finish.
  await crawler.run()

  // Remove the request queue
  await requestQueue.drop()

  // Return the dataset and delete local storage
  const dataset = await Apify.openDataset('default')
  const data = await dataset.getData()
  const items = data.items
  await dataset.drop()

  log.debug('Crawler finished.', items)
  return data.items
}

module.exports = scraper
