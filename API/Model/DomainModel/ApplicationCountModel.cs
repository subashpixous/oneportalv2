using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationCountFilterModel
    {
        public List<SelectListItem>? YearList { get; set; }
        public List<SelectListItem>? SchemeList { get; set; }
        public List<SelectListItem>? DistrictList { get; set; }
        public List<SelectListItem>? StatusList { get; set; }
    }

    public class ApplicationCountFilterValueModel
    {
        public string Year { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
    }

    public class ApplicationRecordCountModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public List<ApplicationCountModel>? RecordCount { get; set; }
    }

    public class ApplicationCountModel
    {
        public string StatusId { get; set; } = string.Empty;
        public string StatusCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public int Order { get; set; }
    }

    public class RecordCountNew
    {
        public string SchemeId { get; set; } = string.Empty;
        public string SchemeCode { get; set; } = string.Empty;
        public string StatusCode { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class DashboardFilterValueModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string WorkCategory { get; set; } = string.Empty;
        public string WorkDelayedDays { get; set; } = string.Empty;
        public string Genderfilter { get; set; } = string.Empty;

        public bool IsDistrictWise { get; set; }
        public bool IsSchemeWise { get; set; }
        public bool IsDueDateWise { get; set; }
    }


    public class MemberDashboardFilterValueModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public bool IsDistrictWise { get; set; }
        public bool IsSchemeWise { get; set; }
        public bool IsDueDateWise { get; set; }
    }

    public class DashboardApplicationCountModel
    {
        public List<ApplicationCountCard> CardCount { get; set; } = null!;
        public List<ApplicationCountMap> MapCount { get; set; } = null!;
        public List<ApplicationCountModel> StatusCount { get; set; } = null!;
    }

    public class DashboardResponseCountModel
    {
        public List<MemberApplicationCount> member_application_count { get; set; }
        public List<SchemeApplicationCount> scheme_application_count { get; set; }


        public class MemberApplicationCount
        {
            public int Count { get; set; }
            public string Status { get; set; }
        }

        public class SchemeApplicationCount
        {
            public int Count { get; set; }
            public string StatusId { get; set; }
            public string StatusCode { get; set; }
        }

        public MemberDashboardData? member_dashboard_data { get; set; } 
        public SchemeDashboardData? scheme_dashboard_data { get; set; }
        public SchemeDashboardAmountData? scheme_dashboard_amount_data { get; set; } 

        public class MemberDashboardData
        {
            public ChartSeries pending_approval { get; set; }
            public ChartSeries approved { get; set; }
            public int card_printed { get; set; }
            public int approval_delay { get; set; }
            public int card_delay { get; set; }

            public MemberCharts? charts { get; set; }    
        }

        public class MemberCharts
        {
            public DistrictwiseMemberCount? districtwise_count { get; set; }
            public GenderChart? member_by_gender { get; set; }
        }

        public class DistrictwiseMemberCount
        {
            public object? pending_approval_count { get; set; } 
            public object?  approved_by_hq_count { get; set; }
            public object? card_printed { get; set; }
            public object? approval_delay { get; set; }
            public object? card_delay { get; set; }
        }

        public class GenderChart
        {
            public object? pending_approval_count { get; set; }
            public object? approved_by_hq_count { get; set; }
            public object? card_printed { get; set; }
            public object? approval_delay { get; set; }
            public object? card_delay { get; set; }
        }

        public class SchemeDashboardData
        {
            public int eligible_applicant_count { get; set; }

            public Dictionary<string, int> statuswise_application_count { get; set; } = new();
            public List<SchemeStatusCount> scheme_statuswise_application_count { get; set; } = new(); 
            public SchemeChartSeries member_applied_count { get; set; }
            public SchemeChartSeries benificary_applied_count { get; set; }

            public SchemeCharts charts { get; set; } = new();

        }

        public class SchemeCharts
        {
            public Dictionary<string, SchemeChartSeries> districtwise_count { get; set; } = new();
            public Dictionary<string, SchemeChartSeries> schemes_by_types { get; set; } = new();
        }
        public class SchemeChartSeries
        {
            public List<string> labels { get; set; } = new();
            public List<int> values { get; set; } = new();
        }
        public class SchemeStatusCount
        {
            public string GroupName { get; set; }
            public string SchemeName { get; set; }
            public string Status_Code { get; set; }
            public int Count { get; set; }
        }
        public class SchemeDashboardAmountData
        {
            public string eligible_applicant_amount { get; set; } = string.Empty;
            public string applied_applicant_amount { get; set; } = string.Empty;
            public string pending_approval_amount { get; set; } = string.Empty;
            public string member_applied_amount { get; set; } = string.Empty;
            public string benificary_applied_amount { get; set; } = string.Empty;
            public string approved_applicants_amount { get; set; } = string.Empty;
            public string amount_disbursed { get; set; } = string.Empty;
            public string amount_sanctioned { get; set; } = string.Empty;

            public AmountCharts? charts { get; set; }
        }

        public class AmountCharts
        {
            public AmountDistrictwise? districtwise_count { get; set; }
            public AmountBySchemes? amount_by_schemes { get; set; }
        }

        public class AmountDistrictwise
        {
            public object? eligible_applicant_amount { get; set; }
            public object? applied_applicant_amount { get; set; }
            public object? pending_approval_amount { get; set; }
            public object? member_applied_amount { get; set; }
            public object? benificary_applied_amount { get; set; }
            public object? approved_applicants_amount { get; set; }
            public object? amount_disbursed { get; set; }
            public object? amount_sanctioned { get; set; }
        }

        public class AmountBySchemes
        {
            public object? eligible_applicant_amount { get; set; }
            public object? applied_applicant_amount { get; set; }
            public object? pending_approval_count { get; set; }
            public object? member_applied_amount { get; set; }
            public object? benificary_applied_amount { get; set; }
            public object? approved_applicants_amount { get; set; }
            public object? amount_disbursed { get; set; }
            public object? amount_sanctioned { get; set; }
        }

        public class RoleWiseModel
        {
            public string RoleName { get; set; }
            public int PendingCount { get; set; }
            public int ApprovedCount { get; set; }
        }

        public class ApprovalDelayModel
        {
            public int approval_delay { get; set; }
        }

        public class CardPrintedModel
        {
            public int card_printed { get; set; }
        }

        public class CardDelayModel
        {
            public int card_delay { get; set; }
        }

        public class DistrictWiseModel
        {
            public string District { get; set; }
            public int pending_approval_count { get; set; }
            public int approved_by_hq_count { get; set; }
            public int approval_delay { get; set; }
            public int card_printed { get; set; }
            public int card_delay { get; set; }
        }

        public class GenderWiseModel
        {
            public string Gender { get; set; }
            public int pending_approval_count { get; set; }
            public int approved_by_hq_count { get; set; }
            public int approval_delay { get; set; }
            public int card_printed { get; set; }
            public int card_delay { get; set; }
        }

        public class DashboardDistrictModel
        {
            public string District { get; set; }

            public int pending_approval_count { get; set; }

            public int approved_by_hq_count { get; set; }

            public int approval_delay { get; set; }

            public int card_printed { get; set; }

            public int card_delay { get; set; }
        }

        public class DashboardGenderModel
        {
            public string Gender { get; set; }

            public int pending_approval_count { get; set; }

            public int approved_by_hq_count { get; set; }

            public int approval_delay { get; set; }

            public int card_printed { get; set; }

            public int card_delay { get; set; }
        }
        public class DashboardPartIIModel
        {
            public List<RoleWiseModel> role_summary { get; set; }
            public ApprovalDelayModel approval_delay { get; set; }
            public CardPrintedModel card_printed { get; set; }
            public CardDelayModel card_delay { get; set; }

            public List<DashboardDistrictModel> district_summary { get; set; }
            public List<DashboardGenderModel> gender_summary { get; set; }
        }

        public class ChartSeries
        {
            public IEnumerable<string> labels { get; set; }
            public IEnumerable<int> values { get; set; }
        }
    }

    public class ApplicationDistrictWiseCount
    {
        public string DistrictId { get; set; } = string.Empty;
        public string DistrictName { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public int Count { get; set; }
    }

    public class ApplicationSchemeWiseCount
    {
        public string SchemeId { get; set; } = string.Empty;
        public string SchemeName { get; set; } = string.Empty;
        public int Count { get; set; }
    }
    public class ApplicationCountCard
    {
        public string Type { get; set; } = string.Empty;
        public string TypeId { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
    }
    public class ApplicationCountMap
    {
        public string Type { get; set; } = string.Empty;
        public string TypeId { get; set; } = string.Empty;
        public string DistrictName { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public int Count { get; set; }
    }

    public class ApplicationAllForDashboardModel
    {
        public string ApplicationId { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string DistrictName { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public DateTime ApprovedDate { get; set; }
        public int DueDays { get; set; }
    }

    public class MemberDetailCount
    {
        public string ForwardIcon { get; set; } = string.Empty;
        public string BackwardIcon { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public List<MemberDetailCount>? Items { get; set; }
    }
    public class TwoColumnValues
    {
        public string Id { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
    public class DashboardCountModel
    {
        public string OrganizationType { get; set; } = string.Empty;
        public string LocalBody { get; set; } = string.Empty;
        public string NameOfLocalBody { get; set; } = string.Empty;
        public string CardPrintingStatus { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public int RecordCount { get; set; }
    }
    public class DashboardItemModels
    {
        public List<TwoColumnValues> Roles { get; set; } = null!;
        public List<TwoColumnValues> CardApprovalStatus { get; set; } = null!;
        public List<TwoColumnValues> OrganizationTypes { get; set; } = null!;
        public List<TwoColumnValues> LocalBody { get; set; } = null!;
        public List<TwoColumnValues> NameofLocalBody { get; set; } = null!;
        public List<DashboardCountModel> CardApprovalCount { get; set; } = null!;
        public List<DashboardCountModel> MemberApprovalCount { get; set; } = null!;
    }
}
