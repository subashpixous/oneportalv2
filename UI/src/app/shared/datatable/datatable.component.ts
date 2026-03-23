import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import {
  ActionModel,
  Actions,
  Column,
  ExportColumn,
} from 'src/app/_models/datatableModel';
import { CookieService } from 'ngx-cookie-service';
import {
  datecolumns,
  dateconvertion,
  dateconvertionwithOnlyDate,
  dateconvertionwithOnlyTime,
  dateonlycolumns,
  getBtnSeverity,
  timeonlycolumns,
} from '../commonFunctions';
import {
  ColumnSearchModel,
  ColumnSortingModel,
  TableFilterModel,
  TenderFilterModel,
} from 'src/app/_models/filterRequest';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class DatatableComponent implements OnInit {
  // @Input() set records(recordslist: any[]) {
  //   if (recordslist) {
  //     this.filteredRecords = recordslist;
  //     this.entirerecords = recordslist;
  //   }
  // }
 
  @Input() records!: any[];
  @Input() cols!: Column[];
  @Input() searchableColumns!: string[];
  @Input() actions!: Actions[];
  @Input() fileName!: string;
  @Input() rows: number = 10;
  @Input() total: number = 0;
  @Input() defaultSortField!: string;
  @Input() defaultSortOrder: number = 1;
  @Input() hasActiveInactive: boolean = false;
  @Input() defaultstatus: boolean = false;
  @Input() canShowAction: boolean = true;
  @Input() canShowCheckbox: boolean = false;
  @Input() canshowExport: boolean = false;
    @Input() canExportpdf: boolean = false;
  @Input() displaySize: string = 'HALF';

  @Output() invokeAction = new EventEmitter<ActionModel>();
  @Output() changeStatus = new EventEmitter<boolean>();
  @Output() selectedApplications = new EventEmitter<any>();
  @Output() actionalAction = new EventEmitter<ActionModel>();
  @Output() changefilter = new EventEmitter<TableFilterModel>();
  @Output() onSelectionChange = new EventEmitter<any[]>();

  constructor(
    private confirmationService: ConfirmationService,
    private cookieService: CookieService
  ) {}

  selectedProducts!: any[];
  filteredRecords: any[] = [];
  entirerecords: any[] = [];
  rowsPerPageOptions: number[] = [];

  exportColumns!: ExportColumn[];

  userPermissions!: string[];

  first: number = 0;
  onLabel: string = 'Show Active';
  offLabel: string = 'Show In-Active';

  ngOnInit() {
    const privillage: any = this.cookieService.get('privillage');

    if (privillage) {
      this.userPermissions = privillage.split(',');
    }
    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
    this.reset();
  }
  ngOnChanges() {
    if (this.records) {
      this.entirerecords = [...this.records];
    }
    if (this.displaySize === 'FULL') {
      this.rowsPerPageOptions = [25, 50, 100, 500, this.total];
    } else if (this.displaySize === 'HALF') {
      this.rowsPerPageOptions = [10, 25, 50, 100, this.total];
    } else if (this.displaySize === 'LESS_HALF') {
      this.rowsPerPageOptions = [5, 10, 25, 50, this.total];
    } else if (this.displaySize === 'LARGE') {
      this.rowsPerPageOptions = [50, 100, 500, this.total];
    }
  }

  selectionChanged(event: any) {
    this.selectedApplications.emit(event);
  }
  customSort(event: SortEvent) {
    this.entirerecords?.sort((data1, data2) => {
      let value1 = data1[event.field ?? ''];
      let value2 = data2[event.field ?? ''];
      let result = null;

      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return event.order ?? 0 * result;
    });
  }

  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.entirerecords);
        doc.save(this.fileName ?? 'Report' + '.pdf');
      });
    });
  }
  exportCSV(table: any) {
  table.exportCSV({ fileName: this.fileName + '_Report.csv' });
}

  exportPdf1() {
    var totalPagesExp = '{total_pages_count_string}';
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('l', 'px', 'a3');
        var fileName = this.fileName;
        (doc as any).autoTable(this.exportColumns, this.entirerecords);
        (doc as any).autoTable({
          willDrawPage: function (data: any) {
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40);
            // if (base64Img) {
            //   doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 10, 10)
            // }
            doc.text(fileName + ' Report', data.settings.margin.left, 20);
          },
          didDrawPage: function (data: any) {
            // Footer
            var str = 'Page ' + (doc as any).internal.getNumberOfPages();
            // Total page number plugin only available in jspdf v1.0+
            if (typeof doc.putTotalPages === 'function') {
              str = str + ' of ' + totalPagesExp;
            }
            doc.setFontSize(10);

            // jsPDF 1.4+ uses getHeight, <1.4 uses .height
            var pageSize = doc.internal.pageSize;
            var pageHeight = pageSize.height
              ? pageSize.height
              : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
          },
          theme: 'striped',
        });
        // Total page number plugin only available in jspdf v1.0+
        if (typeof doc.putTotalPages === 'function') {
          doc.putTotalPages(totalPagesExp);
        }
        doc.setProperties({
          title: this.fileName + '_Report',
        });

        doc.save(this.fileName + '_Report_'  + '.pdf');
      });
    });
  }
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.entirerecords);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, this.fileName);
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
    const start = Math.min(this.total - 1, this.first);
    const end = Math.min(this.total, this.first + this.rows);
    const prod = this.entirerecords;
    this.filteredRecords = prod.slice(start, end);
  }

  isLastPage(): boolean {
    return this.entirerecords
      ? this.first === this.entirerecords.length - this.rows
      : true;
  }

  isFirstPage(): boolean {
    return this.entirerecords ? this.first === 0 : true;
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    const prod = this.entirerecords;
    const start = Math.min(this.total - 1, this.first);
    const end = Math.min(this.total, this.first + this.rows);
    this.filteredRecords = prod.slice(start, end);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  makeAction(action: string, record: any, event: Event) {
    if (action == 'DELETE') {
      this.confirmationService.confirm({
        key: 'confirm2',
        target: (event.target as HTMLInputElement) || new EventTarget(),
        message: 'Are you sure that you want to delete?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.invokeAction.emit({ type: action, record });
        },
        reject: () => {
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Rejected',
          //   detail: 'You have rejected',
          // });
        },
      });
    } else if (action == 'INACTIVATE') {
      this.confirmationService.confirm({
        key: 'confirm2',
        target: (event.target as HTMLInputElement) || new EventTarget(),
        message: 'Are you sure that you want to InActivate?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.invokeAction.emit({ type: action, record });
        },
        reject: () => {},
      });
    } else if (action == 'ACTIVATE') {
      this.confirmationService.confirm({
        key: 'confirm2',
        target: (event.target as HTMLInputElement) || new EventTarget(),
        message: 'Are you sure that you want to Activate?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.invokeAction.emit({ type: action, record });
        },
        reject: () => {},
      });
    } else {
      this.invokeAction.emit({ type: action, record });
    }
  }
  changeEvent(val: any) {
    this.changeStatus.emit(val.checked);
  }
  dc(date: any, field?: string) {
    if (dateonlycolumns().includes(field ?? '')) {
      return dateconvertionwithOnlyDate(date);
    } else if (timeonlycolumns().includes(field ?? '')) {
      return dateconvertionwithOnlyTime(date);
    } else {
      return dateconvertion(date);
    }
  }

  getDateColumn(feild: string) {
    return datecolumns().includes(feild);
  }
  getBtnSeverity(statusName: string) {
    return getBtnSeverity(statusName);
  }
  getStyle() {
    if (!this.canShowAction) {
      return 'extradttable';
    }
    return 'dttable';
  }
  getcheckStyle() {
    if (!this.canShowCheckbox) {
      return 'extradttable';
    }
    return 'dttable';
  }
  getPerm(privleges: any) {
    if (typeof privleges == 'string') {
      return this.userPermissions.includes(privleges);
    } else if (typeof privleges == 'object') {
      return this.userPermissions.find((x) => privleges.includes(x));
    } else {
      return true;
    }
  }
  makeActonEvent(record: any, event: Event) {
    this.actionalAction.emit({ type: 'ACTION', record });
  }
  clearSelection() {
  this.selectedProducts = [];
  this.onSelectionChange.emit([]);
}

}
