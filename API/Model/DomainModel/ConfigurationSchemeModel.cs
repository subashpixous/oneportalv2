using Model.DomainModel.MemberModels;
using Model.ViewModel;

namespace Model.DomainModel
{
    public class ConfigurationSchemeViewModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public string SchemeName { get; set; } = string.Empty;
        public string SchemeNameTamil { get; set; } = string.Empty;
        public string SchemeNameEnglish { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IsSelfOrFamilyMember { get; set; } = string.Empty;
        public bool IsApplicable { get; set; }
        public int SortOrder { get; set; }
        public List<FamilyMemberModel> EligibleMembers { get; set; } = new();
    }
    public class ConfigurationSchemeSaveModel 
    {
        public string SchemeId { get; set; } = string.Empty;
        public string SchemeName { get; set; } = string.Empty;
        public string SchemeNameTamil { get; set; } = string.Empty;
        public string SchemeNameEnglish { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool ShowBankFields { get; set; }
        public bool ShowAdditionalFields { get; set; }
        public int SortOrder { get; set; }

        public List<string>? CallLetterStatusIdsList { get; set; } = null!;
        public string CallLetterStatusId { get; set; } = string.Empty;
        public string CallLetterStatusNames { get; set; } = null!; //1
        public List<string>? CallLetterStatusNamesList { get; set; } = null!; //1

        public List<string>? DocRequiredStatusIdsList { get; set; } = null!;
        public string DocRequiredStatusId { get; set; } = string.Empty;
        public string DocRequiredStatusListNames { get; set; } = null!;//2
        public List<string>? DocRequiredStatusNamesList { get; set; } = null!;//2

        public List<string> ReligionsList { get; set; } = null!;
        public string Religions { get; set; } = string.Empty;
        public string ReligionsListNames { get; set; } = null!;//3
        public List<string> ReligionsNamesList { get; set; } = null!;//3

        public List<string> CommunityList { get; set; } = null!;
        public string Community { get; set; } = string.Empty;
        public string CommunityListNames { get; set; } = null!;//4
        public List<string> CommunityNamesList { get; set; } = null!;//4

        public List<string> CasteList { get; set; } = null!;
        public string Caste { get; set; } = string.Empty;
        public string CasteListNames { get; set; } = null!;//5
        public List<string> CasteNamesList { get; set; } = null!;//5

        public List<string> GendersList { get; set; } = null!;
        public string Genders { get; set; } = string.Empty;
        public string GendersListNames { get; set; } = null!;//6
        public List<string> GendersNamesList { get; set; } = null!;//6

        public List<string> DistrictsList { get; set; } = null!;
        public string Districts { get; set; } = string.Empty;
        public string DistrictsListNames { get; set; } = null!;//7
        public List<string> DistrictsNamesList { get; set; } = null!;//7

        public List<string>? FamilyMemberCategorysList { get; set; } = null!;
        public string FamilyMemberCategorys { get; set; } = string.Empty;
        public string FamilyMemberCategorysListNames { get; set; } = null!;//8
        public List<string>? FamilyMemberCategorysNamesList { get; set; } = null!;//8

        public List<string>? MemberEducationList { get; set; } = null!;
        public string MemberEducation { get; set; } = string.Empty;
        public string MemberEducationListNames { get; set; } = null!;//9
        public List<string>? MemberEducationNamesList { get; set; } = null!;//9

        public List<string>? FamilyMemberEducationList { get; set; } = null!;
        public string FamilyMemberEducation { get; set; } = string.Empty;
        public string FamilyMemberEducationListNames { get; set; } = null!;//10
        public List<string>? FamilyMemberEducationNamesList { get; set; } = null!;//10

        public List<string>? MaritalStatusList { get; set; } = null!;
        public string MaritalStatus { get; set; } = string.Empty;
        public string MaritalStatusListNames { get; set; } = null!;//11
        public List<string>? MaritalStatusNamesList { get; set; } = null!;//11

        public List<string>? OrganizationTypeList { get; set; } = null!;
        public string OrganizationType { get; set; } = string.Empty;
        public string OrganizationTypeListNames { get; set; } = null!;//12
        public List<string>? OrganizationTypeNamesList { get; set; } = null!;//12

        public string IsSelfOrFamilyMember { get; set; } = string.Empty;
        public bool IsAlreadyAvailed { get; set; }
        public bool IsSingleCategorySelect { get; set; }
        public int MinimumAge { get; set; }
        public int MaximumAge { get; set; }
        public bool IsActive { get; set; }

        public DateTime FromDate { get; set; }
        public string FromDateString { get; set; } = string.Empty;
        public DateTime ToDate { get; set; }
        public string ToDateString { get; set; } = string.Empty;

        public List<ConfigSelectListByParentIdListModel>? CommunityGrouped { get; set; }
        public List<ConfigSelectListByParentIdListModel>? CastesGrouped { get; set; }
        public List<SchemRequiredDocumentGroups>? Documents { get; set; }
    }

    public class ExistApplicationIdModel
    {
        public string ApplicationId { get; set; } = string.Empty;
        public string ApplicationNumber {  get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public string FamilyMemberId { get; set; } = string.Empty;
        public string FamilyMemberName { get; set; } = string.Empty;
        public DateTime? LastUpdatedDate { get; set; }
        public DateTime? SubmittedDate { get; set; }
        public bool IsSubmitted { get; set; }
    }

    public class SchemRequiredDocumentGroups
    {
        public string GroupName { get; set; } = string.Empty;
        public List<SchemRequiredCategoryDocuments> RequiredDocumentCategory {  get; set; } = null!;
    }

    public class SchemRequiredCategoryDocuments
    {
        public string CategoryName { get; set; } = string.Empty;
        public List<string> ApplicableDocuments { get; set; } = null!;
    }

    public class SchemRequiredCategoryReadModelDocuments
    {
        public string DocumentGroupName { get; set; } = string.Empty;
        public string DocumentCategory { get; set; } = string.Empty;
        public string AcceptedDocuments { get; set; } = string.Empty;
    }

    public class ConfigurationSchemeCostFieldModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string FieldId { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsVisible { get; set; }
        public string Tooltip { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public string Field { get; set; } = string.Empty;
    }

    public class ConfigurationSchemeCostValidationModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public List<string> CheckFieldIds { get; set; } = null!;
        public List<string> BaseFieldIds { get; set; } = null!;
        public string ConditionId { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public string UnitId { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        // View Properties
        public string? CheckFields { get; set; } = string.Empty;
        public string? BaseFields { get; set; } = string.Empty;
        public string? Condition { get; set; } = string.Empty;
        public string? Unit { get; set; } = string.Empty;
    }

    public class ApplicationValidationModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public bool IsSelf { get; set; }
        public string Dependents { get; set; } = string.Empty;
        public int Age { get; set; }
        public decimal ProjectOutlayCost { get; set; }
        public decimal LandCost { get; set; }
        public decimal BuildingCost { get; set; }
        public decimal EquipmentCost { get; set; }
        public decimal WorkingCost { get; set; }
        public decimal PreopertaiveExpense { get; set; }
        public decimal OtherExpense { get; set; }
        public decimal TotalCost { get; set; }
        public decimal SubsidyCost { get; set; }
        public decimal BeneficiaryCost { get; set; }
        public decimal LoanCost { get; set; }
        public decimal SubsidyPercentage_Config { get; set; }
        public decimal SubsidyCost_Config { get; set; }
    }

    public class ApplicationValidationErrorModel
    {
        public string Key { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
    }
    public class CurrentApplicationCostDetailModel
    {
        public decimal TotalProjectCost { get; set; }
        public decimal TotalSubsidyCost { get; set; }
        public int TotalApplicationCount { get; set; }
    }
    public class CurrentApplicationCostModel
    {
        public CurrentApplicationCostDetailModel TotalApplication { get; set; } = null!;
        public CurrentApplicationCostDetailModel DistrictWiseApplication { get; set; } = null!;
    }

    public class SchemeEligibleFamilyMemberViewModel
    {
        public string MainSchemeId { get; set; }

        public string SubSchemeId { get; set; }

        public string SubSchemeNameEnglish { get; set; }

        public string SubSchemeNameTamil { get; set; }

        public string PersonId { get; set; }

        public string PersonName { get; set; }

        public string Relation { get; set; }

        public int Age { get; set; }

        public string Gender { get; set; }

        public string EligibleType { get; set; }

    }


}
