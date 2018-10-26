const puppeteer = require('puppeteer')
const CircularJSON = require('circular-json')
const URL = 'http://zxgk.court.gov.cn/zhzxgk/index.html'
const URL2 = 'http://zxgk.court.gov.cn/zhzxgk/index_form.do'

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const serve = require("koa-static")
const router = require('koa-router')()
const views = require('koa-views')
const koa = async () => {
  const app = new Koa()
  router.use(views(__dirname + '/views'))
  router.post('/submit', async (ctx, next) => {

    const captcha = await frame.$('#j_captcha')
    await captcha.type(ctx.request.body.captcha)
    try {
      // const navigationPromise = frame.waitForNavigation({ timeout: 0 })
      const button = await frame.$('#button')
      await button.click()
      // await navigationPromise
    } catch (e) { console.error(e) }
    await page.waitFor(10000)
    /*
    const [response] = await Promise.all([
      page.waitForNavigation(),
      button.click()
    ])
    */

    const ctxs = await browser.browserContexts()
    for (item of ctxs) {
      const targets = item.targets()
      for (let j = 0; j < targets.length; j++) {
        const i = targets[j]
        console.log(`[${i.url()}]`)
        const p = await i.page()
        if (!p) continue
        const frameTemp = await p.mainFrame()
        if (!frameTemp) continue
        try {
          const CLASS_NAME = '.searchForm'
          const ResultlistBlock = await frameTemp.$$eval(CLASS_NAME, i => i.textContent)
          const error = await frameTemp.$$eval('h4 span', i => i.textContent)
          if (ResultlistBlock) console.log(`ResultlistBlock = [${ResultlistBlock}]`)
          if (error) console.log(`error = [${error}]`)
        } catch (e) {
          console.error(e)
        }
      }
    }
    if (browser) await browser.close()
  })
  var browser, page, frame
  router.get('/index', async (ctx, next) => {
    await getSession()
    await ctx.render('index')


  })


  app.use(serve(__dirname, { extensions: ['png'] }))
  // 进行 request body 解析
  app.use(bodyParser())
  app.use(router.routes())

  app.listen(3000)
}
// koa()
const printB = async (page) => {
  try {
    const tbodyList = await page.mainFrame().$$('tbody')
    const TEMP = 1
    const indexList = [TEMP, TEMP, TEMP]
    for (tbody of tbodyList) {
      console.log(`第 ${indexList[0]} 个 tbody`)
      const trList = await tbody.$$('tr')
      for (tr of trList) {
        console.log(`第 ${indexList[0]} 个 tbody 下的第 ${indexList[1]} 个 tr`)

        const tdList = await tr.$$('td')

        for (td of tdList) {
          console.log(`第 ${indexList[0]} 个 tbody 下的第 ${indexList[1]} 个 tr 的第 ${indexList[2]} 个 td`)
          try {
            const bText = await td.$eval('strong', element => element.textContent)
            // if (bList.length > 0)7310
            console.log(bText)
          } catch (e) {
            console.error(e)
          }


          indexList[2]++
        }
        indexList[1]++
        indexList[2] = TEMP
      }
      indexList[0]++
      indexList[1] = TEMP
      indexList[2] = TEMP
    }


  } catch (e) { console.error(e) }
}
// 下面是使用 Browser 创建 Page 的例子

const f = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(100000) // 100 秒的请求超时
  /*
    // 事件监听
    const eventName = 'domcontentloaded'
    await page.on(eventName, async () => {
      
    })
    // 取消事件监听
    await page.removeListener(eventName, async () => {
      console.log('取消事件监听')
    })
    */
  try {
    await page.goto(URL)
  } catch (e) { console.error(e) }
  await printB(page)
  await browser.close()
  console.log('浏览器关闭了')
  // 截图
  // await page.screenshot({path: 'screenshot.png'})



}
// f()

// 一个断开连接和重连到 [Browser] 的例子：
const f2 = async () => {
  const browser = await puppeteer.launch()

  // 存储节点以便能重新连接到 Chromium
  const browserWSEndpoint = browser.wsEndpoint()
  // 从 Chromium 断开和 puppeteer 的连接
  browser.disconnect()

  // 使用节点来重新建立连接
  const browser2 = await puppeteer.connect({ browserWSEndpoint })
  // 关闭 Chromium
  await browser2.close()
}
// f2()
/*
// 一个获得框架树的例子：
puppeteer.launch().then(async browser => {
  const page = await browser.newPage()
  await page.goto(URL)
  dumpFrameTree(page.mainFrame(), '')
  await browser.close()

  function dumpFrameTree(frame, indent) {
    console.log(indent + frame.url())
    for (let child of frame.childFrames())
      dumpFrameTree(child, indent + '  ')
  }
})

puppeteer.launch().then(async browser => {
  const page = await browser.newPage()
  await page.goto(URL)

  const frame = await page.frames().find(frame => frame.name() === 'myYanzm')
  // id 用 #
  // class 用 .
  const text = await frame.$eval('#searchForm', element => element.textContent)
  console.log(text)
  await browser.close()

})
*/
const submit = (code) => {
  console.log(code)
}
const getSession = async (end = false) => {
  browser = await puppeteer.launch({ headless: false, devtools: true })
  // browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })

  page = await browser.newPage()
  await page.goto(URL2)

  frame = await page.mainFrame()
  // id 用 #
  // class 用 .
  const nameInput = await frame.$('#pname')
  await nameInput.type('黄跃生')
  const idInput = await frame.$('#cardNum')
  await idInput.type('350303198102040300')
  const courtNameDiv = await frame.$('#courtName')
  if (courtNameDiv) {
    const courtNameInput = await courtNameDiv.$('input')
    courtNameInput.type('东莞市第一人民法院')
    // await courtNameInput.click()
  }
  const pic = await frame.$('#captchaImg')
  await pic.screenshot({ path: 'src/screenshot.png' })

  /*
  const temp1 = await frame.$('#court_senior')
  if (temp1) {
    const temp2 = await temp1.$('#selectContent')
    if (temp2) {
      const courtSeniorList = await temp2.$$eval('li', i => i.textContent)
 
      console.log(courtSeniorList)
    }
  }
  const temp3 = await frame.$('#court_middle')
  if (temp3) {
    const temp4 = await temp3.$$eval('li', i => i.textContent)
    if (temp4) {
      try {
        // const courtMiddleList = await temp4.$$eval('li', i => i.textContent)
 
        console.log(temp4)
      } catch (e) {
        console.error(e)
      }
 
    }
  }
  */
  if (end) browser.close()
  return {
    browser, frame
  }



}
// getSession(true)
// page.waitForNavigation() 使用的一个例子
const baidu = async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()
  await page.goto('https://www.baidu.com/')
  const step1 = await page.$('#kw')
  if (step1) await step1.type('Hello world!')
  const step2 = await page.$('#su')
  await page.waitForNavigation()
  if (step2) await step2.click()
  const text = await page.$eval('.FYB_RD', i => i.textContent)
  console.log(text)
}
baidu()