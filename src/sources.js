// functions to be evaluated by Puppeteer within the browser context.
module.exports = {

  eib: {
    request: {
      userData: { name: 'eib' },
      url: 'https://www.eib.org/en/projects/pipelines/index.htm?q=&sortColumn=releaseDate&sortDir=desc&pageNumber=0&itemPerPage=25&pageable=true&language=EN&defaultLanguage=EN&yearFrom=2000&yearTo=2021&orCountries.region=true&orCountries=true&orSectors=true&orStatus=true'
    },
    handler: async (page) => {
      return page.$$eval('article>div', ($rows) => {
        const fields = []
        const data = []

        $rows.forEach((row, index) => {
          const $cels = row.querySelectorAll('div')
          const first = index === 0
          $cels.forEach((cel, index) => {
            const value = cel.innerText
            if (first) fields.push(value)
            else row[fields[index]] = value
          })
          if (!first) data.push(row)
        })

        return data
      })
    }
  },

  other: {
    request: {
      userData: { name: 'eib' },
      url: 'https://www.eib.org/en/projects/pipelines/index.htm?q=&sortColumn=releaseDate&sortDir=desc&pageNumber=0&itemPerPage=25&pageable=true&language=EN&defaultLanguage=EN&yearFrom=2000&yearTo=2021&orCountries.region=true&orCountries=true&orSectors=true&orStatus=true'
    },
    handler: async (page) => {
      return page.$$eval('article>div', ($rows) => {
        const fields = []
        const data = []

        $rows.forEach((row, index) => {
          const $cels = row.querySelectorAll('div')
          const first = index === 0
          $cels.forEach((cel, index) => {
            const value = cel.innerText
            if (first) fields.push(value)
            else row[fields[index]] = value
          })
          if (!first) data.push(row)
        })

        return data
      })
    }
  }

}
