import lotus from "exceljs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const book = new lotus.Workbook();
const bookwidth = 10000,
  bookheight = 20000;
export async function plainList(bulk) {
  var sheet = book.addWorksheet('sheet', {
    headerFooter: {
      firstHeader: "Hello Exceljs",
      firstFooter: "Hello World"
    }
  });
  const ahora = new Date();
  book.creator = bulk.creator | 'colarqui.com.co';
  book.lastModifiedBy = bulk.creator | 'colarqui.com.co';
  book.created = ahora;
  book.modified = ahora;
  book.views = [{
    x: 0,
    y: 0,
    width: bulk.bookwidth | bookwidth,
    height: bulk.bookheight | bookheight,
    firstSheet: 0,
    activeTab: 1,
    visibility: 'visible'
  }];
  sheet.columns = bulk.columns;
  sheet.addRows(bulk.rows);
  return book.xlsx.writeFile(bulk.name);
}
export default {
  plainList: plainList
};
