using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using Model.ViewModel.Report;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BAL.Interface
{
    public interface IReportBAL
    {
        #region Member
        public List<MemberExportAllDetails> GetAllMember(MemberInfoFilterModel filter);
        public byte[] GetAllMemberAsExcel(MemberInfoFilterModel filter);
        #endregion Member
        public List<ApplicationInfoReportModel> ApplicationInfo(ApplicationInfoFilterModel filter, out int TotalCount);
        public List<ApplicationDocumentReportModel> ApplicationDocument(ApplicationInfoFilterModel filter, out int TotalCount);
        public List<ApplicationStatusReportModel> ApplicationStatus(ApplicationInfoFilterModel filter, out int TotalCount);
        public List<ApplicationForm3ReportModel> ApplicationForm3(ApplicationInfoFilterModel filter, out int TotalCount);
        public List<ApplicationUCReportModel> ApplicationUC(ApplicationInfoFilterModel filter, out int TotalCount);
        public DemographicAndBenificiaryInsightsModel DemographicAndBenificiaryInsights(ReportFilterModel filter);
        public List<FinancialYearAnalysisModel> FinancialYearAnalysis(ReportFilterModel filter);
        public List<ProjectSubsidyCostModel> ComparisionSchemeSubsidyAmount(ReportFilterModel filter);
        public DistrictWiseCountCost DistrictDistribution(ReportFilterModel filter);
        #region reports
        public List<GCCReportModel> GCCReport();
        public List<ReportModel> DistrictWiseCountReport(string pDistrictId , string pOrganization_Type = "");
        public List<CardReportModel> DistrictWiseCardReport(string pDistrictId, string pOrganization_Type = "");
        public List<CoreSanitaryWorkersReportModel> CoreSanitaryWorkersReport(string pDistrictId = "");
        public List<MemberReportModel> MemberReport(MemberReportFilterModel filter, out int TotalCount);
        public MemberReportResponseModel Member_Report_Chart(MemberReportFilterModel filter);



        #endregion reports
        public string UpdatePrintStatus();
        public List<PrintModuleReportModel> GetId(string Id);
        public List<ByBlockModel> ByBlock(string pDistrictId = "",string pBlock = "");
        public List<ByVillagePanchayatModel> ByVillagePanchayatReport(string pDistrictId = "",string pBlock = "",string pVillagePanchayat="");
        public List<CardCollectionModel> CardCollection(string pDistrictId = "");
        public List<ByCorporationModel> ByCorporationReport(string pDistrictId = "", string pCorporation = "");
        public List<ByTownPanchayatModel> ByTownPanchayatReport(string pDistrictId = "", string pTownPanchayat = "");
        public List<ByMunicipalityModel> ByMunicipalityReport(string pDistrictId = "", string Municipality = "");
        public List<PrintModuleReportModel> PrintModuleReport(string pStatus="");
        public int UpdateAsCardDisbursed(MemberDataApprovalFromSubmitModel model, AuditColumnsModel model1);
       
        public List<MemberApplySchemeCountModel> MemberApplySchemeCount(string DistrictId = "", string SchemeId = "");
        public List<SchemeGCCReportModel> SchemeGCCReport(string ZoneId = "", string SchemeId = "");
        public List<SchemeCostReportModel> SchemeCostReport(string DistrictId = "", string SchemeId = "");
        public List<MemberdetailedReportModel> MemberdetailedReport(string DistrictId = "", string Municipality = "", string TownPanchayat = "",
           string pByCorporation = "", string VillagePanchayat = "", string Block = "", string Local_Body = "", string Organization_Type = "", string CardIssued = ""
           , string Core_Sanitary_Worker_Type = "", string Zone = "", string Status = "",
           string CardtobeIssued = "", string CardRejected = "", string CollectedByName = "", string CollectedByPhoneNumber = "");
        public CountModel SchemePerformance(ReportFilterModel filter);
        public ApplicationStatusReport ApplicationStatusWiseReport(ReportFilterModel filter);
        public Task<List<Node>> GetNestedGroupedReportAsync(List<HierarchyField> hierarchy);


        // [29-Oct-2025] Updated by Sivasankar K: Modified to fetch Animator entries
        public List<MemberGridModel> GetMemberListByCollector(MemberFilterModelForAnimator filter, string userId, out int totalCount);
        public List<ApplicationGridModel> GetApplicationListByCollector(ApplicationFilterModelForAnimator filter, string userId, out int totalCount);

    }
    
      
    
}
