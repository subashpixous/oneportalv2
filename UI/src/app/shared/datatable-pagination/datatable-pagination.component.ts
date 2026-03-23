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
import {
  ConfirmationService,
  LazyLoadEvent,
  MessageService,
  SortEvent,
} from 'primeng/api';
import { Table, TableFilterEvent } from 'primeng/table';
import {
  ActionModel,
  Actions,
  Column,
  ExportColumn,
} from 'src/app/_models/datatableModel';
import {
  ColumnSearchModel,
  ColumnSortingModel,
  TableFilterModel,
  TenderFilterModel,
} from 'src/app/_models/filterRequest';
import { CookieService } from 'ngx-cookie-service';
import {
  dateconvertionwithOnlyDate,
  dateconvertion,
  getBtnSeverity,
  getcolorforProgress,
  dateconvertionwithOnlyTime,
  datecolumns,
  dateonlycolumns,
  timeonlycolumns,
} from '../commonFunctions';

@Component({
  selector: 'app-datatable-pagination',
  templateUrl: './datatable-pagination.component.html',
  styleUrls: ['./datatable-pagination.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class DatatablePaginationComponent implements OnInit {
  // @Input() set records(recordslist: any[]) {
  //   if (recordslist) {
  //     this.filteredRecords = recordslist;
  //     this.entirerecords = recordslist;
  //   }
  // }

  @Input() set selectedRows(rows: any[]) {
    if (rows && rows.length) {
      this.selectedProducts = rows; // bind to the table selection
    } else {
      this.selectedProducts = [];
    }
  }
  @Input() normallyExportedData: boolean = false;
    @Input() excelExport: boolean = false;

  @Input() exportedData: any[] = [];
@Input() exportCols: any[] = [];
@Input() isCalledFromApplication: boolean = false;

@Output() exportRequest = new EventEmitter<string>();
lastRequestedExport: string | null = null;

  selectedRowsInternal: { id: string; member_Id: string }[] = [];
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
  @Input() filterModel!: TableFilterModel;
  @Input() canShowCheckbox: boolean = false;
  @Input() canShowAction: boolean = true;
  @Input() displaySize: string = 'HALF';

  @Output() invokeAction = new EventEmitter<ActionModel>();
  @Output() changeStatus = new EventEmitter<boolean>();
  @Output() changefilter = new EventEmitter<TableFilterModel>();
  @Output() actionalAction = new EventEmitter<ActionModel>();
  @Output() onSelectionChange = new EventEmitter<any[]>();
  @Output() selectedApplications = new EventEmitter<any>();
  @Output() onPageChangeEvent = new EventEmitter<any>();

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cookieService: CookieService
  ) {}

  selectedProducts!: any[];
  filteredRecords: any[] = [];
  entirerecords: any[] = [];

  exportColumns!: ExportColumn[];
  rowsPerPageOptions!: any[];

  first: number = 0;
  searchString: string = '';
  onLabel: string = 'Show Active';
  offLabel: string = 'Show In-Active';

  userPermissions!: string[];
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
      this.rowsPerPageOptions = [
        25,
        50,
        100,
        500,
        1000,
        1500,
        2000,
        this.total,
      ];
    } else if (this.displaySize === 'HALF') {
      this.rowsPerPageOptions = [
        10,
        25,
        50,
        100,
        500,
        1000,
        1500,
        2000,
        this.total,
      ];
    } else if (this.displaySize === 'LESS_HALF') {
      this.rowsPerPageOptions = [
        5,
        10,
        25,
        50,
        100,
        500,
        1000,
        1500,
        2000,
        this.total,
      ];
    }

      if (this.exportedData?.length && this.lastRequestedExport) {
    const dataToExport = [...this.exportedData];
    const colsToExport = this.exportCols?.length ? this.exportCols : this.cols;

    if (this.lastRequestedExport === 'excel') this.exportExcelInternal(dataToExport, colsToExport);
    else if (this.lastRequestedExport === 'pdf') this.exportPdfInternal(dataToExport, colsToExport);

    this.lastRequestedExport = null;
  }
    //this.rowsPerPageOptions = [10, 20, 50, 100, 500, 1000, 1500, this.total];
  }
  selectRows(rows: { id: string; member_Id: string }[]) {
    this.selectedRowsInternal = rows;
  }
  customSort(event: any) {
    this.filterModel = {
      ...this.filterModel,
      sorting: {
        fieldName: event.sortField ? event.sortField : this.defaultSortField,
        sort:
          (event.sortOrder ? event.sortOrder : this.defaultSortOrder) == 1
            ? 'ASC'
            : 'DESC',
      },
    };
    this.changefilter.emit(this.filterModel);
  }
  load() {
    alert();
  }
  lazyload(event: any) {
    var list: ColumnSearchModel[] = [];
    if (event.filters) {
      var keys: string[] = Object.keys(event.filters as object);
      keys.forEach((key) => {
        if (event.filters[key].value) {
          list.push({ fieldName: key, searchString: event.filters[key].value });
        }
      });
    }
    this.filterModel = {
      ...this.filterModel,
      sorting: {
        fieldName:
          event.sortField && event.sortField !== ''
            ? event.sortField
            : this.defaultSortField,
        sort:
          (event.sortField && event.sortOrder !== ''
            ? event.sortOrder
            : this.defaultSortOrder) == 1
            ? 'ASC'
            : 'DESC',
      },
      columnSearch: list,
    };
    this.changefilter.emit(this.filterModel);
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
    const start = Math.min(this.total - 1, this.first);
    const end = Math.min(this.total, this.first + this.rows);

    this.filterModel = {
      ...this.filterModel,
      skip: start,
      take: event.rows,
    };
    this.changefilter.emit(this.filterModel);
    this.onPageChangeEvent.emit(event);
  }

  onGlobalFilter(event: any) {
    this.filterModel = {
      ...this.filterModel,
      searchString: this.searchString,
    };
    this.changefilter.emit(this.filterModel);
  }
  makeViewevent(record: any, event: Event) {
    this.actionalAction.emit({ type: 'ACTION', record });
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
        reject: () => {},
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
  getcolor(statusName: string) {
    return (
      'color:' +
      (getBtnSeverity(statusName) == 'danger'
        ? 'red'
        : getBtnSeverity(statusName) == 'success'
        ? 'green'
        : 'black')
    );
  }
  getBtnSeverity(statusName: string, col: Column, row: any) {
    if (col.badgeCheckfield != null && col.badgeCheckfield != '') {
      return getBtnSeverity(row[col.badgeCheckfield]);
    }
    return getBtnSeverity(statusName);
  }
  getDateColumn(feild: string) {
    return datecolumns().includes(feild);
  }
  getcolorforProgress(val: number, type: string) {
    return getcolorforProgress(val, type);
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

exportPdf() {
 const dataToExport =  this.exportedData 
  const colsToExport =  this.exportCols 

  if (this.isCalledFromApplication && (!dataToExport?.length || !colsToExport?.length)) {
    this.lastRequestedExport = 'pdf';
    this.exportRequest.emit('pdf'); // 

    return;
  }
   else if  (!this.normallyExportedData && (!dataToExport?.length || !colsToExport?.length)) {
    this.lastRequestedExport = 'pdf';
    this.exportRequest.emit('pdf'); // 🔹 ask MemberList to call export API
    return;
  }
  else if (this.normallyExportedData) {
   const dataToExport = this.entirerecords;
   const colsToExport = this.cols;

 
  this.exportPdfInternal(dataToExport, colsToExport);
  return
}
 
  this.exportPdfInternal(dataToExport, colsToExport);
}

exportExcel() {

  let dataToExport =  this.exportedData 
  const colsToExport =  this.isCalledFromApplication ? this.exportCols : this.cols;

  if (this.isCalledFromApplication && (!dataToExport?.length || !colsToExport?.length)) {
    if (this.normallyExportedData){
      
      const dataToExport = this.entirerecords;
   const colsToExport = this.cols;
     this.exportExcelInternal(dataToExport, colsToExport);
    }
    else{
    this.lastRequestedExport = 'excel';
    this.exportRequest.emit('excel'); // 🔹 ask MemberList to call export API
    }


 
    return;
  }
  
  else if (!this.normallyExportedData && (!dataToExport?.length || !colsToExport?.length)) {
    this.lastRequestedExport = 'excel';
    this.exportRequest.emit('excel'); // 🔹 ask MemberList to call export API
    return;
  }
  else if (this.normallyExportedData) {
   const dataToExport = this.entirerecords;
   const colsToExport = this.cols;
  this.exportExcelInternal(dataToExport, colsToExport);
  return
  } 

  this.exportExcelInternal(dataToExport, colsToExport);
}


exportPdfInternal(dataToExport: any[], colsToExport: any[]) {
 
  const totalPagesExp = '{total_pages_count_string}';
  const fileName = this.fileName;

  
  const slowExportTimer = setTimeout(() => {
    this.messageService.add({
      severity: 'warn',
      summary: 'Please Wait',
      detail: 'Exporting large PDF data, this may take some time...',
      life: 5000
    });
  }, 5000); // 10 seconds

  import('jspdf').then((jsPDF) => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDF.default('l', 'px', 'a3');

      const exportColumns = colsToExport.map((col) => ({
        title: col.header || col.title,
        dataKey: col.field || col.dataKey,
      }));

      (doc as any).autoTable(exportColumns, dataToExport);

      (doc as any).autoTable({
        willDrawPage: function (data: any) {
          doc.setFontSize(20);
          doc.setTextColor(40);
          doc.text(fileName + ' Report', data.settings.margin.left, 20);
        },
        didDrawPage: function (data: any) {
          let str = 'Page ' + (doc as any).internal.getNumberOfPages();
          if (typeof doc.putTotalPages === 'function') {
            str = str + ' of ' + totalPagesExp;
          }
          doc.setFontSize(10);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 10);
        },
        theme: 'striped',
      });

      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      doc.setProperties({
        title: `${this.fileName}_Report`,
      });

      doc.save(`${this.fileName}_Report_.pdf`);

      clearTimeout(slowExportTimer); 
    });
  });
}

exportExcelInternal(dataToExport: any[], colsToExport: any[]) {

  const slowExportTimer = setTimeout(() => {
    this.messageService.add({
      severity: 'warn',
      summary: 'Please Wait',
      detail: 'Exporting large Excel data, this may take some time...',
      life: 5000
    });
  }, 5000);
  

  import('xlsx').then((xlsx) => {
    const worksheet = xlsx.utils.json_to_sheet(dataToExport);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveAsExcelFile(
      excelBuffer,
      `${this.fileName}_Report_${new Date().getTime()}`
    );

    clearTimeout(slowExportTimer); // ✅ Stop warning if finished quickly
  });
}

getTrend(current: number, previous: number): 'up' | 'down' | 'none' {
  if (previous == null) return 'none';   // ✅ allow 0
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'none';
}

  gettimestanp() {
    return new Date().getTime();
  }
  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

  clearSelection() {
    this.selectedProducts = [];
    this.onSelectionChange.emit([]);
  }
  selectionChanged(event: any) {
    this.selectedApplications.emit(event);
  }
  getcheckStyle() {
    if (!this.canShowCheckbox) {
      return 'extradttable';
    }
    return 'dttable';
  }
}
