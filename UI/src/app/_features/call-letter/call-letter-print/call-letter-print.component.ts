import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  CallletterApplicationModel,
  CallletterMasterSaveModel,
} from 'src/app/_models/CallletterApplicationModel';
import { CallLetterService } from 'src/app/services/call-letter.Service';
import { GeneralService } from 'src/app/services/general.service';
import {
  dateconvertion,
  dateconvertionwithOnlyDate,
  dateconvertionwithOnlyTime,
} from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-call-letter-print',
  templateUrl: './call-letter-print.component.html',
  styleUrls: ['./call-letter-print.component.scss'],
})
export class CallLetterPrintComponent {
  @Input() configurationList!: CallletterApplicationModel[];
  @Input() callLetterDetails!: CallletterMasterSaveModel | null;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private callLetterService: CallLetterService,
    private generalService: GeneralService,
    private messageService: MessageService
  ) {}
  ngOnInit() {}

  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
  dcwt(val: any) {
    return dateconvertion(val);
  }
  dcwot(val: any) {
    return dateconvertionwithOnlyTime(val);
  }
}
