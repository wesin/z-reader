import * as cheerio from 'cheerio';
import request from '../../../utils/request';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';

const DOMAIN = 'http://www.biquge66.net';
const TYPE = '.biquge66';
class ReaderDriver implements ReaderDriverImplements {
  public hasChapter() {
    return true;
  }

  public async search(keyword: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      const res = await request.send(DOMAIN + '/search/?searchkey=' + encodeURI(keyword));
      const $ = cheerio.load(res.body);
      $('.hotcontent .item').each(function (i: number, elem: any) {
        const title = $(elem).find('.image a').attr('title');
        const author = $(elem).find('.btm a').attr('title');
        const path = $(elem).find('.image a').attr('href');
        if (title && author) {
          result.push(
            new TreeNode(
              Object.assign({}, defaultTreeNode, {
                type: TYPE,
                name: `${title} - ${author}`,
                isDirectory: true,
                path: DOMAIN + path
              })
            )
          );
        }
      });
    } catch (error) {
      console.warn(error);
    }
    return result;
  }

  public async getChapter(pathStr: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      console.log(pathStr);
      const res = await request.send(pathStr);
      const $ = cheerio.load(res.body);
      $('#list')
        .eq(1)
        .find('div li')
        .each(function (i: number, elem: any) {
          const name = $(elem).find('a').text();
          const path = $(elem).find('a').attr().href;
          result.push(
            new TreeNode(
              Object.assign({}, defaultTreeNode, {
                type: TYPE,
                name,
                isDirectory: false,
                path: DOMAIN + path
              })
            )
          );
        });
    } catch (error) {
      console.warn(error);
    }
    return result;
  }

  public async getContent(pathStr: string): Promise<string> {
    let result = '';
    try {
      const res = await request.send(pathStr);
      const $ = cheerio.load(res.body);
      const html = $('#booktxt').html();
      result = html ? html : '';
      const next = $('#next_url').eq(1);
      const has_next = next.text().trim() === '下一页';
      if (has_next) {
        const path = next.attr().href;
        result += await this.getContent(DOMAIN + path);
      }
    } catch (error) {
      console.warn(error);
    }
    return result;
  }
}

export const readerDriver = new ReaderDriver();
