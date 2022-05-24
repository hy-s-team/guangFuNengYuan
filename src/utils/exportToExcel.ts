import * as XLSX from "xlsx";
/*
    导出excel表
*/
export class ExcelService {
  constructor() {}
  static toExportFileName(excelFileName: string): string {
    return `${excelFileName}-${new Date().getTime()}.xlsx`;
  }
  public exportAsExcelFile(json: any[], excelFileName: string): void {
    let maxW: number = 0;
    let len: number = 0;
    json.map((i: any) => {
      len = Object.values(i).length;
      Object.values(i).map((v: any, num: number) => {
        if (maxW <= num) maxW = this.getByteLen(v);
      });
    });
    // 每列不同宽度px
    let wscols = <any>[];
    new Array(len).fill("").map(() => {
      let map = { wch: maxW * 2 };
      wscols.push(map);
    });
    let wsrows = [{ hpx: 20 }]; // 每行固定高度px
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    worksheet["!cols"] = wscols;
    worksheet["!rows"] = wsrows;
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    // return;
    XLSX.writeFile(workbook, ExcelService.toExportFileName(excelFileName));
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
}
