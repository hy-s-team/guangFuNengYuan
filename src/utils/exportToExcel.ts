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

    // /**设置标题头背景色 */
    // for (const i in worksheet) {
    //   console.log(i, "i");
    //   if (i === "B2") {
    //     worksheet[i].s = {
    //       // 字体
    //       font: {
    //         name: "仿宋",
    //         sz: 24,
    //         bold: true,
    //       },
    //     };
    //   }
    // }

    // console.log(worksheet, "worksheet");

    // // return;
    // XLSX.utils.book_append_sheet(workbook, worksheet);
    // XLSX.writeFile(workbook, ExcelService.toExportFileName(excelFileName));

    // Excel第一个sheet的名称
    // 导出的excel文件名
    const filename = "幼儿园课程表.xlsx";

    // Excel第一个sheet的名称
    const ws_name = "Sheet1";
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(json);
    XLSX.utils.book_append_sheet(wb, ws, ws_name); // 将数据添加到工作薄

    // 设置标题行单元格合并
    // s即start, e即end, r即row, c即column
    // 合并从--0行0列开始,到0行3列
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

    // 设置单元格宽度
    ws["!cols"] = [
      {
        wpx: 40,
      },
      {
        wpx: 100,
      },
      {
        wpx: 100,
      },
      {
        wpx: 100,
      },
    ];

    /*
    设置单元格其他样式
    这里列举一部分,其他样式大同小异,自行网上搜索
   */

    // 可以遍历全部单元格,进行样式设置
    for (let i in ws) {
      if (i === "B1") {
        ws[i].s = {
          // 字体
          font: {
            name: "仿宋",
            sz: 14,
            bold: true,
          },
        };
      } else if (i === "B2") {
        ws[i].s = {
          // 居中
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
        };
      } else if (i === "B3") {
        ws[i].s = {
          // 单元格边框
          border: {
            top: {
              style: "thin",
            },
            bottom: {
              style: "thin",
            },
            left: {
              style: "thin",
            },
            right: {
              style: "thin",
            },
          },
        };
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

  getByteLen(val: any) {
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
