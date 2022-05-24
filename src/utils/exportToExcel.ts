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
    // 每列不同宽度px
    let wscols = [{ wch: 30 }];
    let wsrows = [{ hpx: 20 }]; // 每行固定高度px
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    worksheet["!cols"] = wscols;
    worksheet["!rows"] = wsrows;
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    XLSX.writeFile(workbook, ExcelService.toExportFileName(excelFileName));
  }
}
