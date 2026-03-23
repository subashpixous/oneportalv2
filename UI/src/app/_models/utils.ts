import { FormGroup } from '@angular/forms';

type fn = (...args: any) => string;

export type ValidationErrorsMapper = () => string[];

export interface ValidationErrorsMap {
  [Key: string]: string | fn;
}
export interface ValidationErrorsGroupMap {
  [Key: string]: string | fn;
}

import { HttpHeaders } from '@angular/common/http';

export const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
export const httpFileUploadOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data',
    s: '',
  }),
};
export interface ResponseStatus {
  Status?: string;
  message?: string;
  id?: string;
}

export interface EventItem {
  status?: string;
  date?: string;
  icon?: string;
  color?: string;
  image?: string;
}
export interface AuditColumnsModel {
  createdBy?: string;
  createdByUserName?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedByUserName?: string;
  modifiedDate?: string;
  deletedBy?: string;
  deletedByUserName?: string;
  deletedDate?: string;
  savedBy?: string;
  savedByUserName?: string;
  savedDate?: string;
}
export interface MapMarkerModel {
  lat: number;
  lng: number;
  label: string;
  content: string;
}
export interface ApplicationValidationErrorModel {
  key: string;
  label: string;
  errorMessage: string;
}
