import { Form } from '@angular/forms';
import { AuditColumnsModel } from './utils';

export interface ApplicationUtilizationCirtificateModel
  extends AuditColumnsModel {
  id: string;
  applicationId: string;
  nameAndAddress: string;
  nameOfTrade: string;
  nodalNumber: string;
  subsidy: number;
  promotorContribution: number;
  bankLoan: number;
  totalAmountReleased: number;
  dateOfLoanSanction: string;
  dateOfDisbursement: string;
  dateOfAssetCreated: string;
  dateOfAssetVerified: string;
  loanAccountNumber: string;
  isActive: boolean;
  savedFileName: string;
  originalFileName: string;
}

export interface ApplicationUtilizationCirtificateSaveModel {
  id: string;
  applicationId: string;
  nameAndAddress: string;
  nameOfTrade: string;
  nodalNumber: string;
  subsidy: number;
  promotorContribution: number;
  bankLoan: number;
  totalAmountReleased: number;
  dateOfLoanSanction: string;
  dateOfDisbursement: string;
  dateOfAssetCreated: string;
  dateOfAssetVerified: string;
  loanAccountNumber: string;
  isActive: boolean;
}

export interface ApplicationUtilizationCirtificateUploadFormModel {
  id: string;
  file: Form;
}
