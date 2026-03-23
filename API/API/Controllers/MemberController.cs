using API.Helpers;
using API.Infrastructure;
using AutoMapper;
using BAL;
using BAL.BackgroundWorkerService;
using BAL.Interface;
using BAL.Service;
using Dapper;
using Google.Cloud.Translation.V2;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using Model.ViewModel.MemberModels;
using Newtonsoft.Json;
using OpenCvSharp;
using Org.BouncyCastle.Crypto;
using Serilog;
using System.Data;
using System.IO;
using System.Net;
using System.Reflection;
using System.Security.Claims;
using Utils;
using Utils.Interface;

namespace API.Controllers
{
    public class MemberController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAccountBAL _accountBAL;
        private readonly ISettingBAL _settingsBAL;
        private readonly ISchemeBAL _schemeBAL;
        private readonly IMemberBAL _memberBAL;
        private readonly IGeneralBAL _generalBAL;
        private readonly IUserBAL _userBAL;
        private readonly IApplicantBAL _applicantBAL;
        private readonly IMapper _mapper;
        private readonly IJwtAuthManager _jwtAuthManager;
        private readonly ISMSHelper _smsHelper;
        private readonly IFTPHelpers _ftpHelper;

        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        private readonly string _memberImportkey = "_keyStatusOfMemberUpload";


        private readonly ITranslationService _translationService;
        private readonly IWebHostEnvironment _webHostEnvironment;



        public MemberController(ILogger<AccountController> logger,
            IAccountBAL accountBAL,
            IMapper mapper,
            IJwtAuthManager jwtAuthManager,
            ISettingBAL settingsBAL,
            ISchemeBAL schemeBAL,
            ISMSHelper smsHelper,
            IFTPHelpers ftpHelper,
            IGeneralBAL generalBAL,
            IUserBAL userBAL,
            IBackgroundTaskQueue backgroundTaskQueue,
            IServiceScopeFactory serviceScopeFactory,
            IMemberBAL memberBAL,
            IApplicantBAL applicantBAL,
            IWebHostEnvironment webHostEnvironment, ITranslationService translationService)
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

            _backgroundTaskQueue = backgroundTaskQueue;
            _serviceScopeFactory = serviceScopeFactory;
            _memberBAL = memberBAL;
            _applicantBAL = applicantBAL;
            _webHostEnvironment = webHostEnvironment;
            
            _translationService = translationService;
        }

        #region Common
        [HttpGet("[action]")]
        public ResponseViewModel Member_Get_All(string MemberId)
        {
            try
            {
                MemberGetModels model = _memberBAL.Member_Get_All(MemberId);

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
        [AllowAnonymous]   // this makes it public
        public ResponseViewModel Qr_View(string MemberId)
        {
            try
            {
                MemberDetailsModel savedMember = _memberBAL.Member_Get(MemberId);

                if (!string.IsNullOrWhiteSpace(savedMember.Member_json) && false)
                {
                    Datum? obj = JsonConvert.DeserializeObject<Datum>(savedMember.Member_json);
                    if (obj != null)
                    {
                        MemberViewModelExisting model = MemberViewMapping(obj);

                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = model,
                            Message = "Action completed successfully"
                        };
                    }
                }
                else
                {
                    MemberViewModelExisting model = _memberBAL.Get_Member_All_Saved_Details_By_MemberId(MemberId);
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = model,
                        Message = "Action completed successfully"
                    };
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Failed,
                    Data = null,
                    Message = "Something went wrong"
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
        public ResponseViewModel MemberFormGeneralInfo_Get(string MemberId)
        {
            try
            {
                MemberFormGeneralInfo model = _memberBAL.MemberFormGeneralInfo_Get(MemberId);

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
        public ResponseViewModel Member_Save_All(MemberSaveAllModels model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                if (model.MemberDetails != null && _memberBAL.IsMobileNumberExist(model.MemberDetails.Id, model.MemberDetails.Phone_Number))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "Phone number exist with other member.",
                        Data = null,
                    };
                }
                else
                {
                    _memberBAL.Member_Save_All(model, auditColumnsModel);
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = null,
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
        public ResponseViewModel Member_Init_SaveUpdate(MemberInitSaveModel model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Phone_Number))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Mobile number is required."
                    };
                }
                else if (!string.IsNullOrWhiteSpace(model.Phone_Number) && _applicantBAL.CheckMemberExist(model.Phone_Number) > 0)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Mobile number exist",
                        ErrorCode = "MEMBER_EXIST"
                    };
                }

                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                if (model.Id == "" || model.Id == null)
                {
                    model.Id = Guid.NewGuid().ToString();
                }

                AccountLoginOtpValidationModel? savedOtpModel = _accountBAL.Account_Login_Otp_Get(ValidationCode: model.Phone_Number).Where(x => x.IsExpired == false).FirstOrDefault();

                if (savedOtpModel != null && !string.IsNullOrWhiteSpace(savedOtpModel.Otp) && savedOtpModel.Otp.Trim() == model.OTP.Trim())
                {
                    savedOtpModel.IsExpired = true;
                    _accountBAL.Account_Login_Otp_Save(savedOtpModel);

                    MemberIdCodeGetModel _model = _memberBAL.Application_Detail_Member_Init_SaveUpdate(model, auditColumnsModel);

                    if (!string.IsNullOrEmpty(_model.Id))
                    {
                        var claims = new[]
                        {
                            new Claim(Constants.UserId, _model.Id),
                            new Claim(Constants.LoginId, _model.Id),
                            new Claim(Constants.Name, model.First_Name + " " + model.Last_Name),
                            new Claim(Constants.Mobile, model.Phone_Number)
                        };

                        AccountApplicantLoginResponseModel login_model = new AccountApplicantLoginResponseModel();

                        JwtAuthResult _tokenResult = _jwtAuthManager.GenerateTokens(model.Phone_Number, claims, DateTime.Now);
                        login_model.RefreshToken = _tokenResult.RefreshToken.TokenString;
                        login_model.AccessToken = "Bearer " + _tokenResult.AccessToken;
                        login_model.Mobile = model.Phone_Number;
                        login_model.Name = model.First_Name + " " + model.Last_Name;
                        login_model.Id = _model.Id;
                        login_model.MemberId = _model.MemberId;
                        login_model.Privillage = new List<string>();

                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Message = "Action completed successfully",
                            Data = login_model
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
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Invalid OTP"
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
        #endregion Common

        #region Member
        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Member_Form_Get(string MemberId)
        {
            try
            {
                MemberDetailsFormModel model = _memberBAL.Member_Form_Get(MemberId);

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
        public ResponseViewModel Member_SaveUpdate(MemberDetailsSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                auditColumnsModel.ModifiedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.ModifiedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.ModifiedDate = DateTime.Now;
                if (model.Id == "" || model.Id == null)
                {
                    model.Id = Guid.NewGuid().ToString();
                }
                string Id = _memberBAL.Application_Detail_Member_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = Id
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
        public ResponseViewModel Member_Get(string MemberId)
        {
            try
            {
                MemberDetailsModel model = _memberBAL.Member_Get(MemberId);

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
        public ResponseViewModel Get_Member_All_Details_By_MemberId(string MemberId)
        {
            try
            {
                MemberDetailsModel savedMember = _memberBAL.Member_Get(MemberId);


                if (!string.IsNullOrWhiteSpace(savedMember.Member_json) && false)
                {
                    Datum? obj = JsonConvert.DeserializeObject<Datum>(savedMember.Member_json);
                    if (obj != null)
                    {
                        MemberViewModelExisting model = MemberViewMapping(obj);

                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = model,
                            Message = "Action completed successfully"
                        };
                    }
                }
                else
                {
                    MemberViewModelExisting model = _memberBAL.Get_Member_All_Saved_Details_By_MemberId(MemberId);
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = model,
                        Message = "Action completed successfully"
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
        public ResponseViewModel Get_Member_All_Details_Diff_By_MemberId(string MemberId)
        {
            try
            {
                MemberDiffViewModel model = _memberBAL.Get_Member_All_Saved_Details_Diff_By_MemberId(MemberId);
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
        public ResponseViewModel Get_Member_Detail_View(string MemberId)
        {
            try
            {
                MemberDetailsViewModelExisting model = _memberBAL.Get_Member_View(MemberId);
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

        // validate endpoint: only detect faces and return bounding box (no save)
        [HttpPost("[action]")]
        [Consumes("multipart/form-data")]
        public ResponseViewModel Member_Profile_Validate([FromForm] MemberProfileUploadFormModel model)
        {
            try
            {
                if (model.File == null || string.IsNullOrWhiteSpace(model.MemberId))
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "File and MemberId required."
                    };
                }

                // read bytes
                byte[] imageBytes;
                using (var ms = new MemoryStream())
                {
                    model.File.CopyTo(ms);
                    imageBytes = ms.ToArray();
                }

                // detect faces (returns Rect[] and image dimensions)
                var detect = DetectFaces(imageBytes);
                if (!detect.Success)
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = detect.Message
                    };
                }

                // exactly one face required
                if (detect.Faces.Length == 0)
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "No human face detected. Please upload a proper photo."
                    };
                }
                if (detect.Faces.Length > 1)
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Multiple faces detected. Please upload a photo with only one person."
                    };
                }

                var face = detect.Faces[0];

                // return bounding box coords as pixel values + image dims
                var respData = new
                {
                    boundingBox = new { x = face.X, y = face.Y, width = face.Width, height = face.Height },
                    imageWidth = detect.ImageWidth,
                    imageHeight = detect.ImageHeight
                };

                return new ResponseViewModel
                {
                    Status = ResponseConstants.Success,
                    Data = respData,
                    Message = "Face detected"
                };
            }
            catch (Exception ex)
            {
                // log same as your project
                Log.Error(ex, ex.Message);
                return new ResponseViewModel
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        // save endpoint: receives cropped image (from frontend) and saves
        [HttpPost("[action]")]
        [Consumes("multipart/form-data")]
        public ResponseViewModel Member_Profile_Save([FromForm] MemberProfileUploadFormModel model)
        {
            try
            {
                if (model.File == null || string.IsNullOrWhiteSpace(model.MemberId))
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
                    fTPModel.FileName = Guid.NewGuid().ToString() + Path.GetExtension(model.File?.FileName);

                    if (_ftpHelper.UploadFile(fTPModel))
                    {
                        FileMasterModel fileMasterModel = new FileMasterModel();

                        if (string.IsNullOrWhiteSpace(fileMasterModel.Id))
                        {
                            fileMasterModel.Id = Guid.NewGuid().ToString();
                        }
                        fileMasterModel.TypeId = model.MemberId;
                        fileMasterModel.Type = FileUploadTypeCode.MemberProfile;
                        fileMasterModel.TypeName = "Application Profile";
                        fileMasterModel.FileType = Path.GetExtension(model.File?.FileName) ?? "";
                        fileMasterModel.OriginalFileName = model.File?.FileName ?? "";
                        fileMasterModel.SavedFileName = fTPModel.FileName;
                        fileMasterModel.ThumbnailSavedFileName = null;
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


        // ---------- Helper: detect faces ----------
        private (bool Success, string Message, Rect[] Faces, int ImageWidth, int ImageHeight) DetectFaces(byte[] imageBytes)
        {
            try
            {
                using (var ms = new MemoryStream(imageBytes))
                using (var mat = Mat.FromStream(ms, ImreadModes.Color))
                {
                    if (mat.Empty())
                    {
                        return (false, "Invalid image file.", null, 0, 0);
                    }

                    var gray = new Mat();
                    Cv2.CvtColor(mat, gray, ColorConversionCodes.BGR2GRAY);

                    var cascadePath = Path.Combine(Directory.GetCurrentDirectory(), "haarcascades", "haarcascade_frontalface_default.xml");
                    var faceCascade = new CascadeClassifier(cascadePath);

                    // adjust parameters for your dataset if needed
                    var faces = faceCascade.DetectMultiScale(gray, 1.1, 6);

                    return (true, "", faces, mat.Width, mat.Height);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return (false, ex.Message, null, 0, 0);
            }
        }

        // Optional helper: crop to a rect and return bytes (if server-side cropping needed)
        private byte[] CropBytesToRect(byte[] imageBytes, Rect rect)
        {
            using (var ms = new MemoryStream(imageBytes))
            using (var mat = Mat.FromStream(ms, ImreadModes.Color))
            {
                var roi = new Mat(mat, rect);
                return roi.ToBytes(".jpg");
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Application_NameOfTheLocalBody_Select_Get(string MemberId, string DistrictId)
        {
            try
            {
                List<SelectListItem> model = _memberBAL.Application_NameOfTheLocalBody_Select_Get(MemberId, DistrictId);
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
        #endregion Member

        #region Organization
        [HttpGet("[action]")]
        public ResponseViewModel Organization_Form_Get(string MemberId)
        {
            try
            {
                OrganizationDetailFormModel model = _memberBAL.Organization_Form_Get(MemberId);

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
        public ResponseViewModel Organization_SaveUpdate(OrganizationDetailSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                if (model.Id == "" || model.Id == null)
                {
                    model.Id = Guid.NewGuid().ToString();
                }
                string Id = _memberBAL.Application_Detail_Organization_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = Id
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
        public ResponseViewModel Organization_Get(string Id = "", string MemberId = "")
        {
            try
            {
                OrganizationDetailModel model = _memberBAL.Member_Organization_Get(Id, MemberId);

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
        #endregion Organization

        #region Family
        [HttpGet("[action]")]
        public ResponseViewModel Family_Form_Get(string MemberId)
        {
            try
            {
                FamilyMemberFormModel model = _memberBAL.Family_Form_Get(MemberId);

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
        public ResponseViewModel Family_SaveUpdate(FamilyMemberSaveModel model)
        {
            try
            {
                if (model.IsActive == false && _memberBAL.Family_Member_Has_Application(model.Id) > 0)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "",
                        ErrorCode = "APPLICATION_EXIST"
                    };
                }

                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                if (model.Id == "" || model.Id == null)
                {
                    model.Id = Guid.NewGuid().ToString();
                }
                string Id = _memberBAL.Application_Detail_Family_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = Id
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
        public ResponseViewModel Family_Master_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            try
            {
                List<FamilyMemberModel> list = _memberBAL.Member_Family_Get(Id, MemberId, IsTemp);

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

        [HttpGet("[action]")]
        public ResponseViewModel Member_New_Family_Member_Save(string MemberId, string MemberName)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                string data = _memberBAL.Member_New_Family_Member_Save(MemberId, MemberName, auditColumnsModel);

                if (!string.IsNullOrEmpty(data))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = data
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

        #endregion Family

        #region Bank
        [HttpGet("[action]")]
        public ResponseViewModel Bank_Form_Get(string MemberId)
        {
            try
            {
                BankDetailFormModel model = _memberBAL.Bank_Form_Get(MemberId);

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
        public ResponseViewModel Bank_SaveUpdate(BankDetailSaveModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                if (model.Id == "" || model.Id == null)
                {
                    model.Id = Guid.NewGuid().ToString();
                }
                string Id = _memberBAL.Application_Detail_Bank_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = Id
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
        public ResponseViewModel Member_Bank_Get(string Id = "", string MemberId = "")
        {
            try
            {
                BankDetailModel model = _memberBAL.Member_Bank_Get(Id, MemberId);

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
        #endregion Bank

        #region Address
        [HttpGet("[action]")]
        public ResponseViewModel Address_Form_Get(string MemberId, string AddressType)
        {
            try
            {
                AddressDetailFormModel model = _memberBAL.Address_Form_Get(MemberId, AddressType);

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
        public ResponseViewModel Address_Master_SaveUpdate(ApplicationAddressMaster model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                if (model.Id == "" || model.Id == null)
                {
                    model.Id = Guid.NewGuid().ToString();
                }
                string Id = _memberBAL.Member_Address_Master_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = Id
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
        public ResponseViewModel Address_Master_Get(string Id = "", string MemberId = "", string AddressType = "")
        {
            try
            {
                List<ApplicationAddressMaster> list = _memberBAL.Member_Address_Master_Get(Id, MemberId, AddressType);

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
        #endregion Address

        #region Member Document
        [HttpGet("[action]")]
        public IActionResult Member_Document_Download(string FileId)
        {
            try
            {
                MemberDocumentMaster? file = _memberBAL.Member_Document_Get_By_Id(Id: FileId).FirstOrDefault();

                if (file == null)
                    return NotFound("File not found");

                byte[] fileBytes;
                string mimeType;
                string downloadFileName = file.OriginalFileName;

                if (!string.IsNullOrEmpty(file.SavedFileName))
                {
                    // ✅ Case 1: File saved in FTP (existing logic)
                    FileInfo info = new FileInfo(file.SavedFileName);

                    string base64encodedstring = _ftpHelper.DownloadFile(new FTPModel() { FileName = file.SavedFileName });
                    fileBytes = Convert.FromBase64String(base64encodedstring);

                    mimeType = StringFunctions.GetMimeType(info.Extension);
                }
                else
                {
                    // ✅ Case 2: OriginalFileName has URL → download from URL
                    using (var httpClient = new HttpClient())
                    {
                        fileBytes = httpClient.GetByteArrayAsync(file.OriginalFileName).Result;
                    }

                    string extension = Path.GetExtension(file.OriginalFileName);
                    mimeType = StringFunctions.GetMimeType(extension);
                }

                return File(new MemoryStream(fileBytes), mimeType, downloadFileName);
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return StatusCode(500, "Error while downloading the file or File Not Found !");
            }
        }

        //[HttpGet("[action]")]
        //[AllowAnonymous]
        //public IActionResult Member_Document_Download_for_qr(string FileId)
        //{
        //    try
        //    {
        //        MemberDocumentMaster? file = _memberBAL.Member_Document_Get_By_Id(Id: FileId).FirstOrDefault();

        //        if (file == null)
        //            return NotFound("File not found");

        //        byte[] fileBytes;
        //        string mimeType;
        //        string downloadFileName = file.OriginalFileName;

        //        if (!string.IsNullOrEmpty(file.SavedFileName))
        //        {
        //            // ✅ Case 1: File saved in FTP (existing logic)
        //            FileInfo info = new FileInfo(file.SavedFileName);

        //            string base64encodedstring = _ftpHelper.DownloadFile(new FTPModel() { FileName = file.SavedFileName });
        //            fileBytes = Convert.FromBase64String(base64encodedstring);

        //            mimeType = StringFunctions.GetMimeType(info.Extension);
        //        }
        //        else
        //        {
        //            // ✅ Case 2: OriginalFileName has URL → download from URL
        //            using (var httpClient = new HttpClient())
        //            {
        //                fileBytes = httpClient.GetByteArrayAsync(file.OriginalFileName).Result;
        //            }

        //            string extension = Path.GetExtension(file.OriginalFileName);
        //            mimeType = StringFunctions.GetMimeType(extension);
        //        }

        //        return File(new MemoryStream(fileBytes), mimeType, downloadFileName);
        //    }
        //    catch (Exception ex)
        //    {
        //        Log.Error(ex, ex.Message);
        //        return StatusCode(500, "Error while downloading the file or File Not Found !");
        //    }
        //}











        [HttpGet("[action]")]
        [AllowAnonymous]
        public IActionResult Member_Document_Download_for_qr(string FileId)
        {
            try
            {
                var file = _memberBAL.Member_Document_Get_By_Id(Id: FileId).FirstOrDefault();

                if (file == null)
                    return NotFound("File not found");

                byte[] fileBytes;
                string mimeType;
                string downloadFileName = file.OriginalFileName;

                if (!string.IsNullOrEmpty(file.SavedFileName))
                {
                    var base64 = _ftpHelper.DownloadFile(new FTPModel()
                    {
                        FileName = file.SavedFileName
                    });

                    if (string.IsNullOrEmpty(base64))
                        return BadRequest("File content empty");

                    fileBytes = Convert.FromBase64String(base64);

                    string extension = Path.GetExtension(file.SavedFileName);
                    mimeType = StringFunctions.GetMimeType(extension);
                }
                else
                {
                    using (var httpClient = new HttpClient())
                    {
                        fileBytes = httpClient.GetByteArrayAsync(file.OriginalFileName).Result;
                    }

                    string extension = Path.GetExtension(file.OriginalFileName);
                    mimeType = StringFunctions.GetMimeType(extension);
                }

                // ✅ IMPORTANT HEADERS
                Response.Headers["Content-Disposition"] = $"inline; filename={downloadFileName}";
                Response.Headers["Content-Type"] = mimeType;

                return File(fileBytes, mimeType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel Member_Document_Delete(string Id = "", bool IsTemp = false)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                string ids = _memberBAL.Member_Document_Delete(Id, IsTemp, auditColumnsModel);

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

        [HttpGet("[action]")]
        public ResponseViewModel Member_Document_Delete_From_Application(string MemberId, string DocumentCategoryId, string ApplicationId = "")
        {
            try
            {
                IEnumerable<(string OriginalFileName, string SavedFileName)> list = _memberBAL.Member_Document_Get_By_DocCategoryAndMember(MemberId, DocumentCategoryId);

                if (list != null && list.Count() > 0)
                {
                    foreach (var item in list)
                    {
                        if (!string.IsNullOrEmpty(item.SavedFileName))
                        {
                            _ftpHelper.DeleteFile(new FTPModel() { FileName = item.SavedFileName });
                        }
                    }
                }

                bool red = _memberBAL.Member_Document_Delete_From_Application(MemberId, DocumentCategoryId, ApplicationId);
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
        public ResponseViewModel Member_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            try
            {
                List<MemberDocumentMaster> model = _memberBAL.Member_Document_Get(Id, MemberId, IsTemp);

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
        public ResponseViewModel Member_NonMandatory_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            try
            {
                List<MemberDocumentMaster> model = _memberBAL.Member_NonMandatory_Document_Get(Id, MemberId, IsTemp);

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
        public ResponseViewModel Family_Member_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            try
            {
                List<MemberDocumentMaster> model = _memberBAL.Family_Member_Document_Get(Id, MemberId, IsTemp);

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
        public ResponseViewModel Family_Member_NonMandatory_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            try
            {
                List<MemberDocumentMaster> model = _memberBAL.Family_Member_NonMandatory_Document_Get(Id, MemberId, IsTemp);

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
        [Consumes("multipart/form-data")]
        public ResponseViewModel Member_Document_SaveUpdate([FromForm] MemberDocumentSaveMaster model)
        {
            try
            {
                if (model.File == null || string.IsNullOrWhiteSpace(model.Member_Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "File and Member Id is required, please send valid content"
                    };
                }
                else
                {
                    FTPModel fTPModel = new FTPModel();
                    fTPModel.file = model.File;
                    fTPModel.FileName = Convert.ToString(Guid.NewGuid()) + Path.GetExtension(model.File.FileName);

                    if (_ftpHelper.UploadFile(fTPModel))
                    {
                        MemberDocumentSaveMaster memberDocumentModel = new MemberDocumentSaveMaster();

                        memberDocumentModel.Id = model.Id;
                        memberDocumentModel.Member_Id = model.Member_Id;
                        memberDocumentModel.DocumentCategoryId = model.DocumentCategoryId;
                        memberDocumentModel.AcceptedDocumentTypeId = model.AcceptedDocumentTypeId;
                        memberDocumentModel.OriginalFileName = model.File.FileName;
                        memberDocumentModel.SavedFileName = fTPModel.FileName;
                        memberDocumentModel.IsTemp = model.IsTemp;

                        AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                        auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                        auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                        auditColumnsModel.SavedDate = DateTime.Now;

                        string res = _memberBAL.Member_Document_SaveUpdate(memberDocumentModel, auditColumnsModel);
                        if (!string.IsNullOrWhiteSpace(res))
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = memberDocumentModel,
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

        #endregion Member Document

        #region Member Search
        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Search_Member(string SearchText)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(SearchText))
                {
                    string exists_phone = _memberBAL.LookupMemberInLocal(SearchText.Trim());

                    if (!string.IsNullOrWhiteSpace(exists_phone))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Message = "Member exist, Please use member login.",
                            Data = exists_phone
                        };
                    }
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;
                    bool model = _memberBAL.Search_Member(SearchText.Trim(), auditColumnsModel);
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = _memberBAL.LookupMemberInLocal(SearchText.Trim()),
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "Search text required",
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
        #endregion Member Search

        #region Member Eligibility
        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel Member_Eligibilty_Get(string MemberId, string SchemeId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _memberBAL.Member_Eligibilty_Get(MemberId, SchemeId),
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
        public ResponseViewModel Member_Eligibilty_Get_By_Scheme(string MemberId, string SchemeGroupId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _memberBAL.Member_Eligibilty_Get_By_Scheme(MemberId, SchemeGroupId).OrderBy(x => x.SortOrder),
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
        public ResponseViewModel Member_Eligible_FamilyMembers_Get_By_SchemeGroup(string MemberId, string SchemeGroupId)
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _memberBAL.Member_Eligible_FamilyMembers_By_SchemeGroup(MemberId, SchemeGroupId),
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
        #endregion Member Eligibility

        #region Member Common
        private MemberViewModelExisting MemberViewMapping(Datum datum)
        {
            MemberViewModelExisting memberViewModelExisting = new MemberViewModelExisting();

            memberViewModelExisting.MemberDetail = _mapper.Map<MemberDetailsViewModelExisting>(datum.member_details);
            memberViewModelExisting.OrganizationalDetail = _mapper.Map<OrganizationalViewModelExisting>(datum.organization_info);
            memberViewModelExisting.PermanentAddress = _mapper.Map<AddressViewModelExisting>(datum.permanent_address);
            memberViewModelExisting.TemproraryAddress = _mapper.Map<AddressViewModelExisting>(datum.temporary_address);
            memberViewModelExisting.FamilyMembers = _mapper.Map<List<FamilyMemberViewModelExisting>>(datum.family_members);
            memberViewModelExisting.BankDetails = _mapper.Map<BankViewModelExisting>(datum.bank_details);

            memberViewModelExisting.MemberDetail.WorkAddress = datum.work_address?.Office_Address ?? string.Empty;
            memberViewModelExisting.MemberDetail.WorkDesignation = datum.organization_info?.Private_Designation ?? string.Empty;
            memberViewModelExisting.MemberDetail.WorkOrganisationName = datum.organization_info?.Private_Organisation_Name ?? string.Empty;
            memberViewModelExisting.MemberDetail.YellowCardNumber = datum.organization_info?.New_Yellow_Card_Number ?? string.Empty;
            memberViewModelExisting.MemberDetail.HealthId = datum.organization_info?.Health_Id ?? string.Empty;

            return memberViewModelExisting;
        }
        #endregion

        #region Member_Detail_Approval_Master_And_History
        [HttpGet("[action]")]
        public ResponseViewModel Member_Data_Approval_Master_Get(string Id, string MemberId)
        {
            try
            {
                List<MemberDataApprovalMaster> model = _memberBAL.Member_Data_Approval_Master_Get(Id, MemberId);

                if (model != null)
                {
                    model.ForEach(x =>
                    {
                        x.History = _memberBAL.Member_Data_Approval_History_Get(RequestId: x.Id);
                    });

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
        public ResponseViewModel Member_Data_Approval_Master_SaveUpdate(MemberDataApprovalMaster model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                auditColumnsModel.ModifiedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.ModifiedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.ModifiedDate = DateTime.Now;
                if (model.Id == "" || model.Id == null)
                {
                    model.Id = Guid.NewGuid().ToString();
                }
                string Id = _memberBAL.Member_Detail_Approval_Master_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = Id
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
        public ResponseViewModel Member_Data_Approval_History_Get(string Id, string RequestId)
        {
            try
            {
                List<MemberDataApprovalHistoryView> model = _memberBAL.Member_Data_Approval_History_Get(Id, RequestId);

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
        public ResponseViewModel Member_Data_Approval_History_SaveUpdate(MemberDataApprovalHistory model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                auditColumnsModel.ModifiedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.ModifiedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.ModifiedDate = DateTime.Now;
                if (model.Id == "" || model.Id == null)
                {
                    model.Id = Guid.NewGuid().ToString();
                }
                string Id = _memberBAL.Member_Data_Approval_History_SaveUpdate(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = Id
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
        #endregion Member_Detail_Approval_Master_And_History

        #region Member Import
        [HttpGet("[action]")]
        public ResponseViewModel Member_Import_Status_Get()
        {
            try
            {
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _memberBAL.GetMemberImportProcessStatus(),
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
        public ResponseViewModel MemberImport(IFormFile file)
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

                    string sWebRootFolder = _webHostEnvironment.ContentRootPath + "wwwroot\\assets\\Templates\\";
                    _memberBAL.MemberImport(file, sWebRootFolder, auditColumnsModel);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
                        Message = "Job scheduled successfully"
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
        public async Task<IActionResult> DownloadMemberImportTemplate()
        {
            try
            {
                string sWebRootFolder = _webHostEnvironment.ContentRootPath + "wwwroot\\assets\\Templates\\MemberBulkLoadSheet.xlsx";
                string exportName = DateTime.Now.ToString("yyyyMMddHHmmssfftt") + "_MemberBulkLoadSheet.xlsx";
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

        [HttpGet("[action]")]
        public async Task<IActionResult> DownloadMemberImportError()
        {
            try
            {
                string sWebRootFolder = _webHostEnvironment.ContentRootPath + "wwwroot\\assets\\Templates\\MemberBulkLoadErrorSheet.xlsx";
                string exportName = DateTime.Now.ToString("yyyyMMddHHmmssfftt") + "_Error_____MemberBulkLoadErrorSheet.xlsx";
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
        #endregion Member Import

        #region Family Member Import
        [HttpPost("[action]")]
        [Consumes("multipart/form-data")]
        public ResponseViewModel FamilyMemberImport(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "File is required, please upload valid Excel file."
                    };
                }

                AuditColumnsModel audit = new AuditColumnsModel
                {
                    SavedBy = User.Claims
                                  .Where(x => x.Type == Constants.UserId)
                                  .FirstOrDefault()?.Value ?? "",

                    SavedByUserName = User.Claims
                                          .Where(x => x.Type == Constants.Name)
                                          .FirstOrDefault()?.Value ?? "",

                    SavedDate = DateTime.Now
                };

                // Call BAL
                ImportResultModel result = _memberBAL.FamilyMemberImport(file, audit);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = result,
                    Message = $"Import Completed. Total Records: {result.TotalRecords},  Created Records: {result.CreatedRecords},Updated Records: {result.UpdatedRecords}, Failed Records: {result.FailedRecords}"
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

        [HttpGet("DownloadErrorReport")]
        public IActionResult DownloadErrorReport(string batchId)
        {
            string filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "ImportErrors",
                $"{batchId}_Errors.xlsx");

            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found");

            var bytes = System.IO.File.ReadAllBytes(filePath);

            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"ErrorReport_{batchId}.xlsx");
        }


        [HttpGet("[action]")]
        public async Task<IActionResult> DownloadFamilyMemberImportTemplate()
        {
            try
            {
                string sWebRootFolder = _webHostEnvironment.ContentRootPath + "wwwroot\\assets\\Templates\\FamilyMemberBulkLoadSheet.xlsx";
                string exportName = DateTime.Now.ToString("yyyyMMddHHmmssfftt") + "_FamilyMemberBulkLoadSheet.xlsx";
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

        #endregion Family Member Import

        #region PartialChangeRequest
        [HttpGet("[action]")]
        public ResponseViewModel PartialChangeRequest_Cancel(string MemberId, string Changed_Detail_Type)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                
                _memberBAL.PartialChangeRequest_Cancel(auditColumnsModel, MemberId, Changed_Detail_Type);

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
        #endregion PartialChangeRequest

        #region Member id card info
        [HttpGet("[action]")]
        public ResponseViewModel MemberIdCardInfo(string MemberId)
        {
            try
            {
                MemberIdCardInfoModel model = new MemberIdCardInfoModel();

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
        #endregion Member id card info

        #region Member Id Card


        //[HttpGet("[action]")]
        //public ResponseViewModel Get_Member_Id_Card(string MemberId)
        //{
        //    try
        //    {
        //        MemberIdCardInfoModel model = _memberBAL.Get_Member_Id_Card(MemberId);

        //        return new ResponseViewModel()
        //        {
        //            Status = ResponseConstants.Success,
        //            Message = "Action completed successfully",
        //            Data = model
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        Log.Error(ex, ex.Message);

        //        return new ResponseViewModel()
        //        {
        //            Status = ResponseConstants.Error,
        //            Data = null,
        //            Message = ex.Message
        //        };
        //    }
        //}
        [HttpGet("[action]")]
public async Task<ResponseViewModel> Get_Member_Id_Card(string MemberId)
{
    try
    {
        // 1️⃣ Fetch member data from DAL/BAL
        MemberIdCardInfoModel model = _memberBAL.Get_Member_Id_Card(MemberId);

        if (model != null)
        {
            // 2️⃣ Translate Name and FatherName to Tamil
            model.NameTamil = await _translationService.TranslateToTamil(model.NameEnglish);
            model.FatherNameTamil = await _translationService.TranslateToTamil(model.FatherNameEnglish);

                    if (model.FamilyMember != null)
                    {
                        var tasks = model.FamilyMember.Select(fm =>
                            _translationService.TranslateToTamil(fm.NameEnglish)
                                .ContinueWith(t => fm.NameTamil = t.Result)
                        ).ToArray();

                        await Task.WhenAll(tasks);
                    }
                    model.StreetNameTamil = await _translationService.TranslateToTamil(model.StreetName);
                    model.VilllageTownCityTamil = await _translationService.TranslateToTamil(model.VilllageTownCity);
                  
                }

        return new ResponseViewModel()
        {
            Status = ResponseConstants.Success,
            Message = "Action completed successfully",
            Data = model
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


        //[HttpGet("[action]")]
        //public ResponseViewModel Get_Member_Id_Card(string MemberId)
        //{
        //    try
        //    {
        //        MemberIdCardInfoModel model = _memberBAL.Get_Member_Id_Card(MemberId);

        //        if (model != null)
        //        {
        //            // Initialize Google Translate client
        //            var client = TranslationClient.Create();

        //            // Helper safe translate
        //            string Translate(string text)
        //            {
        //                if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        //                var result = client.TranslateText(text, "ta");
        //                return result?.TranslatedText ?? string.Empty;
        //            }

        //            // Assign Tamil values
        //            model.NameTamil = Translate(model.NameEnglish);
        //            model.FatherNameTamil = Translate(model.FatherNameEnglish);
        //            model.DistrictTamil = Translate(model.DistrictEnglish);
        //            model.GenderTamil = Translate(model.GenderEnglish);
        //            model.TalukTamil = Translate(model.TalukEnglish);

        //            // Family members
        //            if (model.FamilyMember != null && model.FamilyMember.Any())
        //            {
        //                foreach (var fm in model.FamilyMember)
        //                {
        //                    fm.NameTamil = Translate(fm.NameEnglish);
        //                }
        //            }
        //        }

        //        return new ResponseViewModel()
        //        {
        //            Status = ResponseConstants.Success,
        //            Message = "Action completed successfully",
        //            Data = model
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        Log.Error(ex, ex.Message);

        //        return new ResponseViewModel()
        //        {
        //            Status = ResponseConstants.Error,
        //            Data = null,
        //            Message = ex.Message
        //        };
        //    }
        //}



        #endregion Member Id Card
    }
}