import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MemberDocumentMaster } from 'src/app/_models/MemberDetailsModel';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';

@Component({
  selector: 'app-mem-document-detail-view',
  templateUrl: './mem-document-detail-view.component.html',
  styleUrls: ['./mem-document-detail-view.component.scss'],
})
export class MemDocumentDetailViewComponent {
  @Input() memPersonalInfo?: MemberDocumentMaster[];
  @Input() ismandatory?: boolean = false;

  constructor(private router: Router, private generalService: GeneralService) {}
  ngOnInit() {}
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }
  back() {
    this.router.navigate(['applicant']);
  }
}
