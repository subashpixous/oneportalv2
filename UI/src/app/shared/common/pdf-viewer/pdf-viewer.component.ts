import { Component, Input } from '@angular/core';
import {
  SafeResourceUrl,
  DomSanitizer,
  SafeUrl,
} from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent {
  @Input() fileBlob: Blob | null = null;
  @Input() fileType: 'pdf' | 'image' = 'pdf';
  @Input() show = false;

  fileUrl: any = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (this.fileBlob) {
      const blobUrl = URL.createObjectURL(this.fileBlob);
      this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    }
  }

  close() {
    this.show = false;
    this.fileUrl = null;
  }
}
