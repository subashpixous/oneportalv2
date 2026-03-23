using AutoMapper;
using AutoMapper.Execution;
using BAL.BackgroundWorkerService;
using BAL.Interface;
using DAL;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Model.Constants;
using Model.CustomeAttributes;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System.Data;
using Utils;
using Utils.Interface;
using Utils.Cache.Configuration;

namespace BAL
{
    public class SettingBAL : ISettingBAL
    {
        private readonly SettingsDAL _settingDAL;
        private readonly GeneralDAL _generalDAL;
        private readonly MemberDAL _memberDAL;
        private readonly IMapper _mapper;
        private readonly IFTPHelpers _fTPHelpers;

        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IConfigurationCacheService _configCache;

        private IMemoryCache _cache;

        public SettingBAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IMapper mapper,
            IConfiguration configuration, IFTPHelpers fTPHelpers,
            IBackgroundTaskQueue backgroundTaskQueue, IServiceScopeFactory serviceScopeFactory, IMemoryCache cache, IConfigurationCacheService configCache)
        {
            _settingDAL = new SettingsDAL(configuration);
            _generalDAL = new GeneralDAL(configuration);
            _memberDAL = new MemberDAL(configuration);
            _mapper = mapper;
            _fTPHelpers = fTPHelpers;
            _backgroundTaskQueue = backgroundTaskQueue;
            _serviceScopeFactory = serviceScopeFactory;
            _cache = cache;
            _configCache = configCache;
        }

        #region Two Column Configuration
        public List<ConfigurationModel> Configuration_Get(bool IsActive, string ConfigurationId = "", string CategoryId = "", string ParentConfigurationId = "", string Value = "", 
            string CategoryCode = "", string SchemeId = "", string Code = "", bool ShowParent = false)
        {
            // Cache Integrated - Elanjsuriyan [29-12-2025]

            if (!string.IsNullOrWhiteSpace(ConfigurationId))
            {
                var item = _configCache.GetById(ConfigurationId);
                if (item == null) return new();

                return (!IsActive || item.IsActive)
                    ? new List<ConfigurationModel> { item }
                    : new();
            }

            return _configCache.GetByStoredProcedure(
                isActive: IsActive,
                configurationId: ConfigurationId,
                categoryId: CategoryId,
                parentConfigurationId: ParentConfigurationId,
                value: Value,
                categoryCode: CategoryCode,
                schemeId: SchemeId,
                code: Code,
                showParent: ShowParent
            );


            return _settingDAL.Configuration_Get(IsActive, ConfigurationId, CategoryId, ParentConfigurationId, Value, CategoryCode, SchemeId, Code, ShowParent);
        }
        public List<ConfigCategoryModel> Configuration_Category_Get(string CategoryCode = "", bool IsGeneralCategory = true)
        {
            return _settingDAL.Configuration_Category_Get(CategoryCode, IsGeneralCategory);
        }
        public string Configuration_SaveUpdate(ConfigurationModel Configuration)
        {
            #region Save Difference
            ConfigurationModel? exist = Configuration_Get(true, ConfigurationId: Configuration.Id)?.FirstOrDefault() ?? new ConfigurationModel();
            if (string.IsNullOrWhiteSpace(exist.Id))
            {
                exist = Configuration_Get(false, ConfigurationId: Configuration.Id)?.FirstOrDefault() ?? new ConfigurationModel();
            }
            ObjectDifference diff = new ObjectDifference(Configuration, exist);
            diff.Properties = StringFunctions.GetPropertiesWithAttribute<ConfigurationModel, LogFieldAttribute>();
            if (Configuration.IsActive == false)
            {
                diff.IsDeleted = true;
            }
            diff.SavedBy = Configuration.SavedBy;
            diff.SavedByUserName = Configuration.SavedByUserName;
            diff.SavedDate = Configuration.SavedDate;
            _generalDAL.SaveRecordDifference(diff);

            #endregion Save Difference

            // Clear Cache - Elanjsuriyan - 29-12-2025

            var result = _settingDAL.Configuration_SaveUpdate(Configuration);

            //return _settingDAL.Configuration_SaveUpdate(Configuration);
            if (!string.IsNullOrEmpty(Configuration.Code))
            {
                _configCache.Clear(Configuration.Code);
            }
            if (!string.IsNullOrEmpty(Configuration.Id))
                _configCache.Clear($"CONFIG_ID_{Configuration.Id}");

            if (!string.IsNullOrEmpty(Configuration.CategoryId))
                _configCache.Clear($"CONFIG_CAT_{Configuration.CategoryId}");

            if (!string.IsNullOrEmpty(Configuration.Code))
                _configCache.Clear(Configuration.Code);
                _configCache.Clear($"CONFIG_LIST_{Configuration.Code}");
                _configCache.Clear($"CONFIG_{Configuration.Code}");
            _configCache.ClearPrefix($"CONFIG_SP_");


            return result;
        }
        public List<SelectListItem> ConfigurationSelectList_Get(bool IsActive = true, string ConfigurationId = "", string CategoryId = "", string ParentConfigurationId = "", string CategoryCode = "", string SchemeId = "")
        {
            //List<SelectListItem> selectList = new List<SelectListItem>();

            //List<ConfigurationModel> list = _settingDAL.Configuration_Get(IsActive, ConfigurationId, CategoryId, ParentConfigurationId, "", CategoryCode, SchemeId);
            //if (list != null)
            //{
            //    if (list.Count > 0)
            //    {
            //        selectList = list.Select(x => new SelectListItem() { Text = x.Value, Value = x.Id }).OrderBy(o => o.Text).ToList();
            //    }
            //}

            //return selectList;

            // Cache Integrated - Elanjsuriyan [29-12-2025]

            if (string.IsNullOrWhiteSpace(CategoryCode))
            {
                var list = _settingDAL.Configuration_Get(
                    IsActive,
                    ConfigurationId,
                    CategoryId,
                    ParentConfigurationId,
                    "",
                    CategoryCode,
                    SchemeId
                );

                return list
                    .Select(x => new SelectListItem
                    {
                        Text = x.Value,
                        Value = x.Id
                    })
                    .OrderBy(x => x.Text)
                    .ToList();
            }

            var cachedList = _configCache.GetSelectList(
                CategoryCode,
                ParentConfigurationId,
                SchemeId,
                IsActive
            );

            return cachedList
                .Select(x => new SelectListItem
                {
                    Text = x.Value,
                    Value = x.Id
                })
                .OrderBy(x => x.Text)
                .ToList();
        }
        public List<ConfigSelectListByParentIdListModel> GetConfigurationSelectByParentConfiguration(List<string> ParentIds)
        {
            List<ConfigSelectListByParentIdListModel> list = new List<ConfigSelectListByParentIdListModel>();
            List<ConfigurationSelectListModel> source = _settingDAL.GetConfigurationSelectByParentConfiguration(ParentIds);

            if (source.Count > 0)
            {
                List<string> parentConfigurationIds = source.Select(x => x.ParentId).Distinct().ToList();
                foreach (var parentId in parentConfigurationIds)
                {
                    ConfigSelectListByParentIdListModel item = new ConfigSelectListByParentIdListModel();

                    item.Value = parentId;
                    item.Text = source.Find(x => x.ParentId == parentId)?.ParentValue ?? "";
                    item.Items = source.Where(x => x.ParentId == parentId).Select(s => new CustSelectModel()
                    {
                        Value = s.Id,
                        Text = s.Value
                    }).ToList();

                    list.Add(item);
                }
            }

            return list;
        }
        #endregion Two Column Configuration

        #region Role

        public string Account_Role_Save(AccountRoleModel model)
        {
            #region Save Difference
            AccountRoleModel exist = Account_Role_Get(model.Id)?.FirstOrDefault() ?? new AccountRoleModel();
            ObjectDifference diff = new ObjectDifference(model, exist);
            diff.Properties = StringFunctions.GetPropertiesWithAttribute<AccountRoleModel, LogFieldAttribute>();
            if (model.IsActive == false)
            {
                diff.IsDeleted = true;
            }
            diff.SavedBy = model.SavedBy;
            diff.SavedByUserName = model.SavedByUserName;
            diff.SavedDate = model.SavedDate;
            _generalDAL.SaveRecordDifference(diff);
            #endregion Save Difference

            return _settingDAL.Account_Role_Save(model);
        }
        public List<AccountRoleModel> Account_Role_Get(string Id = "", bool IsActive = true, string RoleName = "", string RoleCode = "")
        {
            return _settingDAL.Account_Role_Get(Id, IsActive, RoleName, RoleCode);
        }

        #endregion Role

        #region Role Privilege
        public List<AccountPrivilegeFormModel> Account_Role_Privilege_Raw_Get(string RoleId, string PrivilegeId)
        {
            return _settingDAL.Account_Role_Privilege_Get(RoleId, PrivilegeId);
        }
        public List<AccountPrivilegeByGroupModel> Account_Role_Privilege_Get(string RoleId)
        {
            List<AccountPrivilegeFormModel> privilegeList = _settingDAL.Account_Role_Privilege_Get(RoleId);

            List<AccountPrivilegeByGroupModel> privilegeListGrouped = privilegeList
                .GroupBy(x => x.ModuleName)
                .Select(y => new AccountPrivilegeByGroupModel()
                {
                    RoleId = RoleId,
                    ModuleName = y.Key,
                    Privilege = y.OrderBy(x => x.OrderNumber).ToList()
                }).ToList();

            return privilegeListGrouped;
        }
        public List<AccountPrivilegeFormModel> Account_Role_Privilege_Login_Get(string RoleId)
        {
            List<AccountPrivilegeFormModel> privilegeList = _settingDAL.Account_Role_Privilege_Get(RoleId);
            privilegeList = privilegeList.Where(x => x.IsSelected == true).ToList();
            return privilegeList;
        }
        public List<AccountPrivilegeFormModel> Account_Role_Privilege_Get_All(string RoleId)
        {
            List<AccountPrivilegeFormModel> privilegeList = _settingDAL.Account_Role_Privilege_Get(RoleId);
            return privilegeList;
        }
        public string Account_Role_Privilege_Save(AccountPrivilegeSaveModel model)
        {
            #region Save Difference
            AccountPrivilegeFormModel? exist = Account_Role_Privilege_Raw_Get(model.RoleId, model.PrivilegeId)?.FirstOrDefault() ?? new AccountPrivilegeFormModel();
            if (string.IsNullOrWhiteSpace(exist.PrivilegeId))
            {
                exist = Account_Role_Privilege_Raw_Get(model.RoleId, model.PrivilegeId)?.FirstOrDefault() ?? new AccountPrivilegeFormModel();
            }
            ObjectDifference diff = new ObjectDifference(model, exist);
            diff.Properties = StringFunctions.GetPropertiesWithAttribute<ConfigurationModel, LogFieldAttribute>();
            diff.IsDeleted = false;
            diff.SavedBy = model.SavedBy;
            diff.SavedByUserName = model.SavedByUserName;
            diff.SavedDate = model.SavedDate;
            _generalDAL.SaveRecordDifference(diff);
            #endregion Save Difference

            return _settingDAL.Account_Role_Privilege_Save(model);
        }
        #endregion Role Privilege

        #region User
        public List<AccountUserModel> Account_Key_Contact_User_Get(string UserId, string DistrictIds, string SchemeIds, List<string> RoleIds)
        {
            return _settingDAL.Account_Key_Contact_User_Get(UserId, DistrictIds, SchemeIds, RoleIds);
        }
        public List<AccountUserModel> User_Get(
            bool IsActive = true,
            string UserId = "",
            string DistrictId = "",
            string DivisionId = "",
            string UserGroup = "",
            string RoleId = "",
            string MobileNumber = "",
            string Email = "",
            string UserGroupName = "",
            string SchemeId = "",
            string BranchId = "",
            string BankId = ""
        )
        {
            List<AccountUserModel> list = _settingDAL.User_Get(
                IsActive, UserId, DistrictId, DivisionId, UserGroup, RoleId, MobileNumber, Email,
                UserGroupName, SchemeId, BranchId, BankId
            );

            list.ForEach(x =>
            {
                x.BranchIds = _settingDAL.User_Get_Branch_By_UserId(x.UserId);
                x.Password = EncryptDecrypt.Decrypt(x.Password);

                // Map CSV fields to List<string>
                x.SchemeIdList = !string.IsNullOrEmpty(x.SchemesIds) ? x.SchemesIds.Split(',').ToList() : new List<string>();
                x.DistrictIdList = !string.IsNullOrEmpty(x.DistrictIds) ? x.DistrictIds.Split(',').ToList() : new List<string>();
                x.DivisionIdList = !string.IsNullOrEmpty(x.DivisionIds) ? x.DivisionIds.Split(',').ToList() : new List<string>();
                x.BankIdList = !string.IsNullOrEmpty(x.BankIds) ? x.BankIds.Split(',').ToList() : new List<string>();
                x.BranchIdList = !string.IsNullOrEmpty(x.BranchIds) ? x.BranchIds.Split(',').ToList() : new List<string>();
                x.CardPrintStatusIdList = !string.IsNullOrEmpty(x.CardPrintStatusIds) ? x.CardPrintStatusIds.Split(',').ToList() : new List<string>();

                // Map new fields
                x.LocalBodyIdList = !string.IsNullOrEmpty(x.LocalBodyIds) ? x.LocalBodyIds.Split(',').ToList() : new List<string>();
                x.NameOfLocalBodyIdList = !string.IsNullOrEmpty(x.NameOfLocalBodyIds) ? x.NameOfLocalBodyIds.Split(',').ToList() : new List<string>();
                x.BlockIdList = !string.IsNullOrEmpty(x.BlockIds) ? x.BlockIds.Split(',').ToList() : new List<string>();
                x.CorporationIdList = !string.IsNullOrEmpty(x.CorporationIds) ? x.CorporationIds.Split(',').ToList() : new List<string>();
                x.MunicipalityIdList = !string.IsNullOrEmpty(x.MunicipalityIds) ? x.MunicipalityIds.Split(',').ToList() : new List<string>();
                x.TownPanchayatIdList = !string.IsNullOrEmpty(x.TownPanchayatIds) ? x.TownPanchayatIds.Split(',').ToList() : new List<string>();
                x.VillagePanchayatIdList = !string.IsNullOrEmpty(x.VillagePanchayatIds) ? x.VillagePanchayatIds.Split(',').ToList() : new List<string>();
                x.ZoneIdList = !string.IsNullOrEmpty(x.ZoneIds) ? x.ZoneIds.Split(',').ToList() : new List<string>();
            });

            return list;
        }

        public List<AccountUserModel> User_Get(UserFilterModel model, out int TotalCount)
        {
            List<AccountUserModel> list = _settingDAL.User_Get(model: model, out TotalCount);
            list.ForEach(x =>
            {
                x.Password = EncryptDecrypt.Decrypt(x.Password);
            });
            return list;
        }
        public List<string> getUserMobile(string pZoneIds)
        {
            return _settingDAL.getUserMobile(pZoneIds);

        }
        public List<UserNextNumberModel> User_GetNextNumber()
        {
            return _settingDAL.User_GetNextNumber();
        }
        public AccountUserModel User_SaveUpdate(AccountUserModel model)
        {
            model.UserId = _settingDAL.User_SaveUpdate(model);

            return model;
        }
        public string User_Activate(AccountUserModel model)
        {
            return _settingDAL.User_Activate(model);
        }
        public AccountUserFormDetailModel User_Form_Get(string UserId = "")
        {
            return _settingDAL.User_Form_Get(UserId);
        }
        public string User_Save_Profile(UserProfileImageSaveModel model)
        {
            return _settingDAL.User_Save_Profile(model);
        }
        public List<CallletterUserModel> GetUserByRoleAndDistrict(string DistrictId, string RoleCode)
        {
            return _settingDAL.GetUserByRoleAndDistrict(DistrictId, RoleCode);
        }
        public List<CallletterUserModel> GetUserByRoleIdAndDistrict(string DistrictId, string RoleId)
        {
            return _settingDAL.GetUserByRoleAndDistrict(DistrictId, RoleId);
        }
        public List<UserUploadViewModel> UserImport(IFormFile postedFile, AuditColumnsModel audit)
        {
            string _key = "_keyStatusOfUpload";
            _cache.Remove(_key);

            List<UserUploadViewModel> outputItems = new List<UserUploadViewModel>();

            if (postedFile != null)
            {
                string sFileExtention = Path.GetExtension(postedFile.FileName).ToLower();
                ISheet sheet;
                string SheetName = "Users";

                using (MemoryStream stream = new MemoryStream())
                {
                    postedFile.CopyTo(stream);

                    stream.Position = 0;

                    if (sFileExtention == ".xls")
                    {
                        HSSFWorkbook hssfwb = new HSSFWorkbook(stream);
                        sheet = hssfwb.GetSheetAt(0);
                        SheetName = sheet.SheetName;
                    }
                    else
                    {
                        XSSFWorkbook xssfwb = new XSSFWorkbook(stream);
                        sheet = xssfwb.GetSheetAt(0);
                        SheetName = sheet.SheetName;
                    }

                    IRow headerRow = sheet.GetRow(0);
                    List<UserUploadViewModel> applicantList = new List<UserUploadViewModel>();

                    for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++)
                    {
                        UserUploadViewModel applicant = new UserUploadViewModel();

                        IRow row = sheet.GetRow(i);
                        if (row == null) continue;
                        if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;

                        applicant.Id = (row.GetCell(0) != null && row.GetCell(0).ToString() != "" ? row.GetCell(0).ToString() : "")?.Trim() ?? "";
                        applicant.FirstName = (row.GetCell(1) != null && row.GetCell(1).ToString() != "" ? row.GetCell(1).ToString() : "")?.Trim() ?? "";
                        applicant.LastName = (row.GetCell(2) != null && row.GetCell(2).ToString() != "" ? row.GetCell(2).ToString() : "") ?? "";
                        applicant.Gender = (row.GetCell(3) != null && row.GetCell(3).ToString() != "" ? row.GetCell(3).ToString() : "")?.Trim() ?? "";
                        applicant.Email = (row.GetCell(4) != null && row.GetCell(4).ToString() != "" ? row.GetCell(4).ToString() : "")?.Trim() ?? "";
                        applicant.PhoneNumber = (row.GetCell(5) != null && row.GetCell(5).ToString() != "" ? row.GetCell(5).ToString() : "")?.Trim() ?? "";
                        applicant.RoleCode = (row.GetCell(6) != null && row.GetCell(6).ToString() != "" ? row.GetCell(6).ToString() : "")?.Trim() ?? "";
                        applicant.Password = (row.GetCell(7) != null && row.GetCell(7).ToString() != "" ? row.GetCell(7).ToString() : "")?.Trim() ?? "";
                        //applicant.Designation = (row.GetCell(8) != null && row.GetCell(8).ToString() != "" ? row.GetCell(8).ToString() : "")?.Trim() ?? "";
                        applicant.District = (row.GetCell(8) != null && row.GetCell(8).ToString() != "" ? row.GetCell(8).ToString() : "")?.Trim() ?? "";
                        applicant.Schemes = (row.GetCell(9) != null && row.GetCell(9).ToString() != "" ? row.GetCell(9).ToString() : "")?.Trim() ?? "";
                        applicant.Bank = (row.GetCell(10) != null && row.GetCell(10).ToString() != "" ? row.GetCell(10).ToString() : "")?.Trim() ?? "";
                        //applicant.Branch = (row.GetCell(11) != null && row.GetCell(11).ToString() != "" ? row.GetCell(11).ToString() : "")?.Trim() ?? "";

                        applicantList.Add(applicant);
                    }

                    if (applicantList.Count > 0)
                    {
                        List<AccountUserModel> usersToCreate = new List<AccountUserModel>();

                        int RecordCount = 0;

                        UserFieldValueModel configList = _settingDAL.User_Get_FieldValueList();

                        foreach (UserUploadViewModel x in applicantList)
                        {
                            x.IsError = false;
                            x.ErrorColumns = new List<string>();
                            x.Error = new List<string>();

                            AccountUserModel userToCreate = new AccountUserModel();

                            #region Validation
                            if (string.IsNullOrEmpty(x.Id))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("Id");
                                x.Error.Add("S.No is required");
                            }
                            if (string.IsNullOrEmpty(x.FirstName))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("FirstName");
                                x.Error.Add("First Name is required");
                            }
                            else
                            {
                                userToCreate.FirstName = x.FirstName;
                            }
                            if (string.IsNullOrEmpty(x.LastName))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("LastName");
                                x.Error.Add("Last Name is required");
                            }
                            else
                            {
                                userToCreate.LastName = x.LastName;
                            }
                            if (string.IsNullOrEmpty(x.Email))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("Email");
                                x.Error.Add("Email is required");
                            }
                            else
                            {
                                UserValidationModel? userExist = configList?.UserList?.Where(y => y.Email == x.Email.Trim())?.FirstOrDefault();
                                if (userExist != null)
                                {
                                    x.IsError = true;
                                    x.ErrorColumns.Add("Email");
                                    x.Error.Add("User exist with same email");
                                }
                                else
                                {
                                    userToCreate.Email = x.Email.Trim();
                                }
                            }
                            if (string.IsNullOrEmpty(x.PhoneNumber))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("PhoneNumber");
                                x.Error.Add("PhoneNumber is required");
                            }
                            else
                            {
                                UserValidationModel? userExist = configList?.UserList?.Where(y => y.Mobile == x.PhoneNumber.Trim())?.FirstOrDefault();
                                if (userExist != null)
                                {
                                    x.IsError = true;
                                    x.ErrorColumns.Add("PhoneNumber");
                                    x.Error.Add("User exist with same phone number");
                                }
                                else
                                {
                                    userToCreate.Mobile = x.PhoneNumber.Trim();
                                }
                            }
                            if (string.IsNullOrEmpty(x.RoleCode))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("RoleCode");
                                x.Error.Add("Role is required");
                            }
                            else
                            {
                                userToCreate.RoleId = configList?.Role_KeyValuePairs?.Find(ro => ro.String_Code.ToLower() == x.RoleCode.ToLower().Trim())?.String_Value ?? "";
                                if (string.IsNullOrEmpty(userToCreate.RoleId))
                                {
                                    x.IsError = true;
                                    x.ErrorColumns.Add("RoleCode");
                                    x.Error.Add("Given role code is not valid");
                                }
                            }

                            if (string.IsNullOrEmpty(x.Gender))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("Gender");
                                x.Error.Add("Gender is required");
                            }
                            else if ((configList?.Gender_KeyValuePairs?.Select(v => v.String_Key)?.ToList()?.Contains(x.Gender) ?? false) == false)
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("Gender");
                                x.Error.Add("Gender is Wrong");
                            }
                            else
                            {
                                userToCreate.GenderId = configList?.Gender_KeyValuePairs?.Find(ro => ro.String_Key.ToLower() == x.Gender.ToLower().Trim())?.String_Value ?? "";
                            }

                            if (string.IsNullOrEmpty(x.Password))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("Password");
                                x.Error.Add("Password is required");
                            }
                            else
                            {
                                userToCreate.Password = x.Password.Trim();
                            }

                            //if (string.IsNullOrEmpty(x.Designation))
                            //{
                            //    x.IsError = true;
                            //    x.ErrorColumns.Add("Designation");
                            //    x.Error.Add("Designation is required");
                            //}
                            //else
                            //{
                            //    KeyValuePairs? designationExist = configList?.Role_KeyValuePairs?.Where(y => y.String_Key == x.Designation.Trim())?.FirstOrDefault();
                            //    if (designationExist == null)
                            //    {
                            //        x.IsError = true;
                            //        x.ErrorColumns.Add("Designation");
                            //        x.Error.Add("Given designation is not valid");
                            //    }
                            //    else
                            //    {
                            //        userToCreate.RoleId = designationExist.String_Value;
                            //    }
                            //}

                            if (string.IsNullOrEmpty(x.District))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("District");
                                x.Error.Add("District is required");
                            }
                            else
                            {
                                if (x.District.Trim().ToLower() == "all")
                                {
                                    userToCreate.DistrictIdList = configList?.District_KeyValuePairs?.Select(y => y.String_Value)?.ToList() ?? new List<string>();
                                    userToCreate.DistrictIds = string.Join(',', userToCreate.DistrictIdList);
                                }
                                else
                                {
                                    var keys = x.District.Split(",").Select(c => c.Trim());
                                    if (keys != null && keys.Count() > 0)
                                    {
                                        List<KeyValuePairs> districtExist = configList?.District_KeyValuePairs?.Where(y => !string.IsNullOrWhiteSpace(y.String_Key) && keys.Contains(y.String_Key.Trim()))?.ToList() ?? new List<KeyValuePairs>();
                                        if (districtExist?.Count == 0)
                                        {
                                            x.IsError = true;
                                            x.ErrorColumns.Add("District");
                                            x.Error.Add("Given district is not valid");
                                        }
                                        else
                                        {
                                            userToCreate.DistrictIdList = districtExist?.Select(y => y.String_Value)?.ToList() ?? new List<string>();
                                            userToCreate.DistrictIds = string.Join(',', userToCreate.DistrictIdList);
                                        }
                                    }
                                }

                            }
                            if (string.IsNullOrEmpty(x.Schemes))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("Schemes");
                                x.Error.Add("Schemes is required");
                            }
                            else
                            {
                                if (x.Schemes.Trim().ToLower() == "all")
                                {
                                    userToCreate.SchemeIdList = configList?.Scheme_KeyValuePairs?.Select(y => y.String_Value)?.ToList() ?? new List<string>();
                                    userToCreate.SchemesIds = string.Join(',', userToCreate.SchemeIdList);
                                }
                                else
                                {
                                    var keys = x.Schemes.Split(",").Select(c => c.Trim());
                                    if (keys != null && keys.Count() > 0)
                                    {
                                        List<KeyValuePairs> schemeExist = configList?.Scheme_KeyValuePairs?.Where(y => !string.IsNullOrWhiteSpace(y.String_Code) && keys.Contains(y.String_Code.Trim()))?.ToList() ?? new List<KeyValuePairs>();
                                        if (schemeExist.Count == 0)
                                        {
                                            x.IsError = true;
                                            x.ErrorColumns.Add("Schemes");
                                            x.Error.Add("Given scheme is not valid");
                                        }
                                        else
                                        {
                                            userToCreate.SchemeIdList = schemeExist?.Select(y => y.String_Value)?.ToList() ?? new List<string>();
                                            userToCreate.SchemesIds = string.Join(',', userToCreate.SchemeIdList);
                                        }
                                    }
                                }
                            }
                            if (string.IsNullOrEmpty(x.Bank))
                            {
                                x.IsError = true;
                                x.ErrorColumns.Add("Bank");
                                x.Error.Add("Bank is required");
                            }
                            else
                            {
                                if (x.Bank.Trim().ToLower() == "all")
                                {
                                    userToCreate.BankIdList = configList?.Bank_KeyValuePairs?.Select(y => y.String_Value)?.ToList() ?? new List<string>();
                                    userToCreate.BankIds = string.Join(',', userToCreate.BankIdList);
                                }
                                else
                                {
                                    var keys = x.Bank.Split(",").Select(c => c.Trim());
                                    if (keys != null && keys.Count() > 0)
                                    {
                                        List<KeyValuePairs> bankExist = configList?.Bank_KeyValuePairs?.Where(y => !string.IsNullOrWhiteSpace(y.String_Key) && keys.Contains(y.String_Key.Trim()))?.ToList() ?? new List<KeyValuePairs>();
                                        if (bankExist.Count == 0)
                                        {
                                            x.IsError = true;
                                            x.ErrorColumns.Add("Bank");
                                            x.Error.Add("Given bank is not valid");
                                        }
                                        else
                                        {
                                            userToCreate.BankIdList = bankExist?.Select(y => y.String_Value)?.ToList() ?? new List<string>();
                                            userToCreate.BankIds = string.Join(',', bankExist?.Select(y => y.String_Value)?.ToList() ?? new List<string>());
                                        }
                                    }
                                }
                            }

                            //if (string.IsNullOrEmpty(x.Branch))
                            //{
                            //    x.IsError = true;
                            //    x.ErrorColumns.Add("Branch");
                            //    x.Error.Add("Branch is required");
                            //}
                            //else
                            //{
                            //    if (x.Branch.Trim().ToLower() == "all")
                            //    {
                            //        if (x.Bank.Trim().ToLower() == "all")
                            //        {
                            //            userToCreate.BranchIdList = configList?.Branch_KeyValuePairs?.Select(y => y.String_Code)?.ToList() ?? new List<string>();
                            //            userToCreate.BranchIds = string.Join(',', userToCreate.BranchIdList);
                            //        }
                            //        else if (userToCreate.BranchIdList?.Count > 0)
                            //        {
                            //            userToCreate.BranchIdList = configList?.Branch_KeyValuePairs?.Where(z => userToCreate.Banks.Contains(z.String_Parant))?.Select(y => y.String_Value)?.ToList() ?? new List<string>();
                            //            userToCreate.BranchIds = string.Join(',', userToCreate.BranchIdList);
                            //        }
                            //    }
                            //    else
                            //    {
                            //        var keys = x.Branch.Split(",").Select(c => c.Trim());
                            //        if (keys != null && keys.Count() > 0)
                            //        {
                            //            List<KeyValuePairs> branchExist = configList?.Branch_KeyValuePairs?.Where(y => !string.IsNullOrWhiteSpace(y.String_Code) && keys.Contains(y.String_Code.Trim()))?.ToList() ?? new List<KeyValuePairs>();
                            //            if (branchExist.Count == 0)
                            //            {
                            //                x.IsError = true;
                            //                x.ErrorColumns.Add("Branch");
                            //                x.Error.Add("Given branch is not valid");
                            //            }
                            //            else
                            //            {
                            //                userToCreate.BranchIdList = branchExist?.Select(y => y.String_Value)?.ToList() ?? new List<string>();
                            //                userToCreate.BranchIds = string.Join(',', branchExist?.Select(y => y.String_Value)?.ToList() ?? new List<string>());
                            //            }
                            //        }
                            //    }
                            //}
                            #endregion Validation

                            if (x.IsError == false)
                            {
                                usersToCreate.Add(userToCreate);
                            }
                            else
                            {
                                outputItems.Add(x);
                                RecordCount = RecordCount + 1;
                            }

                            //if (RecordCount == 10)
                            //{
                            //    break;
                            //}
                        }

                        if (usersToCreate.Count > 0 && outputItems.Count == 0)
                        {
                            _backgroundTaskQueue.QueueBackgroundWorkItem(workItem: token =>
                            {
                                using (var scope = _serviceScopeFactory.CreateScope())
                                {
                                    MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions();
                                    cacheEntryOptions.SlidingExpiration = TimeSpan.FromMinutes(300);
                                    cacheEntryOptions.Priority = CacheItemPriority.Normal;

                                    try
                                    {
                                        _cache.Set(_key, "Running", cacheEntryOptions);

                                        foreach (AccountUserModel item in usersToCreate)
                                        {
                                            item.UserId = Guid.NewGuid().ToString();
                                            item.IsActive = true;
                                            item.UserName = item.Email;

                                            item.SavedBy = audit.SavedBy;
                                            item.SavedByUserName = audit.SavedByUserName;
                                            item.SavedDate = DateTime.Now;

                                            _settingDAL.User_SaveUpdate(item);
                                        }

                                        _cache.Set(_key, "Completed", cacheEntryOptions);
                                    }
                                    catch
                                    {
                                        throw;
                                    }
                                }

                                return Task.CompletedTask;
                            });
                        }
                    }
                }
            }

            if (outputItems.Count > 0)
            {
                return outputItems;
            }
            else
            {
                return new List<UserUploadViewModel>();
            }
        }
        public string GetUserUploadProcessStatus()
        {
            string value;

            if (_cache.TryGetValue("_keyStatusOfUpload", out value))
            {
                return value;
            }
            return "";
        }
        public List<UserBankBranch> User_Bank_Branch_Get(UserBankModel model)
        {
            List<UserBankBranch> list = new List<UserBankBranch>();
            BankBranchMappingSavedModel source = _settingDAL.User_Bank_Branch_Get(model.UserId, string.Join(',', model.BankIds), string.Join(',', model.DistrictIds));

            model.BankIds.ForEach(x =>
            {
                UserBankBranch item = new UserBankBranch();

                item.SelectedBranchIds = new List<string>();
                item.BankId = x;
                item.BankName = source.BankList.Find(bnk => bnk.Id == x)?.Value ?? "";
                item.IsAllBranch = source.Mappings.Find(mp => mp.BankId == x)?.IsAllBranch ?? true;
                if (item.IsAllBranch == false)
                {
                    foreach (var mapping in source.Mappings.Where(mp => mp.BankId == x))
                    {
                        if (!string.IsNullOrEmpty(mapping.BranchIds))
                        {
                            item.SelectedBranchIds.AddRange(mapping.BranchIds.Split(',').ToList());
                        }
                    }

                    item.BranchList = source.BranchList.Where(br => br.ConfigurationId == x).Select(sl => new SelectListItem()
                    {
                        Text = sl.Value,
                        Value = sl.Id,
                        Selected = item.SelectedBranchIds.Contains(sl.Id)
                    }).OrderBy(o => o.Text).ToList();
                }
                if (item.BranchList != null)
                {
                    item.TotalBranchCount = item.BranchList.Count();
                }
                if (item.SelectedBranchIds != null)
                {
                    item.SelectedBranchCount = item.SelectedBranchIds.Count();
                }
                else
                {
                    item.SelectedBranchCount = 0;
                }
                if (item.SelectedBranchCount == 0)
                {
                    item.IsAllBranch = true;
                }
                if (item.IsAllBranch)
                {
                    item.BranchList = new List<SelectListItem>();
                }

                list.Add(item);
            });

            return list;
        }
        public void User_Bank_Branch_Save(UserBankBranchMappingModel model, AuditColumnsModel audit)
        {
            _settingDAL.User_Bank_Branch_Save(model, audit);
        }
        #endregion User

        #region ApprovalFlow

        public List<SelectListItem> GetApprovalflowRoleIdList(string SchemeId)
        {
            List<SelectListItem> list = _settingDAL.Account_Role_Get(IsActive: true).Select(x => new SelectListItem() { Text = x.RoleName, Value = x.Id }).ToList();

            List<string> approvalflow_list = _settingDAL.ApprovalFlow_Get(SchemeId: SchemeId)?.Select(x => x.RoleId)?.ToList() ?? new List<string>();

            list.ForEach(x =>
            {
                if (approvalflow_list.Contains(x.Value))
                {
                    x.Selected = true;
                }
                else
                {
                    x.Selected = false;
                }
            });

            return list;
        }
        public List<ApprovalFlowMaster> ApprovalFlow_Get(string RoleId = "", string SchemeId = "")
        {
            return _settingDAL.ApprovalFlow_Get(RoleId, SchemeId);
        }
        public string ApprovalFlow_Add_Role(ApprovalFlowAddRoleModel_API model)
        {
            return _settingDAL.ApprovalFlow_Add_Role(model);
        }
        public string ApprovalFlow_Remove_Role(ApprovalFlowMaster model)
        {
            return _settingDAL.ApprovalFlow_Remove_Role(model);
        }
        public string ApprovalFlow_SaveUpdate(ApprovalFlowMaster model)
        {
            return _settingDAL.ApprovalFlow_SaveUpdate(model);
        }

        #endregion ApprovalFlow

        #region Application Privilege
        public List<ApplicationPrivilegeViewModel> Application_Privilege_Form_Get(string SchemeId)
        {
            List<ApplicationPrivilegeViewModel> list = new List<ApplicationPrivilegeViewModel>();

            List<ConfigSchemeStatusMappingModel> statusList = _settingDAL.Scheme_Status_Mapping_Get(SchemeId);
            List<AccountRoleModel> roleList = _settingDAL.Account_Role_Get();
            List<ApplicationPrivilegeMaster> savedPrivillages = _settingDAL.Application_Privilege_Get(SchemeId: SchemeId);

            foreach (var status in statusList)
            {
                ApplicationPrivilegeViewModel priv = new ApplicationPrivilegeViewModel();

                priv.StatusId = status.StatusId;
                priv.StatusCode = status.StatusCode;
                priv.Status = status.StatusName;
                priv.SchemeId = SchemeId;
                priv.SortOrder = status.SortOrder;
                priv.Options = new List<RolePrivilegeModel>();

                foreach (var role in roleList)
                {
                    RolePrivilegeModel item = new RolePrivilegeModel();

                    item.RoleId = role.Id;
                    item.Role = role.RoleName;
                    item.StatusId = status.StatusId;
                    item.SchemeId = SchemeId;

                    if (savedPrivillages.Count > 0)
                    {
                        ApplicationPrivilegeMaster? exist = savedPrivillages.Find(x => x.StatusId == status.StatusId && x.RoleId == role.Id && x.SchemeId == SchemeId);
                        if (exist != null)
                        {
                            item.Id = exist.Id;

                            item.CanCreate = exist.CanCreate;
                            item.CanUpdate = exist.CanUpdate;
                            item.CanView = exist.CanView;
                            item.CanDelete = exist.CanDelete;
                            item.CanApprove = exist.CanApprove;
                            item.CanGetMail = exist.CanGetMail;
                            item.CanGetSMS = exist.CanGetSMS;
                            item.CanReturn = exist.CanReturn;
                            item.UcView = exist.UcView;
                            item.UcUpload = exist.UcUpload;
                            item.Form3View = exist.Form3View;
                            item.Form3Upload = exist.Form3Upload;
                        }
                        else
                        {
                            item.Id = Guid.NewGuid().ToString();
                        }
                    }

                    priv.Options.Add(item);
                }

                list.Add(priv);
            }

            List<ApplicationPrivilegeViewModel> otherPrivileges = list.Where(y => y.StatusCode == "REJECTED").OrderBy(x => x.SortOrder).ToList();
            list = list.Where(y => y.StatusCode != "REJECTED").OrderBy(x => x.SortOrder).ToList();
            list.AddRange(otherPrivileges);

            return list;
        }
        public List<RolePrivilegeModel> Application_Privilege_By_Scheme(string SchemeId)
        {
            List<RolePrivilegeModel> Options = new List<RolePrivilegeModel>();

            List<ConfigSchemeStatusMappingModel> statusList = _settingDAL.Scheme_Status_Mapping_Get(SchemeId);
            List<AccountRoleModel> roleList = _settingDAL.Account_Role_Get();
            List<ApplicationPrivilegeMaster> savedPrivillages = _settingDAL.Application_Privilege_Get(SchemeId: SchemeId);

            foreach (var status in statusList)
            {
                foreach (var role in roleList)
                {
                    RolePrivilegeModel item = new RolePrivilegeModel();

                    item.RoleId = role.Id;
                    item.Role = role.RoleName;
                    item.StatusId = status.StatusId;
                    item.SchemeId = SchemeId;

                    if (savedPrivillages.Count > 0)
                    {
                        ApplicationPrivilegeMaster? exist = savedPrivillages.Find(x => x.StatusId == status.Id && x.RoleId == role.Id);
                        if (exist != null)
                        {
                            item.Id = exist.Id;

                            item.CanCreate = exist.CanCreate;
                            item.CanUpdate = exist.CanUpdate;
                            item.CanView = exist.CanView;
                            item.CanDelete = exist.CanDelete;
                            item.CanApprove = exist.CanApprove;
                            item.CanGetMail = exist.CanGetMail;
                            item.CanGetSMS = exist.CanGetSMS;
                            item.CanReturn = exist.CanReturn;
                            item.UcView = exist.UcView;
                            item.UcUpload = exist.UcUpload;
                            item.Form3View = exist.Form3View;
                            item.Form3Upload = exist.Form3Upload;
                        }
                    }

                    Options.Add(item);
                }
            }

            return Options;
        }
        public string Application_Privilege_Save(RolePrivilegeModel model, AuditColumnsModel audit)
        {
            return _settingDAL.Application_Privilege_Save(model, audit);
        }
        public List<ApplicationPrivilegeMaster> Application_Privilege_Get(string SchemeId = "", string RoleId = "", string StatusId = "", string Id = "")
        {
            return _settingDAL.Application_Privilege_Get(SchemeId, RoleId, StatusId, Id);
        }

        #endregion Application Privilege

        #region Scheme Status Mapping
        public List<ConfigSchemeStatusMappingModel> Scheme_Status_Mapping_Get(string SchemeId)
        {
            List<ConfigSchemeStatusMappingModel> list = _settingDAL.Scheme_Status_Mapping_Get(SchemeId);
            list.ForEach(x =>
            {
                if (x.StatusCode == "REJECTED")
                {
                    x.SortOrder = 0;
                    x.IsDisabled = true;
                }
                else if (x.StatusCode == "SAVED")
                {
                    x.SortOrder = 1;
                    x.IsDisabled = true;
                }
                else if (x.StatusCode == "SUBMITTED")
                {
                    x.SortOrder = 2;
                    x.IsDisabled = true;
                }

            });

            list = list.OrderBy(x => x.SortOrder).ToList();

            return list;
        }
        public List<SelectListItem> Scheme_Status_Mapping_Get_Status_List_By_Scheme(string SchemeId)
        {
            List<string> statusList = _settingDAL.Scheme_Status_Mapping_Get(SchemeId)?.Select(x => x.StatusId)?.ToList() ?? new List<string>();
            List<SelectListItem> list = _settingDAL.Configuration_Get(IsActive: true, CategoryCode: "STATUS").Select(x => new SelectListItem()
            {
                Text = x.Value,
                Value = x.Id,
                Selected = statusList.Contains(x.Id),
            }).ToList();

            return list;
        }
        public List<SelectListItem> Get_Status_Select_List_By_Scheme(string SchemeId, bool IsBulkApproval = false)
        {
            List<ConfigSchemeStatusMappingModel> statusList = _settingDAL.Scheme_Status_Mapping_Get(SchemeId);

            if (IsBulkApproval)
            {
                List<string> statusCodeList = new List<string>() { "SAVED", "REJECTED" };
                List<SelectListItem> list = statusList.Where(x => !statusCodeList.Contains(x.StatusCode)).Select(x => new SelectListItem()
                {
                    Text = x.StatusName,
                    Value = x.StatusId
                }).ToList();

                return list;
            }
            else
            {
                List<SelectListItem> list = statusList.Select(x => new SelectListItem()
                {
                    Text = x.StatusName,
                    Value = x.StatusId
                }).ToList();

                return list;
            }
        }
        public void Scheme_Status_Mapping_Generate_Status(SchemeStatusMappingSaveModel model, AuditColumnsModel audit)
        {
            List<ConfigSchemeStatusMappingModel> scheme_status_mapping = _settingDAL.Scheme_Status_Mapping_Get(model.SchemeId);

            _settingDAL.Scheme_Status_Mapping_Delete(model.SchemeId);

            foreach (var statusId in model.StatusIds)
            {
                int order = 0;
                string statusCode = "";

                ConfigSchemeStatusMappingModel? order_model = scheme_status_mapping.Where(x => x.StatusId == statusId && x.SchemeId == model.SchemeId)?.FirstOrDefault();

                if (order_model != null)
                {
                    order = order_model.SortOrder;
                    statusCode = order_model.StatusCode;
                }

                if (order == 0)
                {
                    if (scheme_status_mapping.Count > 0)
                    {
                        order = scheme_status_mapping.Max(x => x.SortOrder) + 1;
                    }
                    else
                    {
                        order = 5;
                    }

                    scheme_status_mapping.Add(new ConfigSchemeStatusMappingModel() { SchemeId = model.SchemeId, StatusId = statusId, SortOrder = order });
                }

                _settingDAL.Scheme_Status_Mapping_Save(model.SchemeId, statusId, order, audit);
            }
        }
        public void Scheme_Status_Mapping_Save(List<ConfigSchemeStatusMappingModel> list, AuditColumnsModel audit)
        {
            foreach (ConfigSchemeStatusMappingModel item in list)
            {
                _settingDAL.Scheme_Status_Mapping_Save(item.SchemeId, item.StatusId, item.SortOrder, audit);
            }
        }

        #endregion Scheme Status Mapping

        #region Document Configuration
        public List<ApplicationDocumentConfigurationModel> Document_Configuration_Get(string Id = "", string SchemeId = "", string DocumentGroupId = "", bool IsActive = true)
        {
            return _settingDAL.Document_Configuration_Get(Id, SchemeId, DocumentGroupId, IsActive);
        }
        public bool Document_Configuration_Update_IsRequired(string Id = "", bool IsRequired = true)
        {
            return _settingDAL.Document_Configuration_Update_IsRequired(Id, IsRequired);
        }
        public string Document_Configuration_Save(ApplicationDocumentConfigurationModel model, AuditColumnsModel audit)
        {
            return _settingDAL.Document_Configuration_Save(model, audit); ;
        }
        public List<DocumentGroupConfigurationOrderModel> Document_Configuration_GetDocumentGroupsBySchemeId(string schemeId)
        {
            return _settingDAL.Document_Configuration_GetDocumentGroupsBySchemeId(schemeId);
        }
        public void Document_Configuration_Group_Order_Save(List<DocumentGroupConfigurationOrderModel> orderList, AuditColumnsModel audit)
        {
            if (orderList != null && orderList.Count > 0)
            {
                foreach (DocumentGroupConfigurationOrderModel item in orderList)
                {
                    _settingDAL.Document_Configuration_Group_Order_Save(item.SchemeId, item.DocumentGroupId, item.SortOrder, audit);
                }
            }
        }
        public List<SchemRequiredDocumentGroups> Document_Configuration_GetBySchemeId(string schemeId)
        {
            List<SchemRequiredDocumentGroups> groupList = new List<SchemRequiredDocumentGroups>();
            List<SchemRequiredCategoryReadModelDocuments> list = _settingDAL.Document_Configuration_GetBySchemeId(schemeId);

            groupList = list.GroupBy(x => x.DocumentGroupName).Select(y => new SchemRequiredDocumentGroups()
            {
                GroupName = y.Key,
                RequiredDocumentCategory = y.ToList()
                    .Select(k => new SchemRequiredCategoryDocuments() 
                    { 
                      CategoryName = k.DocumentCategory, 
                      ApplicableDocuments = k.AcceptedDocuments?.Split(',')?.ToList() ?? new List<string>()
                    }).ToList()
            }).ToList();

            return groupList;
        }
        public List<SchemRequiredDocumentGroups> Document_Configuration_GetByGroupId(string groupId)
        {
            return _settingDAL.Document_Configuration_GetByGroupId(groupId);
        }
        public List<SchemRequiredDocumentGroups> Document_Configuration_GetByGroupIds(List<string> groupIds)
        {
            List<SchemRequiredDocumentGroups> result = new List<SchemRequiredDocumentGroups>();

            foreach (var id in groupIds)
            {
                var docs = _settingDAL.Document_Configuration_GetByGroupId(id);

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
            return _settingDAL.Configuration_Scheme_Subsidy_Get(Id, SchemeId, IsActive);
        }
        public List<ConfigurationdDistrictsWiseSubsidyModel> Configuration_Scheme_District_Subsidy_Get(string ConfigurationSchemeSubsidyId)
        {
            return _settingDAL.Configuration_Scheme_District_Subsidy_Get(ConfigurationSchemeSubsidyId);
        }
        public string Configuration_Scheme_Subsidy_SaveUpdate(ConfigurationSchemeSubsidyModel model, AuditColumnsModel audit)
        {
            string pid = _settingDAL.Configuration_Scheme_Subsidy_SaveUpdate(model, audit);
            if (pid != "-1")
            {
                if (model.DistrictsWiseSubsidyModels != null)
                {
                    foreach (var item in model.DistrictsWiseSubsidyModels)
                    {
                        _settingDAL.Configuration_Scheme_District_Subsidy_SaveUpdate(item, audit);
                    }
                }
            }
            return pid;
        }

        #endregion Scheme Subsidy Configuration

        #region Branch Address
        public List<ConfigurationBranchAddressModel> Config_Branch_Address_Get(string BankId = "", string BranchId = "", string IFSC = "")
        {
            return _settingDAL.Config_Branch_Address_Get(BankId, BranchId, IFSC);
        }
        public string Config_Branch_Address_SaveUpdate(ConfigurationBranchAddressSaveModel model, AuditColumnsModel audit)
        {
            return _settingDAL.Config_Branch_Address_SaveUpdate(model, audit);
        }
        public List<ConfigurationBankBranchGroupViewModel> Config_Branch_Dropdown_Get(BranchGetPayloadModel model)
        {
            List<ConfigurationBankBranchGroupViewModel> list = new List<ConfigurationBankBranchGroupViewModel>();

            List<ConfigurationBranchDropdownModel> source = _settingDAL.Config_Branch_Dropdown_Get(model);
            if (source.Count > 0)
            {
                List<string> bankIds = source.Select(x => x.BankId).Distinct().ToList();
                foreach (var bankId in bankIds)
                {
                    ConfigurationBankBranchGroupViewModel item = new ConfigurationBankBranchGroupViewModel();
                    item.Value = bankId;
                    item.Text = source.Find(x => x.BankId == bankId)?.Bank ?? "";
                    item.Items = source.Where(x => x.BankId == bankId).Select(y => new BranchModel()
                    {
                        Text = y.IFSCCode + "-" + y.Branch + "-" + y.District,
                        Value = y.BranchId,
                    }).ToList();

                    list.Add(item);
                }
            }

            return list;
        }
        public List<SelectListItem> Config_Branch_Dropdown_Get_AutoComplete(string SearchString = "")
        {
            List<ConfigurationBranchDropdownModel> source = _settingDAL.Config_Branch_Dropdown_Get_AutoComplete(SearchString);

            List<SelectListItem> list = source.Select(x => new SelectListItem()
            {
                Text = x.IFSCCode + "-" + x.Branch + "-" + x.District,
                Value = x.IFSCCode
            }).ToList();

            return list;
        }
        public bool IsIFSCValid(string IFSC)
        {
            return _settingDAL.IsIFSCValid(IFSC);
        }
        #endregion Branch Address

        #region Scheme Configuration
        public SchemeConfigDropdownModel Scheme_Config_Form_Get(string SchemeId)
        {
            SchemeConfigDropdownModel model = _settingDAL.Config_Scheme_Form_Get(SchemeId);
            
            model.IsSelfOrFamilyMember = ConstDropdowns.SchemeForSelfOrFamilyMember;
            model.IsAlreadyAvailed = ConstDropdowns.TrueFalseSelect;
            return model;
        }
        public List<ConfigurationSchemeSaveModel> Config_Scheme_Get(string SchemeId = "", string SchemeCode = "", string GroupId = "")
        {
            List<ConfigurationSchemeSaveModel> list = _settingDAL.Config_Scheme_Get(SchemeId: SchemeId,SchemeCode:SchemeCode, SchemeGroupId: GroupId);
            if (list.Count > 0)
            {
                list.ForEach(x =>
                {
                    x.CallLetterStatusIdsList = x.CallLetterStatusId.Split(",").ToList();
                    x.DocRequiredStatusIdsList = x.DocRequiredStatusId.Split(",").ToList();
                    x.FamilyMemberCategorysList = x.FamilyMemberCategorys.Split(",").ToList();
                    x.GendersList = x.Genders.Split(",").ToList();
                    x.CommunityList = x.Community.Split(",").ToList();
                    x.CasteList = x.Caste.Split(",").ToList();
                    x.ReligionsList = x.Religions.Split(",").ToList();
                    x.DistrictsList = x.Districts.Split(",").ToList();

                    x.MemberEducationList = x.MemberEducation.Split(",").ToList();
                    x.FamilyMemberEducationList = x.FamilyMemberEducation.Split(",").ToList();
                    x.MaritalStatusList = x.MaritalStatus.Split(",").ToList();
                    x.OrganizationTypeList = x.OrganizationType.Split(",").ToList();

                    x.CallLetterStatusNamesList = x.CallLetterStatusNames?.Split(",").ToList() ?? new List<string>();
                    x.CommunityNamesList = x.CommunityListNames?.Split(",").ToList() ?? new List<string>();
                    x.DistrictsNamesList = x.DistrictsListNames?.Split(",").ToList() ?? new List<string>();
                    x.GendersNamesList = x.GendersListNames?.Split(",").ToList() ?? new List<string>();
                    x.CasteNamesList = x.CasteListNames?.Split(",").ToList() ?? new List<string>();
                    x.ReligionsNamesList = x.ReligionsListNames?.Split(",").ToList() ?? new List<string>();
                    x.FamilyMemberCategorysNamesList =x.FamilyMemberCategorysListNames?.Split(",").ToList() ?? new List<string>();
                    x.DocRequiredStatusNamesList = x.DocRequiredStatusListNames?.Split(",").ToList() ?? new List<string>();
                    x.MemberEducationNamesList = x.MemberEducationListNames?.Split(",").ToList() ?? new List<string>();
                    x.FamilyMemberEducationNamesList = x.FamilyMemberEducationListNames?.Split(",").ToList() ?? new List<string>();
                    x.MaritalStatusNamesList = x.MaritalStatusListNames?.Split(",").ToList() ?? new List<string>();
                    x.OrganizationTypeNamesList = x.OrganizationTypeListNames?.Split(",").ToList() ?? new List<string>();

                    //x.FromDate = DateOnly.ParseExact(x.FromDateString, "yyyy-MM-dd");
                    //x.ToDate = DateOnly.ParseExact(x.ToDateString, "yyyy-MM-dd");
                    x.FromDate = DateTime.ParseExact(x.FromDateString, "yyyy-MM-dd", null);
                    x.ToDate = DateTime.ParseExact(x.ToDateString, "yyyy-MM-dd", null);

                    if (x.ReligionsList != null && x.ReligionsList.Count > 0)
                    {
                        x.CommunityGrouped = GetConfigurationSelectByParentConfiguration(x.ReligionsList);
                    }
                    if (x.CommunityList != null && x.CommunityList.Count > 0)
                    {
                        x.CastesGrouped = GetConfigurationSelectByParentConfiguration(x.CommunityList);
                    }

                    x.Documents = Document_Configuration_GetBySchemeId(x.SchemeId);

                });
            }
            return list;
        }
        public List<ConfigurationSchemeViewModel> Config_Scheme_View_Get(string SchemeId = "", string SchemeCode = "", string GroupId = "")
        {
            List<ConfigurationSchemeViewModel> list = _settingDAL.Config_Scheme_Get(SchemeId: SchemeId, SchemeCode: SchemeCode, SchemeGroupId: GroupId).Select(y => new ConfigurationSchemeViewModel()
            {
                SchemeId = y.SchemeId,
                SchemeName = y.SchemeName
            }).ToList();
            return list;
        }
        public string Config_Scheme_SaveUpdate(ConfigurationSchemeSaveModel model, AuditColumnsModel audit)
        {
            return _settingDAL.Config_Scheme_SaveUpdate(model, audit);
        }
        public void Config_Scheme_Save_SortOrder(List<SchemeOrderingModel> list, AuditColumnsModel audit)
        {
            foreach (var item in list)
            {
                _settingDAL.Config_Scheme_Save_SortOrder(item, audit);
            }
        }
        public List<SchemeOrderingModel> Config_Scheme_Get_SortOrder(string GroupId)
        {
            return _settingDAL.Config_Scheme_Get_SortOrder(GroupId);
        }
        public string Config_Scheme_Get_Eligibility_Type(string SchemeId)
        {
            return _settingDAL.Config_Scheme_Get_Eligibility_Type(SchemeId);
        }
        #endregion Scheme Configuration

        #region Scheme Sub Cost Configuration
        public List<SchemeSubCategoryConfigurationDateWiseModel> Config_Scheme_Sub_Category_Get(string SchemeId)
        {
            List<SchemeSubCategoryConfigurationDateWiseModel> list = _settingDAL.Config_Scheme_Sub_Category_Get(SchemeId);
            if (list.Count > 0)
            {
                list.ForEach(x =>
                {
                    x.FromDate = DateOnly.ParseExact(x.FromDateString, "yyyy-MM-dd");
                    x.ToDate = DateOnly.ParseExact(x.ToDateString, "yyyy-MM-dd");
                });
            }
            return list;
        }
        public SchemeSubCategoryConfigurationFormContainerModel Config_Scheme_Sub_Category_Form_Get(string SchemeId, string GroupId)
        {
            SchemeSubCategoryConfigurationFormContainerModel model = new SchemeSubCategoryConfigurationFormContainerModel();

            if (string.IsNullOrWhiteSpace(GroupId))
            {
                GroupId = Guid.NewGuid().ToString();
            }

            List<SchemeSubCategoryConfigurationModel> list = _settingDAL.Config_Scheme_Sub_Category_Form_Get(SchemeId, GroupId);
            list.ForEach(x =>
            {
                x.GroupId = GroupId;
                x.OccurrenceList = ConstDropdowns.OccurrenceSelect;
                x.RecurrenceList = ConstDropdowns.RecurrenceSelect;
            });

            SchemeSubCategoryConfigurationDateWiseModel dateRange = Config_Scheme_Sub_Category_Get_Date_Range(GroupId);

            model.CongurationList = list;
            model.FromDate = dateRange.FromDate;
            model.FromDateString = dateRange.FromDateString;
            model.ToDate = dateRange.ToDate;
            model.ToDateString = dateRange.ToDateString;

            model.GroupId = GroupId;
            model.SchemeId = SchemeId;

            return model;
        }
        public SchemeSubCategoryConfigurationDateWiseModel Config_Scheme_Sub_Category_Get_Date_Range(string GroupId)
        {
            SchemeSubCategoryConfigurationDateWiseModel model = _settingDAL.Config_Scheme_Sub_Category_Get_Date_Range(GroupId);

            if (!string.IsNullOrWhiteSpace(model.FromDateString))
            {
                model.FromDate = DateOnly.ParseExact(model.FromDateString, "yyyy-MM-dd");
            }
            else
            {
                model.FromDate = DateOnly.FromDateTime(DateTimeFunctions.GetIST());
            }
            if (!string.IsNullOrWhiteSpace(model.ToDateString))
            {
                model.ToDate = DateOnly.ParseExact(model.ToDateString, "yyyy-MM-dd");
            }
            else
            {
                model.ToDate = DateOnly.FromDateTime(DateTimeFunctions.GetIST());
            }

            return model;
        }
        public void Config_Scheme_Sub_Category_Save(SchemeSubCategoryConfigurationSaveContainerModel model, AuditColumnsModel audit)
        {
            string groupId = Guid.NewGuid().ToString();

            foreach (var item in model.CongurationList)
            {
                //item.GroupId = groupId;
                _settingDAL.Config_Scheme_Sub_Category_Save(item, model.FromDate, model.ToDate, audit);
            }
        }
        public string Config_Scheme_Sub_Category_Check_Dup(string SchemeId, string GroupId, DateTime FromDate, DateTime ToDate)
        {
            return _settingDAL.Config_Scheme_Sub_Category_Check_Dup(SchemeId, GroupId, FromDate, ToDate);
        }
        public string Config_Scheme_Sub_category_Delete(string GroupId)
        {
            return _settingDAL.Config_Scheme_Sub_category_Delete(GroupId);
        }
        #endregion Scheme Sub Cost Configuration

        #region Scheme Group
        public List<ConfigSchemeGroupModel> Config_Scheme_Group_Get(bool IsActive)
        {
            List<ConfigSchemeGroupModel> list = _settingDAL.Config_Scheme_Group_Get(IsActive);
            list.ForEach(x =>
            {
                x.SchemeIdsList = x.SchemeIds.Split(',').ToList();
            });
            return list;
        }
        public string Config_Scheme_Group_Save(ConfigSchemeGroupSaveModel model, AuditColumnsModel audit)
        {
            return _settingDAL.Config_Scheme_Group_Save(model, audit);
        }
        public void Config_Scheme_Group_Save_SortOrder(List<SchemeGroupOrderingModel> list, AuditColumnsModel audit)
        {
            foreach (var item in list)
            {
                _settingDAL.Config_Scheme_Group_Save_SortOrder(item, audit);
            }
        }
        #endregion Scheme Group

        #region Configuration DIstrict
        public List<ConfigurationDistrictModel> Config_District_Get(string districtId)
        {
            return _settingDAL.Config_District_Get(districtId);
        }
        public string Config_District_SaveUpdate(ConfigurationDistrictSaveModel model, AuditColumnsModel audit)
        {
            return _settingDAL.Config_District_SaveUpdate(model, audit);
        }
        #endregion Configuration DIstrict

        #region Help Document
        public List<ConfigHelpDocumentModel> Config_Help_Document_Get(string Id = "", string RoleId = "", string SchemeId = "", string Category = "")
        {
            List<ConfigHelpDocumentModel> list = _settingDAL.Config_Help_Document_Get(Id, RoleId, SchemeId, Category);

            list.ForEach(x =>
            {
                x.SavedFile = _generalDAL.FileMaster_Get(IsActive: true, TypeId: x.Id, Type: FileUploadTypeCode.HelpDocument).FirstOrDefault();

                if (!string.IsNullOrEmpty(x.RoleIds))
                {
                    x.RoleIdList = x.RoleIds.Split(",").ToList();
                }
                if (!string.IsNullOrEmpty(x.SchemeIds))
                {
                    x.SchemeIdList = x.SchemeIds.Split(",").ToList();
                }
            });

            return list;
        }
        public string Config_Help_Document_SaveUpdate(ConfigHelpDocumentSaveModel model, AuditColumnsModel audit)
        {
            return _settingDAL.Config_Help_Document_SaveUpdate(model, audit);
        }
        public ConfigHelpDocumentFormModel Config_Help_Document_Form_Get(string Id = "")
        {
            ConfigHelpDocumentFormModel form = _settingDAL.Config_Help_Document_Form_Get(Id);

            form.CategoryList = new List<SelectListItem>() {

                new SelectListItem(){ Text = "Role", Value = "role" },
                new SelectListItem(){ Text = "Member", Value = "Member" },
                new SelectListItem(){ Text = "General", Value = "General" }
            };

            form.TypeList = new List<SelectListItem>() {

                new SelectListItem(){ Text = "Video", Value = "video" },
                new SelectListItem(){ Text = "PDF", Value = "pdf" }
            };

            return form;
        }
        #endregion Help Document

        #region Approval Doc COnfig
        public bool Config_Scheme_Approval_Doc_Config_Save(ApprovalDocConfigViewModel model, AuditColumnsModel audit)
        {
            return _settingDAL.Config_Scheme_Approval_Doc_Config_Save(model, audit);
        }
        public List<ApprovalDocConfigViewModel> Config_Scheme_Approval_Doc_Config_Get(string SchemeId = "", string StatusId = "")
        {
            return _settingDAL.Config_Scheme_Approval_Doc_Config_Get(SchemeId, StatusId);
        }
        #endregion Approval Doc COnfig

        #region Approval Doc Category Config
        public string Config_Approval_Doc_Category_Save(ConfigApprovalDocCategorySaveModel model, AuditColumnsModel audit)
        {
            return _settingDAL.Config_Approval_Doc_Category_Save(model, audit);
        }
        public List<ConfigApprovalDocCategoryModel> Config_Approval_Doc_Category_Get(string SchemeId = "", string StatusId = "", string DocCategoryId = "")
        {
            return _settingDAL.Config_Approval_Doc_Category_Get(SchemeId, StatusId, DocCategoryId);
        }
        #endregion Approval Doc Category Config

        #region Card Print Status
        public List<CardPrintStatusModel> Config_CardPrintStatusGet()
        {
            return _settingDAL.Config_CardPrintStatusGet();
        }
        public void UpdateCardPrintStatusSortOrder(List<CardPrintStatusOrderModel> list, AuditColumnsModel audit)
        {
            foreach (var item in list)
            {
                _settingDAL.UpdateCardPrintStatusSortOrder(item, audit);
            }
        }
        #endregion Card Print Status

        public List<StatusMaster> Status_Get(string StatusCode = "", string Id = "", string Type = "")
        {
            return _settingDAL.Status_Get(StatusCode, Id, Type);
        }

    }
}
