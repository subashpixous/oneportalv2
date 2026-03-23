import { Form } from '@angular/forms';
import { AuditColumnsModel } from './utils';

export interface ApplicationForm3Model extends AuditColumnsModel {
  id: string;
  applicationId: string;
  nameAndAddress: string;
  nameOfTrade: string;
  refNumber: string;
  subsidy: number;
  promotorContribution: number;
  bankLoan: number;
  totalUtilCost: number;
  isActive: boolean;
  savedFileName: string;
  originalFileName: string;
}

export interface ApplicationForm3SaveModel {
  id: string;
  applicationId: string;
  nameAndAddress: string;
  nameOfTrade: string;
  refNumber: string;
  subsidy: number;
  promotorContribution: number;
  bankLoan: number;
  totalUtilCost: number;
  isActive: boolean;
}

export interface ApplicationForm3UploadFormModel {
  id: string;
  file: Form;
}
