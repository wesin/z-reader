import * as cheerio from 'cheerio';
import request from '../../../utils/request';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';
import got from 'got';

const DOMAIN = 'https://www.uuks5.com';
class ReaderDriver implements ReaderDriverImplements {
  public hasChapter() {
    return true;
  }

  public async search(keyword: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      const res = await got.post(DOMAIN + '/s.php', { form: { searchkey: keyword } });
      const $ = cheerio.load(res.body);
      $('#sitebox dl dd h3 a').each(function (i: number, elem: any) {
        const title = $(elem).text();
        const path = $(elem).attr('href');
        if (title) {
          result.push(
            new TreeNode(
              Object.assign({}, defaultTreeNode, {
                type: '.uu',
                name: `${title}`,
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
      $('#chapterList li a').each(function (i: number, elem: any) {
        const name = $(elem).text();
        const path = $(elem).attr('href');
        result.push(
          new TreeNode(
            Object.assign({}, defaultTreeNode, {
              type: '.uu',
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

      const html = $('#TextContent').html();
      result = html ? html : '';
    } catch (error) {
      console.warn(error);
    }
    return result;
  }
}

export const readerDriver = new ReaderDriver();
