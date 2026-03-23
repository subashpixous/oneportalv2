import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';

@Component({
  selector: 'app-scheme-config',
  templateUrl: './scheme-config.component.html',
  styleUrls: ['./scheme-config.component.scss'],
})
export class SchemeConfigComponent {
  title: string = 'Scheme Configuration';
  schemes!: TCModel[];
  selectedscheme!: string;

  schemeConfigForm!: FormGroup;

  statuses!: TCModel[];
  selectedstatuses!: string[];

  constructor(
    private generalService: GeneralService,
    private messageService: MessageService,
    private roleService: RoleService
  ) {}
  ngOnInit() {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'SCHEME' })
      .subscribe((x) => {
        if (x) {
          this.schemes = x.data;
          if (x.data.length > 0) {
            this.selectedscheme = x.data[0].value;

            this.roleService
              .Get_Status_Select_List_By_Scheme(this.selectedscheme)
              .subscribe((x) => {
                if (x) {
                  this.statuses = x.data;
                  this.selectedstatuses = this.statuses
                    .filter((x) => x.selected)
                    .flatMap((x) => x.value);
                }
              });

            this.generalService
              .Config_Scheme_Get(this.selectedscheme)
              .subscribe((x) => {
                this.schemeConfigForm.controls['callLetterStatusId'].patchValue(
                  x.data[0].callLetterStatusIds
                );
              });
          }
        }
      });
    this.schemeConfigForm = new FormGroup({
      schemeId: new FormControl('', [Validators.required]),
      callLetterStatusId: new FormControl('', [Validators.required]),
    });

    
  }
  changeScheme(event: any) {
    if (event.val) {
    }
  }

  submit() {
    // this.generalService
    //   .Config_Scheme_SaveUpdate({
    //     schemeId: this.selectedscheme,
    //     callLetterStatusIds:
    //       this.schemeConfigForm.controls['callLetterStatusId'].value,
    //     isActive: true,
    //   })
    //   .subscribe((x) => {
    //     if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
    //       this.messageService.add({
    //         severity: 'error',
    //         summary: 'Error',
    //         life: 2000,
    //         detail: x.message,
    //       });
    //     } else if (x) {
    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Success',
    //         detail: x?.message,
    //       });
    //     }
    //   });
  }
}
