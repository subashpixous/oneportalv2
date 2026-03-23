// using API.Infrastructure;
// using AutoMapper;
// using BAL;
// using BAL.Interface;
// using DAL;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Model.Constants;
// using Model.DomainModel;
// using Model.ViewModel;
// using Serilog;
// using Utils.Interface;
using API.Infrastructure;
using AutoMapper;
using BAL;
using BAL.Interface;
using DAL;
using DocumentFormat.OpenXml.EMMA;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DomainModel;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using Serilog;
using Utils.Interface;

namespace API.Controllers
{
    public class ApplicantController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
          private readonly IConfiguration _configuration;
        private readonly IAccountBAL _accountBAL;
        private readonly ISettingBAL _settingsBAL;
        private readonly ISchemeBAL _schemeBAL;
        private readonly IUserBAL _userBAL;
        private readonly IApplicantBAL _applicantBAL;
        private readonly IMapper _mapper;
        private readonly IJwtAuthManager _jwtAuthManager;
        private readonly ISMSHelper _smsHelper;
        private readonly IFTPHelpers _ftpHelper;

        public ApplicantController(ILogger<AccountController> logger,
         IConfiguration configuration,
            IAccountBAL accountBAL,
            IMapper mapper,
            IJwtAuthManager jwtAuthManager,
            ISettingBAL settingsBAL,
            ISchemeBAL schemeBAL,
            ISMSHelper smsHelper,
            IFTPHelpers ftpHelper, 
            IApplicantBAL applicantBAL,
            IUserBAL userBAL)
        {
            _logger = logger;
            _accountBAL = accountBAL;
             _configuration = configuration;
            _settingsBAL = settingsBAL;
            _schemeBAL = schemeBAL;
            _mapper = mapper;
            _jwtAuthManager = jwtAuthManager;
            _smsHelper = smsHelper;
            _ftpHelper = ftpHelper;
            _applicantBAL = applicantBAL;
            _userBAL = userBAL;
        }

        [HttpGet("[action]")]
        public ResponseViewModel Application_Get()
        {
            try
            {
                string UserId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                List<ApplicationGridViewModel> list = _applicantBAL.Application_GetList(MemberId: UserId);

                if (list != null)
                {
                    list.ForEach(x =>
                    {
                        if (x.StatusCode.ToLower() == "saved" && x.IsExpired == false)
                        {
                            x.CanEdit = true;
                        }
                    });
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
        public ResponseViewModel MemberDataApprovalGridFilter()
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";

                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (user != null)
                {
                    MemberDataApprovalFilterModel model = new MemberDataApprovalFilterModel();

                    model.Changed_Detail_Record_Types = new List<SelectListItem>()
                    {
                        new SelectListItem() { Text = "New Member", Value = "MEMBER_WHOLE_DATA" },
                        new SelectListItem() { Text = "Primary details", Value = "MEMBER_DETAIL" },
                        new SelectListItem() { Text = "Organization details", Value = "MEMBER_ORGANIZATION" },
                        new SelectListItem() { Text = "Family details", Value = "MEMBER_FAMILY" },
                        new SelectListItem() { Text = "Bank details", Value = "MEMBER_BANK" },
                        new SelectListItem() { Text = "Address details", Value = "MEMBER_ADDRESS" },
                        new SelectListItem() { Text = "Document details", Value = "MEMBER_DOCUMENT" }
                    };

                    model.StatusList = new List<SelectListItem>()
                    {
                        new SelectListItem() { Text = "Waiting for Approval", Value = "WAITING_FOR_APPROVAL" },
                        new SelectListItem() { Text = "In-Progress", Value = "IN_PROGRESS" },
                        new SelectListItem() { Text = "Cancelled", Value = "CANCELLED" },
                        new SelectListItem() { Text = "Rejected", Value = "REJECTED" },
                        new SelectListItem() { Text = "Completed", Value = "COMPLETED" }
                    };

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = model
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


        [HttpPost("scheme-group")]
        [Consumes("multipart/form-data")]
        [AllowAnonymous]
        public async Task<IActionResult> Esevai()
        {
            var form = Request.Form;

            // ?? REQUIRED FIELDS LIST
            var requiredFields = new[]
            {
                "UserId",
                "Password",
                "OprCode",
                "UniqueId",
                "REQID",
                "ServiceID",
                "DepartmentID",
                "CentreCode",
                "CentreType",
                "Checksum"
            };

            var errors = new List<object>();

            // ?? VALIDATION
            foreach (var field in requiredFields)
            {
                if (!form.ContainsKey(field) || string.IsNullOrWhiteSpace(form[field]))
                {
                    errors.Add(new
                    {
                        Field = field,
                        Error = $"{field} is required"
                    });
                }
            }

            // ? IF ANY ERROR ? RETURN
            if (errors.Any())
            {
                return BadRequest(new
                {
                    Status = false,
                    Message = "Validation failed",
                    Errors = errors
                });
            }

            // ?? MAP VALUES
            var model = new esevairefModel
            {
                UserId = form["UserId"],
                Password = form["Password"],
                OprCode = form["OprCode"],
                UniqueId = form["UniqueId"],
                REQID = form["REQID"],
                ServiceID = form["ServiceID"],
                DepartmentID = form["DepartmentID"],
                CentreCode = form["CentreCode"],
                CentreType = form["CentreType"],
                Checksum = form["Checksum"]
            };

            // ?? SAVE SESSION
            HttpContext.Session.SetString(
                "EsevairefModel",
                JsonConvert.SerializeObject(model)
            );

            await HttpContext.Session.CommitAsync();

            // ?? DB INSERT
            using (var conn = new MySqlConnection(
                _configuration.GetConnectionString("Default")))
            {
                string query = @"INSERT INTO esevairefstore  
        (UserId, Password, OprCode, UniqueId, REQID, ServiceID, DepartmentID,
         CentreCode, CentreType, Checksum, FunctionType) 
        VALUES
        (@UserId, @Password, @OprCode, @UniqueId, @REQID, @ServiceID,
         @DepartmentID, @CentreCode, @CentreType, @Checksum, 'Redirection')";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UserId", model.UserId);
                    cmd.Parameters.AddWithValue("@Password", model.Password);
                    cmd.Parameters.AddWithValue("@OprCode", model.OprCode);
                    cmd.Parameters.AddWithValue("@UniqueId", model.UniqueId);
                    cmd.Parameters.AddWithValue("@REQID", model.REQID);
                    cmd.Parameters.AddWithValue("@ServiceID", model.ServiceID);
                    cmd.Parameters.AddWithValue("@DepartmentID", model.DepartmentID);
                    cmd.Parameters.AddWithValue("@CentreCode", model.CentreCode);
                    cmd.Parameters.AddWithValue("@CentreType", model.CentreType);
                    cmd.Parameters.AddWithValue("@Checksum", model.Checksum);

                    conn.Open();
                    await cmd.ExecuteNonQueryAsync();
                }
            }

            // ?? REDIRECT
            var baseUrl = _configuration["CallLetterConfig:ApplicationBaseURL"];
            if (string.IsNullOrEmpty(baseUrl))
                return BadRequest("Base URL configuration is missing");

            return Redirect($"{baseUrl.TrimEnd('/')}/#/applicant/scheme-group");
        }


        [HttpGet("scheme-group")]
        [AllowAnonymous]
        [Produces("application/json")]
        public IActionResult Esevaiget()
        {
            var baseUrl = _configuration["CallLetterConfig:ApplicationBaseURL"];

            if (string.IsNullOrEmpty(baseUrl))
            {
                return BadRequest(new { message = "Base URL configuration is missing" });
            }

            var redirectUrl = $"{baseUrl.TrimEnd('/')}/#/applicant/scheme-group";

            _logger.LogInformation($"Redirecting to: {redirectUrl}");

            return Ok(new
            {
                status = "API working",
                redirectTo = redirectUrl
            });
        }


        [HttpPost("[action]")]
        public ResponseViewModel MemberDataApprovalGridGet(MemberDataApprovalGridFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";

                if (string.IsNullOrWhiteSpace(filter.Where.MemberId))
                {
                    filter.Where.MemberId = userId;
                }

                int TotalCount = 0;
                List<MemberDataApprovalGridModel> memberList = _userBAL.MemberDataApprovalGridGet(filter, out TotalCount);
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = memberList,
                    TotalRecordCount = TotalCount
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
    }
}
