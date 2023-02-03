import { Octokit } from 'octokit'
import { JSDOM } from 'jsdom'

export async function fetchDatas() {
  const octokit = new Octokit({
    userAgent: 'lk-effect/v0.0.1',
  })
  const { data } = await octokit.rest.repos.getContent({
    owner: 'nemutas',
    repo: 'lk-effect',
    path: 'README.md',
    headers: {
      // 'Access-Control-Allow-Origin': '*',
      // accept: 'Access-Control-Allow-Origin',
      // 'user-agent': 'Access-Control-Allow-Origin',
      // authorization: 'Access-Control-Allow-Origin',
    },
  })
  const decodedData = Buffer.from((data as any).content, (data as any).encoding).toString()
  // console.log(decodedData)
  const dom = new JSDOM(decodedData)
  const tableRows = Array.from(
    dom.window.document.querySelectorAll('table[id="octokit-table"] tr:not(#header)'),
  ) as HTMLTableRowElement[]
  const params = tableRows.map((rows) => {
    const datas = Array.from(rows.querySelectorAll('td')) as HTMLTableCellElement[]
    return { name: datas[0].innerHTML, app: datas[1].innerHTML, image: datas[2].innerHTML }
  })

  return params
}
