import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserSaveModel } from '../_models/AccountUserViewModel';
import { TableFilterModelApp } from '../_models/CommonModel';
import { ResponseModel } from '../_models/ResponseStatus';
import { httpOptions } from '../_models/utils';
import { ReportFilterModel } from '../_models/ReportMode';
import { Guid } from 'guid-typescript';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { selectedProps } from '../_features/report/report-filters/report-filters.component';
import { ApplicationInfoFilterModel } from '../_models/filterRequest';
import * as XLSX from 'xlsx';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApplicationUtilizationCirtificateUploadFormModel } from '../_models/UCModel';

@Injectable({ providedIn: 'root' })
export class ReportService {
   private history: { fileName: string, data: any[] }[] = [];

   private googleTranslateUrl = 'https://translation.googleapis.com/language/translate/v2';
  private apiKey = 'AIzaSyDFV2G6DFlHYrTQXrEaom3GdoVuLoO_0C4'; 
private genAI = new GoogleGenerativeAI('AIzaSyC_6Y58AfErJhgZ3DUIg6jAa6AhB6_faTs');
  constructor(private http: HttpClient,
    
  ) {}

  propSubscription = new BehaviorSubject<selectedProps | null>(null);
  setProps(props: selectedProps) {
    this.propSubscription.next(props);
  }

  Report_Filter_Dropdowns() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/Report_Filter_Dropdowns`
    );
  }
  GetStatusListByScheme(Ids: string[]) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/GetStatusListByScheme
        `,
      Ids,
      httpOptions
    );
  }
  DemographicAndBenificiaryInsights(filter: ReportFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/DemographicAndBenificiaryInsights
        `,
      filter,
      httpOptions
    );
  }
  FinancialYearAnalysis(filter: ReportFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/FinancialYearAnalysis
        `,
      filter,
      httpOptions
    );
  }
  ComparisionSchemeSubsidyAmount(filter: ReportFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/ComparisionSchemeSubsidyAmount
        `,
      filter,
      httpOptions
    );
  }
  DistrictDistribution(filter: ReportFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/DistrictDistribution
        `,
      filter,
      httpOptions
    );
  }
  SummaryReport(filter: ReportFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/ApplicationStatusWiseReport
        `,
      filter,
      httpOptions
    );
  }

  SchemePerformance(filter: ReportFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/SchemePerformance
        `,
      filter,
      httpOptions
    );
  }
  ApplicationInfo(filter: ApplicationInfoFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/ApplicationInfo
        `,
      filter,
      httpOptions
    );
  }
  ApplicationDocument(filter: ApplicationInfoFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/ApplicationDocument
        `,
      filter,
      httpOptions
    );
  }
  ApplicationStatus(filter: ApplicationInfoFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/ApplicationStatus
        `,
      filter,
      httpOptions
    );
  }
  ApplicationForm3(filter: ApplicationInfoFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/ApplicationForm3
        `,
      filter,
      httpOptions
    );
  }
  ApplicationUC(filter: ApplicationInfoFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/ApplicationUC
        `,
      filter,
      httpOptions
    );
  }
  GccReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/GccReport`
    );
  }
    DistrictWiseCountReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/DistrictWiseCountReport`
    );
  }
    CoreSanitaryWorkersReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/CoreSanitaryWorkersReport`
    );
  }
    BlockWiseCountReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/ByBlock`
    );
  }

  CorporationWiseReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/ByCorporationReport`
    );
  }

  MunicipalityWiseReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/ByMunicipalityReport`
    );
  }

  VillagePanchayatWiseReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/ByVillagePanchayatReport`
    );
  }

  MemberApplySchemeCountReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/MemberApplySchemeCount`
    );
  }

getSchemeGccReport(): Observable<ResponseModel[]> {
  return this.http.get<any>(`${environment.apiUrl}/Report/SchemeGCCReport`)
    .pipe(
      map((res: any) => res?.data || [])   // extract data array
    );
}

  getSchemeCostReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/SchemeCostReport`
    );
  }

 getMemberDetailedReport(p: Record<string, any>) {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        params = params.set(k, String(v).trim());
      }
    });
    return this.http.get<{ status: string; data: any[] }>(
      `${environment.apiUrl}/Report/MemberdetailedReport`,
      { params }
    );
  }
   getReport( printingStatus:string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/PrintModuleReport?pStatus=${printingStatus}`
    );
  }
  getprintCompletedReport( printingStatusId:string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/PrintModuleReport?pStatus=${printingStatusId}`
    );
  }

  getCardCollectionReport(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/CardCollection`
    );
  }

  getPrintModuleReport(): Observable<ResponseModel> {
  return this.http.get<ResponseModel>(
    `${environment.apiUrl}/Report/PrintModuleReport`
  );
}

  updateDisbursedStatus(printingStatusId:string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/UpdatePrintStatus?pStatus=${printingStatusId}`
    );
  }
  updateCompletedStatus(printingStatusId:string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Report/UpdatePrintStatus?pStatus=${printingStatusId}`
    );
  }

async translateBatch(texts: string[]): Promise<string[]> {
    if (!texts || texts.length === 0) return [];

    try {
      const response = await this.http.post<string[]>(
        `${environment.apiUrl}/Report/TranslateBatch`,
        { Texts: texts, TargetLanguage: 'ta' }
      ).toPromise();

      return response || [];
    } catch (e) {
      console.error('Batch translation failed', e);
      return texts; // fallback
    }
  }

  // ------------------ Export to Excel ------------------
  async exportToExcel(data: any[], uploadToBackend: boolean = false, districtId?: string) {
  if (!data || data.length === 0) return null;

  // Prepare texts to translate
  const textsToTranslate: string[] = [];
  const textPositions: { rowIndex: number; field: string }[] = [];

  data.forEach((row, index) => {
    if (row.name) { textsToTranslate.push(row.name); textPositions.push({ rowIndex: index, field: 'name' }); }
    if (row.father_Name) { textsToTranslate.push(row.father_Name); textPositions.push({ rowIndex: index, field: 'father_Name' }); }
    if (row.address) { textsToTranslate.push(row.address); textPositions.push({ rowIndex: index, field: 'address' }); }
    if (row.familyMembers) { textsToTranslate.push(row.familyMembers.toString()); textPositions.push({ rowIndex: index, field: 'familyMembers' }); }
  });

  const translatedTexts = await this.translateBatch(textsToTranslate);

  const translated = data.map(row => ({
    MemberId: row.member_Id,
    Name: row.name,
    NameTamil: '',
    FatherName: row.father_Name,
    FatherNameTamil: '',
    Phone: row.phone_Number,
    District: row.district,
    DistrictTamil: row.districtinTAMIL,
    Address: row.address,
    AddressTamil: '',
    FamilyMembers: row.familyMembers,
    FamilyMembersTamil: '',
    Zone: row.zoneName,
    ZoneTamil: row.zoneinTamil,
    DateOfBirth: row.date_Of_Birth
  }));

  // Apply translations
  textPositions.forEach((pos, i) => {
    const translatedText = translatedTexts[i];
    switch (pos.field) {
      case 'name': translated[pos.rowIndex].NameTamil = translatedText; break;
      case 'father_Name': translated[pos.rowIndex].FatherNameTamil = translatedText; break;
      case 'address': translated[pos.rowIndex].AddressTamil = translatedText; break;
      case 'familyMembers': translated[pos.rowIndex].FamilyMembersTamil = translatedText; break;
    }
  });

  // Create Excel
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(translated);
  const wb: XLSX.WorkBook = { Sheets: { 'Report': ws }, SheetNames: ['Report'] };

  // Filename using district
  const districtName = data[0]?.district || 'Report';
  const safeDistrict = districtName.replace(/[^a-zA-Z0-9]/g, '_');
  const count = data.length;
  const fileName = `${safeDistrict}_${count}_Report.xlsx`;

  // Download locally
  XLSX.writeFile(wb, fileName);
  console.log('✅ File exported:', fileName);

  // Save to history
  this.history.push({ fileName, data: translated });

  // Optionally upload to backend
  if (uploadToBackend && districtId) {
    const formData = new FormData();
    const workbookArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([workbookArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    formData.append('file', blob, fileName);
    formData.append('districtId', districtId);
    this.http.post(`${environment.apiUrl}/Report/saveDownloadedPrintFile`, formData).subscribe(
      () => console.log('File uploaded successfully to backend'),
      (err) => console.error('Failed to upload file', err)
    );
  }

  return fileName;
}

  getHistory() {
    return this.history;
  }

 
saveDownloadedFile( obj: ApplicationUtilizationCirtificateUploadFormModel) {
  
  
  return this.http.post(`${environment.apiUrl}/Report/saveDownloadedPrintFile`, obj,
      httpOptions);
}

getFileHistory() {
  return this.http.get<ResponseModel>(`${environment.apiUrl}/Report/GetFileHistory`);
}


}
