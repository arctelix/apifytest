const Apify = require("apify");

const scraper1 = () => {
  Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
      url:
        "https://www.eib.org/en/projects/pipelines/index.htm?q=&sortColumn=releaseDate&sortDir=desc&pageNumber=0&itemPerPage=25&pageable=true&language=EN&defaultLanguage=EN&yearFrom=2000&yearTo=2021&orCountries.region=true&orCountries=true&orSectors=true&orStatus=true"
    });

    const handlePageFunction = async ({ request, $ }) => {
      let fields = [];
      let data = [];
      const $rows = $("body").find("article>div");
      console.log("shit");

      // Scrape table data
      $rows.each((index, element) => {
        let first = index === 0;
        let row = {};
        $(element)
          .find("div")
          .each((index, element) => {
            let value = $(element).text();
            if (first) fields.push(value);
            else row[fields[index]] = value;
          });
        if (!first) data.push(row);
      });

      console.log.info(`URL: ${request.url}, data: ${data}`);

      // Return an object with the data extracted from the page.
      // It will be stored to the resulting dataset.
      return {
        url: request.url,
        data
      };
    };

    // Set up the crawler, passing a single options object as an argument.
    const crawler = new Apify.CheerioCrawler({
      requestQueue,
      handlePageFunction
    });

    await crawler.run();
  });
};

const scraper2 = () => {
  // Apify.utils contains various utilities, e.g. for logging.
  // Here we use debug level of logging to improve the debugging experience.
  // This functionality is optional!
  const { log } = Apify.utils;
  log.setLevel(log.LEVELS.DEBUG);

  // Apify.main() function wraps the crawler logic (it is optional).
  Apify.main(async () => {
    // Apify.openRequestQueue() creates a preconfigured RequestQueue instance.
    // We add our first request to it - the initial page the crawler will visit.
    // const requestQueue = await Apify.openRequestQueue();
    // await requestQueue.addRequest({
    //  url:
    //    "https://www.eib.org/en/projects/pipelines/index.htm?q=&sortColumn=releaseDate&sortDir=desc&pageNumber=0&itemPerPage=25&pageable=true&language=EN&defaultLanguage=EN&yearFrom=2000&yearTo=2021&orCountries.region=true&orCountries=true&orSectors=true&orStatus=true"
    //});

    const sources = [
      {
        url:
          "https://www.eib.org/en/projects/pipelines/index.htm?q=&sortColumn=releaseDate&sortDir=desc&pageNumber=0&itemPerPage=25&pageable=true&language=EN&defaultLanguage=EN&yearFrom=2000&yearTo=2021&orCountries.region=true&orCountries=true&orSectors=true&orStatus=true"
      }
    ];
    const requestList = await Apify.openRequestList("my-list", sources);

    log.error(`MAIN`);

    // Create an instance of the PuppeteerCrawler class - a crawler
    // that automatically loads the URLs in headless Chrome / Puppeteer.
    const crawler = new Apify.PuppeteerCrawler({
      requestQueue,
      requestList,

      // Here you can set options that are passed to the Apify.launchPuppeteer() function.
      launchContext: {
        launchOptions: {
          headless: true
        }
      },

      // The crawler downloads and processes the web pages in parallel, with a concurrency
      // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
      // Here we define some hard limits for the concurrency.
      //minConcurrency: 10,
      //maxConcurrency: 50,

      // On error, retry each page at most once.
      maxRequestRetries: 2,

      // Increase the timeout for processing of each page.
      handlePageTimeoutSecs: 30,

      // Limit to 10 requests per one crawl
      //maxRequestsPerCrawl: 10,

      // This function will be called for each URL to crawl.
      // Here you can write the Puppeteer scripts you are familiar with,
      // with the exception that browsers and pages are automatically managed by the Apify SDK.
      // The function accepts a single parameter, which is an object with the following fields:
      // - request: an instance of the Request class with information such as URL and HTTP method
      // - page: Puppeteer's Page object (see https://pptr.dev/#show=api-class-page)
      handlePageFunction: async ({ request, page }) => {
        log.error(`Processing ${request.url}...`);

        // A function to be evaluated by Puppeteer within the browser context.
        const data = await page.$$eval("article>div", ($rows) => {
          let fields = [];
          let data = [];

          $rows.forEach((row, index) => {
            let $cels = row.querySelectorAll("div");
            let first = index === 0;
            $cels.forEach((cel, index) => {
              let value = cel.innerText;
              if (first) fields.push(value);
              else row[fields[index]] = value;
            });
            if (!first) data.push(row);
          });

          return data;
        });

        log.error(`URL: ${request.url}, data: ${data}`);

        // Store the results to the default dataset. In local configuration,
        // the data will be stored as JSON files in ./apify_storage/datasets/default
        await Apify.pushData({
          url: request.url,
          data
        });
      },

      // This function is called if the page processing failed more than maxRequestRetries+1 times.
      handleFailedRequestFunction: async ({ request }) => {
        log.error(`Request ${request.url} failed twice.`);
      }
    });

    // Run the crawler and wait for it to finish.
    await crawler.run();

    log.debug("Crawler finished.");
  });
};

const scraper3 = () => {
  const Apify = require("apify");

  Apify.main(async () => {
    // Apify.openRequestQueue() creates a preconfigured RequestQueue instance.
    // We add our first request to it - the initial page the crawler will visit.
    // const requestQueue = await Apify.openRequestQueue();
    // await requestQueue.addRequest({ url: "https://news.ycombinator.com/" });

    const sources = [{ url: "https://news.ycombinator.com/" }];
    const requestList = await Apify.openRequestList("my-list", sources);

    // Create an instance of the PuppeteerCrawler class - a crawler
    // that automatically loads the URLs in headless Chrome / Puppeteer.
    const crawler = new Apify.PuppeteerCrawler({
      //requestQueue,
      requestList,

      // Here you can set options that are passed to the Apify.launchPuppeteer() function.
      launchContext: {
        launchOptions: {
          headless: true
          // Other Puppeteer options
        }
      },

      // Stop crawling after several pages
      maxRequestsPerCrawl: 50,

      // This function will be called for each URL to crawl.
      // Here you can write the Puppeteer scripts you are familiar with,
      // with the exception that browsers and pages are automatically managed by the Apify SDK.
      // The function accepts a single parameter, which is an object with the following fields:
      // - request: an instance of the Request class with information such as URL and HTTP method
      // - page: Puppeteer's Page object (see https://pptr.dev/#show=api-class-page)
      handlePageFunction: async ({ request, page }) => {
        console.log(`Processing ${request.url}...`);

        // A function to be evaluated by Puppeteer within the browser context.
        const data = await page.$$eval(".athing", ($posts) => {
          const scrapedData = [];

          // We're getting the title, rank and URL of each post on Hacker News.
          $posts.forEach(($post) => {
            scrapedData.push({
              title: $post.querySelector(".title a").innerText,
              rank: $post.querySelector(".rank").innerText,
              href: $post.querySelector(".title a").href
            });
          });

          return scrapedData;
        });

        // Store the results to the default dataset.
        await Apify.pushData(data);

        // Find a link to the next page and enqueue it if it exists.
        const infos = await Apify.utils.enqueueLinks({
          page,
          requestQueue,
          selector: ".morelink"
        });

        if (infos.length === 0) console.log(`${request.url} is the last page!`);
      },

      // This function is called if the page processing failed more than maxRequestRetries+1 times.
      handleFailedRequestFunction: async ({ request }) => {
        console.log(`Request ${request.url} failed too many times.`);
      }
    });

    // Run the crawler and wait for it to finish.
    await crawler.run();

    console.log("Crawler finished.");
  });
};

module.exports = scraper3;
