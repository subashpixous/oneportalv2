import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { UntilDestroy } from '@ngneat/until-destroy';
import { privileges } from 'src/app/shared/commonFunctions';
import {
  ApprovalFlowAddRoleModel,
  ApprovalFlowNewViewMaster,
  ApprovalFlowViewMaster,
  CardPrintStatusOrderModel,
  ConfigSchemeStatusMappingModel,
  DocumentGroupConfigurationOrderModel,
  SchemeGroupOrderingModel,
  SchemeOrderingModel,
  SchemeStatusMappingSaveModel,
  SchemeStatusMappingViewModel,
} from 'src/app/_models/ApprovalFlowViewMaster';
import { RoleService } from 'src/app/services/role.service';
import { AccountPrivilegeViewModel } from 'src/app/_models/AccountRoleViewModel';
import { GeneralService } from 'src/app/services/general.service';
import { CookieService } from 'ngx-cookie-service';

@UntilDestroy()
@Component({
  selector: 'app-approval-flow',
  templateUrl: './approval-flow.component.html',
  styleUrls: ['./approval-flow.component.scss'],
})
export class ApprovalFlowComponent {
  title: string = 'Approval / Status Flow';
  approvalFlowForm!: FormGroup;

  schemes!: ApprovalFlowViewMaster[];
  selectedscheme!: string;

  roles!: TCModel[];
  selectedRoles!: string[];

  statuses!: TCModel[];
  selectedstatuses!: string[];

  approvalFlows!: ApprovalFlowViewMaster[];
  statusFlows!: ConfigSchemeStatusMappingModel[];

  schemeOrder!: SchemeOrderingModel[];
  schemeGroupOrder!: SchemeGroupOrderingModel[];
  selectedGroup!: string;

  privleges = privileges;
  isDragging = false;

  isenableapprovalbutton: boolean = false;
  isenablestatusbutton: boolean = false;

  eduQualifications!: ApprovalFlowViewMaster[];
  documentGroups!: DocumentGroupConfigurationOrderModel[];

  cardApprovalStatus!: any[];

  userPermissions!: string[];
  constructor(
    private messageService: MessageService,
    private roleService: RoleService,
    private generalService: GeneralService,
    private cookieService: CookieService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const privillage: any = this.cookieService.get('privillage');
    if (privillage) {
      this.userPermissions = privillage.split(',');
    }
    this.approvalFlowForm = this.formBuilder.group({
      roles: new FormArray([]),
    });

    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'SCHEME' })
      .subscribe((x) => {
        if (x) {
          this.schemes = x.data;
          if (x.data.length > 0) {
            this.selectedscheme = x.data[0].value;
            this.GetApprovalFlowRoleList(this.selectedscheme);
            this.getApprovalFlow(this.selectedscheme);
            this.getStatusFlow(this.selectedscheme);
            this.getGroupFlow(this.selectedscheme);
          }
        }
      });
    this.generalService.Config_CardPrintStatusGet().subscribe((x) => {
      if (x) {
        this.cardApprovalStatus = x.data;
      }
    });
    this.roleService.Config_Scheme_Group_Get_SortOrder().subscribe((x) => {
      this.schemeGroupOrder = x.data;
    });
  }
  enableapprovalbutton() {
    this.isenableapprovalbutton = true;
  }
  enablestatusbutton() {
    this.isenablestatusbutton = true;
  }
  GetApprovalFlowRoleList(schemeid: string) {
    this.roleService.GetApprovalFlowRoleList(schemeid).subscribe((x) => {
      if (x) {
        this.roles = x.data;
        this.selectedRoles = this.roles
          .filter((x) => x.selected)
          .flatMap((x) => x.value);
      }
    });
    this.roleService
      .Scheme_Status_Mapping_By_Scheme(schemeid)
      .subscribe((x) => {
        if (x) {
          this.statuses = x.data;
          this.selectedstatuses = this.statuses
            .filter((x) => x.selected)
            .flatMap((x) => x.value);
        }
      });
    this.getGroupFlow(schemeid);
  }
  changeScheme(val: any) {
    this.GetApprovalFlowRoleList(val.value);
    this.getStatusFlow(val.value);
    this.getApprovalFlow(val.value);
  }
  changeGroup(val: any) {
    this.roleService.Config_Scheme_Get_SortOrder(val).subscribe((x) => {
      this.schemeOrder = x.data;
    });
  }
  addRoles(event: any) {
    this.saveApprovalFlowRoles({
      roleIds: this.selectedRoles,
      schemeId: this.selectedscheme,
    });
  }
  addstatus(event: any) {
    this.savestatusFlow({
      statusIds: this.selectedstatuses,
      schemeId: this.selectedscheme,
    });
  }
  getApprovalFlow(val: any) {
    this.roleService.GetApprovalFlow('').subscribe((x) => {
      this.approvalFlows = x.data;
    });
  }
  getStatusFlow(val: any) {
    this.roleService.Scheme_Status_Mapping_Get(val).subscribe((x) => {
      this.statusFlows = x.data;
    });
  }
  getGroupFlow(val: any) {
    this.roleService.Document_Configuration_Group_Get(val).subscribe((x) => {
      this.documentGroups = x.data;
    });
  }

  private moveItemInArrayIfAllowed(
    array: any[],
    fromIndex: number,
    toIndex: number
  ): void {
    const from = this.clamp(fromIndex, array.length - 1);
    const to = this.clamp(toIndex, array.length - 1);

    if (from === to) {
      return;
    }

    const target = array[from];
    const delta = to < from ? -1 : 1;

    const affectedItems = array.filter((item, index) =>
      delta > 0 ? index >= from && index <= to : index >= to && index <= from
    );

    // If any of the items affected by the index changes is disabled
    // don't move any of the items.
    if (affectedItems.some((i) => i.disabled)) {
      return;
    }

    for (let i = from; i !== to; i += delta) {
      array[i] = array[i + delta];
    }

    array[to] = target;
  }
  private clamp(value: number, max: number): number {
    return Math.max(0, Math.min(max, value));
  }

  //#region Scheme Group

  dropSchemeGroup(event: any) {
    this.moveItemInArrayIfAllowed(
      this.schemeGroupOrder,
      event.previousIndex,
      event.currentIndex
    );
    let orders: SchemeGroupOrderingModel[] = [];
    let i = 0;
    this.schemeGroupOrder.map((x) => {
      orders.push({
        id: x.id,
        groupName: x.groupName,
        groupNameTamil: x.groupNameTamil,
        groupNameEnglish: x.groupNameEnglish,
        sortOrder: i,
      });
      i++;
    });
    this.saveSchemeGroupOrder(orders);
  }

  saveSchemeGroupOrder(statuses: SchemeGroupOrderingModel[]) {
    this.roleService
      .Config_Scheme_Group_Save_SortOrder(statuses)
      .subscribe((x) => {
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
            detail: x?.message,
          });
          this.getSchemeGruopOrder();
        }
      });
  }
  getSchemeGruopOrder() {
    this.roleService.Config_Scheme_Group_Get_SortOrder().subscribe((x) => {
      this.schemeGroupOrder = x.data;
    });
  }
  //#endregion

  //#region Scheme Order

  dropSchemeOrder(event: any) {
    this.moveItemInArrayIfAllowed(
      this.schemeOrder,
      event.previousIndex,
      event.currentIndex
    );
    let orders: SchemeOrderingModel[] = [];
    let i = 0;
    this.schemeOrder.map((x) => {
      orders.push({
        id: x.id,
        sortOrder: i,
        schemeName: x.schemeName,
        schemeNameEnglish: x.schemeNameEnglish,
        schemeNameTamil: x.schemeNameTamil,
      });
      i++;
    });
    this.saveSchemeOrder(orders);
  }

  saveSchemeOrder(statuses: SchemeOrderingModel[]) {
    this.roleService.Config_Scheme_Save_SortOrder(statuses).subscribe((x) => {
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
          detail: x?.message,
        });
        this.getStatusFlow(this.selectedscheme);
      }
    });
  }
  //#endregion

  //#region  Status Flow

  dropsttaus(event: any) {
    this.moveItemInArrayIfAllowed(
      this.statusFlows,
      event.previousIndex,
      event.currentIndex
    );
    let orders: ConfigSchemeStatusMappingModel[] = [];
    let i = 0;
    this.statusFlows.map((x) => {
      orders.push({
        schemeId: this.selectedscheme,
        statusId: x.statusId,
        sortOrder: i,
        isDisabled: false,
        id: x.id,
        schemeName: x.schemeName,
        schemeCode: x.schemeCode,
        statusName: x.statusName,
        statusCode: x.statusCode,
      });
      i++;
    });
    this.saveStatus(orders);
  }

  saveStatus(statuses: ConfigSchemeStatusMappingModel[]) {
    this.roleService.Scheme_Status_Mapping_Save(statuses).subscribe((x) => {
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
          detail: x?.message,
        });
        this.getStatusFlow(this.selectedscheme);
      }
    });
  }
  savestatusFlow(roles: SchemeStatusMappingSaveModel) {
    this.roleService
      .Scheme_Status_Mapping_Generate_Status(roles)
      .subscribe((x) => {
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
            detail: x?.message,
          });
          this.isenablestatusbutton = false;
          this.getStatusFlow(this.selectedscheme);
        }
      });
  }
  //#endregion

  //#region  Approval Flow
  drop(event: any) {
    moveItemInArray(
      this.approvalFlows,
      event.previousIndex,
      event.currentIndex
    );
    let orders: ApprovalFlowNewViewMaster[] = [];
    let i = 0;
    this.approvalFlows.map((x) => {
      orders.push({
        id: x.id,
        orderNumber: i,
        roleId: x.roleId,
        schemeId: '',
      });
      i++;
    });
    this.save(orders);
  }
  save(roles: ApprovalFlowNewViewMaster[]) {
    this.roleService.SaveUpdateApprovalFlow(roles).subscribe((x) => {
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
          detail: x?.message,
        });
        this.getApprovalFlow(this.selectedscheme);
      }
    });
  }
  saveApprovalFlowRoles(roles: ApprovalFlowAddRoleModel) {
    this.roleService.AddApprovalFlow_Role(roles).subscribe((x) => {
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
          detail: x?.message,
        });
        this.isenableapprovalbutton = false;
        this.getApprovalFlow(this.selectedscheme);
      }
    });
  }
  //#endregion

  //#region  Educational Qualification
  // dropEducationalQualification(event: any) {
  //   moveItemInArray(
  //     this.eduQualifications,
  //     event.previousIndex,
  //     event.currentIndex
  //   );
  //   let orders: ApprovalFlowNewViewMaster[] = [];
  //   let i = 0;
  //   this.eduQualifications.map((x) => {
  //     orders.push({
  //       id: x.id,
  //       orderNumber: i,
  //       roleId: x.roleId, //TODO
  //       schemeId: this.selectedscheme,
  //     });
  //     i++;
  //   });
  //   this.save(orders);
  // }
  // saveEducationalQualification(roles: ApprovalFlowNewViewMaster[]) {
  //   this.roleService.SaveUpdateApprovalFlow(roles).subscribe((x) => {
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
  //       this.getApprovalFlow(this.selectedscheme);
  //     }
  //   });
  // }
  //#endregion

  //#region  EDucational Group

  GetDocumentGroupList(schemeid: string) {
    this.roleService
      .Document_Configuration_Group_Get(schemeid)
      .subscribe((x) => {
        if (x) {
          this.documentGroups = x.data;
        }
      });
  }
  dropDocumentGroup(event: any) {
    moveItemInArray(
      this.documentGroups,
      event.previousIndex,
      event.currentIndex
    );
    let orders: DocumentGroupConfigurationOrderModel[] = [];
    let i = 0;
    this.documentGroups.map((x) => {
      orders.push({
        documentGroupId: x.documentGroupId,
        schemeId: this.selectedscheme,
        documentGroupName: x.documentGroupName,
        sortOrder: i,
      });
      i++;
    });
    this.saveDocumentGroup(orders);
  }
  saveDocumentGroup(roles: DocumentGroupConfigurationOrderModel[]) {
    this.roleService
      .Document_Configuration_Group_Order_Save(roles)
      .subscribe((x) => {
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
            detail: x?.message,
          });
          this.getGroupFlow(this.selectedscheme);
        }
      });
  }
  //#endregion

  resetForm() {
    this.approvalFlowForm.reset();
  }

  ngOnDestroy() {
    this.selectedRoles = [];
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

  dropCardApprovalOrder(event: any) {
    moveItemInArray(
      this.cardApprovalStatus,
      event.previousIndex,
      event.currentIndex
    );
    let orders: CardPrintStatusOrderModel[] = [];
    let i = 0;
    this.cardApprovalStatus.map((x) => {
      orders.push({
        sortOrder: i,
        id: x.id,
      });
      i++;
    });
    this.saveCardApprovalOrder(orders);
  }
  saveCardApprovalOrder(roles: CardPrintStatusOrderModel[]) {
    this.roleService
      .Config_UpdateCardPrintStatusSortOrder(roles)
      .subscribe((x) => {
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
            detail: x?.message,
          });
        }
      });
  }
}
