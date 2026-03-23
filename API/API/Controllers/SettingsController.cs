using API.Helpers;
using AutoMapper;
using BAL.BackgroundWorkerService;
using BAL.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DomainModel;
using Model.MailTemplateHelper;
using Model.ViewModel;
using MySqlX.XDevAPI.Common;
using Serilog;
using Utils;
using Utils.Cache.Configuration;
using Utils.Interface;
using Utils.UtilModels;

namespace API.Controllers
{
    public class SettingsController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly ISettingBAL _settingBAL;
        private readonly IGeneralBAL _generalBAL;
        private readonly IMapper _mapper;
        private readonly IFTPHelpers _ftpHelper;
        private readonly IWebHostEnvironment _webHostEnvironment;

        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IConfigurationCacheService _configCache;

        public SettingsController(ILogger<AccountController> logger, ISettingBAL settingBAL,
            IMapper mapper, IBackgroundTaskQueue backgroundTaskQueue, IServiceScopeFactory serviceScopeFactory,
            IGeneralBAL generalBAL, IFTPHelpers ftpHelper, IWebHostEnvironment webHostEnvironment, IConfigurationCacheService configCache)
        {
            _logger = logger;
            _settingBAL = settingBAL;
            _mapper = mapper;
            _backgroundTaskQueue = backgroundTaskQueue;
            _serviceScopeFactory = serviceScopeFactory;
            _generalBAL = generalBAL;
            _ftpHelper = ftpHelper;
            _webHostEnvironment = webHostEnvironment;
            _configCache = configCache;
        }

        #region Two Column Configuration

        [HttpGet("[action]")]
        public ResponseViewModel Configuration_Get_Scheme_SelectList()
        {
            try
            {
                List<SelectListItem> list = new List<SelectListItem>()
                {
                    new SelectListItem(){ Text = "General", Value = "GENERAL" }
                };

                list.AddRange(_settingBAL.Configuration_Get(IsActive: true, CategoryCode: "SCHEME").Select(x => new SelectListItem()
                {
                    Text = x.Value,
                    Value = x.Id
                }).OrderBy(o => o.Text).ToList());

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = list,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Configuration_Get_Category_SelectList(string SchemeId)
        {
            try
            {
                List<ConfigCategoryModel> list = _settingBAL.Configuration_Category_Get(IsGeneralCategory: SchemeId == "GENERAL").ToList();

                list.ForEach(configCategory =>
                {
                    if (!string.IsNullOrEmpty(configCategory.ParentId))
                    {
                        configCategory.IsDependent = true;
                    }
                    else
                    {
                        configCategory.IsDependent = false;
                    }
                });

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = list.OrderBy(x => x.Category).ToList(),
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Configuration_Get(bool IsActive = true, string ConfigurationId = "", string CategoryId = "", string ParentConfigurationId = "", string CategoryCode = "", string SchemeId = "", bool ShowParent = false)
        {
            try
            {
                if (SchemeId == "GENERAL")
                {
                    SchemeId = "";
                }

                List<ConfigurationModel> list = _settingBAL.Configuration_Get(IsActive, ConfigurationId, CategoryId, ParentConfigurationId, "", CategoryCode, SchemeId, ShowParent: ShowParent);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = _mapper.Map<List<ConfigurationViewModel>>(list).OrderBy(o => o.Value).ToList(),
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Configuration_Category_Get(string CategoryCode, bool IsGeneralCategory)
        {
            try
            {
                //string loginId = User.Claims.Where(x => x.Type == Constants.LoginID)?.FirstOrDefault()?.Value ?? "";

                List<ConfigCategoryModel> list = _settingBAL.Configuration_Category_Get(CategoryCode, IsGeneralCategory);

                if (list != null)
                {
                    list.ForEach(configCategory =>
                    {
                        if (!string.IsNullOrEmpty(configCategory.ParentId))
                        {
                            configCategory.IsDependent = true;
                        }
                        else
                        {
                            configCategory.IsDependent = false;
                        }
                    });

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = _mapper.Map<List<ConfigCategoryViewModel>>(list),
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Configuration_SaveUpdate(ConfigurationSaveViewModel fModel)
        {
            try
            {
                if (fModel != null)
                {
                    if (fModel.SchemeId == "GENERAL")
                    {
                        fModel.SchemeId = null;
                    }

                    ConfigurationModel model = _mapper.Map<ConfigurationModel>(fModel);

                    model.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    model.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    model.SavedDate = DateTime.Now;
                    if (model.Id == "" || model.Id == null)
                    {
                        model.Id = Guid.NewGuid().ToString();
                    }

                    string result = _settingBAL.Configuration_SaveUpdate(model);

                    if (result == "-1")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Duplicate value",
                            ErrorCode = ResponceErrorCodes.TCC_ConfigurationValueExist
                        };
                    }
                    else if (result == "-2")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Duplicate Code",
                            ErrorCode = ResponceErrorCodes.TCC_ConfigurationCodeExist
                        };
                    }
                    else if (result == "-3")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Dependent record exist, You can not set IsAcive 0",
                            ErrorCode = ResponceErrorCodes.TCC_ConfigurationDependentRecordExist
                        };
                    }
                    else
                    {
                        if (model.IsActive)
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = result,
                                Message = "Action completed successfully",
                                ErrorCode = ResponceErrorCodes.TCC_ConfigurationSaved
                            };
                        }
                        else
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = result,
                                Message = "Action completed successfully",
                                ErrorCode = ResponceErrorCodes.TCC_ConfigurationSaved
                            };
                        }
                    }
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel ConfigurationSelectList_Get(bool IsActive = true, string ConfigurationId = "", string CategoryId = "", string ParentConfigurationId = "", string CategoryCode = "", string SchemeId = "")
        {
            try
            {
                if (SchemeId == "GENERAL")
                {
                    SchemeId = "";
                }

                List<ConfigurationModel> list = _settingBAL.Configuration_Get(IsActive, ConfigurationId, CategoryId, ParentConfigurationId, "", CategoryCode, SchemeId);

                if (list != null)
                {
                    List<SelectListItem> selectList = new List<SelectListItem>();

                    if (list.Count > 0)
                    {
                        selectList = list.Select(x => new SelectListItem() { Text = (x.Value + (string.IsNullOrWhiteSpace(x.ValueTamil) ? "" : (" / " + x.ValueTamil))), Value = x.Id }).OrderBy(o => o.Text).ToList();
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = selectList,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Configuration_GetSelectByParentConfigurationIds(List<string> ParentIds)
        {
            try
            {
                List<ConfigSelectListByParentIdListModel> list = _settingBAL.GetConfigurationSelectByParentConfiguration(ParentIds);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = list,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel ConfigurationPincodeSelectList_GetByDistrict(string DistrictId)
        {
            try
            {
                List<ConfigurationModel> list = _settingBAL.Configuration_Get(true, ParentConfigurationId: DistrictId, CategoryCode: "PINCODE");

                if (list != null)
                {
                    List<SelectListItem> selectList = new List<SelectListItem>();

                    if (list.Count > 0)
                    {
                        selectList = list.Select(x => new SelectListItem() { Text = x.Value, Value = x.Value }).OrderBy(o => o.Text).ToList();
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = selectList,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Two Column Configuration

        #region Role

        [HttpGet("[action]")]
        public ResponseViewModel Role_Get(string RoleId = "", bool IsActive = true)
        {
            try
            {
                List<AccountRoleModel> list = _settingBAL.Account_Role_Get(RoleId, IsActive);

                if (list != null)
                {
                    list.ForEach(r =>
                    {
                        if (Constants.StaticRoles.Contains(r.RoleCode))
                        {
                            r.IsChangeable = false;
                        }
                        else
                        {
                            r.IsChangeable = true;
                        }
                    });

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = _mapper.Map<List<AccountRoleViewModel>>(list),
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Role_Get_Select_List()
        {
            try
            {
                List<SelectListItem> list = _settingBAL.Account_Role_Get(IsActive: true).Select(x => new SelectListItem()
                {
                    Text = x.RoleName,
                    Value = x.Id
                }).ToList();

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = list,
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Role_SaveUpdate(AccountRoleViewModel rModel)
        {
            try
            {
                if (rModel != null)
                {
                    AccountRoleModel model = _mapper.Map<AccountRoleModel>(rModel);

                    model.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    model.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    model.SavedDate = DateTime.Now;
                    if (model.Id == "" || model.Id == null)
                    {
                        model.Id = Guid.NewGuid().ToString();
                    }

                    string result = _settingBAL.Account_Role_Save(model);

                    if (result == "-1")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Duplicate role name",
                            ErrorCode = ResponceErrorCodes.ROLE_ConfigurationValueExist
                        };
                    }
                    else if (result == "-2")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Duplicate role code",
                            ErrorCode = ResponceErrorCodes.ROLE_ConfigurationCodeExist
                        };
                    }
                    else if (result == "-3")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Dependent record exist in user master, You can not set IsAcive 0",
                            ErrorCode = ResponceErrorCodes.ROLE_ConfigurationDependentRecordExist
                        };
                    }
                    else if (result == "-4")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Dependent record exist in role privillage, You can not set IsAcive 0",
                            ErrorCode = ResponceErrorCodes.ROLE_ConfigurationDependentRecordExist
                        };
                    }
                    else
                    {
                        if (model.IsActive)
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = result,
                                Message = "Action completed successfully",
                                ErrorCode = ResponceErrorCodes.ROLE_ConfigurationSaved
                            };
                        }
                        else
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = result,
                                Message = "Action completed successfully",
                                ErrorCode = ResponceErrorCodes.ROLE_ConfigurationSaved
                            };
                        }
                    }
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        #endregion Role

        #region Role Priilege
        [HttpGet("[action]")]
        public ResponseViewModel Role_Privilege_Get(string RoleId)
        {
            try
            {
                List<AccountPrivilegeByGroupModel> list = _settingBAL.Account_Role_Privilege_Get(RoleId);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = list,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Role_Privilege_Save(AccountPrivilegeSaveViewModel rModel)
        {
            try
            {
                if (rModel != null)
                {
                    AccountPrivilegeSaveModel model = _mapper.Map<AccountPrivilegeSaveModel>(rModel);

                    model.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    model.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    model.SavedDate = DateTime.Now;

                    string result = _settingBAL.Account_Role_Privilege_Save(model);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully",
                        ErrorCode = ResponceErrorCodes.ROLE_ConfigurationSaved
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Role Priilege

        #region User

        [HttpGet("[action]")]
        public ResponseViewModel User_Get(bool IsActive = true, string UserId = "", string DistrictId = "",
            string UserGroup = "", string RoleId = "", string MobileNumber = "", string Email = "",
            string UserGroupName = "", string SchemeId = "", string BranchId = "", string BankId = "")
        {
            try
            {
                List<AccountUserModel> list = _settingBAL.User_Get(IsActive, UserId, DistrictId, UserGroup, RoleId, MobileNumber, Email, UserGroupName, SchemeId, BranchId, BankId);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = _mapper.Map<List<AccountUserViewModel>>(list),
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpGet("[action]")]
        public ResponseViewModel User_Activate(string UserId)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(UserId))
                {
                    AccountUserModel model = new AccountUserModel();
                    model.UserId = UserId;
                    model.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    model.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    model.SavedDate = DateTime.Now;

                    string userId = _settingBAL.User_Activate(model);

                    if (!string.IsNullOrWhiteSpace(userId))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Message = "Action completed successfully",
                        };
                    }

                }
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Failed,
                    Data = null,
                    Message = "Somthing went wrong"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("[action]")]
        public ResponseViewModel User_SaveUpdate(UserSaveModel rModel)
        {
            try
            {
                if (rModel != null)
                {
                    AccountUserModel model = _mapper.Map<AccountUserModel>(rModel);
                    if (rModel.DistrictIdss != null && rModel.DistrictIdss.Count > 0)
                    {
                        model.DistrictIds = string.Join(',', rModel.DistrictIdss);
                    }
                    if (rModel.LocalBodyIdss != null && rModel.LocalBodyIdss.Count > 0)
                    {
                        model.LocalBodyIds = string.Join(',', rModel.LocalBodyIdss);
                    }
                    if (rModel.NameOfLocalBodyIdss != null && rModel.NameOfLocalBodyIdss.Count > 0)
                    {
                        model.NameOfLocalBodyIds = string.Join(',', rModel.NameOfLocalBodyIdss);
                    }
                    if (rModel.BlockIdss != null && rModel.BlockIdss.Count > 0)
                    {
                        model.BlockIds = string.Join(',', rModel.BlockIdss);
                    }
                    if (rModel.CorporationIdss != null && rModel.CorporationIdss.Count > 0)
                    {
                        model.CorporationIds = string.Join(',', rModel.CorporationIdss);
                    }
                    if (rModel.MunicipalityIdss != null && rModel.MunicipalityIdss.Count > 0)
                    {
                        model.MunicipalityIds = string.Join(',', rModel.MunicipalityIdss);
                    }
                    if (rModel.Town_PanchayatIdss != null && rModel.Town_PanchayatIdss.Count > 0)
                    {
                        model.TownPanchayatIds = string.Join(',', rModel.Town_PanchayatIdss);
                    }
                    if (rModel.Village_PanchayatIdss != null && rModel.Village_PanchayatIdss.Count > 0)
                    {
                        model.VillagePanchayatIds = string.Join(',', rModel.Village_PanchayatIdss);
                    }
                    if (rModel.ZoneIdss != null && rModel.ZoneIdss.Count > 0)
                    {
                        model.ZoneIds = string.Join(',', rModel.ZoneIdss);
                    }
                    if (rModel.SchemesIdss != null && rModel.SchemesIdss.Count > 0)
                    {
                        model.SchemesIds = string.Join(',', rModel.SchemesIdss);
                    }
                    if (rModel.BankIdss != null && rModel.BankIdss.Count > 0)
                    {
                        model.BankIds = string.Join(',', rModel.BankIdss);
                    }
                    if (rModel.BranchIdss != null && rModel.BranchIdss.Count > 0)
                    {
                        model.BranchIds = string.Join(',', rModel.BranchIdss);
                    }
                    if (rModel.CardPrintStatusIdss != null && rModel.CardPrintStatusIdss.Count > 0)
                    {
                        model.CardPrintStatusIds = string.Join(',', rModel.CardPrintStatusIdss);
                    }
                    model.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    model.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    model.SavedDate = DateTime.Now;

                    if (string.IsNullOrEmpty(model.UserId))
                    {
                        model.UserId = Guid.NewGuid().ToString();
                    }

                    AccountUserModel result = _settingBAL.User_SaveUpdate(model);

                    if (result.UserId == "-1")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Duplicate email address",
                            ErrorCode = ResponceErrorCodes.USER_ConfigurationEmailExist
                        };
                    }
                    else if (result.UserId == "-2")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Duplicate mobile number",
                            ErrorCode = ResponceErrorCodes.USER_ConfigurationMobileExist
                        };
                    }
                    else if (result.UserId == "-3")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Duplicate username",
                            ErrorCode = ResponceErrorCodes.USER_ConfigurationMobileExist
                        };
                    }
                    else
                    {
                        if (model.IsActive)
                        {
                            CurrentUserModel currentUser = new CurrentUserModel();
                            currentUser.UserName = model.SavedByUserName;
                            currentUser.UserId = model.SavedBy;

                            EmailTemplateModel? template = MailTemplate.GetEmailTemplate(EmailTemplateCode.UserCreate);
                            if (template != null)
                            {
                                List<EmailModel> mailList = new List<EmailModel>()
                                {
                                    new EmailModel()
                                    {
                                        Body = template.Body,
                                        Subject = template.Subject + " - " + DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss:FFF"),
                                        To = new List<string>() { model.Email },
                                        BodyPlaceHolders = new Dictionary<string, string>() {
                                            { "{RECIPIENTFIRSTNAME}", model.FirstName },
                                            { "{RECIPIENTLASTNAME}", model.LastName },
                                            { "{USERNAME}", model.Email },
                                            { "{PASSWORD}", rModel.Password }
                                        },
                                        SavedBy = model.SavedBy,
                                        SavedByUserName = model.SavedByUserName,
                                        SavedDate = model.SavedDate,
                                        Type = "ACCOUNT",
                                        TypeId = model.UserId,
                                        ReceivedBy = model.UserId
                                    }
                                };

                                if (mailList.Count > 0)
                                {
                                    _generalBAL.SendMessage(mailList, new List<SMSModel>(), currentUser);
                                }
                            }

                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = result,
                                Message = "Action completed successfully",
                                ErrorCode = ResponceErrorCodes.USER_ConfigurationSaved
                            };
                        }
                        else
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = result,
                                Message = "Action completed successfully",
                                ErrorCode = ResponceErrorCodes.USER_ConfigurationSaved
                            };
                        }
                    }
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel User_Form_Get(string UserId = "")
        {
            try
            {
                AccountUserFormDetailModel model = _settingBAL.User_Form_Get(UserId);

                if (model != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = model,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel User_GetList(UserFilterModel userFilter)
        {
            try
            {
                string UserId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                int TotalCount = 0;
                List<AccountUserModel> list = _settingBAL.User_Get(model: userFilter, out TotalCount);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = _mapper.Map<List<AccountUserViewModel>>(list),
                        TotalRecordCount = TotalCount
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        [Consumes("multipart/form-data")]
        public ResponseViewModel User_UploadProfile([FromForm] UserProfileUploadFormModel model)
        {
            try
            {
                if (model.File == null || string.IsNullOrWhiteSpace(model.UserId))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "File  and UserId is required, please send valid content"
                    };
                }
                else
                {
                    FTPModel fTPModel = new FTPModel();
                    fTPModel.file = model.File;
                    fTPModel.FileName = Convert.ToString(Guid.NewGuid()) + Path.GetExtension(model.File?.FileName);

                    FTPModel fTPModel_t = new FTPModel();
                    fTPModel_t.file = ImageHelper.CreateThumbnail(model.File, 50);
                    fTPModel_t.FileName = Convert.ToString(Guid.NewGuid()) + Path.GetExtension(model.File?.FileName);

                    if (_ftpHelper.UploadFile(fTPModel) && _ftpHelper.UploadFile(fTPModel_t))
                    {
                        UserProfileImageSaveModel userProfileImageModel = new UserProfileImageSaveModel();

                        userProfileImageModel.UserId = model.UserId;
                        userProfileImageModel.PofileImageId = fTPModel.FileName;
                        userProfileImageModel.PofileThumbnileImageId = fTPModel_t.FileName;
                        userProfileImageModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                        userProfileImageModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                        userProfileImageModel.SavedDate = DateTime.Now;

                        string res = _settingBAL.User_Save_Profile(userProfileImageModel);
                        if (!string.IsNullOrWhiteSpace(res))
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = userProfileImageModel,
                                Message = "File saved successfully"
                            };
                        }
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Failed to save file"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        [Consumes("multipart/form-data")]
        public ResponseViewModel User_Import(IFormFile file)
        {
            try
            {
                if (file == null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "File is required, please send valid content"
                    };
                }
                else
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    List<UserUploadViewModel> list = _settingBAL.UserImport(file, auditColumnsModel);

                    if (list.Count > 0)
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = list,
                            Message = "Error found"
                        };
                    }
                    else
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = null,
                            Message = "Job scheduled successfully"
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel User_Import_Status_Get()
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _settingBAL.GetUserUploadProcessStatus(),
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpGet("[action]")]
        [AllowAnonymous]
        public async Task<IActionResult> Download_User_Import_Template()
        {
            try
            {
                string sWebRootFolder = _webHostEnvironment.ContentRootPath + "wwwroot\\assets\\Templates\\UserUploadTemplate.xlsx";
                string exportName = "UserUploadTemplate.xlsx";
                var memory = new MemoryStream();
                using (var stream = new FileStream(sWebRootFolder, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;
                return File(memory, StringFunctions.GetMimeType(Path.GetExtension(sWebRootFolder)), exportName);
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return StatusCode(500, "Error while downloading file - " + ex.Message);
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel User_GetBranchByBanks(UserBankModel model)
        {
            try
            {
                if (model != null && model.BankIds.Count > 0)
                {

                    List<UserBankBranch> list = _settingBAL.User_Bank_Branch_Get(model);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = list
                    };
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Failed,
                    Data = null,
                    Message = "Somthing went wrong"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel User_SaveBankBranchMapping(UserBankBranchMappingModel model)
        {
            try
            {
                if (model != null)
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    _settingBAL.User_Bank_Branch_Save(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
                        Message = "Saved Successfully"
                    };
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Failed,
                    Data = null,
                    Message = "Somthing went wrong"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        #endregion User

        #region BackgroundTask

        //[HttpGet("[action]")]
        //[AllowAnonymous]
        private ResponseViewModel SendMail()
        {
            try
            {
                _backgroundTaskQueue.QueueBackgroundWorkItem(workItem: token =>
                {
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        var scopedService = scope.ServiceProvider;
                        var serringBAL = scopedService.GetRequiredService<ISettingBAL>();
                        var logger = scopedService.GetRequiredService<ILogger<SettingsController>>();

                        try
                        {
                            DoBackgroundWork(serringBAL);
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, ex.Message);
                        }
                    }

                    return Task.CompletedTask;
                });

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Failed,
                    Data = null,
                    Message = "Somthing went wrong"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        private void DoBackgroundWork(ISettingBAL settingBAL)
        {
            var list = settingBAL.Account_Role_Get("", true);
        }

        #endregion BackgroundTask

        #region Approval Flow
        [HttpGet("[action]")]
        public ResponseViewModel ApprovalFlow_GetRoleList(string SchemeId)
        {
            try
            {
                List<SelectListItem> list = _settingBAL.GetApprovalflowRoleIdList(SchemeId);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = list,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel ApprovalFlow_Get(string SchemeId)
        {
            try
            {
                List<ApprovalFlowMaster> list = _settingBAL.ApprovalFlow_Get(SchemeId: SchemeId);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = _mapper.Map<List<ApprovalFlowViewMaster>>(list)?.OrderBy(o => o.OrderNumber)?.ToList() ?? new List<ApprovalFlowViewMaster>(),
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel ApprovalFlow_Add_Role(ApprovalFlowAddRoleModel rModel)
        {
            try
            {
                if (rModel != null)
                {
                    ApprovalFlowAddRoleModel_API model = new ApprovalFlowAddRoleModel_API();
                    model.RoleIds = rModel.RoleIds;
                    model.SchemeId = rModel.SchemeId;
                    model.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    model.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    model.SavedDate = DateTime.Now;

                    string result = _settingBAL.ApprovalFlow_Add_Role(model);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel ApprovalFlow_Remove_Role(string Id, string RoleId, string SchemeId)
        {
            try
            {
                ApprovalFlowMaster model = new ApprovalFlowMaster();
                model.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                model.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                model.SavedDate = DateTime.Now;
                model.RoleId = RoleId;
                model.SchemeId = SchemeId;
                model.Id = Id;

                string res = _settingBAL.ApprovalFlow_Remove_Role(model);

                if (res != null && res != "")
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
                        Message = "Action completed successfully",
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel ApprovalFlow_SaveUpdate(List<ApprovalFlowNewViewMaster> rModel)
        {
            try
            {
                if (rModel != null)
                {
                    List<ApprovalFlowMaster> model_list = new List<ApprovalFlowMaster>();

                    int maxOrderNumber = rModel.Max(x => x.OrderNumber);

                    List<SelectListItem> orderList = new List<SelectListItem>();
                    int orderTemp = 0;

                    rModel.OrderBy(o => o.OrderNumber).ToList().ForEach(x =>
                    {
                        ApprovalFlowMaster item = new ApprovalFlowMaster();

                        string nextRole = rModel.Find(n => n.OrderNumber == x.OrderNumber + 1)?.RoleId ?? string.Empty;
                        string previousRole = rModel.Find(n => n.OrderNumber == x.OrderNumber - 1)?.RoleId ?? string.Empty;

                        if (string.IsNullOrEmpty(x.Id))
                        {
                            x.Id = Guid.NewGuid().ToString();
                        }

                        item.Id = x.Id;
                        item.SchemeId = x.SchemeId;
                        item.RoleId = x.RoleId;
                        item.OrderNumber = x.OrderNumber;

                        if (x.OrderNumber == 1)
                        {
                            item.IsNA = true;
                        }
                        else
                        {
                            item.IsNA = false;
                        }

                        if (x.OrderNumber == maxOrderNumber)
                        {
                            item.IsFinal = true;
                        }
                        else
                        {
                            item.IsFinal = false;
                        }

                        if (item.IsFinal == false)
                        {
                            item.ApprovalFlowId = rModel.Find(n => n.OrderNumber == x.OrderNumber + 1)?.RoleId ?? string.Empty;
                        }

                        if (item.IsNA == false)
                        {
                            item.ReturnFlowId = rModel.Find(n => n.OrderNumber == x.OrderNumber - 1)?.RoleId ?? string.Empty;
                        }

                        item.IsActive = true;

                        orderList.Add(new SelectListItem() { Text = item.RoleId, Value = orderTemp.ToString() });
                        orderTemp = orderTemp + 1;

                        model_list.Add(item);

                    });

                    foreach (ApprovalFlowMaster model in model_list)
                    {
                        model.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                        model.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                        model.SavedDate = DateTime.Now;
                        if (model.Id == "" || model.Id == null)
                        {
                            model.Id = Guid.NewGuid().ToString();
                        }
                        model.IsActive = true;
                        model.OrderNumber = Convert.ToInt32(orderList.Find(x => x.Text == model.RoleId)?.Value ?? "0");
                        string result = _settingBAL.ApprovalFlow_SaveUpdate(model);
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
                        Message = "Action completed successfully",
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Approval Flow

        #region Export

        //[HttpGet("[action]")]
        //[AllowAnonymous]
        private ResponseViewModel ExportAsHTML()
        {
            try
            {
                using (var scope = _serviceScopeFactory.CreateScope())
                {
                    var renderer = scope.ServiceProvider.GetRequiredService<RazorView>();
                    var content = renderer.RenderViewToString("ResultView", new ResponseViewModel()
                    {
                        Data = "TestData",
                        Message = "TestMessage",
                        ErrorCode = "200",
                        TotalRecordCount = 10,
                        Status = "SUCCESS"

                    }).GetAwaiter().GetResult();

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = content,
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        #endregion

        #region General Configuration

        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_Get()
        {
            try
            {
                GeneralConfigurationCommonModel model = new GeneralConfigurationCommonModel();

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey();
                if (result.Count > 0)
                {
                    foreach (var item in result)
                    {
                        switch (item.ConfigKey)
                        {
                            case GeneralConfigKeyConstants.RuralDistricts:
                                model.RuralDistricts = item.ConfigValue.Split(',').ToList();
                                break;

                            case GeneralConfigKeyConstants.UrbanDistricts:
                                model.UrbanDistricts = item.ConfigValue.Split(',').ToList();
                                break;

                            case GeneralConfigKeyConstants.ApplicationExpiryDays:
                                model.ApplicationExpiryDays = Convert.ToInt32(item.ConfigValue);
                                break;

                            case GeneralConfigKeyConstants.MemberDocumentCategories:
                                model.MemberDocumentCategories = item.ConfigValue.Split(',').ToList();
                                break;

                            case GeneralConfigKeyConstants.MemberNonMandatoryDocumentCategories:
                                model.MemberNonMandatoryDocumentCategories = item.ConfigValue.Split(',').ToList();
                                break;

                            case GeneralConfigKeyConstants.FamilyMemberMandatoryDocumentCategories:
                                model.FamilyMemberMandatoryDocumentCategories = item.ConfigValue.Split(',').ToList();
                                break;

                            case GeneralConfigKeyConstants.FamilyMemberNonMandatoryDocumentCategories:
                                model.FamilyMemberNonMandatoryDocumentCategories = item.ConfigValue.Split(',').ToList();
                                break;

                            case GeneralConfigKeyConstants.CanSendPhysicalCard:
                                model.CanSendPhysicalCard = item.ConfigValue;
                                break;

                            case GeneralConfigKeyConstants.QuickContactName:
                                model.QuickContactName = item.ConfigValue;
                                break;

                            case GeneralConfigKeyConstants.QuickContactPhone:
                                model.QuickContactPhone = item.ConfigValue;
                                break;

                            case GeneralConfigKeyConstants.QuickContactEmail:
                                model.QuickContactEmail = item.ConfigValue;
                                break;
                        }
                    }
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = model,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel General_Configuration_GetAreaList_ByDistrict(string DistrictId)
        {
            try
            {
                if (!string.IsNullOrEmpty(DistrictId))
                {
                    List<SelectListItem> selectList = new List<SelectListItem>();

                    List<ConfigurationModel> Configlist = _settingBAL.Configuration_Get(IsActive: true, CategoryCode: ConfigurationCategoryCodeConstant.Area);

                    if (Configlist != null)
                    {
                        if (Configlist.Count > 0)
                        {
                            selectList = Configlist.Select(x => new SelectListItem() { Text = x.Value, Value = x.Code ?? "" }).ToList();
                        }
                    }

                    List<ConfigurationGeneralModel> result1 = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.UrbanDistricts);

                    if (result1.Count > 0)
                    {
                        string resString = result1.FirstOrDefault()?.ConfigValue ?? "";
                        List<string> list = resString.Split(',').ToList();
                        if (list.Contains(DistrictId) == false)
                        {
                            selectList = selectList.Where(x => x.Text.ToLower() != "urban").ToList();
                        }
                    }

                    List<ConfigurationGeneralModel> result2 = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.RuralDistricts);

                    if (result2.Count > 0)
                    {
                        string resString = result2.FirstOrDefault()?.ConfigValue ?? "";
                        List<string> list = resString.Split(',').ToList();
                        if (list.Contains(DistrictId) == false)
                        {
                            selectList = selectList.Where(x => x.Text.ToLower() != "rural").ToList();
                        }
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = selectList
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "Please send district Id"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }


        [HttpPost("[action]")]
        public ResponseViewModel General_Configuration_RuralDistricts_SaveUpdate(RuralDistrictsSaveModel rModel)
        {
            try
            {
                if (rModel.DistrictIds.Count > 0)
                {

                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    ConfigurationGeneralModel model = new ConfigurationGeneralModel();

                    model.ConfigName = "";
                    model.ConfigDesc = "";
                    model.ConfigKey = GeneralConfigKeyConstants.RuralDistricts;
                    model.ConfigValue = string.Join(',', rModel.DistrictIds).ToString();

                    string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_RuralDistricts_Get()
        {
            try
            {
                List<string> list = new List<string>();

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.RuralDistricts);

                if (result.Count > 0)
                {
                    string resString = result.FirstOrDefault()?.ConfigValue ?? "";
                    list = resString.Split(',').ToList();
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = list,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }


        [HttpPost("[action]")]
        public ResponseViewModel General_Configuration_UrbanDistricts_SaveUpdate(UrbanDistrictsSaveModel rModel)
        {
            try
            {
                if (rModel.DistrictIds.Count > 0)
                {

                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    ConfigurationGeneralModel model = new ConfigurationGeneralModel();

                    model.ConfigName = "";
                    model.ConfigDesc = "";
                    model.ConfigKey = GeneralConfigKeyConstants.UrbanDistricts;
                    model.ConfigValue = string.Join(',', rModel.DistrictIds).ToString();

                    string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_UrbanDistricts_Get()
        {
            try
            {
                List<string> list = new List<string>();

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.UrbanDistricts);

                if (result.Count > 0)
                {
                    string resString = result.FirstOrDefault()?.ConfigValue ?? "";
                    list = resString.Split(',').ToList();
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = list,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }


        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_Application_Expiry_SaveUpdate(int Days)
        {
            try
            {
                if (Days > 0)
                {

                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    ConfigurationGeneralModel model = new ConfigurationGeneralModel();

                    model.ConfigName = "";
                    model.ConfigDesc = "";
                    model.ConfigKey = GeneralConfigKeyConstants.ApplicationExpiryDays;
                    model.ConfigValue = Days.ToString();

                    string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_Application_Expiry_Get()
        {
            try
            {
                int res = 0;

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.ApplicationExpiryDays);

                if (result.Count > 0)
                {
                    string resString = result.FirstOrDefault()?.ConfigValue ?? "0";
                    res = Convert.ToInt32(resString);
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = res,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }


        [HttpPost("[action]")]
        public ResponseViewModel General_Configuration_Member_Dodument_SaveUpdate(MemberDocumentSaveModel rModel)
        {
            try
            {
                if (rModel.DocumentCategoryIds.Count > 0)
                {

                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    ConfigurationGeneralModel model = new ConfigurationGeneralModel();

                    model.ConfigName = "";
                    model.ConfigDesc = "";
                    model.ConfigKey = GeneralConfigKeyConstants.MemberDocumentCategories;
                    model.ConfigValue = string.Join(',', rModel.DocumentCategoryIds).ToString();

                    string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_Member_Dodument_Get()
        {
            try
            {
                List<string> list = new List<string>();

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.MemberDocumentCategories);

                if (result.Count > 0)
                {
                    string resString = result.FirstOrDefault()?.ConfigValue ?? "";
                    list = resString.Split(',').ToList();
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = list,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }


        [HttpPost("[action]")]
        public ResponseViewModel General_Configuration_Member_NonMandatory_Dodument_SaveUpdate(MemberDocumentSaveModel rModel)
        {
            try
            {
                if (rModel.DocumentCategoryIds.Count > 0)
                {

                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    ConfigurationGeneralModel model = new ConfigurationGeneralModel();

                    model.ConfigName = "";
                    model.ConfigDesc = "";
                    model.ConfigKey = GeneralConfigKeyConstants.MemberNonMandatoryDocumentCategories;
                    model.ConfigValue = string.Join(',', rModel.DocumentCategoryIds).ToString();

                    string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_Member_NonMandatory_Dodument_Get()
        {
            try
            {
                List<string> list = new List<string>();

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.MemberNonMandatoryDocumentCategories);

                if (result.Count > 0)
                {
                    string resString = result.FirstOrDefault()?.ConfigValue ?? "";
                    list = resString.Split(',').ToList();
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = list,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }


        [HttpPost("[action]")]
        public ResponseViewModel General_Configuration_Family_Member_Dodument_SaveUpdate(MemberDocumentSaveModel rModel)
        {
            try
            {
                if (rModel.DocumentCategoryIds.Count > 0)
                {

                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    ConfigurationGeneralModel model = new ConfigurationGeneralModel();

                    model.ConfigName = "";
                    model.ConfigDesc = "";
                    model.ConfigKey = GeneralConfigKeyConstants.FamilyMemberMandatoryDocumentCategories;
                    model.ConfigValue = string.Join(',', rModel.DocumentCategoryIds).ToString();

                    string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_Family_Member_Dodument_Get()
        {
            try
            {
                List<string> list = new List<string>();

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.FamilyMemberMandatoryDocumentCategories);

                if (result.Count > 0)
                {
                    string resString = result.FirstOrDefault()?.ConfigValue ?? "";
                    list = resString.Split(',').ToList();
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = list,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }


        [HttpPost("[action]")]
        public ResponseViewModel General_Configuration_Family_Member_NonMandatory_Dodument_SaveUpdate(MemberDocumentSaveModel rModel)
        {
            try
            {
                if (rModel.DocumentCategoryIds.Count > 0)
                {

                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    ConfigurationGeneralModel model = new ConfigurationGeneralModel();

                    model.ConfigName = "";
                    model.ConfigDesc = "";
                    model.ConfigKey = GeneralConfigKeyConstants.FamilyMemberNonMandatoryDocumentCategories;
                    model.ConfigValue = string.Join(',', rModel.DocumentCategoryIds).ToString();

                    string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_Family_Member_NonMandatory_Dodument_Get()
        {
            try
            {
                List<string> list = new List<string>();

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.FamilyMemberNonMandatoryDocumentCategories);

                if (result.Count > 0)
                {
                    string resString = result.FirstOrDefault()?.ConfigValue ?? "";
                    list = resString.Split(',').ToList();
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = list,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }


        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_CanSend_Physical_Card_SaveUpdate(string value)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(value))
                {

                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    ConfigurationGeneralModel model = new ConfigurationGeneralModel();

                    model.ConfigName = "";
                    model.ConfigDesc = "";
                    model.ConfigKey = GeneralConfigKeyConstants.CanSendPhysicalCard;
                    model.ConfigValue = value;

                    string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = result,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel General_Configuration_CanSend_Physical_Card_SaveUpdate_Get()
        {
            try
            {
                List<string> list = new List<string>();

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey(GeneralConfigKeyConstants.CanSendPhysicalCard);

                if (result.Count > 0)
                {
                    string resString = result.FirstOrDefault()?.ConfigValue ?? "";
                    list = resString.Split(',').ToList();
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = list,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel General_Configuration_QuickContact_Get()
        {
            try
            {
                QuickContactSaveModel model = new QuickContactSaveModel();

                List<ConfigurationGeneralModel> result = _generalBAL.General_Configuration_GetByKey();
                List<string> keys = new List<string>
                {
                    GeneralConfigKeyConstants.QuickContactName,
                    GeneralConfigKeyConstants.QuickContactPhone,
                    GeneralConfigKeyConstants.QuickContactEmail
                };
                if (result.Count > 0)
                {
                    foreach (var item in result.Where(x => keys.Contains(x.ConfigKey)))
                    {
                        switch (item.ConfigKey)
                        {
                            case GeneralConfigKeyConstants.QuickContactName:
                                model.QuickContactName = item.ConfigValue;
                                break;

                            case GeneralConfigKeyConstants.QuickContactPhone:
                                model.QuickContactPhone = item.ConfigValue;
                                break;

                            case GeneralConfigKeyConstants.QuickContactEmail:
                                model.QuickContactEmail = item.ConfigValue;
                                break;
                        }
                    }
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = model,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel General_Configuration_QuickContact_SaveUpdate(QuickContactSaveModel rModel)
        {
            try
            {
                if (rModel != null)
                {

                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    if (!string.IsNullOrWhiteSpace(rModel.QuickContactName))
                    {
                        ConfigurationGeneralModel model = new ConfigurationGeneralModel();
                        model.ConfigName = "";
                        model.ConfigDesc = "";
                        model.ConfigKey = GeneralConfigKeyConstants.QuickContactName;
                        model.ConfigValue = rModel.QuickContactName;
                        string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);
                    }
                    if (!string.IsNullOrWhiteSpace(rModel.QuickContactPhone))
                    {
                        ConfigurationGeneralModel model = new ConfigurationGeneralModel();
                        model.ConfigName = "";
                        model.ConfigDesc = "";
                        model.ConfigKey = GeneralConfigKeyConstants.QuickContactPhone;
                        model.ConfigValue = rModel.QuickContactPhone;
                        string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);
                    }
                    if (!string.IsNullOrWhiteSpace(rModel.QuickContactEmail))
                    {
                        ConfigurationGeneralModel model = new ConfigurationGeneralModel();
                        model.ConfigName = "";
                        model.ConfigDesc = "";
                        model.ConfigKey = GeneralConfigKeyConstants.QuickContactEmail;
                        model.ConfigValue = rModel.QuickContactEmail;
                        string result = _generalBAL.General_Configuration_SaveUpdate(model, auditColumnsModel);
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        #endregion General Configuration

        #region Application privillage

        [HttpGet("[action]")]
        public ResponseViewModel ApplicationPrivilegeFormGet(string SchemeId)
        {
            try
            {
                List<ApplicationPrivilegeViewModel> list = _settingBAL.Application_Privilege_Form_Get(SchemeId);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = list,
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel ApplicationPrivilegeForm_Save(RolePrivilegeModel model)
        {
            try
            {
                if (model != null)
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    if (string.IsNullOrEmpty(model.Id))
                    {
                        model.Id = Guid.NewGuid().ToString();
                    }

                    string result = _settingBAL.Application_Privilege_Save(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = true,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        #endregion Application privillage

        #region Scheme Status Mapping

        [HttpGet("[action]")]
        public ResponseViewModel Scheme_Status_Mapping_Get_Status_List_By_Scheme(string SchemeId)
        {
            try
            {
                List<SelectListItem> list = _settingBAL.Scheme_Status_Mapping_Get_Status_List_By_Scheme(SchemeId);

                if (list != null && list.Count > 0)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = list,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Get_Status_Select_List_By_Scheme(string SchemeId)
        {
            try
            {
                List<SelectListItem> list = _settingBAL.Get_Status_Select_List_By_Scheme(SchemeId);

                if (list != null && list.Count > 0)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = list,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Scheme_Status_Mapping_Generate_Status(SchemeStatusMappingSaveModel model)
        {
            try
            {
                if (model != null && model.StatusIds != null && model.StatusIds.Count > 0 && !string.IsNullOrEmpty(model.SchemeId))
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    _settingBAL.Scheme_Status_Mapping_Generate_Status(model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpGet("[action]")]
        public ResponseViewModel Scheme_Status_Mapping_Get(string SchemeId)
        {
            try
            {
                if (!string.IsNullOrEmpty(SchemeId))
                {
                    List<ConfigSchemeStatusMappingModel> list = _settingBAL.Scheme_Status_Mapping_Get(SchemeId);
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = list,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Scheme_Status_Mapping_Save(List<ConfigSchemeStatusMappingModel> list_model)
        {
            try
            {
                if (list_model != null && list_model.Count > 0)
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    _settingBAL.Scheme_Status_Mapping_Save(list_model, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = true,
                        Message = "Action completed successfully",
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        #endregion Scheme Status Mapping

        #region Document Configuration
        [HttpGet("[action]")]
        public ResponseViewModel Document_Configuration_Get(string Id = "", string SchemeId = "", string DocumentGroupId = "", bool IsActive = true)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Document_Configuration_Get(Id, SchemeId, DocumentGroupId, IsActive),
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Document_Configuration_SaveUpdate(ApplicationDocumentConfigurationSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                ApplicationDocumentConfigurationModel _model = _mapper.Map<ApplicationDocumentConfigurationModel>(model);

                if (string.IsNullOrEmpty(_model.Id))
                {
                    _model.Id = Guid.NewGuid().ToString();
                }

                string res = _settingBAL.Document_Configuration_Save(_model, auditColumnsModel);

                if (res == "-1")
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Mapping already exist",
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = res,
                        Message = "Action completed successfully",
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Document_Configuration_Group_Get(string SchemeId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Document_Configuration_GetDocumentGroupsBySchemeId(SchemeId),
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Document_Configuration_Group_Order_Save(List<DocumentGroupConfigurationOrderModel> orderList)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                _settingBAL.Document_Configuration_Group_Order_Save(orderList, auditColumnsModel);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Document_Configuration_GetByGroupId(string GroupId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Document_Configuration_GetByGroupId(GroupId),
                };
            }
            catch (Exception ex)
            {
                // Log.Error(ex, ex.Message);
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Document_Configuration_GetByGroupIds([FromBody] List<string> groupIds)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Document_Configuration_GetByGroupIds(groupIds)
                };
            }
            catch (Exception ex)
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Message = ex.Message
                };
            }
        }
        #endregion Document Configuration

        #region Scheme Subsidy Configuration
        [HttpGet("[action]")]
        public ResponseViewModel Subsidy_Configuration_Get(string Id = "", string SchemeId = "", bool IsActive = true)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Configuration_Scheme_Subsidy_Get(Id, SchemeId, IsActive),
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Configuration_Scheme_District_Subsidy_Get(string ConfigurationSchemeSubsidyId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Configuration_Scheme_District_Subsidy_Get(ConfigurationSchemeSubsidyId),
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Subsidy_Configuration_SaveUpdate(ConfigurationSchemeSubsidyModel model)
        {
            try
            {
                if (model != null && !string.IsNullOrEmpty(model.SchemeId))
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    if (string.IsNullOrEmpty(model.Id))
                    {
                        model.Id = Guid.NewGuid().ToString();
                    }

                    string res = _settingBAL.Configuration_Scheme_Subsidy_SaveUpdate(model, auditColumnsModel);
                    if (res == "-1")
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Message = "Date range already exist",
                        };
                    }
                    else
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = res,
                            Message = "Action completed successfully",
                        };
                    }


                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = "Invalid record",
                        Note = "Required fields: SchemeId"
                    };
                }

            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Scheme Subsidy Configuration

        #region Branch Address
        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Branch_Address_Get(string BankId, string BranchId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Branch_Address_Get(BankId, BranchId),
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Branch_Address_SaveUpdate(ConfigurationBranchAddressSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Branch_Address_SaveUpdate(model, auditColumnsModel),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Branch_Dropdown_Get(BranchGetPayloadModel model)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Branch_Dropdown_Get(model),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Branch_Dropdown_Search(string SearchString = "")
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Branch_Dropdown_Get_AutoComplete(SearchString),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Branch Address

        #region Scheme Configuration

        [HttpGet("[action]")]
        public ResponseViewModel Scheme_Config_Form_Get(string SchemeId)
        {
            try
            {
                SchemeConfigDropdownModel model = _settingBAL.Scheme_Config_Form_Get(SchemeId);

                if (model.Religions != null && model.Religions.Count > 0)
                {
                    model.CommunityGrouped = _settingBAL.GetConfigurationSelectByParentConfiguration(model.Religions.Where(c => c.Selected).Select(x => x.Value).ToList());
                }
                if (model.Community != null && model.Community.Count > 0)
                {
                    model.CastesGrouped = _settingBAL.GetConfigurationSelectByParentConfiguration(model.Community.Where(c => c.Selected).Select(x => x.Value).ToList());
                }

                if (model != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = model,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Somthing went wrong"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Config_Scheme_Get(string SchemeId = "", string GroupId = "")
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_Get(SchemeId: SchemeId ?? "", GroupId: GroupId ?? ""),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Config_Scheme_GetBy_GroupId(string GroupId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_Get(GroupId: GroupId),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Config_Scheme_Get_By_Code(string SchemeCode)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_Get(SchemeCode: SchemeCode),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Config_Scheme_View_Get(string SchemeId, string GroupId, string SchemeCode)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_View_Get(SchemeId: SchemeId, GroupId: GroupId, SchemeCode: SchemeCode),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Config_Scheme_SaveUpdate(ConfigurationSchemeSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_SaveUpdate(model, auditColumnsModel),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Config_Scheme_Save_SortOrder(List<SchemeOrderingModel> list)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                _settingBAL.Config_Scheme_Save_SortOrder(list, auditColumnsModel);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Config_Scheme_Get_SortOrder(string GroupId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_Get_SortOrder(GroupId).OrderBy(o => o.SortOrder),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Scheme Configuration

        #region Scheme Sub Cost Configuration
        [HttpGet("[action]")]
        public ResponseViewModel Config_Scheme_Sub_Category_Get_List(string SchemeId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_Sub_Category_Get(SchemeId),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Config_Scheme_Sub_Category_Form_Get(string SchemeId, string GroupId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_Sub_Category_Form_Get(SchemeId, GroupId),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Config_Scheme_Sub_Category_Save(SchemeSubCategoryConfigurationSaveContainerModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

        //string res = _settingBAL.Config_Scheme_Sub_Category_Check_Dup(model.GroupId, model.SchemeId, model.FromDate.ToDateTime(TimeOnly.MinValue), model.ToDate.ToDateTime(TimeOnly.MinValue));
        string res = _settingBAL.Config_Scheme_Sub_Category_Check_Dup(model.GroupId, model.SchemeId, model.FromDate, model.ToDate);

        if (res == "not-exist")
                {
                    _settingBAL.Config_Scheme_Sub_Category_Save(model, auditColumnsModel);
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "Configuration exist with same date range",
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Config_Scheme_Sub_category_Delete(string GroupId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_Sub_category_Delete(GroupId),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Scheme Sub Cost Configuration

        #region Scheme Group
        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Config_Scheme_Group_Get(bool IsActive)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _settingBAL.Config_Scheme_Group_Get(IsActive).OrderBy(x => x.SortOrder),
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("[action]")]
        public ResponseViewModel Config_Scheme_Group_Save(ConfigSchemeGroupSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                if (string.IsNullOrWhiteSpace(model.Id))
                {
                    model.Id = Guid.NewGuid().ToString();
                }

                if (model.SchemeIdsList == null || model.SchemeIdsList.Count == 0)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "Scheme Id required, Please select scheme Id",
                    };
                }

                string Id = _settingBAL.Config_Scheme_Group_Save(model, auditColumnsModel);

                if (!string.IsNullOrWhiteSpace(Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = Id,
                        Message = "Action completed successfully",
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "Somthing went wrong. Please try again",
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("[action]")]
        public ResponseViewModel Config_Scheme_Group_Save_SortOrder(List<SchemeGroupOrderingModel> list)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                _settingBAL.Config_Scheme_Group_Save_SortOrder(list, auditColumnsModel);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpGet("[action]")]
        public ResponseViewModel Config_Scheme_Group_Get_SortOrder()
        {
            try
            {
                List<SchemeGroupOrderingModel> list = _settingBAL.Config_Scheme_Group_Get(true).OrderBy(x => x.SortOrder).Select(x => new SchemeGroupOrderingModel()
                {
                    Id = x.Id,
                    GroupName = x.GroupName,
                    GroupNameEnglish = x.GroupName,
                    GroupNameTamil = x.GroupNameTamil ?? "",
                    SortOrder = x.SortOrder
                }).OrderBy(o => o.SortOrder).ToList();

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = list,
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Scheme Group

        #region Configuration District
        [HttpGet("[action]")]
        public ResponseViewModel Config_District_Get(string districtId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_District_Get(districtId),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Config_District_SaveUpdate(ConfigurationDistrictSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                string diatId = _settingBAL.Config_District_SaveUpdate(model, auditColumnsModel);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_District_Get(diatId),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Configuration District

        #region Help Document
        [HttpGet("[action]")]
        public ResponseViewModel Config_Help_Document_Form()
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Help_Document_Form_Get(),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Config_Help_Document_Get(string Id = "", string RoleId = "", string SchemeId = "", string Type = "")
        {
            try
            {
                if (!string.IsNullOrEmpty(Type))
                {
                    Id = "";
                    RoleId = "";
                    SchemeId = "";

                    if (Type.ToLower() == "role")
                    {
                        RoleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";
                    }
                    if (Type.ToLower() == "scheme")
                    {
                        ConfigurationModel? list = _settingBAL.Configuration_Get(IsActive: true, CategoryCode: "SCHEME").FirstOrDefault();
                        if (list != null)
                        {
                            SchemeId = list.Id;
                        }
                    }
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Help_Document_Get(Id, RoleId, SchemeId, Type),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Config_Help_Document_Delete(string Id)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Help_Document_SaveUpdate(new ConfigHelpDocumentSaveModel()
                    {
                        Id = Id,
                        IsActive = false

                    }, auditColumnsModel),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        [Consumes("multipart/form-data")]
        public ResponseViewModel Config_Help_Document_SaveUpdate([FromForm] ConfigHelpDocumentSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                if (string.IsNullOrEmpty(model.Id))
                {
                    model.Id = Guid.NewGuid().ToString();
                }

                string Id = _settingBAL.Config_Help_Document_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(Id))
                {
                    if (model.File != null)
                    {
                        FTPModel fTPModel = new FTPModel();
                        fTPModel.file = model.File;
                        fTPModel.FileName = Convert.ToString(Guid.NewGuid()) + Path.GetExtension(model.File?.FileName);

                        if (_ftpHelper.UploadFile(fTPModel))
                        {
                            FileMasterModel fileMasterModel = new FileMasterModel();

                            if (string.IsNullOrWhiteSpace(fileMasterModel.Id))
                            {
                                fileMasterModel.Id = Guid.NewGuid().ToString();
                            }
                            fileMasterModel.TypeId = Id;
                            fileMasterModel.Type = FileUploadTypeCode.HelpDocument;
                            fileMasterModel.TypeName = FileUploadTypeCode.HelpDocument;
                            fileMasterModel.FileType = Path.GetExtension(model.File?.FileName) ?? "";
                            fileMasterModel.OriginalFileName = model.File?.FileName ?? "";
                            fileMasterModel.SavedFileName = fTPModel.FileName;
                            fileMasterModel.IsActive = true;
                            fileMasterModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                            fileMasterModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                            fileMasterModel.SavedDate = DateTime.Now;

                            string res = _generalBAL.FileMaster_SaveUpdate(fileMasterModel);
                            if (!string.IsNullOrWhiteSpace(res))
                            {
                                List<FileMasterModel> existRecords = _generalBAL.FileMaster_Get(true, Type: FileUploadTypeCode.HelpDocument, TypeId: Id);
                                if (existRecords?.Count > 0)
                                {
                                    existRecords?.ForEach(x =>
                                    {
                                        if (x.Id != res)
                                        {
                                            x.IsActive = false;
                                            x.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                                            x.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                                            x.SavedDate = DateTime.Now;

                                            _generalBAL.FileMaster_SaveUpdate(x);
                                        }
                                    });
                                }
                            }
                        }
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = Id,
                        Message = "Action completed successfully",
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = Id,
                        Message = "Somthing went wrong!",
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Help Document

        #region Approval Doc COnfig
        [HttpGet("[action]")]
        public ResponseViewModel Config_Scheme_Approval_Doc_Config_Get(string SchemeId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Scheme_Approval_Doc_Config_Get(SchemeId: SchemeId).OrderBy(o => o.SortOrder).ToList(),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("[action]")]
        public ResponseViewModel Config_Scheme_Approval_Doc_Config_Save(ApprovalDocConfigViewModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                bool res = _settingBAL.Config_Scheme_Approval_Doc_Config_Save(model, auditColumnsModel);
                if (res)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = res,
                        Message = "Action completed successfully",
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = res,
                        Message = "Action not completed successfully",
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Approval Doc COnfig

        #region Approval Doc category COnfig

        [HttpGet("[action]")]
        public ResponseViewModel Config_Approval_Doc_Category_Get(string SchemeId = "", string StatusId = "", string DocCategoryId = "")
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _settingBAL.Config_Approval_Doc_Category_Get(SchemeId, StatusId, DocCategoryId),
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("[action]")]
        public ResponseViewModel Config_Approval_Doc_Category_Save(ConfigApprovalDocCategorySaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                string res = _settingBAL.Config_Approval_Doc_Category_Save(model, auditColumnsModel);
                if (!string.IsNullOrWhiteSpace(res))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = res,
                        Message = "Action completed successfully",
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = res,
                        Message = "Action not completed successfully",
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Approval Doc category COnfig

        #region Card Print Status
        [HttpGet("[action]")]
        public ResponseViewModel Config_CardPrintStatusGet()
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _settingBAL.Config_CardPrintStatusGet().OrderBy(o => o.SortOrder).ToList()
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("[action]")]
        public ResponseViewModel Config_UpdateCardPrintStatusSortOrder(List<CardPrintStatusOrderModel> list)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                _settingBAL.UpdateCardPrintStatusSortOrder(list, auditColumnsModel);
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }
        #endregion Card Print Status

        #region CacheClear
        // Function for Clear all caches
        [HttpGet("[action]")]
        [AllowAnonymous]
        public IActionResult ClearAllCache()
        {
            _configCache.ClearAllConfigurationCache();
            return Ok("All caches cleared successfully");
        }
        #endregion CacheClear


    }
}