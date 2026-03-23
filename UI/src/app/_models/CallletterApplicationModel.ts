import { AuditColumnsModel } from './utils';

export interface CallletterApplicationModel {
  id: string;
  callletterId: string;
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  email: string;
  mobile: string;
  isSent: boolean;
  isSentString: string;
  isSelected: boolean;
  isPresent: boolean;
  isActive: boolean;
  canSent: boolean;
}
export interface CallletterMasterModel {
  id: string;
  schemeId: string;
  districtId: string;
  callletterName: string;
  callletterSubject: string;
  meetingDate: string;
  meetingTimeFrom: string;
  meetingTimeTo: string;
  comments: string;
  venue: string;
  meetingStatusId: string;
  prefix: string;
  suffix: string;
  runningNumber: string;
  callLetterNumber: string;
  isActive: boolean;
  schemeName?: string;
  districtName?: string;
  meetingStatusName?: string;
}

export interface CallletterMasterSaveModel {
  id: string;
  schemeId: string;
  schemeName?: string;
  districtId: string;
  districtName?: string;
  callletterName: string;
  callletterSubject: string;
  applicationIds: string[];
  meetingDate: string;
  meetingTimeFrom: string;
  meetingTimeTo: string;
  comments: string;
  venue: string;
  meetingStatusId?: string;
  meetingStatusName?: string;
  isActive: boolean;
}
export interface CallletterGridModel extends AuditColumnsModel {
  id: string;
  schemeId: string;
  districtId: string;
  callletterName: string;
  callletterSubject: string;
  callLetterStatus: string;
  meetingDate: string;
  meetingTimeFrom: string;
  meetingTimeTo: string;
  comments: string;
  meetingStatusId: string;
  venue: string;
  callLetterNumber: string;
  scheme: string;
  district: string;
  isActive: boolean;
  isMessageSentToAll: string;
  isExpired: string;
  canCancel: boolean;
  canDelete: boolean;
  canSent: boolean;
}
