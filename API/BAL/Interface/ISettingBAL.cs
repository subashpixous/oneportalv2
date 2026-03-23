using DAL;
using Dapper;
using Microsoft.AspNetCore.Http;
using Model.DomainModel;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BAL.Interface
{
    public interface ISettingBAL
    {
        #region Two Column Configuration
        public List<ConfigurationModel> Configuration_Get(bool IsActive, string ConfigurationId = "", string CategoryId = "", string ParentConfigurationId = "", 
            string Value = "", string CategoryCode = "", string SchemeId = "", string Code = "", bool ShowParent = false);
        public List<ConfigCategoryModel> Configuration_Category_Get(string CategoryCode = "", bool IsGeneralCategory = true);
        public string Configuration_SaveUpdate(ConfigurationModel Configuration);
        public List<SelectListItem> ConfigurationSelectList_Get(bool IsActive = true, string ConfigurationId = "", string CategoryId = "", string ParentConfigurationId = "", string CategoryCode = "", string SchemeId = "");
        public List<ConfigSelectListByParentIdListModel> GetConfigurationSelectByParentConfiguration(List<string> ParentIds);
        #endregion Two Column Configuration

        #region Role

        public string Account_Role_Save(AccountRoleModel model);
        public List<AccountRoleModel> Account_Role_Get(string Id = "", bool IsActive = true, string RoleName = "", string RoleCode = "");

        #endregion Role


        #region Role Privilege
        public List<AccountPrivilegeByGroupModel> Account_Role_Privilege_Get(string RoleId);
        public List<AccountPrivilegeFormModel> Account_Role_Privilege_Login_Get(string RoleId);
        public List<AccountPrivilegeFormModel> Account_Role_Privilege_Get_All(string RoleId);
        public string Account_Role_Privilege_Save(AccountPrivilegeSaveModel model);
        #endregion Role Privilege

        #region User
        public List<AccountUserModel> Account_Key_Contact_User_Get(string UserId, string DistrictIds, string SchemeIds, List<string> RoleIds);
        public List<AccountUserModel> User_Get(bool IsActive = true, string UserId = "", string DistrictId = "", string DivisionId = "",
            string UserGroup = "", string RoleId = "", string MobileNumber = "", string Email = "",
            string UserGroupName = "", string SchemeId = "", string BranchId = "", string BankId = "");
        public List<UserNextNumberModel> User_GetNextNumber();
        public AccountUserModel User_SaveUpdate(AccountUserModel model);
        public string User_Activate(AccountUserModel model);
        public AccountUserFormDetailModel User_Form_Get(string UserId = "");
        public List<string> getUserMobile(string pZoneIds);
        public List<AccountUserModel> User_Get(UserFilterModel model, out int TotalCount);
        public string User_Save_Profile(UserProfileImageSaveModel model);
        public List<CallletterUserModel> GetUserByRoleAndDistrict(string DistrictId, string RoleCode);
        public List<UserUploadViewModel> UserImport(IFormFile postedFile, AuditColumnsModel audit);
        public string GetUserUploadProcessStatus();
        public List<UserBankBranch> User_Bank_Branch_Get(UserBankModel model);
        public void User_Bank_Branch_Save(UserBankBranchMappingModel model, AuditColumnsModel audit);
        #endregion User

        #region ApprovalFlow
        public List<SelectListItem> GetApprovalflowRoleIdList(string SchemeId);
        public List<ApprovalFlowMaster> ApprovalFlow_Get(string RoleId = "", string SchemeId = "");
        public string ApprovalFlow_Add_Role(ApprovalFlowAddRoleModel_API model);
        public string ApprovalFlow_Remove_Role(ApprovalFlowMaster model);
        public string ApprovalFlow_SaveUpdate(ApprovalFlowMaster model);

        #endregion ApprovalFlow

        #region Application Privilege
        public List<ApplicationPrivilegeViewModel> Application_Privilege_Form_Get(string SchemeId);
        public string Application_Privilege_Save(RolePrivilegeModel model, AuditColumnsModel audit);
        public List<ApplicationPrivilegeMaster> Application_Privilege_Get(string SchemeId = "", string RoleId = "", string StatusId = "", string Id = "");
        #endregion Application Privilege

        #region Scheme Status Mapping
        public List<ConfigSchemeStatusMappingModel> Scheme_Status_Mapping_Get(string SchemeId);
        public List<SelectListItem> Scheme_Status_Mapping_Get_Status_List_By_Scheme(string SchemeId);
        public void Scheme_Status_Mapping_Generate_Status(SchemeStatusMappingSaveModel model, AuditColumnsModel audit);
        public void Scheme_Status_Mapping_Save(List<ConfigSchemeStatusMappingModel> list, AuditColumnsModel audit);
        public List<SelectListItem> Get_Status_Select_List_By_Scheme(string SchemeId, bool IsBulkApproval = false);
        #endregion Scheme Status Mapping

        #region Document Configuration
        public List<ApplicationDocumentConfigurationModel> Document_Configuration_Get(string Id = "", string SchemeId = "", string DocumentGroupId = "", bool IsActive = true);
        public bool Document_Configuration_Update_IsRequired(string Id = "", bool IsRequired = true);
        public string Document_Configuration_Save(ApplicationDocumentConfigurationModel model, AuditColumnsModel audit);
        public List<DocumentGroupConfigurationOrderModel> Document_Configuration_GetDocumentGroupsBySchemeId(string schemeId);
        public void Document_Configuration_Group_Order_Save(List<DocumentGroupConfigurationOrderModel> orderList, AuditColumnsModel audit);
        public List<SchemRequiredDocumentGroups> Document_Configuration_GetBySchemeId(string schemeId);
        List<SchemRequiredDocumentGroups> Document_Configuration_GetByGroupId(string groupId);
        List<SchemRequiredDocumentGroups> Document_Configuration_GetByGroupIds(List<string> groupIds);
        #endregion Document Configuration

        #region Scheme Subsidy Configuration
        public List<ConfigurationSchemeSubsidyModel> Configuration_Scheme_Subsidy_Get(string Id = "", string SchemeId = "",bool IsActive = true);
        public List<ConfigurationdDistrictsWiseSubsidyModel> Configuration_Scheme_District_Subsidy_Get(string ConfigurationSchemeSubsidyId);
        public string Configuration_Scheme_Subsidy_SaveUpdate(ConfigurationSchemeSubsidyModel model, AuditColumnsModel audit);

        #endregion Scheme Subsidy Configuration

        #region Branch Address
        public List<ConfigurationBranchAddressModel> Config_Branch_Address_Get(string BankId = "", string BranchId = "", string IFSC = "");
        public string Config_Branch_Address_SaveUpdate(ConfigurationBranchAddressSaveModel model, AuditColumnsModel audit);
        public List<ConfigurationBankBranchGroupViewModel> Config_Branch_Dropdown_Get(BranchGetPayloadModel model);
        public List<SelectListItem> Config_Branch_Dropdown_Get_AutoComplete(string SearchString = "");
        public bool IsIFSCValid(string IFSC);
        #endregion Branch Address

        #region Scheme Configuration
        public SchemeConfigDropdownModel Scheme_Config_Form_Get(string SchemeId);
        public List<ConfigurationSchemeSaveModel> Config_Scheme_Get(string SchemeId="", string SchemeCode="",string GroupId="");
        public List<ConfigurationSchemeViewModel> Config_Scheme_View_Get(string SchemeId = "", string SchemeCode = "", string GroupId = "");
        public string Config_Scheme_SaveUpdate(ConfigurationSchemeSaveModel model, AuditColumnsModel audit);
        public void Config_Scheme_Save_SortOrder(List<SchemeOrderingModel> list, AuditColumnsModel audit);
        public List<SchemeOrderingModel> Config_Scheme_Get_SortOrder(string GroupId);
        public string Config_Scheme_Get_Eligibility_Type(string SchemeId);
        #endregion Scheme Configuration

        #region Scheme Sub Cost Configuration
        public List<SchemeSubCategoryConfigurationDateWiseModel> Config_Scheme_Sub_Category_Get(string SchemeId);
        public SchemeSubCategoryConfigurationFormContainerModel Config_Scheme_Sub_Category_Form_Get(string SchemeId, string GroupId);
        public SchemeSubCategoryConfigurationDateWiseModel Config_Scheme_Sub_Category_Get_Date_Range(string GroupId);
        public void Config_Scheme_Sub_Category_Save(SchemeSubCategoryConfigurationSaveContainerModel model, AuditColumnsModel audit);
        public string Config_Scheme_Sub_Category_Check_Dup(string SchemeId, string GroupId, DateTime FromDate, DateTime ToDate);
        public string Config_Scheme_Sub_category_Delete(string GroupId);
        #endregion Scheme Sub Cost Configuration

        #region Scheme Group
        public List<ConfigSchemeGroupModel> Config_Scheme_Group_Get(bool IsActive);
        public string Config_Scheme_Group_Save(ConfigSchemeGroupSaveModel model, AuditColumnsModel audit);
        public void Config_Scheme_Group_Save_SortOrder(List<SchemeGroupOrderingModel> list, AuditColumnsModel audit);
        #endregion Scheme Group

        #region Configuration DIstrict
        public List<ConfigurationDistrictModel> Config_District_Get(string districtId);
        public string Config_District_SaveUpdate(ConfigurationDistrictSaveModel model, AuditColumnsModel audit);
        #endregion Configuration DIstrict

        #region Help Document
        public List<ConfigHelpDocumentModel> Config_Help_Document_Get(string Id = "", string RoleId = "", string SchemeId = "", string Category = "");
        public string Config_Help_Document_SaveUpdate(ConfigHelpDocumentSaveModel model, AuditColumnsModel audit);
        public ConfigHelpDocumentFormModel Config_Help_Document_Form_Get(string Id = "");
        #endregion Help Document

        #region Approval Doc COnfig
        public bool Config_Scheme_Approval_Doc_Config_Save(ApprovalDocConfigViewModel model, AuditColumnsModel audit);
        public List<ApprovalDocConfigViewModel> Config_Scheme_Approval_Doc_Config_Get(string SchemeId = "", string StatusId = "");
        #endregion Approval Doc COnfig

        #region Approval Doc Category Config
        public string Config_Approval_Doc_Category_Save(ConfigApprovalDocCategorySaveModel model, AuditColumnsModel audit);
        public List<ConfigApprovalDocCategoryModel> Config_Approval_Doc_Category_Get(string SchemeId = "", string StatusId = "", string DocCategoryId = "");
        #endregion Approval Doc Category Config

        #region Card Print Status
        public List<CardPrintStatusModel> Config_CardPrintStatusGet();
        public void UpdateCardPrintStatusSortOrder(List<CardPrintStatusOrderModel> list, AuditColumnsModel audit);
        #endregion Card Print Status

        public List<StatusMaster> Status_Get(string StatusCode = "", string Id = "", string Type = "");
    }
}
