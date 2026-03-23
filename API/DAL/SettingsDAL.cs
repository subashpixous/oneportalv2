using AutoMapper.Execution;
using DAL.Helpers;
using Dapper;
using Microsoft.Extensions.Configuration;
using Model.DomainModel;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using System.Data;
using System.Globalization;
using System.Reflection;
using System.Text.RegularExpressions;
using Utils;
using Utils.Interface;

namespace DAL
{
    public class SettingsDAL
    {
        private readonly IConfiguration _configuration;

        private readonly string connectionId = "Default";
        public SettingsDAL(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        #region Two Column Configuration

        public List<ConfigurationModel> Configuration_Get(bool IsActive = true, string ConfigurationId = "", string CategoryId = "",
            string ParentConfigurationId = "", string Value = "", string CategoryCode = "", string SchemeId = "", string Code = "", bool ShowParent = false)
        {
            dynamic @params = new
            {
                pId = ConfigurationId?.Trim() ?? "",
                pIsActive = IsActive,
                pCategoryId = CategoryId?.Trim() ?? "",
                pCategoryCode = CategoryCode?.Trim() ?? "",
                pConfigurationId = ParentConfigurationId?.Trim() ?? "",
                pValue = Value?.Trim() ?? "",
                pCode = Code?.Trim() ?? "",
                pSchemeId = SchemeId?.Trim() ?? "",
                pShowParent = ShowParent
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigurationModel>(connection, "Two_Column_Configuration_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigurationModel>();
        }
        public List<ConfigCategoryModel> Configuration_Category_Get(string CategoryCode = "", bool IsGeneralCategory = true)
        {
            dynamic @params = new
            {
                pCategoryCode = CategoryCode?.Trim() ?? "",
                pIsGeneralCategory = IsGeneralCategory,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigCategoryModel>(connection, "Two_Column_Configuration_Category_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigCategoryModel>();
        }
        public string Configuration_SaveUpdate(ConfigurationModel Configuration)
        {
            dynamic @params = new
            {
                pId = Configuration.Id,
                pCategoryId = Configuration.CategoryId,
                pConfigurationId = Configuration.ConfigurationId,
                pValue = Configuration.Value, 
                pValueTamil = Configuration.ValueTamil,
                pCode = Configuration.Code ?? "",
                pIsActive = Configuration.IsActive,
                pSchemeId = Configuration.SchemeId ?? "",
                pSavedBy = Configuration.SavedBy,
                pSavedByUserName = Configuration.SavedByUserName,
                pSavedDate = Configuration.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Two_Column_Configuration_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public List<ConfigurationSelectListModel> GetConfigurationSelectByParentConfiguration(List<string> ParentIds)
        {
            if (ParentIds != null && ParentIds.Count > 0)
            {
                dynamic @params = new
                {
                    pParentIds = string.Join(',', ParentIds)
                };
                using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                return SqlMapper.Query<ConfigurationSelectListModel>(connection, "Configuration_Get_SelectList_By_Multi_Parent", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigurationSelectListModel>();
            }
            else
            {
                return new List<ConfigurationSelectListModel>();
            }
        }
        #endregion Two Column Configuration

        #region Role
        public string Account_Role_Save(AccountRoleModel model)
        {
            dynamic @params = new
            {
                pRoleId = model.Id,
                pRoleName = model.RoleName,
                pRoleCode = model.RoleCode,
                pIsUrbanRural = model.IsUrbanRural,
                pIsActive = model.IsActive,
                pSavedBy = model.SavedBy,
                pSavedByUserName = model.SavedByUserName,
                pSavedDate = model.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Account_Role_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        public List<AccountRoleModel> Account_Role_Get(string RoleId = "", bool IsActive = true, string RoleName = "", string RoleCode = "")
        {
            dynamic @params = new
            {
                pId = RoleId?.Trim() ?? "",
                pIsActive = IsActive,
                pRoleName = RoleName?.Trim() ?? "",
                pRoleCode = RoleCode?.Trim() ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<AccountRoleModel>(connection, "Account_Role_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<AccountRoleModel>();
        }
        #endregion Role

        #region Role Privilege
        public List<AccountPrivilegeFormModel> Account_Role_Privilege_Get(string RoleId, string PrivilegeId = "")
        {
            dynamic @params = new
            {
                pRoleId = RoleId?.Trim() ?? "",
                pPrivilegeId = PrivilegeId?.Trim() ?? "",
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<AccountPrivilegeFormModel>(connection, "Account_Role_Privilege_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<AccountPrivilegeFormModel>();
        }
        public string Account_Role_Privilege_Save(AccountPrivilegeSaveModel model)
        {
            dynamic @params = new
            {
                pRolePrivilegeId = Guid.NewGuid().ToString(),
                pRoleId = model.RoleId,
                pPrivilegeId = model.PrivilegeId,
                pIsSelected = model.IsSelected,
                pSavedBy = model.SavedBy,
                pSavedByUserName = model.SavedByUserName,
                pSavedDate = model.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Account_Role_Privilege_Save", @params, commandType: CommandType.StoredProcedure);
        }
        #endregion Role Privilege

        #region User
        public List<AccountUserModel> Account_Key_Contact_User_Get(string UserId, string DistrictIds, string SchemeIds, List<string> RoleIds)
        {
            string Query = @"SELECT 
                            au.UserId, au.FirstName, au.LastName, au.Email, au.Mobile, 
	                        au.DOB, au.IsSuperAdmin, au.JobTitle,
	                        au.ForgotPasswordOTP, au.Address, au.PofileImageId, au.PofileThumbnileImageId,
	                        au.UserNumber,
                            au.Telephone,
                            ar.RoleCode,
                            ar.RoleName,
                            gender.Value as 'Gender',
                            usergroup.Value as 'Usergroup'
                            FROM Account_User au
                            LEFT JOIN two_column_configuration_values gender ON gender.Id = au.GenderId
                            LEFT JOIN two_column_configuration_values usergroup ON usergroup.Id = au.UserGroup
                            LEFT JOIN account_role ar ON ar.Id = au.RoleId
                            LEFT JOIN account_login al ON al.UserId = au.UserId 
                            WHERE au.IsActive = 1 AND al.UserId != '<USERID_REPLACE>' AND <DISTRICTID_REPLACE> AND <SCHEMEID_REPLACE> AND <ROLEID_REPLACE>;"
            ;

            if (RoleIds != null && RoleIds.Count > 0)
            {
                string searchCondition = " (";
                foreach (string roleId in RoleIds)
                {
                    if (!string.IsNullOrWhiteSpace(roleId))
                    {
                        searchCondition += " ar.Id LIKE " + "'%" + roleId + "%' OR ";
                    }
                }
                int sub_pos = searchCondition.Length - 3;
                if (!(sub_pos < 0) && searchCondition.Substring(searchCondition.Length - 3) == "OR ")
                {
                    searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                }
                searchCondition += ") ";

                Query = Query.Replace("<ROLEID_REPLACE>", searchCondition);
            }
            else
            {
                Query = Query.Replace("<ROLEID_REPLACE>", "(1=1)");
            }

            if (!string.IsNullOrWhiteSpace(DistrictIds))
            {
                List<string> list = DistrictIds.Split(",").ToList();

                if (list.Count > 0)
                {
                    string searchCondition = " (";
                    foreach (string districtId in list)
                    {
                        if (!string.IsNullOrWhiteSpace(districtId))
                        {
                            searchCondition += " au.DistrictIds LIKE " + "'%" + districtId + "%' OR ";
                        }
                    }
                    int sub_pos = searchCondition.Length - 3;
                    if (!(sub_pos < 0) && searchCondition.Substring(searchCondition.Length - 3) == "OR ")
                    {
                        searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    }
                    searchCondition += ") ";

                    Query = Query.Replace("<DISTRICTID_REPLACE>", searchCondition);
                }
                else
                {
                    Query = Query.Replace("<DISTRICTID_REPLACE>", "(1=0)");
                }
            }

            if (!string.IsNullOrWhiteSpace(SchemeIds))
            {
                List<string> list = SchemeIds.Split(",").ToList();

                if (list.Count > 0)
                {
                    string searchCondition = " (";
                    foreach (string SchemeId in list)
                    {
                        if (!string.IsNullOrWhiteSpace(SchemeId))
                        {
                            searchCondition += " au.SchemesIds LIKE " + "'%" + SchemeId + "%' OR ";
                        }
                    }
                    int sub_pos = searchCondition.Length - 3;
                    if (!(sub_pos < 0) && searchCondition.Substring(searchCondition.Length - 3) == "OR ")
                    {
                        searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    }
                    searchCondition += ") ";

                    Query = Query.Replace("<SCHEMEID_REPLACE>", searchCondition);
                }
                else
                {
                    Query = Query.Replace("<SCHEMEID_REPLACE>", "(1=0)");
                }
            }

            Query = Query.Replace("<USERID_REPLACE>", UserId);

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<AccountUserModel>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<AccountUserModel>();
        }
        public List<AccountUserModel> User_Get(bool IsActive = true, string UserId = "", string DistrictId = "", string DivisionId = "",
            string UserGroup = "", string RoleId = "", string MobileNumber = "", string Email = "",
            string UserGroupName = "", string SchemeId = "", string BranchId = "", string BankId = "")
        {
            dynamic @params = new
            {
                pUserId = UserId?.Trim() ?? "",
                pIsActive = IsActive,
                pDistrictId = string.IsNullOrWhiteSpace(DistrictId) ? "" : ("%" + DistrictId?.Trim() + "%"),
                pDivisionId = string.IsNullOrWhiteSpace(DivisionId) ? "" : ("%" + DivisionId?.Trim() + "%"),
                pSchemeId = string.IsNullOrWhiteSpace(SchemeId) ? "" : ("%" + SchemeId?.Trim() + "%"),
                pBranchId = string.IsNullOrWhiteSpace(BranchId) ? "" : ("%" + BranchId?.Trim() + "%"),
                pBankId = string.IsNullOrWhiteSpace(BankId) ? "" : ("%" + BankId?.Trim() + "%"),
                pUserGroup = UserGroup?.Trim() ?? "",
                pUserGroupName = UserGroupName?.Trim() ?? "",
                pRoleId = RoleId?.Trim() ?? "",
                pMobile = MobileNumber?.Trim() ?? "",
                pEmail = Email?.Trim() ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<AccountUserModel>(connection, "Account_User_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<AccountUserModel>();
        }
        public List<string> getUserMobile(string pZoneIds)
        {
            string query = @"
    SELECT Mobile 
FROM account_user 
WHERE FIND_IN_SET(ZoneIds, @ZoneIds) and RoleId=(select Id from account_role where RoleCode='DO')";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return connection.Query<string>(query, new { ZoneIds = pZoneIds })?.ToList() ?? new List<string>();
        }
        public List<UserNextNumberModel> User_GetNextNumber()
        {
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<UserNextNumberModel>(connection, "Account_User_GetNextNumber_Out", commandType: CommandType.StoredProcedure)?.ToList() ?? new List<UserNextNumberModel>();
        }
        public string User_SaveUpdate(AccountUserModel model)
        {
            DateTime? dob = model.DOB == DateTime.MinValue ? null : model.DOB;

            dynamic @params = new
            {
                pUserId = model.UserId,
                pFirstName = model.FirstName,
                pLastName = model.LastName,
                pEmail = model.Email,
                pMobile = model.Mobile,
                pTelephone = model.Telephone,
                pRoleId = model.RoleId,
                pUserGroup = model.UserGroup,
                pDOB = dob,
                pGenderId = model.GenderId,
                pDistrictIds = model.DistrictIds,
                pLocalBodyIds = model.LocalBodyIds,
                pNameOfLocalBodyIds = model.NameOfLocalBodyIds,
                pBlockIds = model.BlockIds,
                pCorporationIds = model.CorporationIds,
                pMunicipalityIds = model.MunicipalityIds,
                pTownPanchayatIds = model.TownPanchayatIds,
                pVillagePanchayatIds = model.VillagePanchayatIds,
                pZoneIds = model.ZoneIds,
                pSchemesIds = model.SchemesIds,
                pBankIds = model.BankIds,
                pBranchIds = "",
                pIsSuperAdmin = model.IsSuperAdmin,
                pJobTitle = model.JobTitle,
                pAddress = model.Address,
                pPassword = EncryptDecrypt.Encrypt(model.Password),
                pUserName = model.UserName,
                pIsActive = model.IsActive,
                pCardPrintStatusIds = model.CardPrintStatusIds,

                pSavedBy = model.SavedBy,
                pSavedByUserName = model.SavedByUserName,
                pSavedDate = model.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Account_User_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public string User_Activate(AccountUserModel model)
        {
            dynamic @params = new
            {
                pUserId = model.UserId,
                pSavedBy = model.SavedBy,
                pSavedByUserName = model.SavedByUserName,
                pSavedDate = model.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Account_User_Activate", @params, commandType: CommandType.StoredProcedure);
        }
        
        public List<AccountUserModel> User_Get(UserFilterModel model, out int TotalCount)
        {
            TotalCount = 0;
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            var baseQuery = @"SELECT SQL_CALC_FOUND_ROWS 
                au.UserId, au.FirstName, au.LastName, au.Email, au.Mobile, au.Telephone,
                au.RoleId, au.DOB, au.Address, au.PofileImageId, au.PofileThumbnileImageId,
                au.UserNumber,
                ar.RoleCode,
                ar.RoleName,
                gender.Value as 'Gender',
                usergroup.Value as 'Usergroup',
                au.CreatedBy, au.CreatedDate, au.CreatedByUserName, 
                au.ModifiedBy, au.ModifiedDate, au.ModifiedByUserName, au.DeletedBy, au.DeletedByUserName, au.DeletedDate
                FROM account_user au
                LEFT JOIN two_column_configuration_values gender ON gender.Id = au.GenderId
                LEFT JOIN two_column_configuration_values usergroup ON usergroup.Id = au.UserGroup
                LEFT JOIN account_role ar ON ar.Id = au.RoleId
                LEFT JOIN account_login al ON al.UserId = au.UserId";

            var whereClauses = new List<string>();
            var parameters = new DynamicParameters();

            if (model != null)
            {
                if (model.Where != null)
                {
                    PropertyInfo[] whereProperties = typeof(UserWhereClauseProperties).GetProperties();
                    foreach (var property in whereProperties)
                    {
                        var value = property.GetValue(model.Where)?.ToString() ?? "";
                        if (value == "True") value = "1";
                        else if (value == "False") value = "0";
                        if (!string.IsNullOrWhiteSpace(value))
                        {
                            string paramName = $"@{property.Name}";
                            whereClauses.Add($"au.{property.Name} = {paramName}");
                            parameters.Add(paramName, value.Replace('\'', '%').Trim());
                        }
                    }
                }
                if (model.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in model.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            string columnName = item.FieldName.ToLower() switch
                            {
                                "usernumber" => "au.UserNumber",
                                "firstname" => "au.FirstName",
                                "lastname" => "au.LastName",
                                "email" => "au.Email",
                                "usergroupname" => "usergroup.Value",
                                "mobile" => "au.Mobile",
                                "modifiedbyusername" => "au.ModifiedByUserName",
                                "lastupdatedusername" => "au.ModifiedByUserName",
                                "rolename" => "ar.RoleName",
                                "dob" => "DATE_FORMAT(au.DOB, '%d-%m-%Y')",
                                "lastupdateddate" => "DATE_FORMAT(au.ModifiedDate, '%d-%m-%Y')",
                                _ => ""
                            };
                            if (!string.IsNullOrEmpty(columnName))
                            {
                                string paramName = $"@cs_{item.FieldName}";
                                whereClauses.Add($"{columnName} LIKE {paramName}");
                                parameters.Add(paramName, $"%{item.SearchString.Replace('\'', '%').Trim()}%");
                            }
                        }
                    }
                }
                if (!string.IsNullOrWhiteSpace(model?.SearchString))
                {
                    string search = $"%{model.SearchString.Trim()}%";
                    whereClauses.Add(@"(
                        au.FirstName LIKE @search OR
                        au.LastName LIKE @search OR
                        au.Email LIKE @search OR
                        au.Mobile LIKE @search OR
                        gender.Value LIKE @search OR
                        au.UserNumber LIKE @search OR
                        au.Address LIKE @search OR
                        ar.RoleName LIKE @search OR
                        ar.RoleCode LIKE @search OR
                        DATE_FORMAT(au.DOB, '%d-%m-%Y') LIKE @search OR
                        DATE_FORMAT(au.ModifiedDate, '%d-%m-%Y') LIKE @search
                    )");
                    parameters.Add("@search", search);
                }
            }

            var queryBuilder = new System.Text.StringBuilder(baseQuery);
            if (whereClauses.Count > 0)
            {
                queryBuilder.Append(" WHERE ");
                queryBuilder.Append(string.Join(" AND ", whereClauses));
            }

            // Sorting and Paging
            string orderBy = " ORDER BY au.CreatedDate ";
            if (model?.Sorting != null && !string.IsNullOrWhiteSpace(model?.Sorting.FieldName) && !string.IsNullOrWhiteSpace(model?.Sorting.Sort))
            {
                string fieldName = model.Sorting.FieldName.ToLower() switch
                {
                    "usernumber" => "au.UserNumber",
                    "firstname" => "au.FirstName",
                    "lastname" => "au.LastName",
                    "email" => "au.Email",
                    "usergroupname" => "usergroup.Value",
                    "department" => "ar.RoleName",
                    "mobile" => "au.Mobile",
                    "modifiedbyusername" => "au.ModifiedByUserName",
                    _ => "au.ModifiedDate"
                };
                orderBy = $" ORDER BY {fieldName} {model.Sorting.Sort} ";
            }
            queryBuilder.Append(orderBy);

            if (model?.Take > 0)
            {
                queryBuilder.Append(" LIMIT @take OFFSET @skip ");
                parameters.Add("@take", model.Take);
                parameters.Add("@skip", model.Skip);
            }

            var result = SqlMapper.Query<AccountUserModel>(connection, queryBuilder.ToString(), parameters, commandType: CommandType.Text)?.ToList() ?? new List<AccountUserModel>();
            TotalCount = connection.ExecuteScalar<int>("SELECT FOUND_ROWS();");
            return result;
        }
        //public AccountUserFormDetailModel User_Form_Get(string UserId = "")
        //{
        //    AccountUserFormDetailModel model = new AccountUserFormDetailModel();

        //    dynamic @params = new
        //    {
        //        pUserId = UserId
        //    };

        //    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
        //    var multi = SqlMapper.QueryMultiple(connection, "Account_UserForm_Get", @params, commandType: CommandType.StoredProcedure);

        //    model.RoleList = multi.Read<SelectListItem>();
        //    model.GenderList = multi.Read<SelectListItem>();
        //    model.UserGroupList = multi.Read<SelectListItem>();
        //    model.DistrictList = multi.Read<SelectListItem>();
        //    model.SchemeList = multi.Read<SelectListItem>();
        //    model.BankList = multi.Read<SelectListItem>();
        //    model.BranchList = multi.Read<SelectListItem>();
        //    model.CardPrintStatusList = multi.Read<SelectListItem>();

        //    // New lists for additional fields
        //    model.LocalBodyList = multi.Read<SelectListItem>();
        //    model.NameOfTheLocalBodyList = multi.Read<SelectListItem>();
        //    model.BlockList = multi.Read<SelectListItem>();
        //    model.CorporationList = multi.Read<SelectListItem>();
        //    model.MunicipalityList = multi.Read<SelectListItem>();
        //    model.TownPanchayatList = multi.Read<SelectListItem>();
        //    model.VillagePanchayatList = multi.Read<SelectListItem>();
        //    model.ZoneList = multi.Read<SelectListItem>();


        //    return model;
        //}


        public AccountUserFormDetailModel User_Form_Get(string UserId = "")
        {
            AccountUserFormDetailModel model = new AccountUserFormDetailModel();

            dynamic @params = new
            {
                pUserId = UserId
            };

            using (IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
            {
                using (var multi = SqlMapper.QueryMultiple(connection, "Account_UserForm_Get", @params, commandType: CommandType.StoredProcedure))
                {
                    // Remove .ToList() since Read<SelectListItem>() already returns List<SelectListItem>
                    model.RoleList = multi.Read<SelectListItem>();
                    model.GenderList = multi.Read<SelectListItem>();
                    model.UserGroupList = multi.Read<SelectListItem>();
                    model.DistrictList = multi.Read<SelectListItem>();
                    model.SchemeList = multi.Read<SelectListItem>();
                    model.BankList = multi.Read<SelectListItem>();
                    model.BranchList = multi.Read<SelectListItem>();
                    model.CardPrintStatusList = multi.Read<SelectListItem>();

                    // New lists for additional fields
                    model.LocalBodyList = multi.Read<SelectListItem>();
                    model.NameOfTheLocalBodyList = multi.Read<SelectListItem>();
                    model.BlockList = multi.Read<SelectListItem>();
                    model.CorporationList = multi.Read<SelectListItem>();
                    model.MunicipalityList = multi.Read<SelectListItem>();
                    model.TownPanchayatList = multi.Read<SelectListItem>();
                    model.VillagePanchayatList = multi.Read<SelectListItem>();
                    model.ZoneList = multi.Read<SelectListItem>();
                }
            }

            return model;
        }
        public string User_Save_Profile(UserProfileImageSaveModel model)
        {
            dynamic @params = new
            {
                pUserId = model.UserId,
                pPofileImageId = model.PofileImageId,
                pPofileThumbnileImageId = model.PofileThumbnileImageId,
                pSavedBy = model.SavedBy,
                pSavedByUserName = model.SavedByUserName,
                pSavedDate = model.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Account_User_Activate", @params, commandType: CommandType.StoredProcedure);
        }
        public List<CallletterUserModel> GetUserByRoleAndDistrict(string DistrictId, string RoleCode)
        {
            string Query = @"SELECT AUD.UserId, AUD.FirstName, AUD.LastName, CONCAT(AUD.FirstName,' ', AUD.LastName) as 'Name', AUD.Email, AUD.Mobile, AUD.JobTitle FROM account_user AUD 
                            WHERE AUD.RoleId=(SELECT mr.Id FROM account_role mr WHERE mr.RoleCode='<REPLACE_ROLE_CODE_HERE>' LIMIT 1) AND ifnull(AUD.IsActive,0)!=0
                            AND AUD.DistrictIds like '%<REPLACE_DISTRICT_ID_HERE>%' LIMIT 1;";

            Query = Query.Replace("<REPLACE_ROLE_CODE_HERE>", RoleCode);
            Query = Query.Replace("<REPLACE_DISTRICT_ID_HERE>", DistrictId);

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<CallletterUserModel>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<CallletterUserModel>();
        }
        public List<CallletterUserModel> GetUserByRoleIdAndDistrict(string DistrictId, string RoleId)
        {
            string Query = @"SELECT AUD.UserId, AUD.FirstName, AUD.LastName, CONCAT(AUD.FirstName,' ', AUD.LastName) as 'Name', AUD.Email, AUD.Mobile, AUD.JobTitle FROM account_user AUD 
                            WHERE AUD.RoleId=(SELECT mr.Id FROM account_role mr WHERE mr.Id='<REPLACE_ROLE_ID_HERE>' LIMIT 1) AND ifnull(AUD.IsActive,0)!=0
                            AND AUD.DistrictIds like '%<REPLACE_DISTRICT_ID_HERE>%' LIMIT 1;";

            Query = Query.Replace("<REPLACE_ROLE_ID_HERE>", RoleId);
            Query = Query.Replace("<REPLACE_DISTRICT_ID_HERE>", DistrictId);

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<CallletterUserModel>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<CallletterUserModel>();
        }
        public UserFieldValueModel User_Get_FieldValueList()
        {
            UserFieldValueModel model = new UserFieldValueModel();

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Account_User_Get_FieldValueList", commandType: CommandType.StoredProcedure);

            model.District_KeyValuePairs = multi.Read<KeyValuePairs>().ToList();
            model.Bank_KeyValuePairs = multi.Read<KeyValuePairs>().ToList();
            model.Branch_KeyValuePairs = multi.Read<KeyValuePairs>().ToList();
            model.Scheme_KeyValuePairs = multi.Read<KeyValuePairs>().ToList();
            model.Gender_KeyValuePairs = multi.Read<KeyValuePairs>().ToList();
            model.Role_KeyValuePairs = multi.Read<KeyValuePairs>().ToList();
            model.UserList = multi.Read<UserValidationModel>().ToList();

            return model;
        }
        public BankBranchMappingSavedModel User_Bank_Branch_Get(string UserId, string BankIds, string DistrictIds)
        {
            BankBranchMappingSavedModel model = new BankBranchMappingSavedModel();

            dynamic @params = new
            {
                pUserId = UserId,
                pBankIds = BankIds,
                pDistrictIds = DistrictIds
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Account_User_Get_Bank_Branch", @params, commandType: CommandType.StoredProcedure);

            model.BankList = multi.Read<ConfigurationModel>();
            model.BranchList = multi.Read<ConfigurationModel>();
            model.Mappings = multi.Read<UserBankBranchMappingSavedModel>();

            return model;
        }

        public void User_Bank_Branch_Save(UserBankBranchMappingModel model, AuditColumnsModel audit)
        {
            User_Bank_Branch_Remove(model.UserId);

            foreach (var item in model.BankBranch)
            {
                int chunkSize = 1000;

                if (item.SelectedBranchIds.Count <= chunkSize)
                {
                    User_Bank_Branch_Save(model.UserId, item.SelectedBranchIds, item.IsAllBranch, item.BankId, audit);
                }
                else
                {
                    int totalChunks = (int)Math.Ceiling((double)item.SelectedBranchIds.Count / chunkSize);
                    for (int i = 0; i < totalChunks; i++)
                    {
                        List<string> chunk = item.SelectedBranchIds.Skip(i * chunkSize).Take(chunkSize).ToList();

                        User_Bank_Branch_Save(model.UserId, chunk, item.IsAllBranch, item.BankId, audit);
                    }
                }
            }
        }

        private string User_Bank_Branch_Save(string userId, List<string> SelectedBranchIds, bool IsAllBranch, string BankId, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pUserId = userId,
                pBranchIds = string.Join(',', SelectedBranchIds),
                pIsAllBranch = IsAllBranch,
                pBankId = BankId,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Account_User_Save_Bank_Branch", @params, commandType: CommandType.StoredProcedure);
        }
        public bool User_Bank_Branch_Remove(string userId)
        {
            string Query = "DELETE FROM account_user_bank_branch WHERE UserId='" + userId + "';";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, Query.ToLower(), commandType: CommandType.Text) > 0;
        }
        public string User_Get_Branch_By_UserId(string userId)
        {
            string Query = "SELECT GROUP_CONCAT(BranchIds separator ',') FROM account_user_bank_branch WHERE IFNULL(BranchIds,'') != '' AND UserId='" + userId + "';";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, Query.ToLower(), commandType: CommandType.Text);
        }

        #endregion User

        #region ApprovalFlow
        public List<ApprovalFlowMaster> ApprovalFlow_Get(string RoleId = "", string SchemeId = "")
        {
            dynamic @params = new
            {
                pRoleId = RoleId?.Trim() ?? "",
                pSchemeId = SchemeId?.Trim() ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApprovalFlowMaster>(connection, "Approval_Flow_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApprovalFlowMaster>();
        }
        public string ApprovalFlow_Add_Role(ApprovalFlowAddRoleModel_API model)
        {
            if (model.RoleIds != null)
            {
                List<ApprovalFlowMaster> exist_role_id_list = ApprovalFlow_Get(SchemeId: model.SchemeId);

                List<ApprovalFlowMaster> exist_role_id_to_remove = exist_role_id_list?.Where(x => !model.RoleIds.Contains(x.RoleId)).ToList() ?? new List<ApprovalFlowMaster>();

                List<string> role_id_to_stay_exist = new List<string>();
                if (exist_role_id_to_remove.Count > 0)
                {
                    role_id_to_stay_exist = exist_role_id_list?.Where(x => !(exist_role_id_to_remove.Select(x => x.RoleId).ToList().Contains(x.RoleId)))?.Select(x => x.RoleId)?.ToList() ?? new List<string>();
                }
                List<string> role_ids_to_add_new = new List<string>();
                if (role_id_to_stay_exist.Count > 0)
                {
                    role_ids_to_add_new = model.RoleIds.Where(x => !role_id_to_stay_exist.Contains(x))?.ToList() ?? new List<string>();
                }

                foreach (ApprovalFlowMaster remove_item in exist_role_id_to_remove)
                {
                    ApprovalFlow_Remove_Role(new ApprovalFlowMaster()
                    {
                        Id = remove_item.Id,
                        SchemeId = remove_item.SchemeId,
                        RoleId = remove_item.RoleId,
                        SavedBy = model.SavedBy,
                        SavedByUserName = model.SavedByUserName,
                        SavedDate = model.SavedDate,
                    });
                }

                foreach (string roleId in model.RoleIds)
                {
                    dynamic @params = new
                    {
                        pId = Guid.NewGuid().ToString(),
                        pRoleId = roleId,
                        pSchemeId = model.SchemeId,
                        pSavedBy = model.SavedBy,
                        pSavedByUserName = model.SavedByUserName,
                        pSavedDate = model.SavedDate,
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    SqlMapper.ExecuteScalar<string>(connection, "Approval_Flow_Add_Role", @params, commandType: CommandType.StoredProcedure);
                }
            }
            return "";
        }
        public string ApprovalFlow_Remove_Role(ApprovalFlowMaster model)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pSchemeId = model.SchemeId,
                pRoleId = model.RoleId,
                pSavedBy = model.SavedBy,
                pSavedByUserName = model.SavedByUserName,
                pSavedDate = model.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Approval_Flow_Remove_Role", @params, commandType: CommandType.StoredProcedure);
        }
        public string ApprovalFlow_SaveUpdate(ApprovalFlowMaster model)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pSchemeId = model.SchemeId,
                pRoleId = model.RoleId,
                pOrderNumber = model.OrderNumber,
                pIsNA = model.IsNA,
                pApprovalFlowId = model.ApprovalFlowId,
                pReturnFlowId = model.ReturnFlowId,
                pIsFinal = model.IsFinal,
                pSavedBy = model.SavedBy,
                pSavedByUserName = model.SavedByUserName,
                pSavedDate = model.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Approval_Flow_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        #endregion ApprovalFlow

        #region Application Privilege
        public List<ApplicationPrivilegeMaster> Application_Privilege_Get(string SchemeId = "", string RoleId = "", string StatusId = "", string Id = "")
        {
            string Query = @"SELECT ap.Id, ap.RoleId, ap.StatusId, ap.SchemeId, ap.CanCreate, ap.CanUpdate, ap.CanView, ap.CanDelete, ap.CanApprove, 
                            ap.CanGetMail, ap.CanGetSMS, ap.CanReturn, ap.UcView, ap.UcUpload, ap.Form3View, ap.Form3Upload,
                            ap.CreatedBy, 
                            ap.CreatedByUserName, ap.CreatedDate, ap.ModifiedBy, ap.ModifiedByUserName, ap.ModifiedDate,
                            ap.DeletedBy, ap.DeletedByUserName, ap.DeletedDate,
                            sm.Code AS 'StatusCode', sm.Value as 'Status'
                            FROM Application_privileages ap
                            INNER JOIN two_column_configuration_values sm ON sm.Id = StatusId
                             WHERE Ifnull(ap.Id, '') <> '' AND ";

            if (!string.IsNullOrEmpty(SchemeId))
            {
                Query += "ap.SchemeId='" + SchemeId + "' AND ";
            }
            if (!string.IsNullOrEmpty(RoleId))
            {
                Query += "ap.RoleId='" + RoleId + "' AND ";
            }
            if (!string.IsNullOrEmpty(StatusId))
            {
                Query += "ap.StatusId='" + StatusId + "' AND ";
            }
            if (!string.IsNullOrEmpty(Id))
            {
                Query += "ap.Id='" + Id + "' AND ";
            }

            Query = Query.Remove(Query.Length - 4);

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationPrivilegeMaster>(connection, Query.ToLower(), commandType: CommandType.Text).ToList() ?? new List<ApplicationPrivilegeMaster>();
        }
        public List<SelectListItem> Application_Privilege_Status_List_Get(string SchemeId = "", string RoleId = "", string StatusId = "", string Id = "")
        {
            string Query = @"SELECT ssm.StatusId as 'Value', sc.Value as 'Text' FROM config_scheme_status_mapping ssm 
                            INNER JOIN two_column_configuration_values sc ON sc.Id = ssm.StatusId 
                            WHERE Ifnull(ssm.StatusId, '') <> '' AND ";

            if (!string.IsNullOrEmpty(SchemeId))
            {
                Query += "ap.SchemeId='" + SchemeId + "' AND ";
            }
            if (!string.IsNullOrEmpty(RoleId))
            {
                Query += "ap.RoleId='" + RoleId + "' AND ";
            }
            if (!string.IsNullOrEmpty(StatusId))
            {
                Query += "ap.StatusId='" + StatusId + "' AND ";
            }
            if (!string.IsNullOrEmpty(Id))
            {
                Query += "ap.Id='" + Id + "' AND ";
            }

            Query = Query.Remove(Query.Length - 4);

            Query = Query + " GROUP BY ssm.StatusId ORDER BY ssm.SchemeId";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<SelectListItem>(connection, Query.ToLower(), commandType: CommandType.Text).ToList() ?? new List<SelectListItem>();
        }
        public string Application_Privilege_Save(RolePrivilegeModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pRoleId = model.RoleId,
                pSchemeId = model.SchemeId,
                pStatusId = model.StatusId,
                pCanCreate = model.CanCreate,
                pCanUpdate = model.CanUpdate,
                pCanView = model.CanView,
                pCanDelete = model.CanDelete,
                pCanApprove = model.CanApprove,
                pCanGetMail = model.CanGetMail,
                pCanGetSMS = model.CanGetSMS,
                pCanReturn = model.CanReturn,

                pUcView = model.UcView,
                pUcUpload = model.UcUpload,
                pForm3View = model.Form3View,
                pForm3Upload = model.Form3Upload,

                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_privileage_Save", @params, commandType: CommandType.StoredProcedure);
        }
        #endregion Application Privilege

        #region Scheme Status Mapping
        public void Scheme_Status_Mapping_Delete(string SchemeId)
        {
            string Query = @"DELETE FROM config_scheme_status_mapping WHERE SchemeId='" + SchemeId + "';";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            SqlMapper.Execute(connection, Query.ToLower(), commandType: CommandType.Text);
        }
        public List<ConfigSchemeStatusMappingModel> Scheme_Status_Mapping_Get(string SchemeId)
        {
            string Query = @"SELECT ssm.Id, ssm.StatusId, ssm.SchemeId, ssm.SortOrder, scheme.Value as 'SchemeName', scheme.Code as 'SchemeCode',
                            statusm.Value as 'StatusName', statusm.Code as 'StatusCode',
                            ssm.CreatedBy, ssm.CreatedByUserName, ssm.CreatedDate, ssm.ModifiedBy, ssm.ModifiedByUserName, ssm.ModifiedDate,
                            ssm.DeletedBy, ssm.DeletedByUserName, ssm.DeletedDate 
                            FROM config_scheme_status_mapping ssm
                            INNER JOIN two_column_configuration_values scheme ON scheme.Id = ssm.SchemeId
                            INNER JOIN two_column_configuration_values statusm ON statusm.Id = ssm.StatusId WHERE ssm.SchemeId='" + SchemeId + "' ORDER BY ssm.SortOrder;";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigSchemeStatusMappingModel>(connection, Query.ToLower(), commandType: CommandType.Text).ToList() ?? new List<ConfigSchemeStatusMappingModel>();
        }
        public string Scheme_Status_Mapping_Save(string SchemeId, string StatusId, int SortOrder, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pSchemeId = SchemeId,
                pStatusId = StatusId,
                pSortOrder = SortOrder,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Config_Scheme_Status_Mapping_Save", @params, commandType: CommandType.StoredProcedure);
        }
        #endregion Scheme Status Mapping

        #region Document Configuration
        public List<ApplicationDocumentConfigurationModel> Document_Configuration_Get(string Id = "", string SchemeId = "", string DocumentGroupId = "", bool IsActive = true)
        {
            dynamic @params = new
            {
                pId = Id,
                pSchemeId = SchemeId,
                pDocumentGroupId = DocumentGroupId,
                pIsActive = IsActive
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApplicationDocumentConfigurationModel>(connection, "Application_Document_Configuration_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApplicationDocumentConfigurationModel>();
        }
        public bool Document_Configuration_Update_IsRequired(string Id = "", bool IsRequired = true)
        {
            string Query = "UPDATE config_scheme_document_configuration SET IsRequired = " + (IsRequired ? "1" : "0") + " WHERE Id = '" + Id + "';";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, Query.ToLower(), commandType: CommandType.Text) > 0;
        }
        public string Document_Configuration_Save(ApplicationDocumentConfigurationModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pSchemeId = model.SchemeId,
                pDocumentGroupId = model.DocumentGroupId,
                pDocumentCategoryId = model.DocumentCategoryId,
                pIsRequired = model.IsRequired,
                pIsActive = model.IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Application_Document_Configuration_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public List<DocumentGroupConfigurationOrderModel> Document_Configuration_GetDocumentGroupsBySchemeId(string schemeId)
        {
            string Query = "SELECT DISTINCT SchemeId, DocumentGroupId, DocumentGroupName, SortOrder FROM config_scheme_document_configuration WHERE SchemeId='" + schemeId + "'";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            List<DocumentGroupConfigurationOrderModel> list = SqlMapper.Query<DocumentGroupConfigurationOrderModel>(connection, Query.ToLower(), commandType: CommandType.Text).ToList() ?? new List<DocumentGroupConfigurationOrderModel>();
            return list.Distinct().OrderBy(o => o.SortOrder).ToList();
        }
        public void Document_Configuration_Group_Order_Save(string schemeId, string groupId, int order, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pSchemeId = schemeId,
                pDocumentGroupId = groupId,
                pSortOrder = order,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            SqlMapper.Execute(connection, "Application_Document_Group_Order_Save", @params, commandType: CommandType.StoredProcedure);
        }
        public List<SchemRequiredCategoryReadModelDocuments> Document_Configuration_GetBySchemeId(string schemeId)
        {
            string Query = @"select 
                            csdc.DocumentGroupName,
                            (CASE WHEN IFNULL(dc.ValueTamil,'')!='' THEN CONCAT(dc.Value,' / ', dc.ValueTamil) ELSE dc.Value END) AS 'DocumentCategory',
                            (select GROUP_CONCAT((CASE WHEN IFNULL(tcv.ValueTamil,'')!='' THEN CONCAT(tcv.Value,' / ', tcv.ValueTamil) ELSE tcv.Value END) separator ',') 
                            from two_column_configuration_values tcv where IFNULL(tcv.IsActive,0) = 1 AND FIND_IN_SET(tcv.ConfigurationId, csdc.DocumentCategoryId)) as 'AcceptedDocuments'
                            from config_scheme_document_configuration csdc 
                            inner join two_column_configuration_values dc on dc.Id = csdc.DocumentCategoryId AND IFNULL(dc.IsActive,0) = 1
                            WHERE IFNULL(csdc.IsActive,0) = 1 AND csdc.SchemeId = '<SCHEME_ID_REPLACE>';";
            Query = Query.Replace("<SCHEME_ID_REPLACE>", schemeId);

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<SchemRequiredCategoryReadModelDocuments>(connection, Query.ToLower(), commandType: CommandType.Text).ToList() ?? new List<SchemRequiredCategoryReadModelDocuments>();
        }
        public List<SchemRequiredDocumentGroups> Document_Configuration_GetByGroupId(string groupId)
        {
            //    string Query = @"
            //SELECT 
            //    csdc.DocumentGroupName,
            //    (CASE WHEN IFNULL(dc.ValueTamil,'')!='' THEN CONCAT(dc.Value,' / ', dc.ValueTamil) ELSE dc.Value END) AS 'DocumentCategory',
            //    (SELECT GROUP_CONCAT((CASE WHEN IFNULL(tcv.ValueTamil,'')!='' THEN CONCAT(tcv.Value,' / ', tcv.ValueTamil) ELSE tcv.Value END) SEPARATOR ', ') 
            //     FROM two_column_configuration_values tcv 
            //     WHERE IFNULL(tcv.IsActive,0) = 1 AND FIND_IN_SET(tcv.ConfigurationId, csdc.DocumentCategoryId)) AS 'AcceptedDocuments'
            //FROM config_scheme_document_configuration csdc 
            //INNER JOIN two_column_configuration_values dc ON dc.Id = csdc.DocumentCategoryId AND IFNULL(dc.IsActive,0) = 1
            //WHERE IFNULL(csdc.IsActive,0) = 1 
            //AND FIND_IN_SET(csdc.SchemeId, IFNULL((SELECT SchemeIds FROM config_scheme_group WHERE Id = @GroupId LIMIT 1), csdc.SchemeId)) > 0;";
            string Query = @"SELECT 
    csdc.DocumentGroupName,

    CASE 
        WHEN IFNULL(dc.ValueTamil,'')!=''
        THEN CONCAT(dc.Value,' / ', dc.ValueTamil)
        ELSE dc.Value
    END AS DocumentCategory,

    GROUP_CONCAT(
        CASE 
            WHEN IFNULL(tcv.ValueTamil,'')!=''
            THEN CONCAT(tcv.Value,' / ', tcv.ValueTamil)
            ELSE tcv.Value
        END SEPARATOR ', '
    ) AS AcceptedDocuments

FROM config_scheme_document_configuration csdc

INNER JOIN two_column_configuration_values dc 
    ON dc.Id = csdc.DocumentCategoryId
    AND IFNULL(dc.IsActive,0) = 1

LEFT JOIN two_column_configuration_values tcv
    ON FIND_IN_SET(tcv.ConfigurationId, csdc.DocumentCategoryId)
    AND IFNULL(tcv.IsActive,0) = 1

WHERE IFNULL(csdc.IsActive,0) = 1

AND FIND_IN_SET(
    csdc.SchemeId,
    IFNULL(
        (SELECT SchemeIds 
         FROM config_scheme_group 
         WHERE Id = @GroupId 
         LIMIT 1),
        csdc.SchemeId
    )
)

GROUP BY csdc.Id";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            // Using Dapper parameterized query for safety
            List<SchemRequiredCategoryReadModelDocuments> list = SqlMapper.Query<SchemRequiredCategoryReadModelDocuments>(
                connection,
                Query,
                new { GroupId = groupId },
                commandType: CommandType.Text).ToList() ?? new List<SchemRequiredCategoryReadModelDocuments>();

            // Grouping logic to match your existing frontend model
            // Inside SettingDAL.cs

            var groupList = list.GroupBy(x => x.DocumentGroupName).Select(y => new SchemRequiredDocumentGroups()
            {
                GroupName = y.Key,
                RequiredDocumentCategory = y.ToList()
                    .Select(k => new SchemRequiredCategoryDocuments()
                    {
                        CategoryName = k.DocumentCategory,
                        ApplicableDocuments = k.AcceptedDocuments?.Split(',')?.ToList() ?? new List<string>()
                    })
                    //ADD THESE TWO LINES TO REMOVE DUPLICATES
                    .GroupBy(doc => doc.CategoryName)
                    .Select(uniqueDoc => uniqueDoc.First())
                    // 
                    .ToList()
            }).ToList();

            return groupList;
        }
        public List<SchemRequiredDocumentGroups> Document_Configuration_GetByGroupIds(List<string> groupIds)
        {
            List<SchemRequiredDocumentGroups> result = new List<SchemRequiredDocumentGroups>();

            foreach (var id in groupIds)
            {
                var docs = Document_Configuration_GetByGroupId(id);

                if (docs != null && docs.Count > 0)
                {
                    result.AddRange(docs);
                }
            }

            return result;
        }
        #endregion Document Configuration

        #region Scheme Subsidy Configuration
        public List<ConfigurationSchemeSubsidyModel> Configuration_Scheme_Subsidy_Get(string Id = "", string SchemeId = "", bool IsActive = true)
        {
            dynamic @params = new
            {
                pId = Id,
                pSchemeId = SchemeId,
                pIsActive = IsActive
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigurationSchemeSubsidyModel>(connection, "Configuration_Scheme_Subsidy_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigurationSchemeSubsidyModel>();
        }
        public string Configuration_Scheme_Subsidy_SaveUpdate(ConfigurationSchemeSubsidyModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pSchemeId = model.SchemeId,
                pTotalSubsidyCost = model.TotalSubsidyCost,
                pTotalProjectCost = model.TotalProjectCost,
                pMaxApplicationCount = model.MaxApplicationCount,
                pMaxProjectCost = model.MaxProjectCost,
                pSubsidyCost = model.SubsidyCost,
                pSubsidyPercentage = model.SubsidyPercentage,
                pFromDate = model.FromDate,
                pToDate = model.ToDate,
                pIsActive = model.IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Configuration_Scheme_Subsidy_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public List<ConfigurationdDistrictsWiseSubsidyModel> Configuration_Scheme_District_Subsidy_Get(string ConfigurationSchemeSubsidyId, string DistrictId = "")
        {
            dynamic @params = new
            {
                pConfigurationSchemeSubsidyId = ConfigurationSchemeSubsidyId,
                pDistrictId = DistrictId,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigurationdDistrictsWiseSubsidyModel>(connection, "Configuration_Scheme_District_Subsidy_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigurationdDistrictsWiseSubsidyModel>();
        }
        public string Configuration_Scheme_District_Subsidy_SaveUpdate(ConfigurationdDistrictsWiseSubsidyModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pDistrictId = model.DistrictId,
                pConfigurationSchemeSubsidyId = model.ConfigurationSchemeSubsidyId,
                pMaxSubsidyCost = model.MaxSubsidyCost,
                pMaxPojectCost = model.MaxPojectCost,
                pMaxApplicationCount = model.MaxApplicationCount,
                pSubsidyCost = model.DistrictId,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Configuration_Scheme_District_Subsidy_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        #endregion Scheme Subsidy Configuration

        #region Branch Address
        public List<ConfigurationBranchAddressModel> Config_Branch_Address_Get(string BankId = "", string BranchId = "", string IFSCCode = "")
        {
            dynamic @params = new
            {
                pBankId = BankId,
                pIFSCCode = IFSCCode,
                pBranchId = BranchId,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigurationBranchAddressModel>(connection, "Config_Branch_Address_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigurationBranchAddressModel>();
        }
        public string Config_Branch_Address_SaveUpdate(ConfigurationBranchAddressSaveModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pBankId = model.BankId,
                pBranchId = model.BranchId,
                pBranchName = model.BranchName,
                pIFSCCode = model.IFSCCode,
                pDistrictId = model.DistrictId,
                pAddress = model.Address,
                pEmail = model.Email,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Config_Branch_Address_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public List<ConfigurationBranchDropdownModel> Config_Branch_Dropdown_Get(BranchGetPayloadModel model)
        {
            dynamic @params = new
            {
                pBankIds = string.Join(',', model.BankIds),
                pDistrictIds = string.Join(',', model.DistrictIds),
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigurationBranchDropdownModel>(connection, "Config_Branch_Dropdown_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigurationBranchDropdownModel>();
        }
        public List<ConfigurationBranchDropdownModel> Config_Branch_Dropdown_Get_AutoComplete(string SearchString)
        {
            dynamic @params = new
            {
                pSearchString = ("%" + SearchString?.Trim() + "%"),
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigurationBranchDropdownModel>(connection, "Config_Branch_Dropdown_Get_AutoComplete", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigurationBranchDropdownModel>();
        }
        public bool IsIFSCValid(string IFSC)
        {
            string Query = "SELECT IFNULL(1,0) FROM config_branch_address WHERE IFSCCode = '"+ IFSC + "';";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<int>(connection, Query, commandType: CommandType.Text) > 0;
        }
        #endregion Branch Address

        #region Scheme Configuration
        public List<ConfigurationSchemeSaveModel> Config_Scheme_Get(string SchemeId = "", string SchemeCode = "", string SchemeGroupId = "")
        {
            dynamic @params = new
            {
                pSchemeId = SchemeId ?? "",
                pSchemeCode = SchemeCode ?? "",
                pSchemeGroupId = SchemeGroupId ?? "",
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigurationSchemeSaveModel>(connection, "Config_Scheme_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigurationSchemeSaveModel>();
        }
        public string Config_Scheme_SaveUpdate(ConfigurationSchemeSaveModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pSchemeId = model.SchemeId,
                pIsSelfOrFamilyMember = model.IsSelfOrFamilyMember,
                pIsAlreadyAvailed = model.IsAlreadyAvailed,
                pIsSingleCategorySelect = model.IsSingleCategorySelect,
                pFamilyMemberCategorys = string.Join(',', model.FamilyMemberCategorysList ?? new List<string>()),
                pGenders = string.Join(',', model.GendersList ?? new List<string>()),
                pCaste = string.Join(',', model.CasteList ?? new List<string>()),
                pCommunity = string.Join(',', model.CommunityList ?? new List<string>()),
                pReligions = string.Join(',', model.ReligionsList ?? new List<string>()),
                pDistricts = string.Join(',', model.DistrictsList ?? new List<string>()),

                pMemberEducation = string.Join(',', model.MemberEducationList ?? new List<string>()),
                pFamilyMemberEducation = string.Join(',', model.FamilyMemberEducationList ?? new List<string>()),
                pMaritalStatus = string.Join(',', model.MaritalStatusList ?? new List<string>()),
                pOrganizationType = string.Join(',', model.OrganizationTypeList ?? new List<string>()),

                //pFromDate = model.FromDate.ToDateTime(TimeOnly.MinValue),
                //pToDate = model.ToDate.ToDateTime(TimeOnly.MinValue),
                pFromDate = model.FromDate,
                pToDate = model.ToDate,
                pMinimumAge = model.MinimumAge,
                pMaximumAge = model.MaximumAge,
                pCallLetterStatusId = string.Join(',', model.CallLetterStatusIdsList ?? new List<string>()),
                pDocRequiredStatusId = string.Join(',', model.DocRequiredStatusIdsList ?? new List<string>()),
                pDescription = model.Description,
                pIsActive = model.IsActive,
                pShowAdditionalFields = model.ShowAdditionalFields,
                pShowBankFields = model.ShowBankFields,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };


            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Config_Scheme_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        public SchemeConfigDropdownModel Config_Scheme_Form_Get(string SchemeId = "")
        {
            SchemeConfigDropdownModel model = new SchemeConfigDropdownModel();

            dynamic @params = new
            {
                pSchemeId = SchemeId
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Config_Scheme_Form_Get", @params, commandType: CommandType.StoredProcedure);

            model.Genders = multi.Read<SelectListItem>();
            model.Districts = multi.Read<SelectListItem>();
            model.Religions = multi.Read<SelectListItem>();
            model.Community = multi.Read<SelectListItem>();
            model.Castes = multi.Read<SelectListItem>();
            model.FamilyMemberCategorys = multi.Read<SelectListItem>();
            model.StatusList = multi.Read<SelectListItem>();

            model.MemberEducationList = multi.Read<SelectListItem>();
            model.MaritalStatusList = multi.Read<SelectListItem>();
            model.OrganizationTypeList = multi.Read<SelectListItem>();

            model.FamilyMemberEducationList = new List<SelectListItem>()
            {
                new SelectListItem(){ Value = "COLLEGE", Text = "College" },
                new SelectListItem(){ Value = "SCHOOL", Text = "School" },
                new SelectListItem(){ Value = "NA", Text = "NA" },
            };

            return model;
        }
        public bool Config_Scheme_Check_Eligibility_of_member(string SchemeId, string MemberId, string FamilyMemberId, bool GetGroupEligibility = false)
        {
            dynamic @params = new
            {
                pSchemeId = SchemeId,
                pMemberId = MemberId,
                pFamilyMemberId = FamilyMemberId,
                pGetGroupEligibility = GetGroupEligibility,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<bool>(connection, "Config_Scheme_Check_Eligibility_of_member", @params, commandType: CommandType.StoredProcedure);
        }
        // New
        public List<SchemeEligibleFamilyMemberViewModel> Config_Scheme_Get_Eligible_FamilyMembers(string MemberId, string SchemeGroupId)
        {
            dynamic param = new
            {
                pMemberId = MemberId,
                pSchemeGroupId = SchemeGroupId
            };

            using IDbConnection connection =
                new MySqlConnection(_configuration.GetConnectionString(connectionId));

            return SqlMapper.Query<SchemeEligibleFamilyMemberViewModel>(connection,"Config_Scheme_Get_Eligible_FamilyMembers",param,commandType: CommandType.StoredProcedure);
        }
        public int Config_Scheme_Save_SortOrder(SchemeOrderingModel model, AuditColumnsModel audit)
        {
            string Query = $"UPDATE config_scheme SET SortOrder = {model.SortOrder} WHERE SchemeId = '{model.Id}';";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, Query, commandType: CommandType.Text);
        }
        public List<SchemeOrderingModel> Config_Scheme_Get_SortOrder(string GroupId)
        {
            string Query = @"select tcv.Id, 
                            (CASE WHEN IFNULL(tcv.ValueTamil,'')!='' THEN CONCAT(tcv.Value,' / ', tcv.ValueTamil) ELSE tcv.Value END) AS 'SchemeName', 
                            cs.SortOrder,
                            tcv.ValueTamil as 'SchemeNameTamil',
                            tcv.Value as 'SchemeNameEnglish'   
                            from two_column_configuration_values tcv
                            inner join two_column_configuration_category tcc on tcc.Id = tcv.CategoryId and tcc.CategoryCode = 'SCHEME'
                            inner join config_scheme cs on cs.SchemeId = tcv.Id
                            WHERE find_in_set(tcv.Id, (select SchemeIds from config_scheme_group where Id = '" + GroupId + "' limit 1)) ;";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<SchemeOrderingModel>(connection, Query, commandType: CommandType.Text).ToList();
        }
        public string Config_Scheme_Get_Eligibility_Type(string SchemeId)
        {
            string Query = $"SELECT IsSelfOrFamilyMember FROM config_scheme WHERE SchemeId = '{SchemeId}';";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, Query, commandType: CommandType.Text);
        }
        #endregion Scheme Configuration

        #region Scheme Sub Cost Configuration
        public List<SchemeSubCategoryConfigurationDateWiseModel> Config_Scheme_Sub_Category_Get(string SchemeId)
        {
            dynamic @params = new
            {
                pSchemeId = SchemeId,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<SchemeSubCategoryConfigurationDateWiseModel>(connection, "config_scheme_sub_category_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<SchemeSubCategoryConfigurationModel>();
        }
        public List<SchemeSubCategoryConfigurationModel> Config_Scheme_Sub_Category_Form_Get(string SchemeId, string GroupId)
        {
            dynamic @params = new
            {
                pSchemeId = SchemeId,
                pGroupId = GroupId,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<SchemeSubCategoryConfigurationModel>(connection, "config_scheme_sub_category_form_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<SchemeSubCategoryConfigurationModel>();
        }
        public SchemeSubCategoryConfigurationDateWiseModel Config_Scheme_Sub_Category_Get_Date_Range(string GroupId)
        {
            dynamic @params = new
            {
                pGroupId = GroupId,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.QueryFirstOrDefault<SchemeSubCategoryConfigurationDateWiseModel>(connection, "config_scheme_sub_category_Get_date_Range", @params, commandType: CommandType.StoredProcedure) ?? new SchemeSubCategoryConfigurationDateWiseModel();
        }
        public string Config_Scheme_Sub_Category_Save(SchemeSubCategoryConfigurationSaveModel model, DateTime FromDate, DateTime ToDate, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pGroupId = model.GroupId,
                pSchemeId = model.SchemeId,
                pSubCategoryId = model.SubCategoryId,
                pCommunityId = model.CommunityId,
                pOccurrence = model.Occurrence,
                pRecurrence = model.Recurrence,
                pAmount = model.Amount,
                //pFromDate = FromDate.ToDateTime(TimeOnly.MinValue),
                //pToDate = ToDate.ToDateTime(TimeOnly.MinValue),
                pFromDate = FromDate,
                pToDate = ToDate,
                pIsActive = true,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "config_scheme_sub_category_form_save", @params, commandType: CommandType.StoredProcedure);
        }
        public string Config_Scheme_Sub_Category_Check_Dup(string SchemeId, string GroupId, DateTime FromDate, DateTime ToDate)
        {
            dynamic @params = new
            {
                pSchemeId = SchemeId,
                pGroupId = GroupId,
                pFromDate = FromDate,
                pToDate = ToDate
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "config_scheme_sub_category_form_save_check_exist", @params, commandType: CommandType.StoredProcedure);
        }
        public string Config_Scheme_Sub_category_Delete(string GroupId)
        {
            string query = @"UPDATE config_scheme_sub_category
             SET IsActive = 0
             WHERE GroupId = '" + GroupId + "';";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, query, commandType: CommandType.Text);
        }
        #endregion Scheme Sub Cost Configuration

        #region Scheme Group
        public List<ConfigSchemeGroupModel> Config_Scheme_Group_Get(bool IsActive)
        {
            string Query = "";

            if (IsActive)
            {
                Query = @"SELECT csg.*,
            (Select GROUP_CONCAT(CASE WHEN IFNULL(scheme.ValueTamil,'') != ''THEN
            CONCAT(scheme.ValueTamil,'/',scheme.Value)
            ELSE scheme.Value
            END SEPARATOR ',') FROM two_column_configuration_values scheme 
            WHERE FIND_IN_SET(scheme.Id,csg.SchemeIds)) AS SchemeNames
            FROM config_scheme_group csg
            WHERE csg.IsActive=1";
            }

            else
            {
                Query = @"SELECT csg.*,
            (Select GROUP_CONCAT(CASE WHEN IFNULL(scheme.ValueTamil,'') != ''THEN
            CONCAT(scheme.ValueTamil,'/',scheme.Value)
            ELSE scheme.Value
            END SEPARATOR ',') FROM two_column_configuration_values scheme 
            WHERE FIND_IN_SET(scheme.Id,csg.SchemeIds)) AS SchemeNames
            FROM config_scheme_group csg
            WHERE csg.IsActive=0";
            }

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigSchemeGroupModel>(connection, Query, commandType: CommandType.Text).ToList();
        }

//        public List<ConfigSchemeGroupModel> Config_Scheme_Group_Get(bool IsActive)
//        {
//            //        string Query = @"
//            //SELECT 
//            //    csg.*,
//            //    GROUP_CONCAT(
//            //        CASE 
//            //            WHEN IFNULL(scheme.ValueTamil,'') != '' 
//            //            THEN CONCAT(scheme.ValueTamil,'/',scheme.Value)
//            //            ELSE scheme.Value
//            //        END
//            //        SEPARATOR ','
//            //    ) AS SchemeNames
//            //FROM config_scheme_group csg
//            //LEFT JOIN two_column_configuration_values scheme
//            //    ON FIND_IN_SET(scheme.Id, csg.SchemeIds)
//            //WHERE csg.IsActive = @IsActive
//            //GROUP BY csg.Id";
//            string Query = @"
//SELECT 
//    csg.Id,
//    csg.GroupName,
//    csg.SchemeIds,
//    csg.IsActive,
//    GROUP_CONCAT(
//        CASE 
//            WHEN scheme.ValueTamil IS NOT NULL AND scheme.ValueTamil != ''
//            THEN CONCAT(scheme.ValueTamil,'/',scheme.Value)
//            ELSE scheme.Value
//        END
//        ORDER BY scheme.Id
//        SEPARATOR ','
//    ) AS SchemeNames
//FROM config_scheme_group csg
//LEFT JOIN two_column_configuration_values scheme
//    ON FIND_IN_SET(scheme.Id, csg.SchemeIds) > 0
//WHERE csg.IsActive = @IsActive
//GROUP BY csg.Id, csg.GroupName, csg.SchemeIds, csg.IsActive";

//            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

//            return connection.Query<ConfigSchemeGroupModel>(
//                Query,
//                new { IsActive = IsActive ? 1 : 0 }
//            ).ToList();
//        }
        public string Config_Scheme_Group_Save(ConfigSchemeGroupSaveModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pGroupName = model.GroupName,
                pGroupNameTamil = model.GroupNameTamil,
                pGroupImage = model.GroupImage,
                pSchemeIds = string.Join(',', model.SchemeIdsList),
                pDescription = model.Description,
                pIsActive = model.IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "config_scheme_group_save", @params, commandType: CommandType.StoredProcedure);
        }
        public int Config_Scheme_Group_Save_SortOrder(SchemeGroupOrderingModel model, AuditColumnsModel audit)
        {
            string Query = $"UPDATE config_scheme_group SET SortOrder = {model.SortOrder} WHERE Id = '{model.Id}';";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, Query, commandType: CommandType.Text);
        }
        public List<ExistApplicationIdModel> GetMemberExistApplication(string schemeId,string memberId)
        {
            dynamic @params = new
            {
                pSchemeId = schemeId,
                pMemberId = memberId
            };
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ExistApplicationIdModel>(connection, "MemberExistApplication", @params, commandType: CommandType.StoredProcedure) ?? new List<ExistApplicationIdModel>();
        }
        #endregion Scheme Group

        #region Configuration DIstrict
        public List<ConfigurationDistrictModel> Config_District_Get(string districtId)
        {
            string Query = @"SELECT tcc.Value as 'District', tcc.Id as 'DistrictId', cdm.Latitude, cdm.Longitude  
                            FROM two_column_configuration_values tcc 
                            LEFT JOIN Configuration_District_master cdm ON cdm.DistrictId = tcc.Id
                            WHERE tcc.CategoryId IN(SELECT Id FROM two_column_configuration_category WHERE CategoryCode='DISTRICT') AND tcc.Id='" + districtId + "';";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigurationDistrictModel>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<ConfigurationDistrictModel>();
        }
        public string Config_District_SaveUpdate(ConfigurationDistrictSaveModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pDistrictId = model.DistrictId,
                pLatitude = model.Latitude,
                pLongitude = model.Longitude,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Configuration_District_Master_Save", @params, commandType: CommandType.StoredProcedure);
        }
        #endregion Configuration DIstrict

        #region Help Document
        public List<ConfigHelpDocumentModel> Config_Help_Document_Get(string Id = "", string RoleId = "", string SchemeId = "", string Category = "")
        {
            string roleId = "";
            if (!string.IsNullOrEmpty(RoleId))
            {
                roleId = "'%" + RoleId + "%'";
            }

            string schemeId = "";
            if (!string.IsNullOrEmpty(SchemeId))
            {
                schemeId = "'%" + SchemeId + "%'";
            }

            dynamic @params = new
            {
                pId = Id?.Trim() ?? "",
                pRoleId = RoleId?.Trim() ?? "",
                pSchemeId = SchemeId?.Trim() ?? "",
                pCategory = Category?.Trim() ?? "",
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigHelpDocumentModel>(connection, "Config_Help_Document_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigHelpDocumentModel>();
        }
        public string Config_Help_Document_SaveUpdate(ConfigHelpDocumentSaveModel model, AuditColumnsModel audit)
        {
            string roleIds = "";
            if (model.RoleIds?.Count > 0)
            {
                roleIds = string.Join(",", model.RoleIds);
            }

            string schemeIds = "";
            if (model.SchemeIds?.Count > 0)
            {
                schemeIds = string.Join(",", model.SchemeIds);
            }

            dynamic @params = new
            {
                pId = model.Id,
                pDocumentName = model.DocumentName,
                pDocumentType = model.DocumentType,
                pRoleIds = roleIds,
                pSchemeIds = schemeIds,
                pDescription = model.Description,
                pCategory = model.Category,
                pLink = model.Link,
                pIsActive = model.IsActive,

                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Config_Help_Document_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

        public ConfigHelpDocumentFormModel Config_Help_Document_Form_Get(string Id = "")
        {
            ConfigHelpDocumentFormModel model = new ConfigHelpDocumentFormModel();

            dynamic @params = new
            {
                pId = Id
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            var multi = SqlMapper.QueryMultiple(connection, "Config_Help_Document_Form_Get", @params, commandType: CommandType.StoredProcedure);

            model.SchemeList = multi.Read<SelectListItem>();
            model.RoleList = multi.Read<SelectListItem>();

            return model;
        }
        #endregion Help Document

        #region Approval Doc COnfig
        public bool Config_Scheme_Approval_Doc_Config_Save(ApprovalDocConfigViewModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pMappingId = model.MappingId,
                pIsDocumentRequired = model.IsDocumentRequired,
                pIsAssertVerificationStatus = model.IsAssertVerificationStatus,
                pDocumentLabel = model.DocumentLabel,

                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Execute(connection, "Config_Scheme_Approval_Doc_Config_Save", @params, commandType: CommandType.StoredProcedure) > 0;
        }
        public List<ApprovalDocConfigViewModel> Config_Scheme_Approval_Doc_Config_Get(string SchemeId = "", string StatusId = "")
        {
            dynamic @params = new
            {
                pSchemeId = SchemeId?.Trim() ?? "",
                pStatusId = StatusId?.Trim() ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ApprovalDocConfigViewModel>(connection, "Config_Scheme_Approval_Doc_Config_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ApprovalDocConfigViewModel>();
        }
        #endregion Approval Doc COnfig

        #region Approval Doc Category COnfig
        public string Config_Approval_Doc_Category_Save(ConfigApprovalDocCategorySaveModel model, AuditColumnsModel audit)
        {
            if (string.IsNullOrWhiteSpace(model.Id))
            {
                model.Id = Guid.NewGuid().ToString();
            }

            dynamic @params = new
            {
                pId = model.Id,
                pSchemeId = model.SchemeId,
                pStatusId = model.StatusId,
                pDocCategoryId = model.DocCategoryId,
                pIsRequired = model.IsRequired,
                pIsActive = model.IsActive,

                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Config_Approval_Doc_Category_Save", @params, commandType: CommandType.StoredProcedure);
        }
        public List<ConfigApprovalDocCategoryModel> Config_Approval_Doc_Category_Get(string SchemeId = "", string StatusId = "", string DocCategoryId = "")
        {
            dynamic @params = new
            {
                pSchemeId = SchemeId?.Trim() ?? "",
                pStatusId = StatusId?.Trim() ?? "",
                pDocCategoryId = DocCategoryId?.Trim() ?? "",
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigApprovalDocCategoryModel>(connection, "Config_Approval_Doc_Category_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigApprovalDocCategoryModel>();
        }
        #endregion Approval Doc Category COnfig

        #region Card Print Status
        public List<CardPrintStatusModel> Config_CardPrintStatusGet()
        {
            string Query = @"select tcv.Id, tcv.Value as 'StatusName', tcv.SortOrder from two_column_configuration_values tcv 
                            inner join two_column_configuration_category tcc on tcc.Id = tcv.CategoryId where CategoryCode = 'CARD_PRINTING_STATUS'";
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<CardPrintStatusModel>(connection, Query, commandType: CommandType.Text)?.ToList() ?? new List<CardPrintStatusModel>();
        }
        public void UpdateCardPrintStatusSortOrder(CardPrintStatusOrderModel model, AuditColumnsModel audit)
        {
            string Query = $"UPDATE two_column_configuration_values SET SortOrder = {model.SortOrder} WHERE Id = '{model.Id}';";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            SqlMapper.Execute(connection, Query, commandType: CommandType.Text);
        }
        #endregion Card Print Status

        public List<StatusMaster> Status_Get(string StatusCode = "", string Id = "", string Type = "")
        {
            dynamic @params = new
            {
                pStatusCode = StatusCode?.Trim() ?? "",
                pId = Id?.Trim() ?? "",
                pType = Type?.Trim() ?? ""
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<StatusMaster>(connection, "Status_Master_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<StatusMaster>();
        }


    }
}
