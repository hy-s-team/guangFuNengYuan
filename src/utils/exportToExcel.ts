import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import XLSXS from "xlsx-style";
/*
    导出excel表
*/
export class ExcelService {
  constructor() {}
  static toExportFileName(excelFileName: string): string {
    return `${excelFileName}-${new Date().getTime()}.xlsx`;
  }
  public exportAsExcelFile(json: any[], excelFileName: string): void {
    // let maxW: number = 0;
    // let len: number = 0;
    // json.map((i: any) => {
    //   len = Object.values(i).length;
    //   Object.values(i).map((v: any, num: number) => {
    //     if (maxW <= num) maxW = this.getByteLen(v);
    //   });
    // });
    // // 每列不同宽度px
    // let wscols = <any>[];
    // new Array(len).fill("").map(() => {
    //   let map = { wch: maxW * 2 };
    //   wscols.push(map);
    // });
    // let wsrows = [{ hpx: 20 }]; // 每行固定高度px

    // const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    // const workbook: XLSX.WorkBook = {
    //   Sheets: { data: worksheet },
    //   SheetNames: ["data"],
    // };

    // worksheet["!cols"] = wscols;
    // worksheet["!rows"] = wsrows;

    // return;
    // XLSX.utils.book_append_sheet(workbook, worksheet);
    // XLSX.writeFile(workbook, ExcelService.toExportFileName(excelFileName));

    // 导出的excel文件名
    const filename = ExcelService.toExportFileName(excelFileName) + ".xlsx";

    // Excel第一个sheet的名称
    const wb = XLSX.utils.book_new();

    // return;
    const ws = XLSX.utils.aoa_to_sheet(json);

    XLSX.utils.book_append_sheet(wb, ws, filename); // 将数据添加到工作薄

    let maxW: number = 0;
    let len: number = 0;
    json.map((i: any) => {
      len = Object.values(i).length - 1;
      Object.values(i).map((v: any, num: number) => {
        if (maxW <= num) maxW = this.getByteLen(v);
      });
    });

    // 设置单元格宽度
    let wscols = <any>[];
    new Array(len).fill("").map(() => {
      let map = { wch: maxW };
      wscols.push(map);
    });
    ws["!cols"] = wscols;

    // 设置标题行单元格合并
    // s即start, e即end, r即row, c即column
    // 合并从--0行0列开始,到0行3列
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: len } }];

    /*
      设置单元格其他样式
      这里列举一部分,其他样式大同小异,自行网上搜索
   */
    for (let key in ws) {
      if (key.indexOf("!") !== 0) {
        if (key == "A1") {
          ws[key]["s"] = {
            font: {
              sz: 20, //设置标题的字号
              bold: true, //设置标题是否加粗
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            }, //设置标题水平竖直方向居中，并自动换行展示
            fill: {
              fgColor: { rgb: "ebebeb" }, //设置标题单元格的背景颜色
            },
          };
        } else {
          ws[key]["s"] = {
            font: {
              sz: 10,
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            },
          };
        }
      }
    }

    // 导出Excel, 注意这里用到的是XLSXS对象
    let wbout = XLSXS.write(wb, {
      bookType: "xlsx",
      bookSST: false,
      type: "binary",
    });
    FileSaver.saveAs(
      new Blob([this.s2ab(wbout)], {
        type: "application/octet-stream",
      }),
      filename
    );
  }
  // 打开下载
  openDownload(url: any, saveName: any) {
    if (typeof url == "object" && url instanceof Blob) {
      url = URL.createObjectURL(url); // 创建blob地址
    }
    var aLink = document.createElement("a");
    aLink.href = url;
    aLink.download = saveName || ""; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event;
    if (window.MouseEvent) event = new MouseEvent("click");
    else {
      event = document.createEvent("MouseEvents");
      event.initMouseEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
    }
    aLink.dispatchEvent(event);
  }

  // 字符串长度
  getByteLen(val: string) {
    let len = 0;
    for (var i = 0; i < val.length; i++) {
      var length = val.charCodeAt(i);
      if (length >= 0 && length <= 128) {
        len += 1;
      } else {
        len += 2;
      }
    }
    return len;
  }

  /**
   * 工具方法
   */
  s2ab(s: any) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }
}
