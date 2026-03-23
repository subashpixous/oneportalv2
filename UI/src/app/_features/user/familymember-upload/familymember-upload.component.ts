import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserUploadViewModel } from 'src/app/_models/ReportMode';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-familymember-upload',
  templateUrl: './familymember-upload.component.html',
  styleUrls: ['./familymember-upload.component.scss']
})
export class FamilymemberUploadComponent {
  @ViewChild('filechosen') someInput!: ElementRef;

  title: string = 'Family Member Upload';
  visible: boolean = false;
  isUploadComplete: boolean = false;
  errorRes: UserUploadViewModel[] = [];
  batchId: string = '';
  failedCount: number = 0;

  constructor(
    private messageService: MessageService,
    private schemeService: SchemeService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private http: HttpClient
  ) { }
  ngOnInit() {
    this.batchId = sessionStorage.getItem('importBatchId') || '';
  }
  removeFile() { }
  download() {
    var fileUrl = `${environment.apiUrl}/Member/DownloadFamilyMemberImportTemplate`;
    this.DocumentsDownload(fileUrl).subscribe(async (event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = 'Family_Member_Template.xlsx';
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }
  downloadError() {
    var fileUrl = `${environment.apiUrl}/Member/DownloadFamilyMemberImportError`;
    this.DocumentsDownload(fileUrl).subscribe(async (event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = 'Member_Import_Error.xlsx';
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }

  downloadErrorReport() {

    if (!this.batchId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No import batch found'
      });
      return;
    }

    this.http.get(
      `${environment.apiUrl}/Member/DownloadErrorReport?batchId=${this.batchId}`,
      { responseType: 'blob' }
    )
      .subscribe(blob => {

        const downloadURL = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = `ErrorReport_${this.batchId}.xlsx`;
        link.click();

        window.URL.revokeObjectURL(downloadURL);

      }, error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Unable to download error report'
        });
      });
  }

  DocumentsDownload(fileUrl: string) {
    return this.http.get(fileUrl, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }
  checkStatus() {
    this.userService.Member_Import_Status_Get().subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
      } else if (x) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail:
            x.data != ''
              ? 'Upload process is ' + x.data
              : 'Currently there is no process running',
        });
        this.isUploadComplete = x.data == 'Completed';
      }
    });
  }

  onSelectDocumentFile(event: any) {

    if (event.files && event.files[0]) {

      const formData = new FormData();
      formData.append('file', event.files[0]);

      this.http.post(`${environment.apiUrl}/Member/FamilyMemberImport`, formData)
        .subscribe(
          (response: any) => {

            (this.someInput as any).files = [];

            if (response && response.status == FailedStatus) {
              this.visible = true;
              this.errorRes = response.data;
            }
            else if (response && response.status == ErrorStatus) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to Upload! Please try again',
              });
            }
            else {

              // IMPORTANT PART
              this.batchId = response.data.batchId;
              this.failedCount = response.data.failedRecords;

              // Optional: store in session in case page refresh
              sessionStorage.setItem('importBatchId', this.batchId);

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Total: ${response.data.totalRecords},
                       Created Records: ${response.data.createdRecords},
                       Updated Records: ${response.data.updatedRecords},
                       Failed Records: ${response.data.failedRecords}`,
              });
            }
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to Upload! Please try again',
            });
          }
        );
    }
  }

  getColor(columnName: string, data: UserUploadViewModel) {
    if (data.errorColumns?.includes(columnName)) {
      var errorres = data.errorColumns?.indexOf(columnName);
      return `<br /><p >${data.error?.at(errorres)} </p>`;
    }
    return '';
  }
}
