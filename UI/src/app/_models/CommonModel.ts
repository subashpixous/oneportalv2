export interface AuditModel {
  createdBy: string;
  createdByUserName: string;
  createdDate: string;
  modifiedBy: string;
  modifiedByUserName: string;
  modifiedDate: string;
  deletedBy: string;
  deletedByUserName: string;
  deletedDate: string;
  savedBy: string;
  savedByUserName: string;
  savedDate: string;
}
export interface TableFilterModelApp {
  skip: number;
  take: number;
  searchString: string | null;
  sorting: ColumnSortingModel | null;
  columnSearch: ColumnSearchModel[] | null;
}

export interface ColumnSortingModel {
  fieldName: string | null;
  sort: string | null;
}

export interface ColumnSearchModel {
  fieldName: string | null;
  searchString: string | null;
}

export interface BreadcrumbModel {
  pathName: string | undefined;
  routing: string;
  isActionable: boolean;
}
