using AutoMapper;
using BAL;
using BAL.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Model.Constants;
using Model.DomainModel;
using Model.ViewModel;
using Serilog;
using System.Reflection.Metadata;
using API.Infrastructure;
using Utils;
using Utils.Interface;
using Utils.UtilModels;

namespace API.Controllers
{
    public class CommonController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAccountBAL _accountBAL;
        private readonly ISettingBAL _settingsBAL;
        private readonly IGeneralBAL _generalBAL;
        private readonly IMapper _mapper;
        private readonly IJwtAuthManager _jwtAuthManager;
        private readonly IFTPHelpers _ftpHelper;
        private GeneralDetail _confg;
        private readonly IMailHelper _mailHelper;

        public CommonController(ILogger<AccountController> logger,
            IAccountBAL accountBAL,
            IMapper mapper,
            IJwtAuthManager jwtAuthManager,
            ISettingBAL settingsBAL,
            IGeneralBAL generalBAL,
            IFTPHelpers ftpHelper, IOptions<GeneralDetail> confg, IMailHelper mailHelper)
        {
            _logger = logger;
            _accountBAL = accountBAL;
            _settingsBAL = settingsBAL;
            _mapper = mapper;
            _jwtAuthManager = jwtAuthManager;
            _ftpHelper = ftpHelper;
            _generalBAL = generalBAL;
            _confg = confg.Value;
            _mailHelper = mailHelper;
        }

        #region File Upload/Download

        [HttpPost("[action]")]
        [Consumes("multipart/form-data")] // MBookDocument
        public ResponseViewModel UploadFile([FromForm] FileUploadFormModel model)
        {
            try
            {
                if (model.File == null || string.IsNullOrWhiteSpace(model.Type) || string.IsNullOrWhiteSpace(model.TypeId))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "File, Type and TypeId is required, please send valid content"
                    };
                }
                else
                {
                    FTPModel fTPModel = new FTPModel();
                    fTPModel.file = model.File;
                    fTPModel.FolderName = model.Type;
                    fTPModel.FileName = Convert.ToString(Guid.NewGuid()) + Path.GetExtension(model.File?.FileName);

                    if (_ftpHelper.UploadFile(fTPModel))
                    {
                        FileMasterModel fileMasterModel = new FileMasterModel();

                        if (string.IsNullOrWhiteSpace(fileMasterModel.Id))
                        {
                            fileMasterModel.Id = Guid.NewGuid().ToString();
                        }
                        fileMasterModel.TypeId = model.TypeId;
                        fileMasterModel.Type = model.Type;
                        fileMasterModel.TypeName = model.TypeName;
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
                            //List<FileMasterModel> existRecords = _generalBAL.FileMaster_Get(true, Type: model.Type, TypeId: model.TypeId);
                            //if (existRecords?.Count > 0)
                            //{
                            //    existRecords?.ForEach(x =>
                            //    {
                            //        if (x.Id != res)
                            //        {
                            //            x.IsActive = false;
                            //            x.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                            //            x.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                            //            x.SavedDate = DateTime.Now;

                            //            _generalBAL.FileMaster_SaveUpdate(x);
                            //        }
                            //    });
                            //}

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

        [HttpPost("[action]")]
        public ResponseViewModel FileMaster_SaveUpdate(FileMasterModel model)
        {
            try
            {
                FileMasterModel? fileObj = _generalBAL.FileMaster_Get(true, Id: model.Id).FirstOrDefault();
                if (fileObj != null)
                {
                    //fileObj.Type = model.Type;
                    //fileObj.TypeName = model.TypeName;
                    //fileObj.TypeId = model.TypeId;

                    fileObj.IsActive = model.IsActive;

                    fileObj.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    fileObj.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    fileObj.SavedDate = DateTime.Now;

                    string res = _generalBAL.FileMaster_SaveUpdate(fileObj);
                    if (!string.IsNullOrWhiteSpace(res))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = res,
                            Message = "Action completed successfully"
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

        [HttpGet("[action]")]
        [AllowAnonymous]
        public IActionResult DownloadImage(string fileId)
        {
            try
            {
                FileMasterModel? existRecord = _generalBAL.FileMaster_Get(true, Id: fileId).FirstOrDefault();
                if (existRecord != null)
                {
                    FileInfo info = new FileInfo(existRecord.SavedFileName);

                    string base64encodedstring = _ftpHelper.DownloadFile(new FTPModel() { FileName = existRecord.SavedFileName });
                    byte[] bytes = Convert.FromBase64String(base64encodedstring);
                    MemoryStream memory = new MemoryStream(bytes);

                    memory.Position = 0;
                    string MimeType = StringFunctions.GetMimeType(info.Extension);

                    return File(memory, MimeType, existRecord.OriginalFileName);
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return null;
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public IActionResult File(string fileName)
        {
            try
            {
                FileMasterModel? existRecord = _generalBAL.FileMaster_Get(true, SavedFileName: fileName).FirstOrDefault();
                if (existRecord != null)
                {
                    FileInfo info = new FileInfo(fileName);

                    string base64encodedstring = _ftpHelper.DownloadFile(new FTPModel() { FileName = fileName });

                    byte[] bytes = Convert.FromBase64String(base64encodedstring);
                    MemoryStream memory = new MemoryStream(bytes);

                    memory.Position = 0;
                    string MimeType = StringFunctions.GetMimeType(info.Extension);

                    return File(memory, MimeType, existRecord.OriginalFileName);
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return default;
            }
        }
        [HttpGet("Image")]
        [AllowAnonymous]
        public IActionResult Image(string fileName)
        {
            try
            {
                var record = _generalBAL
                    .FileMaster_Get(true, SavedFileName: fileName)
                    .FirstOrDefault();

                if (record == null)
                    return NotFound();

                string base64 = _ftpHelper.DownloadFile(
                    new FTPModel { FileName = fileName });

                byte[] bytes = Convert.FromBase64String(base64);

                string mime = StringFunctions.GetMimeType(
                    Path.GetExtension(fileName));

                return File(bytes, mime);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public string ImageSource_Base64(string fileName)
        {
            try
            {
                FileMasterModel? existRecord = _generalBAL.FileMaster_Get(true, SavedFileName: fileName).FirstOrDefault();
                if (existRecord != null)
                {
                    FileInfo info = new FileInfo(fileName);

                    string MimeTypePrefix = "data:" + StringFunctions.GetMimeType(info.Extension) + ";base64, ";

                    string base64encodedstring = _ftpHelper.DownloadFile(new FTPModel() { FileName = fileName });

                    string image = MimeTypePrefix + base64encodedstring;

                    return image;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return default;
            }
        }

        #endregion File Upload/Download

        #region RecordHistory
        [HttpPost("[action]")]
        public ResponseViewModel Record_History_Get(TableFilterModel model)
        {
            try
            {
                int TotalCount = 0;

                List<RecordHistoryModel> list = _generalBAL.GetRecordHistory(model, out TotalCount);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = list,
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
        #endregion RecordHistory

        #region Email SMS Log
        [HttpPost("[action]")]
        public ResponseViewModel Email_SMS_Log_Get(MailSMSLog model)
        {
            try
            {
                int TotalCount = 0;

                List<MailSMSLog> list = _generalBAL.MailSMSLog_Get(model);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = list,
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
        #endregion Email SMS Log

        #region Comment
        [HttpPost("[action]")]
        public ResponseViewModel Comment_Get(CommentFilterModel model)
        {
            try
            {
                model.Ids = new List<string>();
                model.Types = new List<string>();

                if (model.Where != null)
                {
                    model.Where.Type = null;
                    model.Where.TypeId = null;

                    model.Ids.Add(model.Where?.TypeId ?? "");
                    model.Types.Add(model.Where?.Type ?? "");
                }
                int TotalCount = 0;
                List<CommentMasterModel> list = _generalBAL.Comment_Get(model, out TotalCount);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = list.OrderByDescending(x => x.CreatedDate).ToList(),
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
        [HttpGet("[action]")]
        public ResponseViewModel Comment_Get(string Type = "", string TypeId = "", string CommentsFrom = "", string ParentId = "")
        {
            try
            {
                List<CommentMasterModel> list = _generalBAL.Comment_Get(Type, TypeId, CommentsFrom, ParentId);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = list,
                        TotalRecordCount = list.Count
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
        public ResponseViewModel Comment_SaveUpdate(CommentMasterModel model)
        {
            try
            {
                if (model != null)
                {
                    model.CreatedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    model.CreatedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    model.CreatedDate = DateTime.Now;
                    model.CommentDate = DateTime.Now;
                    model.CommentsFrom = model.Type;
                    string result = _generalBAL.Comment_SaveUpdate(model);

                    if (!string.IsNullOrWhiteSpace(result))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = result,
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
        #endregion Comment

        #region Feedback
        [HttpPost("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Feedback_SaveUpdate(FeedbackModel model)
        {
            try
            {
                if (model != null)
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    if (string.IsNullOrWhiteSpace(model.Id))
                    {
                        model.Id = Guid.NewGuid().ToString();
                    }

                    string result = _generalBAL.FeedbackSaveUpdate(model, auditColumnsModel);

                    if (!string.IsNullOrWhiteSpace(result))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = result,
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
        [AllowAnonymous]
        public ResponseViewModel Feedback_Get(FeedbackFilterModel model)
        {
            try
            {
                int TotalCount = 0;
                List<FeedbackViewModel> list = _generalBAL.FeedbackList(model, out TotalCount);

                if (list != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = list.OrderByDescending(x => x.ModifiedDate).ToList(),
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
        #endregion Feedback

        [HttpGet("[action]")]
        public string DecryptPassword(string PasswordString)
        {
            try
            {
                return EncryptDecrypt.Decrypt(PasswordString);
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return default;
            }
        }

        [HttpGet("[action]")]
        public string EncryptPassword(string PasswordString)
        {
            try
            {
                return EncryptDecrypt.Encrypt(PasswordString);
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return default;
            }
        }

        [HttpGet("[action]")]
        public DateTime GetUTCDate()
        {
            try
            {
                var asdasd = DateTime.Now;

                return asdasd;
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return default;
            }
        }

        [HttpGet("[action]")]
        public GeneralDetail GetGeneralDetails()
        {
            try
            {
                return _confg;
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return default;
            }
        }

        [HttpGet("[action]")]
        public IActionResult TestMail(string MailId)
        {
            try
            {
                var mail = new EmailModel()
                {
                    Body = "Test Mail",
                    Subject = "Test Mail Subject" + " - " + DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss:FFF"),
                    To = new List<string>() { MailId },
                    BodyPlaceHolders = new Dictionary<string, string>()
                };

                string body = "";
                string subject = "";

                _mailHelper.SendMail(mail, out body, out subject);


                return Ok("Success");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return Ok("Error");
            }
        }


    }
}
