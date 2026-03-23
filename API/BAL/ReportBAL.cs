using AutoMapper;
using BAL.BackgroundWorkerService;
using BAL.Helper;
using BAL.Interface;
using BAL.Service;
using DAL;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using Model.ViewModel.Report;
using NPOI.SS.Formula.Functions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utils.Interface;

namespace BAL
{
    public class ReportBAL : IReportBAL
    {
        private readonly SettingsDAL _settingDAL;
        private readonly GeneralDAL _generalDAL;
        private readonly SchemeDAL _schemeDAL;
        private readonly ReportDAL _reportDAL;
        private readonly IMapper _mapper;
        private readonly IFTPHelpers _fTPHelpers;
        private readonly Service.ITranslationService _translationService;

        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public ReportBAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IMapper mapper, IConfiguration configuration,
            IFTPHelpers fTPHelpers, IBackgroundTaskQueue backgroundTaskQueue, IServiceScopeFactory serviceScopeFactory, ITranslationService translationService)
        {
            _settingDAL = new SettingsDAL(configuration);
            _generalDAL = new GeneralDAL(configuration);
            _schemeDAL = new SchemeDAL(mySqlDapperHelper, mySqlHelper, configuration);
            _reportDAL = new ReportDAL(mySqlDapperHelper, mySqlHelper, configuration);
            _mapper = mapper;
            _fTPHelpers = fTPHelpers;
            _backgroundTaskQueue = backgroundTaskQueue;
            _serviceScopeFactory = serviceScopeFactory;
            _translationService = translationService;
        }

        #region Member
        public List<MemberExportAllDetails> GetAllMember(MemberInfoFilterModel filter)
        {
            return _reportDAL.GetAllMember(filter);
        }
        public byte[] GetAllMemberAsExcel(MemberInfoFilterModel filter)
        {
            List<MemberExportAllDetails> list = _reportDAL.GetAllMember(filter);
            if (list.Count > 0)
            {
                return HelperFunctions.ExportToExcel(list);
            }

            return null;
        }
        #endregion Member

        public List<ApplicationInfoReportModel> ApplicationInfo(ApplicationInfoFilterModel filter, out int TotalCount)
        {
            return _reportDAL.ApplicationInfo(filter, out TotalCount, _generalDAL.ApplicationExpiryDays());
        }
        public List<ApplicationDocumentReportModel> ApplicationDocument(ApplicationInfoFilterModel filter, out int TotalCount)
        {
            return _reportDAL.ApplicationDocument(filter, out TotalCount, _generalDAL.ApplicationExpiryDays());
        }
        public List<ApplicationStatusReportModel> ApplicationStatus(ApplicationInfoFilterModel filter, out int TotalCount)
        {
            return _reportDAL.ApplicationStatus(filter, out TotalCount, _generalDAL.ApplicationExpiryDays());
        }
        public List<ApplicationForm3ReportModel> ApplicationForm3(ApplicationInfoFilterModel filter, out int TotalCount)
        {
            return _reportDAL.ApplicationForm3(filter, out TotalCount, _generalDAL.ApplicationExpiryDays());
        }
        public List<ApplicationUCReportModel> ApplicationUC(ApplicationInfoFilterModel filter, out int TotalCount)
        {
            return _reportDAL.ApplicationUC(filter, out TotalCount, _generalDAL.ApplicationExpiryDays());
        }

        #region reports
        public List<GCCReportModel> GCCReport()
        {
            return _reportDAL.GCCReport();
        }
         
        public List<ReportModel> DistrictWiseCountReport(string pDistrictId ="", string pOrganization_Type = "")
        {
            return _reportDAL.DistrictWiseCountReport(pDistrictId, pOrganization_Type);
        }
        public List<CardReportModel> DistrictWiseCardReport(string pDistrictId = "", string pOrganization_Type = "")
        {
            return _reportDAL.DistrictWiseCardReport(pDistrictId, pOrganization_Type);
        }

        public List<CoreSanitaryWorkersReportModel> CoreSanitaryWorkersReport(string pDistrictId = "")
        {
            return _reportDAL.CoreSanitaryWorkersReport(pDistrictId);
        }
        public List<ByBlockModel> ByBlock(string pDistrictId = "", string pBlock = "")
        {
            return _reportDAL.ByBlock(pDistrictId, pBlock);
        }
        public List<CardCollectionModel> CardCollection(string pDistrictId = "")
        {
            return _reportDAL.CardCollection(pDistrictId);
        }
        public List<ByCorporationModel> ByCorporationReport(string pDistrictId = "", string pCorporation = "")
        {
            return _reportDAL.ByCorporationReport(pDistrictId, pCorporation);
        }
        public List<ByTownPanchayatModel> ByTownPanchayatReport(string pDistrictId = "", string pTownPanchayat = "")
        {
            return _reportDAL.ByTownPanchayatReport(pDistrictId, pTownPanchayat);
        }
        public List<ByMunicipalityModel> ByMunicipalityReport(string pDistrictId = "", string Municipality = "")
        {
            return _reportDAL.ByMunicipalityReport(pDistrictId, Municipality);
        }
        public List<PrintModuleReportModel> PrintModuleReport(string pStatus="")
        {
            


            return _reportDAL.PrintModuleReport(pStatus);
        }

        public List<MemberReportModel> MemberReport(MemberReportFilterModel filter, out int TotalCount)
        {
            return _reportDAL.MemberReport(filter, out TotalCount);
        }

        public MemberReportResponseModel Member_Report_Chart(MemberReportFilterModel filter)
        {
            return _reportDAL.Member_Report_Chart(filter);
        }
        #endregion reports
        public string UpdatePrintStatus()
        {
            


            return _reportDAL.UpdatePrintStatus();
        }

        public int UpdateAsCardDisbursed(MemberDataApprovalFromSubmitModel model,AuditColumnsModel model1)
        {
            return _reportDAL.UpdateAsCardDisbursed(model,model1);
        }
        

        public List<PrintModuleReportModel> GetId(string Id)
        {
            return _reportDAL.GetId(Id);
        }
        public List<MemberdetailedReportModel> MemberdetailedReport(string DistrictId = "", string Municipality = "", string TownPanchayat = "",
            string pByCorporation = "", string VillagePanchayat = "", string Block = "", string Local_Body = "", string Organization_Type = "", string CardIssued = ""
            , string Core_Sanitary_Worker_Type = "", string Zone = "", string Status = "",
            string CardtobeIssued = "", string CardRejected = "", string CollectedByName = "", string CollectedByPhoneNumber = "")
        {
            return _reportDAL.MemberdetailedReport(DistrictId, Municipality, TownPanchayat, pByCorporation, VillagePanchayat,
                Block, Local_Body, Organization_Type, CardIssued, Core_Sanitary_Worker_Type, Zone, Status, CardtobeIssued, CardRejected, CollectedByName, CollectedByPhoneNumber);
        }
        public List<ByVillagePanchayatModel> ByVillagePanchayatReport(string pDistrictId = "", string pBlock = "",string pVillagePanchayat = "")
        {
            return _reportDAL.ByVillagePanchayatReport(pDistrictId, pBlock,pVillagePanchayat);
        }
        public List<MemberApplySchemeCountModel> MemberApplySchemeCount(string DistrictId = "", string SchemeId = "")
        {
            return _reportDAL.MemberApplySchemeCount(DistrictId, SchemeId);
        }

        public List<SchemeGCCReportModel> SchemeGCCReport(string ZoneId = "", string SchemeId = "")
        {
            return _reportDAL.SchemeGCCReport(ZoneId, SchemeId);
        }

        public List<SchemeCostReportModel> SchemeCostReport(string DistrictId = "", string SchemeId = "")
        {
            return _reportDAL.SchemeCostReport(DistrictId, SchemeId);
        }
        public DemographicAndBenificiaryInsightsModel DemographicAndBenificiaryInsights(ReportFilterModel filter)
        {
            return _reportDAL.DemographicAndBenificiaryInsights(filter, _generalDAL.ApplicationExpiryDays());
        }
        public List<FinancialYearAnalysisModel> FinancialYearAnalysis(ReportFilterModel filter)
        {
            return _reportDAL.FinancialYearAnalysis(filter, _generalDAL.ApplicationExpiryDays());
        }
        public List<ProjectSubsidyCostModel> ComparisionSchemeSubsidyAmount(ReportFilterModel filter)
        {
            return _reportDAL.ComparisionSchemeSubsidyAmount(filter, _generalDAL.ApplicationExpiryDays());
        }
        public DistrictWiseCountCost DistrictDistribution(ReportFilterModel filter)
        {
            return _reportDAL.DistrictDistribution(filter, _generalDAL.ApplicationExpiryDays());
        }
        public CountModel SchemePerformance(ReportFilterModel filter)
        {
            return _reportDAL.SchemePerformance(filter, _generalDAL.ApplicationExpiryDays());
        }

        public ApplicationStatusReport ApplicationStatusWiseReport(ReportFilterModel filter)
        {
            ApplicationStatusReport model = new ApplicationStatusReport();
            model.ApplicationAllStatusCount = _settingDAL.Configuration_Get(IsActive: true, CategoryCode: "DISTRICT").Select(x => new ApplicationAllStatus() { District = x.Value, DistrictId = x.Id }).ToList();

            int expiryDays = _generalDAL.ApplicationExpiryDays();

            model.ApplicationReceived = _reportDAL.ApplicationStatusWiseReport("SUBMITTED", filter, expiryDays);
            model.TaskForceCommittee = _reportDAL.ApplicationStatusWiseReport("CAPP", filter, expiryDays);
            model.ForwardedToLendingBank = _reportDAL.ApplicationStatusWiseReport("FLB", filter, expiryDays);
            model.ApprovedByLendingBank = _reportDAL.ApplicationStatusWiseReport("ALB", filter, expiryDays);
            model.SubsidyReleasedToLendingBank = _reportDAL.ApplicationStatusWiseReport("SRLB", filter, expiryDays);
            model.SubsidyReleasedByHq = _reportDAL.ApplicationStatusWiseReport("SRHQ", filter, expiryDays);

            List<ApplicationStatusCount> total_count = _reportDAL.ApplicationTotalCountReport(filter, expiryDays);

            model.ApplicationAllStatusCount.ForEach(x =>
            {
                if (model.ApplicationReceived.Count > 0)
                {
                    ApplicationStatusCount rec = model.ApplicationReceived.Find(y => y.DistrictId == x.DistrictId) ?? new ApplicationStatusCount();

                    x.ApplicationReceived = rec.Count;
                    if (!string.IsNullOrWhiteSpace(rec.Scheme))
                    {
                        x.Scheme = rec.Scheme;
                    }
                }
                if (model.TaskForceCommittee.Count > 0)
                {
                    ApplicationStatusCount rec = model.TaskForceCommittee.Find(y => y.DistrictId == x.DistrictId) ?? new ApplicationStatusCount();

                    x.TaskForceCommittee = rec.Count;
                    if (!string.IsNullOrWhiteSpace(rec.Scheme))
                    {
                        x.Scheme = rec.Scheme;
                    }
                }
                if (model.ForwardedToLendingBank.Count > 0)
                {
                    ApplicationStatusCount rec = model.ForwardedToLendingBank.Find(y => y.DistrictId == x.DistrictId) ?? new ApplicationStatusCount();

                    x.ForwardedToLendingBank = rec.Count;
                    if (!string.IsNullOrWhiteSpace(rec.Scheme))
                    {
                        x.Scheme = rec.Scheme;
                    }
                }
                if (model.ApprovedByLendingBank.Count > 0)
                {
                    ApplicationStatusCount rec = model.ApprovedByLendingBank.Find(y => y.DistrictId == x.DistrictId) ?? new ApplicationStatusCount();

                    x.ApprovedByLendingBank = rec.Count;
                    if (!string.IsNullOrWhiteSpace(rec.Scheme))
                    {
                        x.Scheme = rec.Scheme;
                    }
                }
                if (model.SubsidyReleasedToLendingBank.Count > 0)
                {
                    ApplicationStatusCount rec = model.SubsidyReleasedToLendingBank.Find(y => y.DistrictId == x.DistrictId) ?? new ApplicationStatusCount();

                    x.SubsidyReleasedToLendingBank = rec.Count;
                    if (!string.IsNullOrWhiteSpace(rec.Scheme))
                    {
                        x.Scheme = rec.Scheme;
                    }
                }
                if (model.SubsidyReleasedByHq.Count > 0)
                {
                    ApplicationStatusCount rec = model.SubsidyReleasedByHq.Find(y => y.DistrictId == x.DistrictId) ?? new ApplicationStatusCount();

                    x.SubsidyReleasedByHq = rec.Count;
                    if (!string.IsNullOrWhiteSpace(rec.Scheme))
                    {
                        x.Scheme = rec.Scheme;
                    }
                }


                ApplicationStatusCount? tot_rec = total_count.Find(y => y.DistrictId == x.DistrictId);
                if (tot_rec != null)
                {
                    x.TotalCount = tot_rec.Count;
                    if (!string.IsNullOrWhiteSpace(tot_rec.Scheme))
                    {
                        x.Scheme = tot_rec.Scheme;
                    }
                }

            });

            ApplicationAllStatus totalRecord = new ApplicationAllStatus()
            {
                DistrictId = "",
                District = "",
                Scheme = "",
                TotalCount = model.ApplicationAllStatusCount.Sum(y => y.TotalCount),
                ApplicationReceived = model.ApplicationAllStatusCount.Sum(y => y.ApplicationReceived),
                TaskForceCommittee = model.ApplicationAllStatusCount.Sum(y => y.TaskForceCommittee),
                ForwardedToLendingBank = model.ApplicationAllStatusCount.Sum(y => y.ForwardedToLendingBank),
                ApprovedByLendingBank = model.ApplicationAllStatusCount.Sum(y => y.ApprovedByLendingBank),
                SubsidyReleasedToLendingBank = model.ApplicationAllStatusCount.Sum(y => y.SubsidyReleasedToLendingBank),
                SubsidyReleasedByHq = model.ApplicationAllStatusCount.Sum(y => y.SubsidyReleasedByHq),
            };

            model.ApplicationAllStatusCount.Add(totalRecord);

            return model;
        }


        public async Task<List<Node>> GetNestedGroupedReportAsync(List<HierarchyField> hierarchy)
        {
            //var data = await _reportDAL.GetMemberOrgReportAsync();
            return await _reportDAL.GetHierarchyTreeAsync(hierarchy);
            //return GroupByHierarchyAsync(data, hierarchy);
        }
     

          



        // [29-Oct-2025] Updated by Sivasankar K: Modified to fetch Animator entries
        public List<MemberGridModel> GetMemberListByCollector(MemberFilterModelForAnimator filter, string userId, out int totalCount)
        {
            return _reportDAL.GetMemberListByCollector(filter, userId, out totalCount);
        }
        public List<ApplicationGridModel> GetApplicationListByCollector(ApplicationFilterModelForAnimator filter, string userId, out int totalCount)
        {
            return _reportDAL.GetApplicationListByCollector(filter, userId, out totalCount);
        }

        //private List<GroupedNode> GroupByHierarchyAsync(List<MemberOrgReport> data, List<GroupingFilter> hierarchy)
        //{
        //    if (!hierarchy.Any()) return null;

        //    var current = hierarchy.First();
        //    var next = hierarchy.Skip(1).ToList();

        //    if (current.Ids?.Any() == true)
        //    {
        //        data = data
        //            .Where(x => current.Ids.Contains(GetPropertyValue(x, current.Field)))
        //            .ToList();
        //    }

        //    return data
        //        .GroupBy(x => GetPropertyValue(x, current.Field) ?? "Unknown")
        //        .Select(g => new GroupedNode
        //        {
        //            Id = g.Key,
        //            Count = g.Count(),
        //            Children = GroupByHierarchyAsync(g.ToList(), next)
        //        })
        //        .ToList();
        //}
        //private string GetPropertyValue(MemberOrgReport item, string field)
        //{
        //    var prop = typeof(MemberOrgReport).GetProperty(field);
        //    return prop?.GetValue(item)?.ToString();
        //}

    }
}
