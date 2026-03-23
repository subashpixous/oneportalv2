using API.Helpers;
using API.Infrastructure;
using AutoMapper;
using AutoMapper.Execution;
using BAL;
using BAL.BackgroundWorkerService;
using BAL.Interface;
using DAL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using Org.BouncyCastle.Asn1.X509;
using Serilog;
using System.Reflection;
using Utils;
using Utils.Interface;
using static System.Net.Mime.MediaTypeNames;

namespace API.Controllers
{
    public class SchemeController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAccountBAL _accountBAL;
        private readonly ISettingBAL _settingsBAL;
        private readonly ISchemeBAL _schemeBAL;
        private readonly IGeneralBAL _generalBAL;
        private readonly IUserBAL _userBAL;
        private readonly IMapper _mapper;
        private readonly IJwtAuthManager _jwtAuthManager;
        private readonly ISMSHelper _smsHelper;
        private readonly IFTPHelpers _ftpHelper;
        private readonly IMemberBAL _memberBAL;

        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public SchemeController(ILogger<AccountController> logger,
            IAccountBAL accountBAL,
            IMapper mapper,
            IJwtAuthManager jwtAuthManager,
            ISettingBAL settingsBAL,
            ISchemeBAL schemeBAL,
            ISMSHelper smsHelper,
            IFTPHelpers ftpHelper, IGeneralBAL generalBAL, IUserBAL userBAL,
            IBackgroundTaskQueue backgroundTaskQueue,
            IServiceScopeFactory serviceScopeFactory,
            IMemberBAL memberBAL)
        {
            _logger = logger;
            _accountBAL = accountBAL;
            _settingsBAL = settingsBAL;
            _schemeBAL = schemeBAL;
            _mapper = mapper;
            _jwtAuthManager = jwtAuthManager;
            _smsHelper = smsHelper;
            _ftpHelper = ftpHelper;
            _generalBAL = generalBAL;
            _userBAL = userBAL;
            _memberBAL = memberBAL;

            _backgroundTaskQueue = backgroundTaskQueue;
            _serviceScopeFactory = serviceScopeFactory;
        }

        #region Application

        [HttpPost("[action]")]
        public ResponseViewModel Application_Init(ApplicationMasterSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                string applicationID = _schemeBAL.Application_Master_Save(model.IsSubmit, model, auditColumnsModel);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = applicationID,
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
        public ResponseViewModel Application_Scheme_Form(SelectedSchemeSubCategoryGetPayload model)
        {
            try
            {
                ApplicationSchemeCostDetails _model = new ApplicationSchemeCostDetails();

                IEnumerable<(string SchemeId, string SchemeSubCategoryId, string SchemeSubCategory, decimal Amount)> applicationDetails = _schemeBAL.GetSelectedSubCategoryAndAmount(model.ApplicationId);

                _model.SchemeSubCategory = new List<ApplicationCostDetails>();
                _settingsBAL.Configuration_Get(IsActive: true, CategoryCode: "SCHEMESUBCATEGORY", SchemeId: model.SchemeId).ForEach(x =>
                {
                    ApplicationCostDetails item = _schemeBAL.Application_Get_Cost_Details(model, x.Id);
                    if (item != null)
                    {
                        if (applicationDetails?.Count() > 0)
                        {
                            item.IsSelected = applicationDetails.ToList().Exists(u => u.SchemeSubCategoryId == item.SubCategoryId);
                        }

                        item.SubCategory = !string.IsNullOrWhiteSpace(x.ValueTamil) ? x.Value + "/" + x.ValueTamil : x.Value;
                        _model.SchemeSubCategory.Add(item);
                    }
                });
                _model.IsSingleCategorySelect = _schemeBAL.Application_IsSingleCategorySelect(model.SchemeId);
                _model.BankSelectList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "BANK");

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = _model,
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
        public ResponseViewModel Application_Save_Scheme_Cost_Details(ApplicationSaveSchemeCostDetails model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                //created by surya
                _schemeBAL.Application_Save_Cost_Details(model.ApplicationCostDetails, auditColumnsModel, model.ActionType);

                _memberBAL.Application_Member_Bank_SaveUpdate(model.BankDetailSaveModel, auditColumnsModel);
                _schemeBAL.Application_Scheme_Additional_Information_Update(model.schemeAdditionalInformation);
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = "",
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
        public ResponseViewModel Application_Get(string DetailId = "", string ApplicationId = "")
        {
            try
            {
                string roleId = "";
                string authHeader = Request.Headers["Authorization"].ToString();
                if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    roleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";
                }

                List<ApplicationDetailViewModel> list = _schemeBAL.Application_Detail_Get(DetailId, ApplicationId);

                if (list != null)
                {
                    if (!string.IsNullOrEmpty(ApplicationId))
                    {
                        list.ForEach(x =>
                        {
                            if (!string.IsNullOrEmpty(roleId))
                            {
                                ApplicationPrivilegeMaster? p_m = _settingsBAL.Application_Privilege_Get(SchemeId: x.SchemeId, RoleId: roleId, StatusId: x.StatusId).FirstOrDefault();
                                if (p_m != null)
                                {
                                    x.Privileges = _mapper.Map<ApplicationUCForm3PrivilegeModel>(p_m);
                                }
                            }

                            x.StatusFlow = new List<StatusFlowModel>();

                            List<ConfigSchemeStatusMappingModel> list = _settingsBAL.Scheme_Status_Mapping_Get(x.SchemeId);
                            if (list.Count > 0)
                            {
                                bool passed = false;

                                foreach (var status in list.Where(y => y.StatusCode != "REJECTED"))
                                {
                                    StatusFlowModel sfm = new StatusFlowModel();

                                    sfm.Status = status.StatusName;
                                    sfm.StatusCode = status.StatusCode;
                                    sfm.Order = status.SortOrder;
                                    sfm.Number = status.SortOrder;

                                    if (!passed)
                                    {
                                        sfm.IsPassed = true;
                                    }
                                    if (status.StatusId == x.StatusId)
                                    {
                                        passed = true;
                                    }

                                    x.StatusFlow.Add(sfm);
                                }
                            }

                            x.ApplicationBank = _memberBAL.Application_Member_Bank_Get(Application_Id: x.ApplicationId);
                            x.schemeAdditionalInformation = _schemeBAL.Application_Scheme_Additional_Information_Get(ApplicationId: x.ApplicationId);
                        });
                    }

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

        #endregion Application

        #region Mail

        [HttpGet("[action]")]
        public ResponseViewModel Application_Send_Mail(string ApplicationId)
        {
            try
            {
                bool res = _schemeBAL.ApplicationSendMail(ApplicationId, new List<string>(), "");

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return null;
            }
        }

        #endregion Mail

        #region Document

        [HttpGet("[action]")]
        public ResponseViewModel Application_Document_Get(string ApplicationId)
        {
            try
            {
                List<ApplicationDocumentFormModel> list = _schemeBAL.Application_Document_Get(ApplicationId: ApplicationId);

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
        public ResponseViewModel Application_Document_Get_From_Member_Doc_Table(string MemberId, string SchemeId, string ApplicationId)
        {
            try
            {
                List<ApplicationDocumentFormModel> list = _schemeBAL.Application_Document_Get_From_Member_Doc_Table(MemberId, SchemeId, ApplicationId);

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

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Common_File_Download_qr(string SavedFileName, string OriginalFileName)
        {
            try
            {
                if (!string.IsNullOrEmpty(SavedFileName) && !string.IsNullOrEmpty(OriginalFileName))
                {
                    FileInfo info = new FileInfo(SavedFileName);

                    string base64encodedstring = _ftpHelper.DownloadFile(new FTPModel() { FileName = SavedFileName });

                    byte[] bytes = Convert.FromBase64String(base64encodedstring);
                    MemoryStream memory = new MemoryStream(bytes);

                    memory.Position = 0;
                    string MimeType = StringFunctions.GetMimeType(info.Extension);

                    return File(memory, MimeType, OriginalFileName);
                }

                return null;
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return null;
            }
        }


        [HttpGet("[action]")]
        public IActionResult Application_Common_File_Download(string SavedFileName, string OriginalFileName)
        {
            try
            {
                if (!string.IsNullOrEmpty(SavedFileName) && !string.IsNullOrEmpty(OriginalFileName))
                {
                    FileInfo info = new FileInfo(SavedFileName);

                    string base64encodedstring = _ftpHelper.DownloadFile(new FTPModel() { FileName = SavedFileName });

                    byte[] bytes = Convert.FromBase64String(base64encodedstring);
                    MemoryStream memory = new MemoryStream(bytes);

                    memory.Position = 0;
                    string MimeType = StringFunctions.GetMimeType(info.Extension);

                    return File(memory, MimeType, OriginalFileName);
                }

                return null;
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return null;
            }
        }

        [HttpGet("[action]")]
        public IActionResult Application_Document_Download(string fileId)
        {
            try
            {
                ApplicationDocumentMasterModel? file = _schemeBAL.Application_Document_GetById(fileId).FirstOrDefault();

                if (file != null)
                {
                    FileInfo info = new FileInfo(file.SavedFileName);

                    string base64encodedstring = _ftpHelper.DownloadFile(new FTPModel() { FileName = file.SavedFileName });

                    byte[] bytes = Convert.FromBase64String(base64encodedstring);
                    MemoryStream memory = new MemoryStream(bytes);

                    memory.Position = 0;
                    string MimeType = StringFunctions.GetMimeType(info.Extension);

                    return File(memory, MimeType, file.OriginalFileName);
                }

                return null;
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return null;
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel Document_SaveUpdate([FromForm] ApplicationDocumentMasterSaveModel model)
        {
            try
            {
                if (model.File != null)
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    ApplicationDocumentMasterModel model2 = _mapper.Map<ApplicationDocumentMasterModel>(model);

                    FTPModel fTPModel = new FTPModel();
                    fTPModel.file = model.File;
                    fTPModel.FileName = Convert.ToString(Guid.NewGuid()) + Path.GetExtension(model.File?.FileName);

                    if (_ftpHelper.UploadFile(fTPModel))
                    {
                        model2.SavedFileName = fTPModel.FileName;
                        model2.OriginalFileName = model.File?.FileName ?? model2.SavedFileName;
                        model2.IsActive = true;

                        string documentSavedId = _schemeBAL.Application_Document_SaveUpdate(model2, auditColumnsModel);

                        if (!string.IsNullOrEmpty(documentSavedId))
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Message = "Action completed successfully",
                                Data = model2
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
                        Message = "Please select file"
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

        [HttpGet("[action]")]
        public ResponseViewModel Document_Delete(string Id = "")
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                string ids = _schemeBAL.Application_Document_Delete(Id, auditColumnsModel);

                if (ids != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = ids,
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
        public ResponseViewModel Document_Verification_SaveUpdate(ApplicationDocumentVerificationMasterModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                int res = _schemeBAL.Application_Document_Verification_SaveUpdate(model, auditColumnsModel);

                if (res > 0)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = null
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Failed to save document verification details"
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

        #endregion Document

        #region Profile

        [HttpPost("[action]")]
        [Consumes("multipart/form-data")]
        public ResponseViewModel Profile_Upload([FromForm] ApplicationProfileUploadFormModel model)
        {
            try
            {
                if (model.File == null || string.IsNullOrWhiteSpace(model.ApplicationId))
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
                        FileMasterModel fileMasterModel = new FileMasterModel();

                        if (string.IsNullOrWhiteSpace(fileMasterModel.Id))
                        {
                            fileMasterModel.Id = Guid.NewGuid().ToString();
                        }
                        fileMasterModel.TypeId = model.ApplicationId;
                        fileMasterModel.Type = FileUploadTypeCode.ApplicationProfile;
                        fileMasterModel.TypeName = "Application Profile";
                        fileMasterModel.FileType = Path.GetExtension(model.File?.FileName) ?? "";
                        fileMasterModel.OriginalFileName = model.File?.FileName ?? "";
                        fileMasterModel.SavedFileName = fTPModel.FileName;
                        fileMasterModel.ThumbnailSavedFileName = fTPModel_t.FileName;
                        fileMasterModel.IsActive = true;
                        fileMasterModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                        fileMasterModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                        fileMasterModel.SavedDate = DateTime.Now;

                        string res = _generalBAL.FileMaster_SaveUpdate(fileMasterModel);

                        if (!string.IsNullOrWhiteSpace(res))
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = fileMasterModel,
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

        [HttpGet("[action]")]
        public ResponseViewModel Profile_Delete(string ApplicationId)
        {
            try
            {
                List<FileMasterModel> list = _generalBAL.FileMaster_Get(IsActive: true, Type: FileUploadTypeCode.ApplicationProfile, TypeId: ApplicationId);

                list.ForEach(x =>
                {
                    x.IsActive = false;
                    x.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    x.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    x.SavedDate = DateTime.Now;

                    string res = _generalBAL.FileMaster_SaveUpdate(x);
                });

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

        #endregion Profile

        #region Approvals

        [HttpGet("[action]")]
        public ResponseViewModel Application_Approval_Document_Get(string ApprovalCommentId)
        {
            try
            {
                List<ApplicationApprovalFileModel> list = _schemeBAL.Application_Approval_File_Get(ApprovalCommentId: ApprovalCommentId).OrderBy(x => x.DocCategory).ToList();

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
        public ResponseViewModel Application_Approval_Doc_Category_Get(string ApplicationId, string SchemeId, string StatusId, string ApprovalCommentId)
        {
            try
            {
                List<ApplicationApprovalFileModel> list = _schemeBAL.Application_Approval_Doc_Category_Get(ApplicationId, SchemeId, StatusId, ApprovalCommentId).OrderBy(x => x.DocCategory).ToList();

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
        public ResponseViewModel Application_approval_comments_Get(string ApplicationId)
        {
            try
            {
                List<ApprovalViewModel> list = _schemeBAL.Application_approval_comments_Get(ApplicationId: ApplicationId);

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

        #endregion Approvals

        #region Subsidy Config

        [HttpPost("[action]")]
        public ResponseViewModel SubsidyValueGet(SubsidyValueGetFormModel model)
        {
            try
            {
                SubsidyValueGetResponseModel res = new SubsidyValueGetResponseModel();

                if (string.IsNullOrEmpty(model.SchemeId))
                {
                    model.SchemeId = _settingsBAL.Configuration_Get(IsActive: true, Code: "MKKS").FirstOrDefault()?.Id ?? "";
                }

                DateTime currentDate = DateTime.Now;
                List<ConfigurationSchemeSubsidyModel> list = _settingsBAL.Configuration_Scheme_Subsidy_Get(IsActive: true, SchemeId: model.SchemeId).OrderByDescending(x => x.ModifiedDate).ToList();
                ConfigurationSchemeSubsidyModel? config = list.FirstOrDefault(x => currentDate >= x.FromDate && currentDate <= x.ToDate);
                if (config != null)
                {
                    decimal percentageCost = (config.SubsidyPercentage / 100) * model.Cost;
                    if (percentageCost > config.SubsidyCost)
                    {
                        res.SubsidyCost = config.SubsidyCost;
                    }
                    else
                    {
                        res.SubsidyCost = percentageCost;
                    }

                    res.SubsidyCost_Config = config.SubsidyCost;
                    res.MaxProjectCost = config.MaxProjectCost;
                    res.SubsidyPercentage_Config = config.SubsidyPercentage;
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = res,
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

        #endregion Subsidy Config

        #region Bank
        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel BranchGetByIFSC(string ifsc)
        {
            try
            {
                if (!string.IsNullOrEmpty(ifsc))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = _settingsBAL.Config_Branch_Address_Get(IFSC: ifsc).FirstOrDefault(),
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "IFSC is mandatory"
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
        #endregion Bank

        #region Callletter

        [HttpGet("[action]")]
        public ResponseViewModel Callletter_Application_SelectList_Get(string District, string SchemeId, string StatusId)
        {
            try
            {
                List<SelectListItem> list = _schemeBAL.Callletter_Application_SelectList_Get(District, SchemeId, StatusId);

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
        public ResponseViewModel Callletter_Application_Get(string Id = "", string CallletterId = "", string ApplicationId = "", bool IsActive = true)
        {
            try
            {
                List<CallletterApplicationModel> list = _schemeBAL.Callletter_Application_Get(Id, CallletterId, ApplicationId, IsActive);

                if (list != null)
                {
                    var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                    var istTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istZone);

                    list.ForEach(x =>
                    {
                        //if (x.MeetingDate > istTime || x.MeetingTimeTo > istTime)
                        //{
                        //    x.CanSent = true;
                        //}
                        //else
                        //{
                        //    x.CanSent = false;
                        //}

                        x.CanSent = true;
                    });

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
        public ResponseViewModel Callletter_Application_SaveUpdate(CallletterMasterSaveModel model)
        {
            try
            {
                if (model.ApplicationIds != null && model.ApplicationIds.Count > 0)
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    if (string.IsNullOrEmpty(model.Id))
                    {
                        model.Id = Guid.NewGuid().ToString();
                    }

                    string callletterId = _schemeBAL.Callletter_Application_SaveUpdate(model, auditColumnsModel);

                    if (!string.IsNullOrEmpty(callletterId))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Message = "Action completed successfully",
                            Data = callletterId
                        };
                    }

                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Please select applications"
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
        public ResponseViewModel Callletter_Get(CallletterFilterModel model)
        {
            try
            {
                if (model != null)
                {
                    string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                    if (bb != null)
                    {
                        if (model.Where == null)
                        {
                            model.Where = new CallletterWhereClauseProperties();
                        }
                        if (!string.IsNullOrEmpty(bb.SchemesIds) && (model.Where.SchemeIds == null || model.Where.SchemeIds?.Count == 0))
                        {
                            model.Where.SchemeIds = bb.SchemesIds.Split(',').ToList();
                        }
                        if (!string.IsNullOrEmpty(bb.DistrictIds) && (model.Where.DistrictIds == null || model.Where.DistrictIds?.Count == 0))
                        {
                            model.Where.DistrictIds = bb.DistrictIds.Split(',').ToList();
                        }
                    }


                    int TotalCount = 0;
                    List<CallletterGridModel> list = _schemeBAL.Callletter_Grid_Get(model, out TotalCount);
                    if (list.Count > 0)
                    {
                        list.ForEach(x =>
                        {
                            if ((x.CallLetterStatus.ToLower() == "scheduled" || x.CallLetterStatus.ToLower() == "cancelled"))
                            {
                                x.CanDelete = true;
                            }
                            else
                            {
                                x.CanDelete = false;
                            }

                            if (x.CallLetterStatus.ToLower() == "scheduled" || x.CallLetterStatus.ToLower() == "Cancelled")
                            {
                                x.CanCancel = false;
                            }
                            else
                            {
                                x.CanCancel = true;
                            }

                            var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                            var istTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istZone);

                            if ((x.CallLetterStatus.ToLower() == "scheduled" || x.CallLetterStatus.ToLower() == "message not sent for all"))
                            {
                                x.CanSent = true;
                            }
                            else
                            {
                                x.CanSent = false;
                            }
                        });
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = list,
                        TotalRecordCount = TotalCount
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

        [HttpGet("[action]")]
        public ResponseViewModel Callletter_GetById(string Id)
        {
            try
            {
                if (!string.IsNullOrEmpty(Id))
                {
                    CallletterMasterSaveModel model = _schemeBAL.Callletter_Application_Master_Get(Id);
                    if (!string.IsNullOrEmpty(model.ApplicationIdsStr))
                    {
                        model.ApplicationIds = model.ApplicationIdsStr.Split(',').ToList();
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = model,
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

        [HttpGet("[action]")]
        public ResponseViewModel Callletter_Status_SelectList(string schemeId)
        {
            try
            {
                List<SelectListItem> statusList = new List<SelectListItem>();

                if (!string.IsNullOrEmpty(schemeId))
                {
                    List<CallletterStatusModel> list = _schemeBAL.GetCallletterStatus(schemeId);
                    if (list.Count > 0)
                    {
                        statusList = list.Select(x => new SelectListItem()
                        {
                            Text = x.Status,
                            Value = x.StatusId
                        }).Distinct().ToList();
                    }
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = statusList,
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
        public ResponseViewModel Callletter_Delete(string CallletterId)
        {
            try
            {
                if (!string.IsNullOrEmpty(CallletterId))
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    string model = _schemeBAL.Callletter_Application_Master_Delete(CallletterId, false, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = model,
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

        [HttpGet("[action]")]
        public ResponseViewModel Callletter_Cancel_Meeting(string CallletterId)
        {
            try
            {
                if (!string.IsNullOrEmpty(CallletterId))
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    var baseUri = $"{Request.Scheme}://{Request.Host}";
                    _schemeBAL.CallLetter_SendMessage(CallletterId, baseUri, "CANCELED", auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
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

        [HttpGet("[action]")]
        public ResponseViewModel Callletter_Send_Meeting_Invite(string CallletterId)
        {
            try
            {
                if (!string.IsNullOrEmpty(CallletterId))
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    var baseUri = $"{Request.Scheme}://{Request.Host}";
                    _schemeBAL.CallLetter_SendMessage(CallletterId, baseUri, "SCHEDULED", auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
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

        [HttpGet("[action]")]
        public ResponseViewModel Callletter_Reschedule_Meeting(string CallletterId)
        {
            try
            {
                if (!string.IsNullOrEmpty(CallletterId))
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    var baseUri = $"{Request.Scheme}://{Request.Host}";
                    _schemeBAL.CallLetter_SendMessage(CallletterId, baseUri, "RESCHEDULED", auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
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

        [HttpGet("[action]")]
        public ResponseViewModel Callletter_Send_Meeting_Invite_Application(string CallletterId, string ApplicationId)
        {
            try
            {
                if (!string.IsNullOrEmpty(CallletterId))
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    var baseUri = $"{Request.Scheme}://{Request.Host}";
                    _schemeBAL.CallLetter_SendMessage(CallletterId, baseUri, "SCHEDULED", auditColumnsModel, ApplicationId);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
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

        [HttpGet("[action]")]
        public ResponseViewModel Callletter_Resend_Meeting_Invite_Application(string CallletterId, string ApplicationId)
        {
            try
            {
                if (!string.IsNullOrEmpty(CallletterId))
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    var baseUri = $"{Request.Scheme}://{Request.Host}";
                    _schemeBAL.CallLetter_SendMessage(CallletterId, baseUri, "RESCHEDULED", auditColumnsModel, ApplicationId);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
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

        #endregion Callletter

        #region UC

        [HttpGet("[action]")]
        public ResponseViewModel Application_Utilisation_Certificate_Get(string Id = "", string ApplicationId = "")
        {
            try
            {
                List<ApplicationUtilizationCirtificateModel> list = _schemeBAL.Application_Utilisation_Certificate_Get(Id, ApplicationId);

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
        public ResponseViewModel Application_Utilisation_Certificate_SaveUpdate(ApplicationUtilizationCirtificateSaveModel model)
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

                string resId = _schemeBAL.Application_Utilisation_Certificate_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(resId))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = resId
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
        [Consumes("multipart/form-data")]
        public ResponseViewModel Application_Utilisation_Certificate_Upload([FromForm] ApplicationUtilizationCirtificateUploadFormModel model)
        {
            try
            {
                if (model.File == null || string.IsNullOrWhiteSpace(model.Id))
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

                    if (_ftpHelper.UploadFile(fTPModel))
                    {
                        FileMasterModel fileMasterModel = new FileMasterModel();

                        if (string.IsNullOrWhiteSpace(fileMasterModel.Id))
                        {
                            fileMasterModel.Id = Guid.NewGuid().ToString();
                        }
                        fileMasterModel.TypeId = model.Id;
                        fileMasterModel.Type = FileUploadTypeCode.UtilisationCertificate;
                        fileMasterModel.TypeName = "Utilisation Certificate";
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
                            List<FileMasterModel> existRecords = _generalBAL.FileMaster_Get(true, Type: FileUploadTypeCode.Form3, TypeId: model.Id);
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

                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = fileMasterModel,
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

        #endregion UC

        #region Form 3

        [HttpGet("[action]")]
        public ResponseViewModel Application_Form_3_Get(string Id = "", string ApplicationId = "")
        {
            try
            {
                List<ApplicationForm3Model> list = _schemeBAL.Application_Form_3_Get(Id, ApplicationId);

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
        public ResponseViewModel Application_Form_3_SaveUpdate(ApplicationForm3SaveModel model)
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

                string resId = _schemeBAL.Application_Form_3_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(resId))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = resId
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
        [Consumes("multipart/form-data")]
        public ResponseViewModel Application_Form_3_Upload([FromForm] ApplicationForm3UploadFormModel model)
        {
            try
            {
                if (model.File == null || string.IsNullOrWhiteSpace(model.Id))
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

                    if (_ftpHelper.UploadFile(fTPModel))
                    {
                        FileMasterModel fileMasterModel = new FileMasterModel();

                        if (string.IsNullOrWhiteSpace(fileMasterModel.Id))
                        {
                            fileMasterModel.Id = Guid.NewGuid().ToString();
                        }
                        fileMasterModel.TypeId = model.Id;
                        fileMasterModel.Type = FileUploadTypeCode.Form3;
                        fileMasterModel.TypeName = "Utilisation Certificate";
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
                            List<FileMasterModel> existRecords = _generalBAL.FileMaster_Get(true, Type: FileUploadTypeCode.Form3, TypeId: model.Id);
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

                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = fileMasterModel,
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

        #endregion Form 3
    }
}
