using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class TableFilterModel
    {
        public int Skip { get; set; }
        public int Take { get; set; } = 10;
        public string? SearchString { get; set; }
        public ColumnSortingModel? Sorting { get; set; }
        public List<ColumnSearchModel>? ColumnSearch { get; set; }
    }
    public class ColumnSortingModel
    {
        public string FieldName { get; set; } = string.Empty;
        public string Sort { get; set; } = string.Empty;
    }
    public class ColumnSearchModel
    {
        public string FieldName { get; set; } = string.Empty;
        public string SearchString { get; set; } = string.Empty;
    }

    #region Comment
    public class CommentFilterModel : TableFilterModel
    {
        public CommentWhereClauseProperties? Where { get; set; }
        public List<string>? Ids { get; set; }
        public List<string>? Types { get; set; }
    }
    public class CommentWhereClauseProperties
    {
        public string? Id { get; set; } = string.Empty;
        public string? Type { get; set; } = string.Empty;
        public string? TypeId { get; set; } = string.Empty;
        public string? ParentId { get; set; } = string.Empty;
        public string? CommentsFrom { get; set; } = string.Empty;
        public string? CommentsText { get; set; } = string.Empty;
        public string? SubjectText { get; set; } = string.Empty;
        public string? CommentNumber { get; set; } = string.Empty;
        public string? CreatedByUserName { get; set; } = string.Empty;
        public DateTime? CommentDate { get; set; }
    }
    #endregion Comment

    #region Alert
    public class AlertFilterModel : TableFilterModel
    {
        public string? RoleId { get; set; }
        public List<string>? DivisionIds { get; set; }
        public List<string>? Types { get; set; }
        public List<string>? TypeIds { get; set; }
    }
    #endregion Alert

    #region Users
    public class UserFilterModel : TableFilterModel
    {
        public UserWhereClauseProperties? Where { get; set; }
    }
    public class UserWhereClauseProperties
    {
        public bool IsActive { get; set; } = true;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
    }
    #endregion

    #region Application
    public class ApplicationFilterModel : TableFilterModel
    {
        public ApplicationWhereClauseProperties Where { get; set; } = null!;
    }
    public class ApplicationWhereClauseProperties
    {
        public string UserId { get; set; } = string.Empty;
        public List<string>? SchemeIds { get; set; }
        public List<string>? DistrictIds { get; set; }
        public List<string>? StatusIds { get; set; }
        public bool IsExpired { get; set; }
        public string Year { get; set; } = string.Empty;
        public bool IsBulkApprovalGet { get; set; } = false;

        public bool ShowInactiveOnly { get; set; } = false;

        public List<string> Mobile { get; set; }
        public string CollectedByName { get; set; } = string.Empty;
        public string CollectedByPhoneNumber { get; set; } = string.Empty;
    }
    #endregion

    #region Callletter
    public class CallletterFilterModel : TableFilterModel
    {
        public CallletterWhereClauseProperties? Where { get; set; }
    }
    public class CallletterWhereClauseProperties
    {
        public bool IsActive { get; set; } = true;
        public List<string>? SchemeIds { get; set; }
        public string SchemeId { get; set; } = string.Empty;
        public List<string>? DistrictIds { get; set; }
        public string DistrictId { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public string Status { get; set; } = string.Empty; // Active/Expired
    }
    #endregion Callletter

    #region Feedback
    public class FeedbackFilterModel : TableFilterModel
    {
        public FeedbackWhereClauseProperties Where { get; set; } = null!;
    }
    public class FeedbackWhereClauseProperties
    {
        public DateTimeOffset FromDate { get; set; }
        public DateTimeOffset ToDate { get; set; }
    }
    #endregion Feedback

    #region Member

    // [06-11-2025] Updated by Sivasankar K: Modified To Export All Data
    public class ExportRequestModel
    {
        public MemberFilterModel Filter { get; set; }  // existing filter
        public string ExportType { get; set; }





        // "excel" or "pdf"
    }
    public class ExportRequestModelForApproval
    {
        public MemberDataApprovalGridFilterModel Filter { get; set; }
        public string ExportType { get; set; }





        // "excel" or "pdf"
    }

    public class ExportCardApprovalFilterModel
    {
        public MemberCardApprovalGridFilterModel Filter { get; set; }
        public string ExportType { get; set; }

        // "excel" or "pdf"
    }
    public class ExportCardApprovalHistoryFilterModel
    {
        public MemberCardApprovalHistoryFilterModel Filter { get; set; }
        public string ExportType { get; set; }

        // "excel" or "pdf"
    }
    // [08-11-2025] Updated by Sivasankar K: Modified To Export All Data
    public class MemberFilterForAnimatorModel
    {
        public MemberFilterModelForAnimator Filter { get; set; }
        public string ExportType { get; set; }

        // "excel" or "pdf"
    }
    public class ApplicationFilterForAnimatorModel
    {
        public ApplicationFilterModelForAnimator Filter { get; set; }
        public string ExportType { get; set; }

        // "excel" or "pdf"
    }

    //modified by Sivasankar K on 20-12-2025 for viewing datewise approved report
    public class GCCReportModels
    {

        public string DistrictName { get; set; }
        public string ZoneName { get; set; }
        public string Zone { get; set; }

        public int Private { get; set; }
        public int Government { get; set; }
        public int GovernmentandPrivate { get; set; }

        public int Saved { get; set; }
        public int Submitted { get; set; }
        public int Rejected { get; set; }
        public int ApprovedCount { get; set; }

        public int CardIssued { get; set; }
        public int CardRejected { get; set; }
        public int CardtobeIssued { get; set; }

        public int Total { get; set; }
    }
    public class BlockWiseReportModel
    {
        public string NameOfTheDistrict { get; set; }
        public int NoOfBlocks { get; set; }
        public int Total { get; set; }
        public int Approved { get; set; }
        public int CardIssued { get; set; }
        public int CardToBeIssued { get; set; }
        public int CardRejected { get; set; }
    }
    public class LocalBodyReportModel
    {
        public string Districts { get; set; }
        public int NameofLocalbodyitems { get; set; }
        public int Total { get; set; }
        public int Approved { get; set; }
        public int CardIssued { get; set; }
        public int CardToBeIssued { get; set; }
        public int CardRejected { get; set; }
    }
    public class AllLocalBodyReportModel
    {
        public string AllLocalBody { get; set; } = string.Empty;
        public int? LocalBodyCount { get; set; }
        public int Total { get; set; }
        public int Approved { get; set; }
        public int Returned { get; set; }
        public int CardIssued { get; set; }
    }


    public class MemberFilterModel : TableFilterModel
    {
        public MemberWhereClauseProperties Where { get; set; } = null!;
    }
    public class MemberReportFilterModel : TableFilterModel
    {
        public MemberReportWhereClauseProperties Where { get; set; } = null!;
    }

    public class MemberReportWhereClauseProperties
    {
        public List<string>? DistrictIds { get; set; }
        public string DistrictId { get; set; }

        public string Status { get; set; } = string.Empty;
        public List<string>? StatusIds { get; set; } 
        public string MemberId { get; set; } = string.Empty;

        public List<string> LocalBody { get; set; } 
        public List<string> Type_of_Work { get; set; }
        public List<string> OrganizationType { get; set; }

        public List<string> NameOfLocalBody { get; set; } 
        public List<string> LocalBodyType { get; set; } 
        public List<string> Municipality { get; set; } 
        public List<string> Block { get; set; } 
        public string CreatedDate { get; set; } = string.Empty;
        public string CollectedByName { get; set; } = string.Empty;

        public List<string> CollectedByPhoneNumber { get; set; }

        public string CollectedOn { get; set; } = string.Empty;
        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

    }
    public class MemberWhereClauseProperties

    {
        public List<string>? approvaldateRange { get; set; }
        public List<string>? DistrictIds { get; set; }

        public string? Type_of_Work { get; set; } = string.Empty;
        public string? user_Role { get; set; } = string.Empty;
        public string? user_RoleName { get; set; } = string.Empty;
        public string? user_RoleId { get; set; } = string.Empty;

        public List<string>? Type_of_Works { get; set; }

        public string? Core_Sanitary_Worker_Type { get; set; } = string.Empty;
// Updated By Sivasankar K on 14/01/2026 for Health Worker
        public string? Health_Worker_Type { get; set; } = string.Empty; 
        public string? Organization_Type { get; set; } = string.Empty;

        public List<string>? Organization_Types { get; set; }

        public string? Nature_of_Job { get; set; } = string.Empty;

        public string? Local_Body { get; set; } = string.Empty;

        public List<string>? Local_Bodys { get; set; }

        public List<string>? Changed_Detail_Records { get; set; }

        public List<string>? Application_Status { get; set; }

        public List<string>? cardstatusId { get; set; }

        public string? Name_of_Local_Body { get; set; } = string.Empty;

        public List<string>? Name_of_Local_Bodys { get; set; }

        public string? Zone { get; set; } = string.Empty;

        public string? Block { get; set; } = string.Empty;

        public string? Village_Panchayat { get; set; } = string.Empty;

        public string? Corporation { get; set; } = string.Empty;

        public string? Municipality { get; set; } = string.Empty;
        public List<string>? StatusIds { get; set; }

        public string? Town_Panchayat { get; set; } = string.Empty;

        public string? District_Id { get; set; } = string.Empty;

        public bool IsApprovalPending { get; set; }

        public bool IsSubmitted { get; set; }

        public bool IsActive { get; set; }

        public string Year { get; set; } = string.Empty;

        public string CollectedByPhoneNumber { get; set; } = string.Empty;

        public string CollectedByName { get; set; } = string.Empty;

        public List<string> Mobile { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public List<string> ApplicationSatus { get; set; }

        public DateTime? Collected_FromDate { get; set; }

        public DateTime? Collected_ToDate { get; set; }

        public string? DMroleId { get; set; } = string.Empty;
        public string? DCroleId { get; set; } = string.Empty;
        public string? HQroleId { get; set; } = string.Empty;
        public string? Approval_application_Status { get; set; } = string.Empty;


        // ✅ NEW FILTERS (SAFE)
        public string? MemberAadhaarNumber { get; set; }
        public string? MemberPhoneNumber { get; set; }
        public string? ReportFormat { get; set; }
        
        //modified by Sivasankar K on 20-12-2025 for viewing datewise approved report
        public string? Phone_Number { get; set; }
        public string? Aadhaar_Number { get; set; }


        public string? type_of_workMap { get; set; }

    }



    #endregion

    #region Member
    public class MemberDataApprovalGridFilterModel : TableFilterModel
    {
        public MemberDataApprovalGridWhereClauseProperties Where { get; set; } = null!;
    }
    public class MemberDataApprovalGridWhereClauseProperties
    {
        public List<string>? DistrictIds { get; set; }
        public List<string>? StatusIds { get; set; }
        public List<string>? MemberDataChangeRequestTypes { get; set; }
        public string? RoleId { get; set; }
        public string? MemberId { get; set; }
        public bool IsActive { get; set; }
        public bool? MemberIsActive { get; set; }
        public bool GetAll { get; set; }
        public bool IsCompleted { get; set; }
        public bool? IsDeleted { get; set; }
        public string Year { get; set; } = string.Empty;
    }

    public class MemberCardApprovalGridFilterModel : TableFilterModel
    {
        public MemberCardApprovalGridWhereClauseProperties Where { get; set; } = null!;
    }
    public class MemberCardApprovalGridWhereClauseProperties
    {
        public List<string>? DistrictIds { get; set; }
        public List<string>? StatusIds { get; set; }
        public bool IsActive { get; set; }
        public string Year { get; set; } = string.Empty;
        public bool? IsCompleted { get; set; }
        public string MemberId { get; set; } = string.Empty;
    }

    public class MemberCardApprovalHistoryFilterModel : TableFilterModel
    {
        public MemberCardApprovalHistoryWhereClauseProperties Where { get; set; } = null!;
    }
    public class MemberCardApprovalHistoryWhereClauseProperties
    {
        public List<string>? DistrictIds { get; set; }
        public List<string>? FromStatusId { get; set; }
        public List<string>? ToStatusId { get; set; }
        public List<string>? StatusIds { get; set; }
        public string Year { get; set; } = string.Empty;

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
    #endregion

    #region DuplicateMemberGet

    // Grid Model
    public class DuplicateMemberGridModel
    {
        public string Id { get; set; }
        public string? MemberCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime ModifiedDate { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string? AadhaarNumber { get; set; } = string.Empty;
        public string? District { get; set; } = string.Empty;
        public string? OrganizationType { get; set; } = string.Empty;
    }

    // Filter Model
    public class DuplicateMemberFilterModel
    {
        public DuplicateMemberWhereClauseProperties Where { get; set; } = new DuplicateMemberWhereClauseProperties();
        public string SearchString { get; set; }
        public SortingModel Sorting { get; set; }
        public int Take { get; set; }   // default 10 rows
        public int skip { get; set; }
    }

    public class DuplicateMemberWhereClauseProperties
    {
        public List<string> DistrictIds { get; set; } = new List<string>();
        public string MemberId { get; set; }
        public string PhoneNumber { get; set; }
        public string? MemberCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;

        public string? AadhaarNumber { get; set; } = string.Empty;
        public string? District { get; set; } = string.Empty;
        public string? OrganizationType { get; set; } = string.Empty;

    }

    public class SortingModel
    {
        public string FieldName { get; set; }
        public string Sort { get; set; } // ASC or DESC
    }
    public class RemoveDuplicateMembersModel
    {
        public List<string> MemberIds { get; set; } = new List<string>();
    }
    #endregion


    // [29-Oct-2025] Updated by Sivasankar K: Modified to fetch Animator entries
    #region GetAnimatorEntries
    public class MemberGridModel
    {
        public string Id { get; set; }

        public string Member_Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string CollectedByName { get; set; } = string.Empty;
        public string CollectedByPhoneNumber { get; set; } = string.Empty;
        public string IsApproved { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string NextApprovalRole { get; set; } = string.Empty;
        public string CardStatus { get; set; } = string.Empty;
        public string CardDisbursedStatus { get; set; } = string.Empty;
        public DateTime? CollectedOn { get; set; }
    }

    public class MemberFilterModelForAnimator
    {
        public FilterWhere Where { get; set; } = new FilterWhere();
        public string SearchString { get; set; } = string.Empty;
        public SortingModel Sorting { get; set; } = new SortingModel();
        public int skip { get; set; }
        public int Take { get; set; }
    }
    public class FilterWhere
    {
        public string MemberId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
    }



    public class ApplicationGridModel
    {
        public string SchemeId { get; set; }
        public string StatusId { get; set; }
        public string TemporaryNumber { get; set; }
        public string ApplicationNumber { get; set; }
        public string DetailId { get; set; }
        public string ApplicationId { get; set; }
        public string Mobile { get; set; }
        public string CollectedByPhoneNumber { get; set; }

        public string DistrictId { get; set; }
        public string DistrictName { get; set; }

        public string MemberId { get; set; }
        public string Status { get; set; }
        public string StatusCode { get; set; }
        public string Scheme { get; set; }

        // Audit fields
        public string CreatedBy { get; set; }
        public string CreatedByUserName { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public string ModifiedByUserName { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string DeletedBy { get; set; }
        public string DeletedByUserName { get; set; }
        public DateTime? DeletedDate { get; set; }

        // Bulk approval fields
        public string BulkApprovedBy { get; set; }
        public string BulkApprovedByUserName { get; set; }
        public DateTime? BulkApprovedDate { get; set; }
        public DateTime? SubmittedDate { get; set; }

        public bool IsExpired { get; set; }
    }

    public class ApplicationFilterModelForAnimator
    {
        public ApplicationFilterWhere Where { get; set; }
        public SortingModel Sorting { get; set; }
        public string SearchString { get; set; }
        public int skip { get; set; } = 0;
        public int Take { get; set; } = 10;
    }

    public class ApplicationFilterWhere
    {
        public string ApplicationNumber { get; set; }
        public string Mobile { get; set; }
        public string MemberId { get; set; }
        public string District { get; set; }
        public string Scheme { get; set; }
        public string Status { get; set; }
    }


    #endregion

}