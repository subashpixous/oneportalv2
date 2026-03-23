using Model.DomainModel;
using System.Collections.Generic;

namespace Model.Constants
{
    public static class Constants
    {
        public const string UserId = "UserID";
        public const string LoginId = "LoginID";
        public const string UserName = "UserName";
        public const string Name = "Name";
        public const string RoleId = "RoleId";
        public const string RoleCode = "RoleCode";
        public const string RoleName = "RoleName";
        public const string DistrictId = "DistrictId";
        public const string LocalBodyId = "LocalBodyId";
        public const string NameOfLocalBodyId = "NameOfLocalBodyId";
        public const string BlockId = "BlockId";
        public const string CorporationId = "CorporationId";
        public const string MunicipalityId = "MunicipalityId";
        public const string TownPanchayatId = "TownPanchayatId";
        public const string VillagePanchayatId = "VillagePanchayatId";
        public const string ZoneId = "ZoneId";
        public const string Login = "LOGIN";

        public const string DivisionId = "DivisionId";
        public const string Mobile = "Mobile";
        public const string AadhaarNumber = "AadhaarNumber";
        public const string UserGroup = "UserGroup";
        public const string UserGroupName = "UserGroupName";
        public const string TotalCost = "TOTAL_COST";
        public const string Scheme = "SCHEME";
        public const string Dependent = "DEPENDENTS";
        public const string TargetGroupSelf = "SELF";
        public const string TargetGroupDependent = "DEPENDENT";

        public const string ConfigurationGeneralSchemeId = "dasdsad6546546432424133214";

        public static List<string> StaticRoles = new List<string>() { "ADMIN" };
        public const string Privillage = "Privillages";
    }

    public static class EmailTemplateCode
    {
        public const string UserCreate = "USERCREATE";
        public const string UserCreate1 = "USERCREATE1";
    }

    public static class AddressTypeConstants
    {
        public const string WorkAddress = "WORK";
        public const string PermanentAddress = "PERMANENT";
        public const string TemporaryAddress = "TEMPORARY";
    }
    public static class GeneralConfigKeyConstants
    {
        public const string RuralDistricts = "RURAL_DISTRICTS";
        public const string UrbanDistricts = "URBAN_DISTRICTS";
        public const string ApplicationExpiryDays = "APPEXPIRYDAYS";
        public const string MemberDocumentCategories = "MEMBERDOCUMENTCATEGORIES";
        public const string MemberNonMandatoryDocumentCategories = "MEMBERNONMANDATORYDOCUMENTCATEGORIES";
        public const string FamilyMemberMandatoryDocumentCategories = "FAMILYMEMBERMANDATORYDOCUMENTCATEGORIES";
        public const string FamilyMemberNonMandatoryDocumentCategories = "FAMILYMEMBERNONMANDATORYDOCUMENTCATEGORIES";
        public const string CanSendPhysicalCard = "CANSENDPHYSICALCARD";

        public const string QuickContactName = "QUICKCONTACTNAME";
        public const string QuickContactPhone = "QUICKCONTACTPHONE";
        public const string QuickContactEmail = "QUICKCONTACTEMAIL";
    }
    public static class FileUploadTypeCode
    {
        public const string UserDocument = "UserDocument";
        public const string ApplicationProfile = "APPLICATION_PROFILE";
        public const string UtilisationCertificate = "UtilisationCertificate";
        public const string Form3 = "Form3";
        public const string HelpDocument = "HELPDOCUMENT";
        public const string SchemeGroup = "SCHEMEGROUPIMAGE";
        public const string MemberProfile = "MEMBERPROFILEIMAGE";
        public const string DownloadedPrintFile = "DOWNLOADEDPRINTFILE";
    }
    public static class StatusCodeConst
    {
        // Status codes you have to send to Mbook approve reject API is 'APPROVE, RETURN, REJECT'
        public const string Approve = "APPROVE";
        public const string Return = "RETURN";
        public const string Reject = "REJECT";
        public const string Saved = "SAVED";
        public const string Submitted = "SUBMITTED";
        public const string Completed = "COMPLETED";
    }

    public static class CostFieldValuesConst
    {
        public const string LAND_COST = "LAND_COST";
        public const string BUILDING_COST = "BUILDING_COST";
        public const string MACHINERY_EQUIPMENT_COST = "MACHINERY_EQUIPMENT_COST";
        public const string SUBSIDY_COST = "SUBSIDY_COST";
        public const string WORKING_COST = "WORKING_COST";
        public const string BENEFICIARY_CONTRIBUTION = "BENEFICIARY_CONTRIBUTION";
        public const string PRE_OPERTAIVE_EXPENSE = "PRE_OPERTAIVE_EXPENSE";
        public const string OTHER_EXPENSE = "OTHER_EXPENSE";
        public const string TOTAL_COST = "TOTAL_COST";
        public const string PROJECT_COST = "PROJECT_COST";
        public const string LOAN_AMOUNT = "LOAN_AMOUNT";
    }
    public static class CostConditionsValuesConst
    {
        public const string GREATER_THAN = "GREATER_THAN";
        public const string LESSER_THAN = "LESSER_THAN";
        public const string LESSER_THAN_EQUALS = "LESSER_THAN_EQUALS";
        public const string GREATER_THAN_EQUALS = "GREATER_THAN_EQUALS";
    }

    public static class ConstDropdowns
    {
        public static List<SelectListItem> SchemeForSelfOrFamilyMember = new() 
        {
            new SelectListItem { Text = "Self", Value = "SELF" },
            new SelectListItem { Text = "Dependent", Value = "DEPENDENT" }
        };
        public static List<SelectListItem> TrueFalseSelect = new()
        {
            new SelectListItem { Text = "Yes", Value = "1" },
            new SelectListItem { Text = "No", Value = "0" }
        };
        public static List<SelectListItem> RecurrenceSelect = new()
        {
            new SelectListItem { Text = "Monthly", Value = "Monthly" },
            new SelectListItem { Text = "Quarterly", Value = "Quarterly" },
            new SelectListItem { Text = "Half-Yearly", Value = "Half-Yearly" },
            new SelectListItem { Text = "Yearly", Value = "Yearly" },
            new SelectListItem { Text = "Lifetime", Value = "Lifetime" }
        };
        public static List<SelectListItem> OccurrenceSelect = new()
        {
            new SelectListItem { Text = "1", Value = "1" },
            new SelectListItem { Text = "2", Value = "2" },
            new SelectListItem { Text = "3", Value = "3" },
        };
    }

    public static class ConfigurationCategoryCodeConstant
    {
        public const string Area = "AREAS";
    }
    public static class SchemeErrorConstants
    {

        public const string ActiveErrror = "This scheme is currently unavailable.";
        public const string AgeErrror = "Age is not within the given limits {0} to {1}";
        public const string TargetGroupSelfError = "Scheme is not applicable to Self";
        public const string TargetGroupDependentError = "Scheme is not applicable to Dependents";
        public const string DependentErrror = "Scheme is not applicable to dependent";
        public const string TotalProjectCostErrror = "Total cost has been reached maximum limit";
        public const string MaxProjectCostErrror = "Total cost should be less than {0}. Please adjust the Land cost, Building cost and Project cost accordingly";
        public const string TotalSubsidyCostErrror = "Total Subsidy cost has been reached maximum limit";
        public const string NoOfAppErrror = "No of application has been reached maximum limit";
        public const string DistrictWiseTotalProjectCostErrror = "Total cost has been reached maximum limit for your district";
        public const string DistrictWiseTotalSubsidyCostErrror = "Total Subsidy cost has been reached maximum limit for your district";
        public const string DistrictWiseNoOfAppErrror = "No of application has been reached maximum limit for your district";
        public const string CostValidationErrorw = "Sum of {0} should be {1} {2} with the difference of {3} {4}";
        public const string CostValidationError1 = "The {0} {1} {3} {4} of the {2}. Please adjust the {0} accordingly";
        public const string CostValidationError2 = "The {0} {1} (amount {3} {4}) of the {2}. Please adjust the {0} to stay within this limit";
    }

    public static class CallletterStatusConstant
    {
        public const string Scheduled = "Scheduled";
        public const string Cancelled = "Cancelled";
        public const string SentToAll = "Message Sent For All";
        public const string NotSentToAll = "Message Sent For All";
    }
    public static class MemberInformationKey
    {
        public const string MEMBER_WHOLE_DATA = "MEMBER_WHOLE_DATA";

        public const string MEMBER_DETAIL = "MEMBER_DETAIL";
        public const string MEMBER_ORGANIZATION = "MEMBER_ORGANIZATION";
        public const string MEMBER_FAMILY = "MEMBER_FAMILY";
        public const string MEMBER_BANK = "MEMBER_BANK";
        public const string MEMBER_ADDRESS = "MEMBER_ADDRESS";
        public const string MEMBER_DOCUMENT = "MEMBER_DOCUMENT";
    }
    public static class MemberDetailApprovalStatus
    {
        public const string WAITING_FOR_APPROVAL = "WAITING_FOR_APPROVAL";
        public const string IN_PROGRESS = "IN_PROGRESS";
        public const string COMPLETED = "COMPLETED";
        public const string CANCELLED = "CANCELLED";
        public const string REJECTED = "REJECTED";
    }
}
