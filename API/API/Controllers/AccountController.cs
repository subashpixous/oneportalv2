using API.Infrastructure;
using AutoMapper;
using BAL.Interface;
using BAL.Service;
using DAL;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.LogModel;
using Model.ViewModel;
using NPOI.POIFS.Crypt.Dsig;
using Org.BouncyCastle.Asn1.Pkcs;
using Serilog;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Xml.Linq;
using Utils;
using Utils.Interface;
using Utils.Services;
using IOFile = System.IO.File;


namespace API.Controllers
{
    public class AccountController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAccountBAL _accountBAL;
        private readonly ISettingBAL _settingsBAL;
        private readonly IMemberBAL _memberBAL;
        private readonly GeneralDAL _generalDAL;
        private readonly IFTPHelpers _ftpHelper;

        private readonly IMapper _mapper;
        private readonly IJwtAuthManager _jwtAuthManager;
        private readonly ISMSHelper _smsHelper;
        private readonly IMailHelper _mailHelpers;
        private readonly ILogService _logService;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AccountController(ILogger<AccountController> logger,
            IAccountBAL accountBAL,
            IMapper mapper,
            IJwtAuthManager jwtAuthManager,
            ISettingBAL settingsBAL,
            IMailHelper mailHelpers,
            ISMSHelper smsHelper,
            IMemberBAL memberBAL,
        
        ILogService logService,
            IConfiguration configuration,
            IWebHostEnvironment env,
            IFTPHelpers ftpHelper,
            IHttpContextAccessor httpContextAccessor)
        {
            HttpClientHandler clientHandler = new HttpClientHandler();
            clientHandler.ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => { return true; };
            
            _logger = logger;
            _accountBAL = accountBAL;
            _settingsBAL = settingsBAL;
            _mapper = mapper;
            _httpClient = new HttpClient(clientHandler);
            _jwtAuthManager = jwtAuthManager;
            _smsHelper = smsHelper;
            _memberBAL = memberBAL;
            _generalDAL = new GeneralDAL(configuration);

            _mailHelpers = mailHelpers;
            _logService = logService;
            _configuration = configuration;
            _env = env;
            _ftpHelper = ftpHelper;
            _httpContextAccessor = httpContextAccessor; }

        [AllowAnonymous]
        [HttpPost("[action]")]
        public ResponseViewModel Login(LoginRequestModel login)
        {
            try
            {
                login.Password = EncryptDecrypt.Encrypt(login.Password);

                LoginModel? _login = _accountBAL.GetLogin(login);

                if (_login != null)
                {
                    AccountUserModel user = _accountBAL.GetUser(UserId: _login.UserId) ?? new AccountUserModel();

                    AccountUserViewModel userViewData = _mapper.Map<AccountUserViewModel>(user);
                    userViewData.LoginId = _login.UserId;

                    var claims = new[]
                    {
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim(Constants.UserId, user.UserId),
                        new Claim(Constants.LoginId, _login.LoginId),
                        new Claim(Constants.Name, user.FirstName + " "+ user.LastName),
                        new Claim(Constants.RoleId, user.RoleId),
                       // new Claim(Constants.DistrictId, user.DistrictIds),
                        //new Claim(Constants.Scheme, user.SchemesIds),
                        new Claim(Constants.Mobile, user.Mobile),
                        new Claim(Constants.RoleCode, user.RoleCode),
                        //new Claim(Constants.UserGroup, user.UserGroup),
                        //new Claim(Constants.UserGroupName, user.UserGroupName),
                        new Claim(JwtRegisteredClaimNames.NameId, user.UserNumber),
                    };

                    JwtAuthResult _tokenResult = _jwtAuthManager.GenerateTokens(login.UserName, claims, DateTime.Now);

                    _login.RefreshToken = _tokenResult.RefreshToken.TokenString;
                    _login.AccessToken = "Bearer " + _tokenResult.AccessToken;

                    _login.SavedByUserName = user.FirstName + " " + user.LastName;
                    _login.SavedBy = _login.LoginId;
                    _login.SavedDate = DateTime.Now;

                    LoginViewModel loginViewData = GetLoginData(_login, user);

                    AccountLoginLogModel _log = new AccountLoginLogModel();

                    _log.LoginId = _login.LoginId;
                    _log.Device = login.Device;
                    _log.UserName = user.FirstName + " " + user.LastName;


                    _accountBAL.SaveLoginLog(_log);

                    string FirstName = loginViewData.UserDetails.FirstName;
                    string LastName = loginViewData.UserDetails.LastName;
                    string RoleName = loginViewData.UserDetails.RoleName;
                    string Mobile = loginViewData.UserDetails.Mobile;
                    //string district = loginViewData.UserDetails.DistrictIds;

                    loginViewData.UserDetails = new AccountUserModel()
                    {
                        FirstName = FirstName,
                        LastName = LastName,
                        RoleName = RoleName,
                        Mobile = Mobile,
                       // DistrictIds= district,
                    };

                    _logService.LogAsync(new Model.LogModel.UserActivityLogModel
                    {
                        ActivityLogId = Guid.NewGuid().ToString(),
                        UserId = user.UserId,
                        UserName = user.FirstName + " " + user.LastName,
                        RoleId = user.RoleId,
                        RoleName = user.RoleName,
                        ModuleName = "Account",
                        EventType = "LOGIN",
                        EventDescription = "User logged in successfully",
                        EventStatus = 2,
                        FailureCount = 0,
                        SuccessCount = 1
                    }).GetAwaiter().GetResult();

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = loginViewData,
                    };
                }
                else
                {
                    _logService.LogAsync(new Model.LogModel.UserActivityLogModel
                    {
                        ActivityLogId = Guid.NewGuid().ToString(),
                        UserId = "",
                        UserName = login.UserName,
                        RoleId = "",
                        RoleName = "",
                        ModuleName = "Account",
                        EventType = "LOGIN",
                        EventDescription = "Invalid username or password",
                        EventStatus = 0,
                        FailureCount = 1,
                        SuccessCount = 0
                    }).GetAwaiter().GetResult();

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Invalid username and password"
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

        // Updated by sivasankar On 11/12/2025 for user log report
        [HttpPost("getLogs")]
        public IActionResult Get([FromBody] UserActivityLogFilter filter)
        {
            try
            {
                int totalCount;


                var data = _accountBAL.GetLogs(filter, out totalCount);

                return Ok(new
                {
                    success = true,
                    message = "Fetched successfully",
                    data = data,
                    totalCount = totalCount
                });
            }
            catch (Exception ex)
            {

                return BadRequest(new
                {
                    success = false,
                    message = ex.Message,
                    data = new List<object>(),
                    totalCount = 0
                });
            }
        }

        [HttpGet("user")]
        [Authorize]
        public ActionResult GetCurrentUser()
        {
            return Ok(new LoginViewModel
            {
                UserName = User.Identity?.Name,
                Role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty,
            });
        }

        //[HttpPost("logout")]
        //[Authorize]
        //public ActionResult Logout()
        //{
        //    var userName = User.Identity?.Name;
        //    _jwtAuthManager.RemoveRefreshTokenByUserName(userName);
        //    return Ok();
        //}

        [HttpPost("logout")]
        [Authorize]
        public ActionResult Logout()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == Constants.UserId)?.Value ?? "";
            var userName = User.Claims.FirstOrDefault(c => c.Type == Constants.Name)?.Value ?? "";
            var roleId = User.Claims.FirstOrDefault(c => c.Type == Constants.RoleId)?.Value ?? "";
            var roleName = User.Claims.FirstOrDefault(c => c.Type == Constants.RoleCode)?.Value ?? "";
            AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();

            _jwtAuthManager.RemoveRefreshTokenByUserName(userName);

            _logService.LogAsync(new Model.LogModel.UserActivityLogModel
            {
                ActivityLogId = Guid.NewGuid().ToString(),
                UserId = userId,
                UserName = userName,
                RoleId = roleId,
                RoleName = roleName,
                ModuleName = "Account",
                EventType = "LOGOUT",
                EventDescription = $"{userName} logged out successfully",
                EventStatus = 2,
                FailureCount = 0,
                SuccessCount = 1
            }).GetAwaiter().GetResult();

            return Ok();
        }


        [Authorize]
        [HttpGet("[action]")]
        public ResponseViewModel LoginUserDetails()
        {
            try
            {
                var userId = User.Claims
                    .FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";

                if (!string.IsNullOrEmpty(userId))
                {
                    AccountUserModel user = _accountBAL.GetUser(UserId: userId) ?? new AccountUserModel();

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = user,
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Invalid UserId!"
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

        [HttpPost("refresh-token")]
        [Authorize]
        public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var userName = User.Identity?.Name;

                if (string.IsNullOrWhiteSpace(request.RefreshToken))
                {
                    return Unauthorized();
                }

                var accessToken = await HttpContext.GetTokenAsync("Bearer", "access_token");
                var jwtResult = _jwtAuthManager.Refresh(request.RefreshToken, accessToken, DateTime.Now);
                return Ok(new LoginViewModel
                {
                    UserName = userName,
                    Role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty,
                    AccessToken = "Bearer " + jwtResult.AccessToken,
                    RefreshToken = jwtResult.RefreshToken.TokenString
                });
            }
            catch (SecurityTokenException e)
            {
                return Unauthorized(e.Message); // return 401 so that the client side can redirect the user to login page
            }
        }

        private LoginViewModel GetLoginData(LoginModel login, AccountUserModel user)
        {
            LoginViewModel model = _mapper.Map<LoginViewModel>(login);

            model.UserNumber = user.UserNumber;
            model.FirstName = user.FirstName;
            model.LastName = user.LastName;

            model.UserDetails = user;

            model.Password = "";
            model.UserDetails.Password = "";

            if (user.RoleCode == "ADM")
            {
                model.Privillage = _settingsBAL.Account_Role_Privilege_Get_All(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
            }
            else
            {
                model.Privillage = _settingsBAL.Account_Role_Privilege_Login_Get(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
            }

            return model;
        }

        [AllowAnonymous]
        [HttpGet("[action]")]
        public ResponseViewModel ApplicantLogin(string MobileNumber = "")
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(MobileNumber.Trim()) && MobileNumber.Length == 10)
                {
                    //AccountApplicantMasterModel? applicant1 = _accountBAL.Application_Get_By_Mobile(MobileNumber.Trim()).FirstOrDefault();
                    // Updated by Elanjsuriyan
                    AccountApplicantMasterModel? applicant = _accountBAL.Application_Get_By_Mobile(MobileNumber.Trim()).FirstOrDefault();

                    if (applicant == null)
                    {
                        _memberBAL.Search_Member(MobileNumber, new AuditColumnsModel());
                    }

                    if (applicant != null)
                    {
                        string mobileNumber = MobileNumber;

                        if (!string.IsNullOrWhiteSpace(mobileNumber))
                        {
                            var OTP = _smsHelper.GenerateOtp();

                            string res = _accountBAL.Application_SaveUpdate_Otp_By_Mobile(MobileNumber, OTP);

                            IDictionary<string, string> replaces = new Dictionary<string, string>();
                            replaces.Add("{#otp#}", OTP);

                            string _message = string.Empty;
                            _smsHelper.SentSMS(new List<string>() { mobileNumber }, "SENDOTP", replaces, out _message);

                            _accountBAL.SendOtpMail(applicant, OTP);


                            string mobileEndsWith = mobileNumber.Substring(mobileNumber.Length - 2);
                            if (res == OTP)
                            {
                                return new ResponseViewModel()
                                {
                                    Status = ResponseConstants.Success,
                                    Data = MobileNumber,
                                    Message = "OTP send to registered mobile number ends with ...." + mobileEndsWith
                                };
                            }
                        }
                        else
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Failed,
                                Data = null,
                                Message = "Mobile number is not saved for this user"
                            };
                        }
                    }
                    else
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Mobile number is not registered"
                        };
                    }
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Something went wrong"
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

        [AllowAnonymous]
        [HttpPost("[action]")]
        public ResponseViewModel ApplicantLogin_ValidateOtp(ValidateOtpModel model)
        {
            try
            {
                AccountApplicantMasterModel? applicant = _accountBAL.Application_Get_By_Mobile(model.MobileNumber.Trim()).FirstOrDefault();
                string user = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";
                string role = User.Claims.FirstOrDefault(c => c.Type == Constants.RoleId)?.Value ?? "";

                List<string> privileges = _settingsBAL.Account_Role_Privilege_Login_Get(role)?.Select(x => x.PrivilegeCode)?.ToList();


                if (applicant != null)
                {
                    if ((model.AccessType == "OFFICER" || model.AccessType == "ADMIN") && !privileges.Contains("OTP_VERIFICATION"))
                    {
                        var claims = new[]
                       {
                            new Claim(ClaimTypes.Email, applicant.Name),
                            new Claim(Constants.UserId, applicant.Id),
                            new Claim(Constants.LoginId, applicant.Id),
                            new Claim(Constants.Name, applicant.Name),
                            //new Claim(Constants.RoleId, ""),
                            //new Claim(Constants.DistrictId, user.DistrictId),
                            //new Claim(Constants.DivisionId, user.DivisionId),
                            new Claim(Constants.Mobile, applicant.Mobile),
                            //new Claim(Constants.RoleCode, user.RoleCode),
                            //new Claim(Constants.UserGroup, user.UserGroup),
                            //new Claim(Constants.UserGroupName, user.UserGroupName),
                            //new Claim(JwtRegisteredClaimNames.NameId, user.UserNumber),
                        };

                        AccountApplicantLoginResponseModel login_model = new AccountApplicantLoginResponseModel();

                        JwtAuthResult _tokenResult = _jwtAuthManager.GenerateTokens(applicant.Mobile, claims, DateTime.Now);
                        login_model.RefreshToken = _tokenResult.RefreshToken.TokenString;
                        login_model.AccessToken = "Bearer " + _tokenResult.AccessToken;
                        login_model.Mobile = model.MobileNumber;
                        login_model.Name = applicant.Name;
                        login_model.Id = applicant.Id;
                        login_model.MemberId = applicant.Member_Id;
                        login_model.Privillage = new List<string>();

                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = login_model,
                            Message = "OTP is valid"
                        };

                    }
                    else
                    {
                        string savedOtp = _accountBAL.Application_Get_Otp_By_Mobile(model.MobileNumber);

                        if (!string.IsNullOrWhiteSpace(savedOtp) && savedOtp.Trim() == model.OTP.Trim())
                        {
                            string res = _accountBAL.Application_SaveUpdate_Otp_By_Mobile(model.MobileNumber, "");

                            var claims = new[]
                            {
                            new Claim(ClaimTypes.Email, applicant.Name),
                            new Claim(Constants.UserId, applicant.Id),
                            new Claim(Constants.LoginId, applicant.Id),
                            new Claim(Constants.Name, applicant.Name),
                            //new Claim(Constants.RoleId, ""),
                            //new Claim(Constants.DistrictId, user.DistrictId),
                            //new Claim(Constants.DivisionId, user.DivisionId),
                            new Claim(Constants.Mobile, applicant.Mobile),
                            //new Claim(Constants.RoleCode, user.RoleCode),
                            //new Claim(Constants.UserGroup, user.UserGroup),
                            //new Claim(Constants.UserGroupName, user.UserGroupName),
                            //new Claim(JwtRegisteredClaimNames.NameId, user.UserNumber),
                        };

                            AccountApplicantLoginResponseModel login_model = new AccountApplicantLoginResponseModel();

                            JwtAuthResult _tokenResult = _jwtAuthManager.GenerateTokens(applicant.Mobile, claims, DateTime.Now);
                            login_model.RefreshToken = _tokenResult.RefreshToken.TokenString;
                            login_model.AccessToken = "Bearer " + _tokenResult.AccessToken;
                            login_model.Mobile = model.MobileNumber;
                            login_model.Name = applicant.Name;
                            login_model.Id = applicant.Id;
                            login_model.MemberId = applicant.Member_Id;
                            login_model.Privillage = new List<string>();

                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = login_model,
                                Message = "OTP is valid"
                            };
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
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Mobile number is not valid"
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

        [AllowAnonymous]
        [HttpGet("[action]")]
        public ResponseViewModel SendOtp(string MobileNumber = "")
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(MobileNumber.Trim()) && MobileNumber.Length == 10)
                {
                    AccountUserModel? user = _accountBAL.GetUser(IsActive: true, MobileNumber: MobileNumber.Trim());

                    if (user != null)
                    {
                        string mobileNumber = user.Mobile;

                        if (!string.IsNullOrWhiteSpace(mobileNumber))
                        {
                            var OTP = _smsHelper.GenerateOtp();

                            string res = _accountBAL.Login_OTP_Save(user.UserId, OTP, "");


                            IDictionary<string, string> replaces = new Dictionary<string, string>();
                            replaces.Add("{#otp#}", OTP);

                            string _message = string.Empty;
                            _smsHelper.SentSMS(new List<string>() { mobileNumber }, "SENDOTP", replaces, out _message);

                            string mobileEndsWith = mobileNumber.Substring(mobileNumber.Length - 3);
                            if (res == OTP)
                            {
                                return new ResponseViewModel()
                                {
                                    Status = ResponseConstants.Success,
                                    Data = MobileNumber,
                                    Message = "OTP send to registered mobile number ends with ...." + mobileEndsWith
                                };
                            }
                        }
                        else
                        {
                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Failed,
                                Data = null,
                                Message = "Mobile number is not saved for this user"
                            };
                        }
                    }
                    else
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Mobile number is not valid"
                        };
                    }
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Something went wrong"
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

        [AllowAnonymous]
        [HttpPost("[action]")]
        public ResponseViewModel ValidateOtp(ValidateOtpModel model)
        {
            try
            {
                AccountUserModel? user = _accountBAL.GetUser(MobileNumber: model.MobileNumber.Trim());

                if (user != null)
                {
                    string savedOtp = _accountBAL.Login_OTP_Get(UserId: user.UserId);

                    if (!string.IsNullOrWhiteSpace(savedOtp) && savedOtp.Trim() == model.OTP.Trim())
                    {
                        Guid g = Guid.NewGuid();
                        string GuidString = Convert.ToBase64String(g.ToByteArray());
                        GuidString = GuidString.Replace("=", "");
                        GuidString = GuidString.Replace("+", "");

                        string res = _accountBAL.Login_OTP_Save(user.UserId, "", GuidString);

                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = GuidString,
                            Message = "OTP is valid"
                        };
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
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Mobile number is not valid"
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

        [AllowAnonymous]
        [HttpPost("[action]")]
        public ResponseViewModel SaveNewPassword(SaveNewPasswordModel model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.Token))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Invalid request"
                    };
                }
                bool res = _accountBAL.Login_Password_Save(model.Token, EncryptDecrypt.Encrypt(model.Password), model.OTP);
                if (res)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
                        Message = "New password saved"
                    };
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Failed,
                    Data = null,
                    Message = "Somthing went wrog"
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
        [Authorize]
        public ResponseViewModel GetLoginLog(string Id, string LoginId)
        {
            try
            {
                var res = _accountBAL.GetLoginLog(Id, LoginId);
                if (res != null)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = res,
                        Message = "Login log"
                    };
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Failed,
                    Data = null,
                    Message = "Somthing went wrog"
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

        #region OTP Validation

        [AllowAnonymous]
        [HttpGet("[action]")]
        public ResponseViewModel SendAnonymousOtp(string MobileNumber = "")
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(MobileNumber.Trim()) && MobileNumber.Length == 10)
                {


                    string exists_phone = _memberBAL.LookupMemberInLocal(MobileNumber.Trim());

                    if (!string.IsNullOrWhiteSpace(exists_phone))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Message = "Member exist, Please use member login.",
                            Data = exists_phone
                        };
                    }


                    AccountLoginOtpValidationModel model = new AccountLoginOtpValidationModel();
                    model.Id = Guid.NewGuid().ToString();
                    model.ValidationCode = MobileNumber;
                    model.Otp = _smsHelper.GenerateOtp();
                    model.IsExpired = false;
                    model.ExpireOn = DateTime.Now;

                    string res = _accountBAL.Account_Login_Otp_Save(model);

                    IDictionary<string, string> replaces = new Dictionary<string, string>();
                    replaces.Add("{#otp#}", model.Otp);

                    string _message = string.Empty;
                    _smsHelper.SentSMS(new List<string>() { MobileNumber }, "SENDOTP", replaces, out _message);

                    string mobileEndsWith = MobileNumber.Substring(MobileNumber.Length - 3);
                    if (!string.IsNullOrEmpty(res))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = MobileNumber,
                            Message = "OTP send to registered mobile number ends with ...." + mobileEndsWith
                        };
                    }
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Something went wrong"
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

        [AllowAnonymous]
        [HttpPost("[action]")]
        public ResponseViewModel ValidateAnonymousOtp(ValidateOtpModel model)
        {
            try
            {
                AccountLoginOtpValidationModel? savedOtpRecord = _accountBAL.Account_Login_Otp_Get(ValidationCode: model.MobileNumber).Where(x => x.IsExpired == false).FirstOrDefault();

                if (savedOtpRecord != null)
                {
                    if (savedOtpRecord != null && !string.IsNullOrWhiteSpace(savedOtpRecord.Otp) && savedOtpRecord.Otp.Trim() == model.OTP.Trim())
                    {
                        savedOtpRecord.IsExpired = true;
                        string res = _accountBAL.Account_Login_Otp_Save(savedOtpRecord);

                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = true,
                            Message = "OTP is valid"
                        };
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
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Mobile number is not valid"
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

        [AllowAnonymous]
        [HttpPost("[action]")]
        public ResponseViewModel ValidateFormOtp(ValidateOtpModel model)
        {
            try
            {
                AccountLoginOtpValidationModel? savedOtpRecord = _accountBAL.Account_Login_Otp_Get(ValidationCode: model.MobileNumber).Where(x => x.IsExpired == false).FirstOrDefault();

                if (savedOtpRecord != null)
                {
                    if (savedOtpRecord != null && !string.IsNullOrWhiteSpace(savedOtpRecord.Otp) && savedOtpRecord.Otp.Trim() == model.OTP.Trim())
                    {
                        savedOtpRecord.IsExpired = true;
                        string res = _accountBAL.Account_Login_Otp_Save(savedOtpRecord);


                        AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                        auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                        auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                        auditColumnsModel.SavedDate = DateTime.Now;

                        MemberInitSaveModel Save = new MemberInitSaveModel();

                        AadhaarKycData kycData = new AadhaarKycData();
                        //if (Save.Id == "" || Save.Id == null)
                        //{
                        Save.Id = Guid.NewGuid().ToString();
                        Save.Aadhaar_Number = "";
                        Save.AadhaarVerified = false;
                        Save.Phone_Number = model.MobileNumber;
                        Save.OTP = model.OTP;
                        //Save.First_Name = "";
                        //}

                        MemberIdCodeGetModel _model = _memberBAL.Application_Detail_Member_Init_SaveUpdate(Save, auditColumnsModel);

                        if (!string.IsNullOrEmpty(_model.Id))
                        {
                            var claims = new[]
                            {
                            new Claim(Constants.UserId, _model.Id),   
                            new Claim(Constants.LoginId, _model.Id),
                            //new Claim(Constants.Name, ""),
                            new Claim(Constants.Mobile,model.MobileNumber),
                            //new Claim(Constants.AadhaarNumber, "")
                        };

                            AccountApplicantLoginResponseModel login_model = new AccountApplicantLoginResponseModel();

                            JwtAuthResult _tokenResult = _jwtAuthManager.GenerateTokens(model.MobileNumber, claims, DateTime.Now);
                            kycData.LoginDetails.RefreshToken = _tokenResult.RefreshToken.TokenString;
                            kycData.LoginDetails.AccessToken = "Bearer " + _tokenResult.AccessToken;
                            kycData.LoginDetails.Mobile = model.MobileNumber;
                            kycData.LoginDetails.AadhaarNumber = "";
                            kycData.LoginDetails.Name = login_model.Name;
                            kycData.LoginDetails.Id = _model.Id;
                            kycData.LoginDetails.AccessType = "APPLICANT";
                            kycData.LoginDetails.MemberId = _model.MemberId;
                            kycData.LoginDetails.Privillage = new List<string>();
                            kycData.MemberId = _model.Id;
                            kycData.AadhaarVerified = false;

                            return new ResponseViewModel()
                            {
                                Status = ResponseConstants.Success,
                                Data = kycData,
                                Message = "OTP is valid"
                            };
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
                    else
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Failed,
                            Data = null,
                            Message = "Mobile number is not valid"
                        };
                    }
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "OTP expired or not found"
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
     
        
        #endregion OTP Validation




        //[AllowAnonymous]
        //[HttpPost("Aadhar_GetOtp")]
        //public async Task<IActionResult> Aadhar_GetOtp([FromBody] AadharGetOtpModel model)
        //{
        //    try
        //    {
        //        string baseUrl = _configuration["AadharAPIs:Aadhar_GetOtp"];

        //        if (string.IsNullOrEmpty(baseUrl))
        //        {
        //            return Ok(new ResponseViewModel
        //            {
        //                Status = "FAILED",
        //                Message = "Aadhar_GetOtp URL missing in appsettings.json"
        //            });
        //        }

        //        var json = JsonSerializer.Serialize(model);

        //        var content = new StringContent(json, Encoding.UTF8, "application/json");

        //        var response = await _httpClient.PostAsync(baseUrl, content);

        //        var responseContent = await response.Content.ReadAsStringAsync();

        //        // Deserialize external response
        //        var externalResponse = JsonSerializer.Deserialize<AadharOtpApiResponse>(responseContent);

        //        // 🔴 Check Aadhaar error
        //        if (externalResponse?.data != null &&
        //            (!string.IsNullOrEmpty(externalResponse.data.err) ||
        //             !string.IsNullOrEmpty(externalResponse.data.errdesc)))
        //        {
        //            return Ok(new ResponseViewModel
        //            {
        //                Status = "FAILED",
        //                Message = externalResponse.data.errdesc ?? "OTP Failed",
        //                Data = JsonSerializer.Deserialize<object>(responseContent)
        //            });
        //        }

        //        // ✅ Success case
        //        return Ok(new ResponseViewModel
        //        {
        //            Status = "SUCCESS",
        //            Message = "OTP sent successfully",
        //            Data = JsonSerializer.Deserialize<object>(responseContent)
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return Ok(new ResponseViewModel
        //        {
        //            Status = "FAILED",
        //            Message = ex.Message
        //        });
        //    }
        //}





        [AllowAnonymous]
        [HttpPost("Aadhar_GetOtp")]
        public async Task<IActionResult> Aadhar_GetOtp([FromBody] AadharGetOtpModel model)
        {


            try
            {

                string exists_phone = _memberBAL.LookupMemberInLocal(model.AUAKUAParameters.AADHAARID.Trim());

                if (!string.IsNullOrWhiteSpace(exists_phone))
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = ResponseConstants.Success,
                        Message = "Aadhaar Number exist, Please use member login.",
                        Data = exists_phone
                    });
                }

                string baseUrl = _configuration["AadharAPIs:Aadhar_GetOtp"];

                if (string.IsNullOrEmpty(baseUrl))
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = "FAILED",
                        Message = "Aadhar_GetOtp URL missing"
                    });
                }

                var json = JsonSerializer.Serialize(model);

                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(baseUrl, content);

                var responseContent = await response.Content.ReadAsStringAsync();

                Console.WriteLine("AADHAAR GET OTP RAW RESPONSE:");
                Console.WriteLine(responseContent);

                if (string.IsNullOrWhiteSpace(responseContent))
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = "FAILED",
                        Message = "Empty response from Aadhaar API"
                    });
                }

                var apiResponse = JsonSerializer.Deserialize<AadharOtpVerifyApiResponse>(
                    responseContent,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (apiResponse == null)
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = "FAILED",
                        Message = "Failed to deserialize Aadhaar response",
                        Data = responseContent
                    });
                }

                // Check error
                if (!string.IsNullOrEmpty(apiResponse.err) &&
                    apiResponse.err != "000")
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = "FAILED",
                        Message = apiResponse.errdesc ?? "OTP generation failed",
                        Data = apiResponse
                    });
                }

                //  Check ret status
                if (!string.Equals(apiResponse.ret, "y", StringComparison.OrdinalIgnoreCase))
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = "FAILED",
                        Message = apiResponse.errdesc ?? "OTP generation failed",
                        Data = apiResponse
                    });
                }

                // SUCCESS
                return Ok(new ResponseViewModel
                {
                    Status = "SUCCESS",
                    Message = "OTP sent successfully",
                    Data = apiResponse
                });
            }
            catch (Exception ex)
            {
                return Ok(new ResponseViewModel
                {
                    Status = "FAILED",
                    Message = ex.Message
                });
            }
        }

        //elanjsuriyan

        //[AllowAnonymous]
        //[HttpPost("Aadhar_VerifyOtp")]
        //public async Task<IActionResult> Aadhar_VerifyOtp([FromBody] AadharGetOtpModel model)
        //{
        //    try
        //    {
        //        string baseUrl = _configuration["AadharAPIs:Aadhar_VerifyOtp"];

        //        if (string.IsNullOrEmpty(baseUrl))
        //        {
        //            return Ok(new ResponseViewModel
        //            {
        //                Status = "FAILED",
        //                Message = "Aadhar_VerifyOtp URL missing"
        //            });
        //        }

        //        var json = JsonSerializer.Serialize(model);

        //        var content = new StringContent(json, Encoding.UTF8, "application/json");

        //        var response = await _httpClient.PostAsync(baseUrl, content);

        //        var responseContent = await response.Content.ReadAsStringAsync();

        //        Console.WriteLine("AADHAAR RAW RESPONSE:");
        //        Console.WriteLine(responseContent);

        //        if (string.IsNullOrWhiteSpace(responseContent))
        //        {
        //            return Ok(new ResponseViewModel
        //            {
        //                Status = "FAILED",
        //                Message = "Empty response from Aadhaar API"
        //            });
        //        }

        //        var apiResponse = JsonSerializer.Deserialize<AadharOtpVerifyApiResponse>(
        //            responseContent,
        //            new JsonSerializerOptions
        //            {
        //                PropertyNameCaseInsensitive = true
        //            });

        //        if (apiResponse == null)
        //        {
        //            return Ok(new ResponseViewModel
        //            {
        //                Status = "FAILED",
        //                Message = "Failed to deserialize Aadhaar response",
        //                Data = responseContent
        //            });
        //        }

        //        // Check error
        //        if (!string.IsNullOrEmpty(apiResponse.err) &&
        //            apiResponse.err != "000")
        //        {
        //            return Ok(new ResponseViewModel
        //            {
        //                Status = "FAILED",
        //                Message = apiResponse.errdesc,
        //                Data = apiResponse
        //            });
        //        }

        //        // Success
        //        if (apiResponse.ret?.Equals("y", StringComparison.OrdinalIgnoreCase) == true
        //            && !string.IsNullOrWhiteSpace(apiResponse.responseXML))
        //        {
        //            var kycData = DecodeAadhaarXml(apiResponse.responseXML);

        //            if (kycData != null)
        //            {
        //                // SAVE DB HERE
        //                // await SaveKyc(kycData);

        //                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
        //                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
        //                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
        //                auditColumnsModel.SavedDate = DateTime.Now;

        //                MemberInitSaveModel Save = new MemberInitSaveModel();

        //                //if (Save.Id == "" || Save.Id == null)
        //                //{
        //                Save.Id = Guid.NewGuid().ToString();
        //                Save.Aadhaar_Number = model.AUAKUAParameters.AADHAARID;
        //                Save.AadhaarVerified = true;
        //                Save.First_Name = kycData.Name;
        //                //}

        //                MemberIdCodeGetModel _model = _memberBAL.Application_Detail_Member_Init_SaveUpdate(Save, auditColumnsModel);

        //                if (!string.IsNullOrEmpty(_model.Id))
        //                {
        //                    var claims = new[]
        //                    {
        //                    new Claim(Constants.UserId, _model.Id),
        //                    new Claim(Constants.LoginId, _model.Id),
        //                    new Claim(Constants.Name, kycData.Name + " " + ""),
        //                    new Claim(Constants.Mobile, ""),
        //                    new Claim(Constants.AadhaarNumber, kycData.AadhaarNumber)
        //                };

        //                    AccountApplicantLoginResponseModel login_model = new AccountApplicantLoginResponseModel();

        //                    JwtAuthResult _tokenResult = _jwtAuthManager.GenerateTokens(kycData.AadhaarNumber, claims, DateTime.Now);
        //                    kycData.LoginDetails.RefreshToken = _tokenResult.RefreshToken.TokenString;
        //                    kycData.LoginDetails.AccessToken = "Bearer " + _tokenResult.AccessToken;
        //                    kycData.LoginDetails.Mobile = "";
        //                    kycData.LoginDetails.AadhaarNumber = kycData.AadhaarNumber;
        //                    kycData.LoginDetails.Name = kycData.Name + " " + "";
        //                    kycData.LoginDetails.Id = _model.Id;
        //                    kycData.LoginDetails.AccessType = "APPLICANT";
        //                    kycData.LoginDetails.MemberId = _model.MemberId;
        //                    kycData.LoginDetails.Privillage = new List<string>();
        //                    kycData.MemberId = _model.Id;
        //                    kycData.AadhaarVerified = true;

        //                    return Ok(new ResponseViewModel
        //                    {
        //                        Status = "SUCCESS",
        //                        Message = "OTP verified successfully",
        //                        Data = kycData
        //                    });
        //                }
        //                else
        //                {
        //                    return Ok(new ResponseViewModel
        //                    {
        //                        Status = "SUCCESS",
        //                        Message = "OTP verified successfully",
        //                        Data = kycData
        //                    });
        //                }


        //                return Ok(new ResponseViewModel
        //                {
        //                    Status = "SUCCESS",
        //                    Message = "OTP verified successfully",
        //                    Data = kycData
        //                });
        //            }
        //        }

        //        return Ok(new ResponseViewModel
        //        {
        //            Status = "FAILED",
        //            Message = "OTP verification failed",
        //            Data = apiResponse
        //        });

        //    }
        //    catch (Exception ex)
        //    {
        //        return Ok(new ResponseViewModel
        //        {
        //            Status = "FAILED",
        //            Message = ex.Message
        //        });
        //    }
        //}




        //Indu

        [AllowAnonymous]
        [HttpPost("Aadhar_VerifyOtp")]
        public async Task<IActionResult> Aadhar_VerifyOtp([FromBody] AadharGetOtpModel model)
        {
            try
            {
                string baseUrl = _configuration["AadharAPIs:Aadhar_VerifyOtp"];

                if (string.IsNullOrEmpty(baseUrl))
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = "FAILED",
                        Message = "Aadhar_VerifyOtp URL missing"
                    });
                }

                var json = JsonSerializer.Serialize(model);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(baseUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                Console.WriteLine("AADHAAR RAW RESPONSE:");
                Console.WriteLine(responseContent);

                if (string.IsNullOrWhiteSpace(responseContent))
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = "FAILED",
                        Message = "Empty response from Aadhaar API"
                    });
                }

                var apiResponse = JsonSerializer.Deserialize<AadharOtpVerifyApiResponse>(
                    responseContent,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (apiResponse == null)
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = "FAILED",
                        Message = "Failed to deserialize Aadhaar response",
                        Data = responseContent
                    });
                }

               
                if (!string.IsNullOrEmpty(apiResponse.err) && apiResponse.err != "000")
                {
                    return Ok(new ResponseViewModel
                    {
                        Status = "FAILED",
                        Message = apiResponse.errdesc,
                        Data = apiResponse
                    });
                }


                if (apiResponse.ret?.Equals("y", StringComparison.OrdinalIgnoreCase) == true)
                {
                    var kycData = DecodeAadhaarXml(apiResponse.responseXML);

                    if (kycData != null)
                    {
                        AuditColumnsModel auditColumnsModel = new AuditColumnsModel
                        {
                            SavedBy = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "",
                            SavedByUserName = User.Claims.FirstOrDefault(x => x.Type == Constants.Name)?.Value ?? "",
                            SavedDate = DateTime.Now
                        };

                     
                        MemberInitSaveModel save = new MemberInitSaveModel
                        {
                            Id = Guid.NewGuid().ToString(),
                            Aadhaar_Number = model.AUAKUAParameters.AADHAARID,
                            AadhaarVerified = true,
                            First_Name = kycData.Name,
                            Aadhaar_Json = JsonSerializer.Serialize(kycData)




                        };

                        var member = _memberBAL.Application_Detail_Member_Init_SaveUpdate(save, auditColumnsModel);

                        
                        if (!string.IsNullOrEmpty(member?.Id) &&
                            !string.IsNullOrWhiteSpace(kycData.PhotoBase64))
                        {
                            string savedFileName = await UploadAadhaarPhotoToFTPAsync(
                                kycData.PhotoBase64,
                                kycData.AadhaarNumber
                            );

                            if (!string.IsNullOrWhiteSpace(savedFileName))
                            {
                                FileMasterModel fileMasterModel = new FileMasterModel
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    TypeId = member.Id, // ✅ LINK TO MEMBER
                                    Type = FileUploadTypeCode.MemberProfile,
                                    TypeName = FileUploadTypeCode.MemberProfile,
                                    FileType = ".jpg",
                                    OriginalFileName = $"aadhaar_{kycData.AadhaarNumber}.jpg",
                                    SavedFileName = savedFileName,
                                    IsActive = true,
                                    SavedBy = auditColumnsModel.SavedBy,
                                    SavedByUserName = auditColumnsModel.SavedByUserName,
                                    SavedDate = DateTime.Now
                                };

                                _generalDAL.FileMaster_SaveUpdate(fileMasterModel);

                                // Optional: return public URL
                                kycData.PhotoUrl =
    $"{Request.Scheme}://{Request.Host}/api/common/Image?fileName={savedFileName}";

                            }
                        }

                        // ✅ GENERATE LOGIN TOKEN
                        if (!string.IsNullOrEmpty(member?.Id))
                        {
                            var claims = new[]
                            {
                new Claim(Constants.UserId, member.Id),
                new Claim(Constants.LoginId, member.Id),
                new Claim(Constants.Name, kycData.Name ?? ""),
                new Claim(Constants.Mobile, ""),
                new Claim(Constants.AadhaarNumber, kycData.AadhaarNumber ?? "")
            };

                            JwtAuthResult tokenResult = _jwtAuthManager.GenerateTokens(
                                kycData.AadhaarNumber ?? "",
                                claims,
                                DateTime.Now);

                            kycData.LoginDetails.RefreshToken = tokenResult.RefreshToken.TokenString;
                            kycData.LoginDetails.AccessToken = "Bearer " + tokenResult.AccessToken;
                            kycData.LoginDetails.Mobile = "";
                            kycData.LoginDetails.AadhaarNumber = kycData.AadhaarNumber;
                            kycData.LoginDetails.Name = kycData.Name;
                            kycData.LoginDetails.Id = member.Id;
                            kycData.LoginDetails.AccessType = "APPLICANT";
                            kycData.LoginDetails.MemberId = member.MemberId;
                            kycData.LoginDetails.Privillage = new List<string>();

                            kycData.MemberId = member.Id;
                            kycData.AadhaarVerified = true;
                        }

                        return Ok(new ResponseViewModel
                        {
                            Status = "SUCCESS",
                            Message = "OTP verified successfully",
                            Data = kycData
                        });
                    }
                }

                return Ok(new ResponseViewModel
                {
                    Status = "FAILED",
                    Message = "OTP verification failed",
                    Data = apiResponse
                });
            }
            catch (Exception ex)
            {
                return Ok(new ResponseViewModel
                {
                    Status = "FAILED",
                    Message = ex.Message
                });
            }
        }


        //private AadhaarKycData DecodeAadhaarXml(string base64Xml)
        //{
        //    try
        //    {
        //        var xmlBytes = Convert.FromBase64String(base64Xml);

        //        var xmlString = Encoding.UTF8.GetString(xmlBytes);

        //        var doc = XDocument.Parse(xmlString);

        //        var uidNode = doc.Descendants("UidData").FirstOrDefault();

        //        var poi = doc.Descendants("Poi").FirstOrDefault();

        //        var poa = doc.Descendants("Poa").FirstOrDefault();

        //        return new AadhaarKycData
        //        {
        //            AadhaarNumber = uidNode?.Attribute("uid")?.Value,
        //            Name = poi?.Attribute("name")?.Value,
        //            Gender = poi?.Attribute("gender")?.Value,
        //            DOB = poi?.Attribute("dob")?.Value,
        //            CareOf = poa?.Attribute("co")?.Value,
        //            District = poa?.Attribute("dist")?.Value,
        //            State = poa?.Attribute("state")?.Value,
        //            Pincode = poa?.Attribute("pc")?.Value
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("XML Decode Error: " + ex.Message);
        //        return null;
        //    }
        //}

        //elanjusruiyam
        //private AadhaarKycData DecodeAadhaarXml(string base64Xml)
        //{
        //    try
        //    {
        //        var xmlBytes = Convert.FromBase64String(base64Xml);
        //        var xmlString = Encoding.UTF8.GetString(xmlBytes);

        //        var doc = XDocument.Parse(xmlString);

        //        var uidNode = doc.Descendants("UidData").FirstOrDefault();
        //        var poi = doc.Descendants("Poi").FirstOrDefault();
        //        var poa = doc.Descendants("Poa").FirstOrDefault();
        //        var photoNode = doc.Descendants("Pht").FirstOrDefault();

        //        string photoUrl = null;

        //        if (photoNode != null && !string.IsNullOrEmpty(photoNode.Value))
        //        {
        //            byte[] photoBytes = Convert.FromBase64String(photoNode.Value);

        //            string folderPath = Path.Combine(_env.WebRootPath, "aadhaar-photos");

        //            if (!Directory.Exists(folderPath))
        //                Directory.CreateDirectory(folderPath);

        //            string fileName = $"{uidNode?.Attribute("uid")?.Value}_{Guid.NewGuid()}.jpg";

        //            string filePath = Path.Combine(folderPath, fileName);

        //            // FIX HERE
        //            System.IO.File.WriteAllBytes(filePath, photoBytes);

        //            var request = _httpContextAccessor.HttpContext.Request;

        //            photoUrl = $"{request.Scheme}://{request.Host}/aadhaar-photos/{fileName}";

        //            //photoUrl = $"/aadhaar-photos/{fileName}";
        //        }

        //        return new AadhaarKycData
        //        {
        //            AadhaarNumber = uidNode?.Attribute("uid")?.Value,
        //            Name = poi?.Attribute("name")?.Value,
        //            Gender = poi?.Attribute("gender")?.Value,
        //            DOB = poi?.Attribute("dob")?.Value,
        //            CareOf = poa?.Attribute("co")?.Value,
        //            District = poa?.Attribute("dist")?.Value,
        //            State = poa?.Attribute("state")?.Value,
        //            Pincode = poa?.Attribute("pc")?.Value,
        //            PhotoUrl = photoUrl
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("XML Decode Error: " + ex.Message);
        //        return null;
        //    }
        //}



        //Indu
        private AadhaarKycData DecodeAadhaarXml(string base64Xml)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(base64Xml))
                    return null;

                var xmlBytes = Convert.FromBase64String(base64Xml);
                var xmlString = Encoding.UTF8.GetString(xmlBytes);

                Console.WriteLine("Decoded XML:");
                Console.WriteLine(xmlString);

                var doc = XDocument.Parse(xmlString);

                
                var uidNode = doc.Descendants()
                                 .FirstOrDefault(x => x.Name.LocalName == "UidData");

                if (uidNode == null) return null;

                var poi = uidNode.Descendants()
                                 .FirstOrDefault(x => x.Name.LocalName == "Poi");

                var poa = uidNode.Descendants()
                                 .FirstOrDefault(x => x.Name.LocalName == "Poa");

                var photoNode = uidNode.Descendants()
                                       .FirstOrDefault(x => x.Name.LocalName == "Pht");

                string photoUrl = null;

                
                if (photoNode != null && !string.IsNullOrWhiteSpace(photoNode.Value))
                {
                    //byte[] photoBytes = Convert.FromBase64String(photoNode.Value);
                    //string rootPath = _env.ContentRootPath ?? Directory.GetCurrentDirectory();

                    //string folderPath = Path.Combine(rootPath, "aadhaar-photos");

                    //if (!Directory.Exists(folderPath))
                    //    Directory.CreateDirectory(folderPath);
                  

                    //string uid = uidNode.Attribute("uid")?.Value ?? "aadhaar";

                    //string fileName = $"{uid}_{Guid.NewGuid()}.jpg";
                    //string filePath = Path.Combine(folderPath, fileName);

                    //System.IO.File.WriteAllBytes(filePath, photoBytes);

                    //var request = _httpContextAccessor.HttpContext?.Request;

                    //photoUrl = request != null
                    //    ? $"{request.Scheme}://{request.Host}/aadhaar-photos/{fileName}"
                    //    : $"/aadhaar-photos/{fileName}";
                }

                return new AadhaarKycData
                {
                    AadhaarNumber = uidNode.Attribute("uid")?.Value,
                    Name = poi?.Attribute("name")?.Value,
                    Gender = poi?.Attribute("gender")?.Value,
                    DOB = poi?.Attribute("dob")?.Value,

                    CareOf = poa?.Attribute("co")?.Value,
                    District = poa?.Attribute("dist")?.Value,
                    State = poa?.Attribute("state")?.Value,
                    Pincode = poa?.Attribute("pc")?.Value,
                    PhotoBase64 = photoNode?.Value,
                    PhotoUrl = photoUrl
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("AADHAAR XML Decode Error:");
                Console.WriteLine(ex);
                return null;
            }
        }
        
        
        
        [AllowAnonymous]
        [HttpPost("PDS_Details")]
        public async Task<ResponseViewModel> GetPdsDetails(string RationCardNo)
        {
            try
            {
                string username = "TNeGA";
                string password = "aiml";

                string url = $"https://makkalsevai.tn.gov.in/sfdb/dataservices/adtw/adtw-pdsdata/{RationCardNo}";

                using (var client = new HttpClient())
                {
                    var authBytes = Encoding.ASCII.GetBytes($"{username}:{password}");
                    client.DefaultRequestHeaders.Authorization =
                        new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));

                    client.DefaultRequestHeaders.Accept.Add(
                        new MediaTypeWithQualityHeaderValue("application/json"));

                    var response = await client.GetAsync(url);

                    var responseString = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Error,
                            Message = "API call failed",
                            Data = responseString
                        };
                    }

                    var apiResponse = JsonSerializer.Deserialize<ApiResponseModel>(responseString);

                    if (apiResponse == null || string.IsNullOrEmpty(apiResponse.data))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Error,
                            Message = "Invalid API response"
                        };
                    }

                    var decodedData = DecodePDSXml(apiResponse.data);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "PDS verified successfully",
                        Data = decodedData
                    };
                }
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
        private List<PdsData> DecodePDSXml(string jwtToken)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();

                var token = handler.ReadJwtToken(jwtToken);

                var payloadJson = token.Payload.SerializeToJson();

                var root = JsonDocument.Parse(payloadJson);

                var result = root.RootElement
                                 .GetProperty("Result")
                                 .GetProperty("Data");

                var list = new List<PdsData>();

                foreach (var item in result.EnumerateArray())
                {
                    list.Add(new PdsData
                    {
                        NewRationCardNo = item.GetProperty("NewRationCardNo").GetString(),
                        name_in_english = item.GetProperty("name_in_english").GetString(),
                        name_in_tamil = item.GetProperty("name_in_tamil").GetString(),
                        sex = item.GetProperty("sex").GetString(),
                        addressInEnglish = item.GetProperty("addressInEnglish").GetString(),
                        addressInTamil = item.GetProperty("addressInTamil").GetString(),
                        village_name = item.GetProperty("village_name").GetString(),
                        taluk_name = item.GetProperty("taluk_name").GetString(),
                        district_name = item.GetProperty("district_name").GetString(),
                        pincode = item.GetProperty("pincode").GetString(),
                        mobileNumber = item.GetProperty("mobileNumber").GetString(),
                        dob = item.GetProperty("dob").GetString(),
                        FamilyRelationship = item.GetProperty("FamilyRelationship").GetString()
                    });
                }

                return list;
            }
            catch (Exception ex)
            {
                Console.WriteLine("PDS Decode Error: " + ex.Message);
                return null;
            }
        }
        private async Task<string> UploadAadhaarPhotoToFTPAsync(string base64Photo, string aadhaarNumber)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(base64Photo))
                    return "";

                string savedFileName =
                    $"aadhaar_{aadhaarNumber}_{Guid.NewGuid()}.jpg";

                FTPModel ftpModel = new FTPModel
                {
                    FileFromBase64 = base64Photo,
                    FileName = savedFileName
                };

                if (_ftpHelper.UploadFileFromBase64(ftpModel))
                {
                    return savedFileName;
                }

                return "";
            }
            catch
            {
                return "";
            }
        }

    

        [AllowAnonymous]
        [HttpPost("EMIS_Details")]
        public async Task<ResponseViewModel> GetEMISDetails(string EMIS)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("Authorization", "4acdca2cc493c1ec28e1f68e0d37c49a");

                    var requestBody = new
                    {
                        EmisId = EMIS
                    };

                    var content = new StringContent(
                        JsonSerializer.Serialize(requestBody),
                        Encoding.UTF8,
                        "application/json"
                    );

                    var response = await client.PostAsync("https://tnega.tnschools.gov.in/tnega/api/GetSchlDetails", content);

                    var responseString = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Error,
                            Message = "API call failed",
                            Data = responseString
                        };
                    }

                    var apiResponse = JsonSerializer.Deserialize<EmisApiResponse>(responseString);

                    if (apiResponse == null || !apiResponse.dataStatus || apiResponse.result == null || !apiResponse.result.Any())
                    {
                        return new ResponseViewModel()
                        {
                            Status = null,
                            Message = "No data found"
                        };
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "EMIS details fetched successfully",
                        Data = apiResponse.result.FirstOrDefault()
                    };
                }
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

        [AllowAnonymous]
        [HttpPost("UMIS_Details")]
        public async Task<ResponseViewModel> GetUMISDetails(string UMIS)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("Authorization", "4acdca2cc493c1ec28e1f68e0d37c49a");

                    var url = $"https://umisapi.tnega.org/api/ADWD/GetStudentData/{UMIS}";

                    var response = await client.GetAsync(url);

                    var responseString = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Error,
                            Message = "API call failed",
                            Data = responseString
                        };
                    }

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };

                    var apiResponse = JsonSerializer.Deserialize<UmisStudentResponse>(responseString, options);

                    if (apiResponse == null)
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Error,
                            Message = "Invalid API response"
                        };
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "UMIS details fetched successfully",
                        Data = apiResponse
                    };
                }
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


        public class RefreshTokenRequest
        {
            [JsonPropertyName("refreshToken")]
            public string RefreshToken { get; set; }
        }

        public class ImpersonationRequest
        {
            [JsonPropertyName("username")]
            public string UserName { get; set; }
        }
    }
}
