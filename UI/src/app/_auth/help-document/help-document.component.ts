import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConfigHelpDocumentModel } from 'src/app/_models/ConfigurationModel';
import { GeneralService } from 'src/app/services/general.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';

@UntilDestroy()
@Component({
  selector: 'app-help-document',
  templateUrl: './help-document.component.html',
  styleUrls: ['./help-document.component.scss'],
})
export class HelpDocumentComponent {
  configurationList!: ConfigHelpDocumentModel[];
  quickContact:any=null
  searchText: string = '';
  
  showViewer = false;
  fileType: 'pdf' | 'image' | 'video' | null = null;

  pdfSrc: SafeResourceUrl | null = null;
  imgSrc: SafeResourceUrl | null = null;
  videoSrc: SafeResourceUrl | null = null;
  currentFileId: string | null = null;

  routeSub!: Subscription;
  constructor(
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private http: HttpClient,
    private userService: UserService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.getQuickContact();
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.generalService
          .Config_Help_Document_Get('', '', '', params['id'])
          .subscribe((x) => {
            if (x) {
              this.configurationList = x.data;
            }
          });
      });
  }

  getQuickContact() {
    this.userService.GeneralConfigureQuickContact().subscribe((response) => {
      if (response) {
        this.quickContact = response.data;
      }
    });
  }

  download(doc: ConfigHelpDocumentModel) {
    var fileUrl = `${environment.apiUrl}/Common/DownloadImage?fileId=${doc.savedFile?.id}`;
    this.DocumentsDownload(fileUrl).subscribe(async (event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = doc.savedFile?.originalFileName ?? '';
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }




// Updated by Sivasankar On 18/11/2025 For SonarCube issues
private trustUrl(url: string) {
 
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}


showVideo(doc: ConfigHelpDocumentModel) {

  this.currentFileId = doc.id;
  const fileUrl = `${environment.apiUrl}/Common/DownloadImage?fileId=${doc.savedFile?.id}`;

  this.showDoc(fileUrl).subscribe(blob => {
    const objectUrl = URL.createObjectURL(blob);
    const extension = doc.documentType.toLowerCase();

    if (['pdf','doc','docx','xls','xlsx','ppt','pptx','txt'].includes(extension!)) {
      this.fileType = 'pdf';
      this.pdfSrc = this.trustUrl(objectUrl);
    } 
    else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(extension!)) {
      this.fileType = 'image';
      this.imgSrc = this.trustUrl(objectUrl);
    } 
    else if (['mp4', 'webm', 'ogg','video'].includes(extension!)) {
      this.fileType = 'video';
      this.videoSrc = this.trustUrl(objectUrl);
    } 
    else {
      console.warn('Unsupported file type:', extension);
      return;
    }

    this.showViewer = true;
  });
}

  DocumentsDownload(fileUrl: string) {
    return this.http.get(fileUrl, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }
showDoc(fileUrl: string) {
  return this.http.get(fileUrl, { responseType: 'blob' });
}

  back() {
    window.history.back();
  }
}
export interface Document {
  icon: string;
  title: string;
  content: string;
  href: string;
}
