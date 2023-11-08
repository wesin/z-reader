import * as cheerio from 'cheerio';
import request from '../../../utils/request';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';

const DOMAIN = 'https://www.shuangliusc.com';
class ReaderDriver implements ReaderDriverImplements {
  public hasChapter() {
    return true;
  }

  public async search(keyword: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      const res = await request.send(DOMAIN + '/modules/article/search.php?searchkey=' + encodeURI(keyword));
      const $ = cheerio.load(res.body);
      $('.txt-list li').each(function (i: number, elem: any) {
        if (i === 0) {
          return;
        }
        const title = $(elem).find('.s2').text();
        const author = $(elem).find('.s4').text();
        const path = $(elem).find('.s2').find('a').attr('href');
        if (title && author) {
          result.push(
            new TreeNode(
              Object.assign({}, defaultTreeNode, {
                type: '.txtdownload',
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
      $('#section-list li').each(function (i: number, elem: any) {
        const name = $(elem).find('a').text();
        const path = $(elem).find('a').attr().href;
        result.push(
          new TreeNode(
            Object.assign({}, defaultTreeNode, {
              type: '.txtdownload',
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
      const html = $('#content').html();
      result = html ? html : '';
    } catch (error) {
      console.warn(error);
    }
    return result;
  }
}

export const readerDriver = new ReaderDriver();
