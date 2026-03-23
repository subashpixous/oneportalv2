export interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  isSortable?: boolean;
  sortablefield?: string;
  isSearchable?: boolean;
  isLink?: boolean;
  isBadge?: boolean;
  badgeCheckfield?: string;
  isColorText?: boolean;
  badgeColor?: string;
  isProgress?: boolean;
  isAnchortagforFilter?: boolean;
  isPopup?: boolean;
  popupType?: string;
  isActionable?: boolean;
  actionableType?: string;
  compareWith?: string; //Updated by Sivasankar K on 20/12/2025 for DateWiseReport 
  sortable?: boolean;
  highlight?: boolean;
}

export interface PageEvent {
  first: number | 0;
  rows: number;
  page: number;
  pageCount: number;
}

export interface ExportColumn {
  title: string;
  dataKey: string;
}

// export interface Actions {
//   ids?: string[];
//   icon: string;
//   title: string;
//   type: string;
//   visibilityCheckFeild?: string;
//   privilege?: string | string[];
//   isIcon?: boolean;
// }

export interface Actions {
  ids?: string[];
  icon?: string;   // ✅ make optional
  title: string;
  type: string;
  visibilityCheckFeild?: string;
  privilege?: string | string[];
  isIcon?: boolean;
}

export interface ActionModel {
  type: string;
  record: any;
}
