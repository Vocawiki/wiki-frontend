/**
 * @file 供{{tl|首页/最新条目}}使用。
 */

interface PageImagesResult {
  [title: string]: {
    source: string
    width: number
    height: number
  }
}
async function getPageImages(titles: string[]): Promise<PageImagesResult> {
  const api = new mw.Api()
  const data = (await api.get({
    action: 'query',
    format: 'json',
    formatversion: '2',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pilicense: 'any',
    titles: titles,
  })) as unknown as {
    query: {
      pages: {
        pageid: number
        ns: number
        title: string
        thumbnail: {
          source: string
          width: number
          height: number
        }
      }[]
    }
  }
  const result = Object.fromEntries(data.query.pages.map((x) => [x.title, x.thumbnail]))
  return result
}

async function setBackground() {
  const items: { liElem: HTMLLIElement; title: string }[] = (
    [...document.querySelectorAll('.new-article-list li')] as HTMLLIElement[]
  )
    .map((li) => ({ liElem: li, title: (li.querySelector('a') as HTMLAnchorElement).title }))
    .filter((x) => x.title)
  const pageImages = await getPageImages([...new Set(items.map((x) => x.title))])
  for (const { liElem, title } of items) {
    if (!pageImages[title]) continue
    const { source } = pageImages[title]
    liElem.style.backgroundImage = `url("${source}")`
  }
}

setBackground()
