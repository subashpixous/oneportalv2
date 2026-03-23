using API.Helpers;
using API.Infrastructure;
using AutoMapper;
using AutoMapper.Execution;
using BAL;
using BAL.BackgroundWorkerService;
using BAL.Interface;
using ClosedXML.Excel;
using DAL;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Drawing.Diagrams;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.CardApprpvalModels;
using Model.LogModel;
using Model.ViewModel;
using Model.ViewModel.MemberModels;
using NPOI.HPSF;
using OpenCvSharp;
using Org.BouncyCastle.Bcpg;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Serilog;
using Serilog;
using System.IO;
using System.Linq;
using Utils;
using Utils.Interface;
using Utils.Services;
using Document = QuestPDF.Fluent.Document;
namespace API.Controllers
{
    public class UserController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly ILogger<UserController> _userLogger;
        private readonly IAccountBAL _accountBAL;
        private readonly ISettingBAL _settingsBAL;
        private readonly ISchemeBAL _schemeBAL;
        private readonly IUserBAL _userBAL;
        private readonly IMemberBAL _memberBAL;
        private readonly IMapper _mapper;
        private readonly IJwtAuthManager _jwtAuthManager;
        private readonly ISMSHelper _smsHelper;
        private readonly IFTPHelpers _ftpHelper;

        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        private readonly IConfiguration _configuration;
        private readonly ISettingBAL _settingBAL;
        private readonly IGeneralBAL _generalBAL;
         private static readonly Dictionary<string, string> ExportFiles = new();
        private IReportBAL _reportBAL;
        private readonly ILogService _logService;

        public UserController(ILogger<AccountController> logger,
             ILoggerFactory loggerFactory,
            IAccountBAL accountBAL,
            IMapper mapper,
            IJwtAuthManager jwtAuthManager,
            ISettingBAL settingsBAL,
            ISchemeBAL schemeBAL,
            IUserBAL userBAL,
            IMemberBAL memberBAL,
            ISMSHelper smsHelper,
            IFTPHelpers ftpHelper,
            IReportBAL reportBAL,
            IBackgroundTaskQueue backgroundTaskQueue,
            ILogService logService,
            IServiceScopeFactory serviceScopeFactory, IConfiguration configuration , ISettingBAL settingBAL , IGeneralBAL generalBAL)
        {
            _logger = logger;
            _userLogger = loggerFactory.CreateLogger<UserController>();
            _accountBAL = accountBAL;
            _settingsBAL = settingsBAL;
            _schemeBAL = schemeBAL;
            _mapper = mapper;
            _jwtAuthManager = jwtAuthManager;
            _smsHelper = smsHelper;
            _ftpHelper = ftpHelper;
            _userBAL = userBAL;
            _settingBAL = settingBAL;
            _backgroundTaskQueue = backgroundTaskQueue;
            _serviceScopeFactory = serviceScopeFactory;

            _configuration = configuration;
            _memberBAL = memberBAL;
            _generalBAL = generalBAL;
            _reportBAL = reportBAL;
            _logService = logService;
        }

        #region Application

        [HttpGet("[action]")]
        public ResponseViewModel Application_Get()
        {
            try
            {
                List<ApplicationGridViewModel> list = _userBAL.Application_GetList();

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

        [HttpPost("[action]")]
        public ResponseViewModel Application_GetList(ApplicationFilterModel filter)
        {
            try
            {
                if (filter.Where.IsBulkApprovalGet && (filter.Where.StatusIds == null || filter.Where.StatusIds?.Count == 0))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = new List<ApplicationMainGridModel>(),
                        TotalRecordCount = 0
                    };
                }

                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";



                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                List<string> Privillage = new List<string>();
                if (user.RoleCode == "ADM")
                {
                    Privillage = _settingsBAL.Account_Role_Privilege_Get_All(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
                }
                else
                {

                    Privillage = _settingsBAL.Account_Role_Privilege_Login_Get(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
                    if (Privillage.Contains("APPLY_SCHEME"))
                    {

                        filter.Where.CollectedByName = user.UserName;
                        //filter.Where.CollectedByPhoneNumber = user.Mobile;

                    }
                }

                if (Privillage.Contains("APPLICATION_LOCALBODY_VIEW"))
                {

                    filter.Where.Mobile = _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);

                }
                if (user != null)
                {
                    UserPrivillageInfoModel userPrivilege = new UserPrivillageInfoModel();
                    userPrivilege.UserId = userId;
                    userPrivilege.RoleId = user.RoleId;
                    userPrivilege.DistrictIdList = user.DistrictIdList;
                    userPrivilege.BankIdList = user.BankIdList;
                    userPrivilege.BranchIdList = user.BranchIdList;
                    userPrivilege.SchemeIdList = user.SchemeIdList;
                    List<ApplicationPrivilegeMaster> applicationPrivilege = _settingsBAL.Application_Privilege_Get(RoleId: user.RoleId);

                    int TotalCount = 0;



                    List<ApplicationMainGridModel> applicationList = _schemeBAL.Application_MainGrid_Get_List(applicationPrivilege, filter, userPrivilege, out TotalCount);

                    applicationList.ForEach(item =>
                    {
                        if (!string.IsNullOrEmpty(item.SchemeId) && !string.IsNullOrWhiteSpace(item.StatusCode))
                        {
                            ApplicationPrivilegeMaster? _privillage = applicationPrivilege.Where(x => x.SchemeId == item.SchemeId && x.StatusCode == item.StatusCode && x.RoleId == user.RoleId).FirstOrDefault();
                            if (_privillage != null)
                            {
                                item.CanView = _privillage.CanView;
                                item.CanUpdate = _privillage.CanUpdate;
                                item.CanApprove = _privillage.CanApprove;
                                item.CanDelete = _privillage.CanDelete;
                            }
                        }
                    });

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = applicationList,
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
        public ResponseViewModel Application_GetCount(ApplicationCountFilterValueModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";

                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (user != null)
                {
                    UserPrivillageInfoModel userPrivilege = new UserPrivillageInfoModel();
                    userPrivilege.UserId = userId;
                    userPrivilege.RoleId = user.RoleId;
                    userPrivilege.DistrictIdList = user.DistrictIdList;
                    userPrivilege.BankIdList = user.BankIdList;
                    userPrivilege.BranchIdList = user.BranchIdList;
                    userPrivilege.SchemeIdList = user.SchemeIdList;
                    List<ApplicationPrivilegeMaster> applicationPrivilege = _settingsBAL.Application_Privilege_Get(RoleId: user.RoleId);

                    ApplicationRecordCountModel applicationCount = _schemeBAL.ApplicationStatusCountList(applicationPrivilege, filter, userPrivilege);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = applicationCount
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

        #region Member
        [HttpPost("[action]")]


        //modified by Indu on 28-10-2025 for applications(for data checker,RDC,C and others dynamically) 
        public ResponseViewModel Member_GetList(MemberFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                filter.Where.user_Role = user.RoleCode;
                filter.Where.user_RoleName = user.RoleName;
                filter.Where.user_RoleId=user.RoleId;

                if (user != null)
                {
                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                    {
                        filter.Where.DistrictIds = user.DistrictIdList;
                    }

                    List<string> Privillage = new List<string>();

                    //List<string> Privillage = User.Claims.FirstOrDefault(x => x.Type == Constants.Privillage)?.Value?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();

                    if (user.RoleCode == "ADM")
                    {
                        Privillage = _settingsBAL.Account_Role_Privilege_Get_All(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
                       
                    }
                    else
                    {
                       
                        Privillage = _settingsBAL.Account_Role_Privilege_Login_Get(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
                        if (Privillage.Contains("FORM_CREATE"))
                        {

                            filter.Where.CollectedByName = user.UserName;
                            //filter.Where.CollectedByPhoneNumber = user.Mobile;

                        }
                    }


                    int TotalCount = 0;
                    List<MemberGridViewModel> memberList;
                    //if (user.RoleCode == "LCU" || user.RoleCode == "DO" || user.RoleCode == "DC")
                    //{
                    //  filter.Where.IsSubmitted = true;

                    //if (user.RoleCode == "DO" || user.RoleCode == "DC")
                    //{
                    //    if (!string.IsNullOrEmpty(user.LocalBodyIds))
                    //    {
                    //        filter.Where.Local_Body = user.LocalBodyIds;
                    //    }
                    //    if (!string.IsNullOrEmpty(user.NameOfLocalBodyIds))
                    //    {
                    //        filter.Where.Name_of_Local_Body = user.NameOfLocalBodyIds;
                    //    }
                    //    if (!string.IsNullOrEmpty(user.BlockIds))
                    //    {
                    //        filter.Where.Block = user.BlockIds;
                    //    }
                    //    if (!string.IsNullOrEmpty(user.CorporationIds))
                    //    {
                    //        filter.Where.Corporation = user.CorporationIds;
                    //    }
                    //    if (!string.IsNullOrEmpty(user.MunicipalityIds))
                    //    {
                    //        filter.Where.Municipality = user.MunicipalityIds;
                    //    }
                    //    if (!string.IsNullOrEmpty(user.TownPanchayatIds))
                    //    {
                    //        filter.Where.Town_Panchayat = user.TownPanchayatIds;
                    //    }

                    //    if (!string.IsNullOrEmpty(user.VillagePanchayatIds))
                    //    {
                    //        filter.Where.Town_Panchayat = user.VillagePanchayatIds;
                    //    }

                    //if (!string.IsNullOrEmpty(user.ZoneIds))
                    //{
                    //    filter.Where.Zone = user.ZoneIds;
                    //}
                    //if (!string.IsNullOrEmpty(user.Mobile))
                    //{
                    //    filter.Where.Mobile = user.Mobile;
                    //}
                    // }

                    //if (Privillage != null && Privillage.Contains("FORM_CREATE"))
                    //{
                    //        filter.Where.Mobile = _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);

                    //    }

                    //  memberList = _memberBAL.MemberGridGetforLocalBody(filter, out TotalCount);
                    //}
                    //else
                    //{
                    //    filter.Where.IsSubmitted = false;

                    //}
                    if (!string.IsNullOrEmpty(user.BlockIds) && (filter.Where.Block == null || filter.Where.Block.Count() == 0))
                    {
                        filter.Where.Block = user.BlockIds;
                    }
                    if (!string.IsNullOrEmpty(user.CorporationIds) && (filter.Where.Corporation == null || filter.Where.Corporation.Count() == 0))
                    {
                        filter.Where.Corporation = user.CorporationIds;
                    }
                    if (!string.IsNullOrEmpty(user.MunicipalityIds) && (filter.Where.Municipality == null || filter.Where.Municipality.Count() == 0))
                    {
                        filter.Where.Municipality = user.MunicipalityIds;
                    }
                    if (!string.IsNullOrEmpty(user.TownPanchayatIds) && (filter.Where.Town_Panchayat == null || filter.Where.Town_Panchayat.Count() == 0))
                    {
                        filter.Where.Town_Panchayat = user.TownPanchayatIds;
                    }

                    if (!string.IsNullOrEmpty(user.VillagePanchayatIds) && (filter.Where.Village_Panchayat == null || filter.Where.Village_Panchayat.Count() == 0))
                    {
                        filter.Where.Village_Panchayat = user.VillagePanchayatIds;
                    }

                    if (!string.IsNullOrEmpty(user.LocalBodyIds) && (filter.Where.Local_Body == null || filter.Where.Local_Body.Count() == 0))
                    {
                        filter.Where.Local_Body = user.LocalBodyIds;
                    }
                    if (!string.IsNullOrEmpty(user.NameOfLocalBodyIds) && (filter.Where.Name_of_Local_Body == null || filter.Where.Name_of_Local_Body.Count() == 0))
                    {
                        filter.Where.Name_of_Local_Body = user.NameOfLocalBodyIds;
                    }
                    if (!string.IsNullOrEmpty(user.ZoneIds) && (filter.Where.Zone == null || filter.Where.Zone.Count() == 0))
                    {
                        filter.Where.Zone = user.ZoneIds;
                    }

                    // this privillage is used for RDC ,DC,C to view the applications submitted by Data operators
                    if (Privillage.Contains("APPLICATION_LOCALBODY_VIEW"))
                    {

                        filter.Where.Mobile = _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);

                    }
                   

                  

                    memberList = _memberBAL.MemberGridGet(filter, out TotalCount);

                    if (Privillage.Contains("MEMBER_UPDATE") )
                    {
                        memberList.ForEach(x =>
                        {
                            if (!x.IsSubmitted && filter.Where.Approval_application_Status!="Approvals")
                            {
                                x.CanEdit = true;
                            }
                            if (x.NextApprovalRole == user.RoleName && x.IsApprovalCompleted == "0")
                            {
                                x.CanApprove = true;
                            }
                          
                        });
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = memberList,
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
       
        // [06-11-2025] Updated by Sivasankar K: Modified To Export All Data
        [HttpPost("ExportMemberList")]
        public IActionResult ExportMemberList([FromBody] ExportRequestModel request)
        {
            string userId = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";
            string jobId = Guid.NewGuid().ToString();

            // 🟡 Mark export job as pending
            ExportJobStore.Add(jobId, new ExportJobStatus { Status = "Pending" });

            // 🟢 Queue background job for export generation
            _backgroundTaskQueue.QueueBackgroundWorkItem(async token =>
            {
                try
                {
                    AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    if (user == null)
                        throw new Exception("User not found.");

                    var filter = request.Filter;
                    filter.Where.user_Role = user.RoleCode;

                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                        filter.Where.DistrictIds = user.DistrictIdList;

                    List<string> privileges = user.RoleCode == "ADM"
                        ? _settingsBAL.Account_Role_Privilege_Get_All(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new()
                        : _settingsBAL.Account_Role_Privilege_Login_Get(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new();

                    // 🧭 Apply user’s regional access filters if missing
                    if (!string.IsNullOrEmpty(user.BlockIds) && (filter.Where.Block == null || filter.Where.Block.Count() == 0))
                        filter.Where.Block = user.BlockIds;

                    if (!string.IsNullOrEmpty(user.CorporationIds) && (filter.Where.Corporation == null || filter.Where.Corporation.Count() == 0))
                        filter.Where.Corporation = user.CorporationIds;

                    if (!string.IsNullOrEmpty(user.MunicipalityIds) && (filter.Where.Municipality == null || filter.Where.Municipality.Count() == 0))
                        filter.Where.Municipality = user.MunicipalityIds;

                    if (!string.IsNullOrEmpty(user.TownPanchayatIds) && (filter.Where.Town_Panchayat == null || filter.Where.Town_Panchayat.Count() == 0))
                        filter.Where.Town_Panchayat = user.TownPanchayatIds;

                    if (!string.IsNullOrEmpty(user.VillagePanchayatIds) && (filter.Where.Village_Panchayat == null || filter.Where.Village_Panchayat.Count() == 0))
                        filter.Where.Village_Panchayat = user.VillagePanchayatIds;

                    if (!string.IsNullOrEmpty(user.LocalBodyIds) && (filter.Where.Local_Body == null || filter.Where.Local_Body.Count() == 0))
                        filter.Where.Local_Body = user.LocalBodyIds;

                    if (!string.IsNullOrEmpty(user.NameOfLocalBodyIds) && (filter.Where.Name_of_Local_Body == null || filter.Where.Name_of_Local_Body.Count() == 0))
                        filter.Where.Name_of_Local_Body = user.NameOfLocalBodyIds;

                    if (!string.IsNullOrEmpty(user.ZoneIds) && (filter.Where.Zone == null || filter.Where.Zone.Count() == 0))
                        filter.Where.Zone = user.ZoneIds;

                    if (privileges.Contains("APPLICATION_LOCALBODY_VIEW"))
                        filter.Where.Mobile = _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);

                    int totalCount = 0;
                    List<MemberGridViewModel> memberList = _memberBAL.MemberGridGet(filter, out totalCount);

                    if (memberList == null || memberList.Count == 0)
                        throw new Exception("No data found.");

                    if (privileges.Contains("MEMBER_UPDATE"))
                        memberList.ForEach(x => { if (!x.IsSubmitted) x.CanEdit = true; });

                    // 🧾 Generate file
                    byte[] fileBytes;
                    string mimeType;
                    string fileName;

                    if (request.ExportType?.ToLower() == "excel")
                    {
                        using var workbook = new ClosedXML.Excel.XLWorkbook();
                        var ws = workbook.Worksheets.Add("Members");
                        var props = typeof(MemberGridViewModel).GetProperties();

                        for (int i = 0; i < props.Length; i++)
                            ws.Cell(1, i + 1).Value = props[i].Name;

                        int row = 2;
                        foreach (var item in memberList)
                        {
                            for (int i = 0; i < props.Length; i++)
                                ws.Cell(row, i + 1).Value = props[i].GetValue(item)?.ToString() ?? "";
                            row++;
                        }

                        using var ms = new MemoryStream();
                        workbook.SaveAs(ms);
                        fileBytes = ms.ToArray();
                        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"MemberListExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                    }
                    else
                    {
                        fileBytes = Document.Create(container =>
                        {
                            container.Page(page =>
                            {
                                page.Margin(20);
                                page.Header().Text("Member List Export").FontSize(18).Bold().AlignCenter();
                                page.Content().Table(table =>
                                {
                                    var props = typeof(MemberGridViewModel).GetProperties().Take(8).ToList();
                                    table.ColumnsDefinition(cols =>
                                    {
                                        foreach (var _ in props)
                                            cols.RelativeColumn();
                                    });
                                    table.Header(header =>
                                    {
                                        foreach (var prop in props)
                                            header.Cell().Text(prop.Name).Bold();
                                    });
                                    foreach (var item in memberList)
                                    {
                                        foreach (var prop in props)
                                            table.Cell().Text(prop.GetValue(item)?.ToString() ?? "");
                                    }
                                });
                            });
                        }).GeneratePdf();

                        mimeType = "application/pdf";
                        fileName = $"MemberListExport_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    }

                    // 🟢 Store export result in memory
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Completed",
                        FileBytes = fileBytes,
                        MimeType = mimeType,
                        FileName = fileName
                    });
                }
                catch (Exception ex)
                {
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Failed",
                        ErrorMessage = ex.Message
                    });
                    _logger.LogError(ex, "Background export failed for MemberList.");
                }
            });

            // 🟢 Return immediate response with download link
            var downloadUrl = $"{Request.Scheme}://{Request.Host}/api/User/Export/WaitAndDownload/{jobId}";
            return Ok(new { Message = "Export started.", DownloadUrl = downloadUrl });
        }



        [HttpPost("[action]")]


        //modified by Sivasankar K on 30-10-2025 for applications(for data checker,RDC,C and others data export) 
        public ResponseViewModel Member_GetList_Export(MemberFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                filter.Where.user_Role = user.RoleCode;
                if (user != null)
                {
                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                    {
                        filter.Where.DistrictIds = user.DistrictIdList;
                    }

                    List<string> Privillage = new List<string>();
                    if (user.RoleCode == "ADM")
                    {
                        Privillage = _settingsBAL.Account_Role_Privilege_Get_All(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
                    }
                    else
                    {
                        Privillage = _settingsBAL.Account_Role_Privilege_Login_Get(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
                    }


                    int TotalCount = 0;
                    List<MemberGridViewModel> memberList;
              
                    
                    if (!string.IsNullOrEmpty(user.BlockIds))
                    {
                        filter.Where.Block = user.BlockIds;
                    }
                    if (!string.IsNullOrEmpty(user.CorporationIds))
                    {
                        filter.Where.Corporation = user.CorporationIds;
                    }
                    if (!string.IsNullOrEmpty(user.MunicipalityIds))
                    {
                        filter.Where.Municipality = user.MunicipalityIds;
                    }
                    if (!string.IsNullOrEmpty(user.TownPanchayatIds))
                    {
                        filter.Where.Town_Panchayat = user.TownPanchayatIds;
                    }

                    if (!string.IsNullOrEmpty(user.VillagePanchayatIds))
                    {
                        filter.Where.Town_Panchayat = user.VillagePanchayatIds;
                    }

                    if (!string.IsNullOrEmpty(user.LocalBodyIds))
                    {
                        filter.Where.Local_Body = user.LocalBodyIds;
                    }
                    if (!string.IsNullOrEmpty(user.NameOfLocalBodyIds))
                    {
                        filter.Where.Name_of_Local_Body = user.NameOfLocalBodyIds;
                    }
                    if (!string.IsNullOrEmpty(user.ZoneIds))
                    {
                        filter.Where.Zone = user.ZoneIds;
                    }

                    // this privillage is used for RDC ,DC,C to view the applications submitted by Data operators
                    if (Privillage.Contains("APPLICATION_LOCALBODY_VIEW"))
                    {

                        filter.Where.Mobile = _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);

                    }
                    memberList = _memberBAL.MemberGridGetforLocalBody(filter, out TotalCount);
                    
                    if (Privillage.Contains("MEMBER_UPDATE"))
                    {
                        memberList.ForEach(x =>
                        {
                            if (!x.IsSubmitted)
                            {
                                x.CanEdit = true;
                            }
                        });
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = memberList,
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
        // [08-11-2025] Updated by Sivasankar K: Modified To Export All Data
        [HttpPost("ExportMemberListByAnimator")]
        public IActionResult ExportMemberListByAnimator([FromBody] MemberFilterForAnimatorModel request)
        {
            string userId = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";
            string jobId = Guid.NewGuid().ToString();

            ExportJobStore.Add(jobId, new ExportJobStatus { Status = "Pending" });

            _backgroundTaskQueue.QueueBackgroundWorkItem(async token =>
            {
                try
                {
                    var user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    if (user == null)
                        throw new Exception("User not found.");

                    var filter = request.Filter;
                    if (filter == null)
                        throw new Exception("Invalid filter payload.");

                    var memberList = _reportBAL.GetMemberListByCollector(filter, userId, out int totalCount);
                    if (memberList == null || memberList.Count == 0)
                        throw new Exception("No data found to export.");

                    byte[] fileBytes;
                    string mimeType;
                    string fileName;

                    if (request.ExportType?.ToLower() == "excel")
                    {
                        using var workbook = new XLWorkbook();
                        var ws = workbook.Worksheets.Add("Members");
                        var props = memberList.First().GetType().GetProperties();

                        for (int i = 0; i < props.Length; i++)
                            ws.Cell(1, i + 1).Value = props[i].Name;

                        int row = 2;
                        foreach (var item in memberList)
                        {
                            for (int i = 0; i < props.Length; i++)
                                ws.Cell(row, i + 1).Value = props[i].GetValue(item)?.ToString() ?? "";
                            row++;
                        }

                        using var ms = new MemoryStream();
                        workbook.SaveAs(ms);
                        fileBytes = ms.ToArray();
                        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"MemberListByAnimator_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                    }
                    else
                    {
                        fileBytes = Document.Create(container =>
                        {
                            container.Page(page =>
                            {
                                page.Margin(20);
                                page.Header().Text("Member List - Animator Report").FontSize(18).Bold().AlignCenter();
                                page.Content().Table(table =>
                                {
                                    var props = memberList.First().GetType().GetProperties().Take(8).ToList();
                                    table.ColumnsDefinition(cols => { foreach (var _ in props) cols.RelativeColumn(); });
                                    table.Header(header => { foreach (var p in props) header.Cell().Text(p.Name).Bold(); });
                                    foreach (var item in memberList)
                                        foreach (var p in props)
                                            table.Cell().Text(p.GetValue(item)?.ToString() ?? "");
                                });
                            });
                        }).GeneratePdf();

                        mimeType = "application/pdf";
                        fileName = $"MemberListByAnimator_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    }

                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Completed",
                        FileBytes = fileBytes,
                        MimeType = mimeType,
                        FileName = fileName
                    });
                }
                catch (Exception ex)
                {
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Failed",
                        ErrorMessage = ex.Message
                    });
                    _logger.LogError(ex, "ExportMemberListByAnimator failed.");
                }
            });

            var downloadUrl = $"{Request.Scheme}://{Request.Host}/api/User/Export/WaitAndDownload/{jobId}";
            return Ok(new { Message = "Export started.", DownloadUrl = downloadUrl });
        }

        // [08-11-2025] Updated by Sivasankar K: Modified To Export All Data

        [HttpPost("ExportApplicationListByAnimator")]
        public IActionResult ExportApplicationListByAnimator([FromBody] ApplicationFilterForAnimatorModel request)
        {
            string userId = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";
            string jobId = Guid.NewGuid().ToString();

            ExportJobStore.Add(jobId, new ExportJobStatus { Status = "Pending" });

            _backgroundTaskQueue.QueueBackgroundWorkItem(async token =>
            {
                try
                {
                    var user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    if (user == null)
                        throw new Exception("User not found.");

                    var filter = request.Filter;
                    if (filter == null)
                        throw new Exception("Invalid filter payload.");

                    var appList = _reportBAL.GetApplicationListByCollector(filter, userId, out int totalCount);
                    if (appList == null || appList.Count == 0)
                        throw new Exception("No data found to export.");

                    byte[] fileBytes;
                    string mimeType;
                    string fileName;

                    if (request.ExportType?.ToLower() == "excel")
                    {
                        using var workbook = new XLWorkbook();
                        var ws = workbook.Worksheets.Add("Applications");
                        var props = appList.First().GetType().GetProperties();

                        for (int i = 0; i < props.Length; i++)
                            ws.Cell(1, i + 1).Value = props[i].Name;

                        int row = 2;
                        foreach (var item in appList)
                        {
                            for (int i = 0; i < props.Length; i++)
                                ws.Cell(row, i + 1).Value = props[i].GetValue(item)?.ToString() ?? "";
                            row++;
                        }

                        using var ms = new MemoryStream();
                        workbook.SaveAs(ms);
                        fileBytes = ms.ToArray();
                        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"SchemeListByAnimator_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                    }
                    else
                    {
                        fileBytes = Document.Create(container =>
                        {
                            container.Page(page =>
                            {
                                page.Margin(20);
                                page.Header().Text("Application List - Animator Report").FontSize(18).Bold().AlignCenter();
                                page.Content().Table(table =>
                                {
                                    var props = appList.First().GetType().GetProperties().Take(8).ToList();
                                    table.ColumnsDefinition(cols => { foreach (var _ in props) cols.RelativeColumn(); });
                                    table.Header(header => { foreach (var p in props) header.Cell().Text(p.Name).Bold(); });
                                    foreach (var item in appList)
                                        foreach (var p in props)
                                            table.Cell().Text(p.GetValue(item)?.ToString() ?? "");
                                });
                            });
                        }).GeneratePdf();

                        mimeType = "application/pdf";
                        fileName = $"SchemeListByAnimator_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    }

                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Completed",
                        FileBytes = fileBytes,
                        MimeType = mimeType,
                        FileName = fileName
                    });
                }
                catch (Exception ex)
                {
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Failed",
                        ErrorMessage = ex.Message
                    });
                    _logger.LogError(ex, "ExportApplicationListByAnimator failed.");
                }
            });

            var downloadUrl = $"{Request.Scheme}://{Request.Host}/api/User/Export/WaitAndDownload/{jobId}";
            return Ok(new { Message = "Export started.", DownloadUrl = downloadUrl });
        }



        // [06-11-2025] Updated by Sivasankar K: Modified To Export All Data
        [HttpPost("Export")]
        public IActionResult Export([FromBody] ExportRequestModel request)
        {
            string userId = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";
            string jobId = Guid.NewGuid().ToString();

            // Store job as pending
            ExportJobStore.Add(jobId, new ExportJobStatus { Status = "Pending" });

            _backgroundTaskQueue.QueueBackgroundWorkItem(async token =>
            {
                try
                {
                    // ------------------ your logic reused ------------------
                    var user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    if (user == null) throw new Exception("User not found.");

                    var filter = request.Filter;
                    filter.Where.user_Role = user.RoleCode;

                    if (filter.Where.DistrictIds == null || !filter.Where.DistrictIds.Any())
                        filter.Where.DistrictIds = user.DistrictIdList;

                    var privileges = user.RoleCode == "ADM"
                        ? _settingsBAL.Account_Role_Privilege_Get_All(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new()
                        : _settingsBAL.Account_Role_Privilege_Login_Get(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new();

                    if (!string.IsNullOrEmpty(user.BlockIds)) filter.Where.Block = user.BlockIds;
                    if (!string.IsNullOrEmpty(user.CorporationIds)) filter.Where.Corporation = user.CorporationIds;
                    if (!string.IsNullOrEmpty(user.MunicipalityIds)) filter.Where.Municipality = user.MunicipalityIds;
                    if (!string.IsNullOrEmpty(user.TownPanchayatIds)) filter.Where.Town_Panchayat = user.TownPanchayatIds;
                    if (!string.IsNullOrEmpty(user.VillagePanchayatIds)) filter.Where.Town_Panchayat = user.VillagePanchayatIds;
                    if (!string.IsNullOrEmpty(user.LocalBodyIds)) filter.Where.Local_Body = user.LocalBodyIds;
                    if (!string.IsNullOrEmpty(user.NameOfLocalBodyIds)) filter.Where.Name_of_Local_Body = user.NameOfLocalBodyIds;
                    if (!string.IsNullOrEmpty(user.ZoneIds)) filter.Where.Zone = user.ZoneIds;

                    if (privileges.Contains("APPLICATION_LOCALBODY_VIEW"))
                        filter.Where.Mobile = _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);

                    int totalCount = 0;
                    var memberList = _memberBAL.MemberGridGetforLocalBody(filter, out totalCount);

                    if (privileges.Contains("MEMBER_UPDATE"))
                        memberList.ForEach(x => { if (!x.IsSubmitted) x.CanEdit = true; });

                    if (memberList == null || memberList.Count == 0)
                        throw new Exception("No data found.");

                    // ------------------ file generation ------------------
                    byte[] fileBytes;
                    string fileName;
                    string mimeType;

                    if (request.ExportType?.ToLower() == "excel")
                    {
                        using var workbook = new ClosedXML.Excel.XLWorkbook();
                        var ws = workbook.Worksheets.Add("Members");
                        var props = typeof(MemberGridViewModel).GetProperties();

                        for (int i = 0; i < props.Length; i++)
                            ws.Cell(1, i + 1).Value = props[i].Name;

                        int row = 2;
                        foreach (var item in memberList)
                        {
                            for (int i = 0; i < props.Length; i++)
                                ws.Cell(row, i + 1).Value = props[i].GetValue(item)?.ToString() ?? "";
                            row++;
                        }

                        using var ms = new MemoryStream();
                        workbook.SaveAs(ms);
                        fileBytes = ms.ToArray();

                        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"MemberExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                    }
                    else
                    {
                        fileBytes = Document.Create(container =>
                        {
                            container.Page(page =>
                            {
                                page.Margin(20);
                                page.Header().Text("Member Export Report").FontSize(18).Bold().AlignCenter();
                                page.Content().Table(table =>
                                {
                                    var props = typeof(MemberGridViewModel).GetProperties().Take(8).ToList();
                                    table.ColumnsDefinition(cols =>
                                    {
                                        foreach (var _ in props)
                                            cols.RelativeColumn();
                                    });
                                    table.Header(header =>
                                    {
                                        foreach (var prop in props)
                                            header.Cell().Text(prop.Name).Bold();
                                    });
                                    foreach (var item in memberList)
                                    {
                                        foreach (var prop in props)
                                            table.Cell().Text(prop.GetValue(item)?.ToString() ?? "");
                                    }
                                });
                            });
                        }).GeneratePdf();

                        mimeType = "application/pdf";
                        fileName = $"MemberExport_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    }

                    // Store result in memory
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Completed",
                        FileBytes = fileBytes,
                        MimeType = mimeType,
                        FileName = fileName
                    });
                }
                catch (Exception ex)
                {
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Failed",
                        ErrorMessage = ex.Message
                    });
                    _logger.LogError(ex, "Background export failed.");
                }
            });

            // return immediately
            var downloadUrl = $"{Request.Scheme}://{Request.Host}/api/User/Export/WaitAndDownload/{jobId}";
            return Ok(new { Message = "Export started.", DownloadUrl = downloadUrl });
        }









        // [06-11-2025] Updated by Sivasankar K: Modified To Export All Data

        [AllowAnonymous] // required so browser can download without token
        [HttpGet("Export/WaitAndDownload/{jobId}")]
        public async Task<IActionResult> WaitAndDownload(string jobId)
        {
            const int maxWaitMs = 20 * 60 * 1000; // 20 minutes
            const int intervalMs = 2000; // check every 2 seconds
            int waited = 0;

            while (waited < maxWaitMs)
            {
                var job = ExportJobStore.Get(jobId);

                if (job == null)
                    return NotFound("Invalid or expired job ID.");

                // ✅ If job is ready, return file immediately
                if (job.Status == "Completed")
                {
                    var bytes = job.FileBytes;

                    // Clean memory immediately after sending
                    ExportJobStore.Remove(jobId);

                    return File(bytes, job.MimeType ?? "application/octet-stream", job.FileName ?? "ExportFile");
                }

                // ✅ If failed, return error
                if (job.Status == "Failed")
                {
                    var error = job.ErrorMessage ?? "Export failed due to an internal error.";
                    ExportJobStore.Remove(jobId);
                    return BadRequest(error);
                }

                // ⏳ Optional safety: expire if job older than 15 minutes
                if ((DateTime.UtcNow - job.CreatedAt).TotalMinutes > 15)
                {
                    ExportJobStore.Remove(jobId);
                    return BadRequest("Export link expired. Please try again.");
                }

                await Task.Delay(intervalMs);
                waited += intervalMs;
            }

            // ⏰ If export didn't complete in 20 minutes, stop waiting
            return Ok("Export is still processing. Please refresh or try again later.");
        }






        // [07-11-2025] Added by Vijay: Background Export for Datewise Approved Report

        [HttpPost("ExportDatewiseApprovedList")]
        public IActionResult ExportDatewiseApprovedList([FromBody] ExportRequestModel request)
        {
            string userId = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";
            string jobId = Guid.NewGuid().ToString();

            ExportJobStore.Add(jobId, new ExportJobStatus { Status = "Pending" });

            _backgroundTaskQueue.QueueBackgroundWorkItem(async token =>
            {
                try
                {
                    // ✅ Reuse your DatewiseAprovedList logic
                    var user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    if (user == null) throw new Exception("User not found.");

                    var filter = request.Filter;
                    filter.Where.user_Role = user.RoleCode;

                    if (filter.Where.DistrictIds == null || !filter.Where.DistrictIds.Any())
                        filter.Where.DistrictIds = user.DistrictIdList;

                    var privileges = user.RoleCode == "ADM"
                        ? _settingsBAL.Account_Role_Privilege_Get_All(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new()
                        : _settingsBAL.Account_Role_Privilege_Login_Get(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new();

                    // ✅ Role mapping (same as your existing DatewiseAprovedList)
                    string HQRoleId = _userBAL.GetRoleId("HQ");
                    string DMroleId = _userBAL.GetRoleId("DM");
                    string DCroleId = _userBAL.GetRoleId("DC");
                    filter.Where.DMroleId = DMroleId;
                    filter.Where.DCroleId = DCroleId;
                    filter.Where.HQroleId = HQRoleId;

                    if (!string.IsNullOrEmpty(user.BlockIds) && (filter.Where.Block == null || !filter.Where.Block.Any()))
                        filter.Where.Block = user.BlockIds;

                    if (!string.IsNullOrEmpty(user.CorporationIds) && (filter.Where.Corporation == null || !filter.Where.Corporation.Any()))
                        filter.Where.Corporation = user.CorporationIds;

                    if (!string.IsNullOrEmpty(user.MunicipalityIds) && (filter.Where.Municipality == null || !filter.Where.Municipality.Any()))
                        filter.Where.Municipality = user.MunicipalityIds;

                    if (!string.IsNullOrEmpty(user.TownPanchayatIds) && (filter.Where.Town_Panchayat == null || !filter.Where.Town_Panchayat.Any()))
                        filter.Where.Town_Panchayat = user.TownPanchayatIds;

                    if (!string.IsNullOrEmpty(user.VillagePanchayatIds) && (filter.Where.Village_Panchayat == null || !filter.Where.Village_Panchayat.Any()))
                        filter.Where.Village_Panchayat = user.VillagePanchayatIds;

                    if (!string.IsNullOrEmpty(user.LocalBodyIds) && (filter.Where.Local_Body == null || !filter.Where.Local_Body.Any()))
                        filter.Where.Local_Body = user.LocalBodyIds;

                    if (!string.IsNullOrEmpty(user.NameOfLocalBodyIds) && (filter.Where.Name_of_Local_Body == null || !filter.Where.Name_of_Local_Body.Any()))
                        filter.Where.Name_of_Local_Body = user.NameOfLocalBodyIds;

                    if (!string.IsNullOrEmpty(user.ZoneIds) && (filter.Where.Zone == null || !filter.Where.Zone.Any()))
                        filter.Where.Zone = user.ZoneIds;
                    if (privileges.Contains("APPLICATION_LOCALBODY_VIEW"))
                    {

                        filter.Where.Mobile = _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);

                    }

                    // ✅ Fetch all data
                    int totalCount = 0;
                    var approvedList = _memberBAL.DatewiseAprovedList(filter, out totalCount);

                    if (approvedList == null || approvedList.Count == 0)
                        throw new Exception("No data found for export.");

                    // ✅ Generate file
                    byte[] fileBytes;
                    string fileName;
                    string mimeType;

                    if (request.ExportType?.ToLower() == "excel")
                    {
                        using var workbook = new ClosedXML.Excel.XLWorkbook();
                        var ws = workbook.Worksheets.Add("Datewise Approved");
                        var props = typeof(DatewiseApprovalModel).GetProperties();

                        for (int i = 0; i < props.Length; i++)
                            ws.Cell(1, i + 1).Value = props[i].Name;

                        int row = 2;
                        foreach (var item in approvedList)
                        {
                            for (int i = 0; i < props.Length; i++)
                                ws.Cell(row, i + 1).Value = props[i].GetValue(item)?.ToString() ?? "";
                            row++;
                        }

                        using var ms = new MemoryStream();
                        workbook.SaveAs(ms);
                        fileBytes = ms.ToArray();

                        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"DatewiseApproved_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                    }
                    else
                    {
                        fileBytes = Document.Create(container =>
                        {
                            container.Page(page =>
                            {
                                page.Margin(20);
                                page.Header().Text("Datewise Approved Report").FontSize(18).Bold().AlignCenter();
                                page.Content().Table(table =>
                                {
                                    var props = typeof(DatewiseApprovalModel).GetProperties().Take(8).ToList();
                                    table.ColumnsDefinition(cols =>
                                    {
                                        foreach (var _ in props)
                                            cols.RelativeColumn();
                                    });
                                    table.Header(header =>
                                    {
                                        foreach (var prop in props)
                                            header.Cell().Text(prop.Name).Bold();
                                    });
                                    foreach (var item in approvedList)
                                    {
                                        foreach (var prop in props)
                                            table.Cell().Text(prop.GetValue(item)?.ToString() ?? "");
                                    }
                                });
                            });
                        }).GeneratePdf();

                        mimeType = "application/pdf";
                        fileName = $"DatewiseApproved_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    }

                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Completed",
                        FileBytes = fileBytes,
                        MimeType = mimeType,
                        FileName = fileName
                    });
                }
                catch (Exception ex)
                {
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Failed",
                        ErrorMessage = ex.Message
                    });
                    _logger.LogError(ex, "Datewise Approved Export failed.");
                }
            });

            var downloadUrl = $"{Request.Scheme}://{Request.Host}/api/User/Export/WaitAndDownload/{jobId}";
            return Ok(new { Message = "Export started.", DownloadUrl = downloadUrl });
        }



        //modified by Indu on 05-11-2025 for viewing datewise approved report
        [HttpPost("[action]")]
        public ResponseViewModel DatewiseAprovedList(MemberFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                filter.Where.user_Role = user.RoleCode;
                if (user != null)
                {
                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                    {
                        filter.Where.DistrictIds = user.DistrictIdList;
                    }

                    List<string> Privillage = new List<string>();
                    if (user.RoleCode == "ADM")
                    {
                        Privillage = _settingsBAL.Account_Role_Privilege_Get_All(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
                    }
                    else
                    {
                        Privillage = _settingsBAL.Account_Role_Privilege_Login_Get(user.RoleId)?.Select(x => x.PrivilegeCode)?.ToList() ?? new List<string>();
                    }


                    int TotalCount = 0;
                    object memberList;
                    //List<DatewiseApprovalModel> memberList;

                    string HQRoleId = _userBAL.GetRoleId("HQ");
                    string DMroleId = _userBAL.GetRoleId("DM");
                    string DCroleId = _userBAL.GetRoleId("DC");
                    filter.Where.DMroleId = DMroleId;
                    filter.Where.DCroleId = DCroleId;
                    filter.Where.HQroleId = HQRoleId;



                    if (!string.IsNullOrEmpty(user.BlockIds) && (filter.Where.Block == null || filter.Where.Block.Count() == 0))
                    {
                        filter.Where.Block = user.BlockIds;
                    }
                    if (!string.IsNullOrEmpty(user.CorporationIds) && (filter.Where.Corporation == null || filter.Where.Corporation.Count() == 0))
                    {
                        filter.Where.Corporation = user.CorporationIds;
                    }
                    if (!string.IsNullOrEmpty(user.MunicipalityIds) && (filter.Where.Municipality == null || filter.Where.Municipality.Count() == 0))
                    {
                        filter.Where.Municipality = user.MunicipalityIds;
                    }
                    if (!string.IsNullOrEmpty(user.TownPanchayatIds) && (filter.Where.Town_Panchayat == null || filter.Where.Town_Panchayat.Count() == 0))
                    {
                        filter.Where.Town_Panchayat = user.TownPanchayatIds;
                    }

                    if (!string.IsNullOrEmpty(user.VillagePanchayatIds) && (filter.Where.Village_Panchayat == null || filter.Where.Village_Panchayat.Count() == 0))
                    {
                        filter.Where.Village_Panchayat = user.VillagePanchayatIds;
                    }

                    if (!string.IsNullOrEmpty(user.LocalBodyIds) && (filter.Where.Local_Body == null || filter.Where.Local_Body.Count() == 0))
                    {
                        filter.Where.Local_Body = user.LocalBodyIds;
                    }
                    if (!string.IsNullOrEmpty(user.NameOfLocalBodyIds) && (filter.Where.Name_of_Local_Body == null || filter.Where.Name_of_Local_Body.Count() == 0))
                    {
                        filter.Where.Name_of_Local_Body = user.NameOfLocalBodyIds;
                    }
                    if (!string.IsNullOrEmpty(user.ZoneIds) && (filter.Where.Zone == null || filter.Where.Zone.Count() == 0))
                    {
                        filter.Where.Zone = user.ZoneIds;
                    }
                    if (Privillage.Contains("APPLICATION_LOCALBODY_VIEW"))
                    {

                        filter.Where.Mobile = _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);

                    }

                    //modified by Sivasankar K on 20-12-2025 for viewing datewise approved report

                    if (!string.IsNullOrWhiteSpace(filter.Where.ReportFormat))
                    {
                        if (filter.Where.ReportFormat == "MEMBER")
                        {
                            memberList = _memberBAL.GetAllLocalBodySummary();
                        }
                        else if (filter.Where.ReportFormat == "DEPARTMENT")
                        {
                            memberList = _memberBAL.GetDatewiseApprovedMembers(filter, out TotalCount);
                        }

                        else if (filter.Where.ReportFormat.Equals("CORPORATION", StringComparison.OrdinalIgnoreCase) ||
       filter.Where.ReportFormat.Equals("MUNICIPALITY", StringComparison.OrdinalIgnoreCase) ||
       filter.Where.ReportFormat.Equals("TOWN PANCHAYAT", StringComparison.OrdinalIgnoreCase) )
                        {
                            memberList = _memberBAL.GetNameofLocalBodyReport(filter, out TotalCount);
                        }
                        else if (string.Equals(filter.Where.ReportFormat, "GCC", StringComparison.OrdinalIgnoreCase) || string.Equals(filter.Where.ReportFormat, "CMWS", StringComparison.OrdinalIgnoreCase))
                        {
                            memberList = _memberBAL.GetGCCReport(filter, out TotalCount);
                        }
                      
                        else if (filter.Where.ReportFormat == "RuralDevelopement")
                        {
                            memberList = _memberBAL.GetBlockWiseReport(filter, out TotalCount);
                        }
                      
                        else if (filter.Where.ReportFormat == "FamilyMembers")
                        {
                            memberList = _memberBAL.FamilyMembersAprovedList(filter, out TotalCount);
                        }
                        else if (filter.Where.ReportFormat == "PROGRESSIVE")
                        {
                            memberList = _memberBAL.GetDatewiseProgressiveReport(filter, out TotalCount);
                        }
                        else
                        {
                            // unknown report format safety
                            memberList = _memberBAL.DatewiseAprovedList(filter, out TotalCount);
                        }
                    }
                    else
                    {
                        // reportFormat is null
                        memberList = _memberBAL.DatewiseAprovedList(filter, out TotalCount);
                    }

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = memberList,
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







        #endregion Member

        #region Approval

        [HttpPost("[action]")]
        [Consumes("application/json", "multipart/form-data")]
        public ResponseViewModel Application_Approve([FromForm] ApprovalModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                if (model.File != null)
                {
                    FTPModel fTPModel = new FTPModel();
                    fTPModel.file = model.File;
                    fTPModel.FileName = Convert.ToString(Guid.NewGuid()) + Path.GetExtension(model.File?.FileName);
                    if (_ftpHelper.UploadFile(fTPModel))
                    {
                        model.OriginalFileName = model.File?.FileName ?? "";
                        model.SavedFileName = fTPModel.FileName;
                    }
                }

                string Id = _schemeBAL.Application_approval_comments_Save(model, auditColumnsModel, false);

                if (!string.IsNullOrEmpty(Id))
                {
                    _backgroundTaskQueue.QueueBackgroundWorkItem(workItem: token =>
                    {
                        using (var scope = _serviceScopeFactory.CreateScope())
                        {
                            try
                            {
                                var _scheme_bal = scope.ServiceProvider.GetRequiredService<ISchemeBAL>();
                                var _settings_bal = scope.ServiceProvider.GetRequiredService<ISettingBAL>();

                                List<ApplicationPrivilegeMaster> applicationPrivilege = _settings_bal.Application_Privilege_Get(SchemeId: model.SchemeId, StatusId: model.StatusIdTo);
                                if (applicationPrivilege.Count > 0)
                                {
                                    List<string> roleIds_mail = applicationPrivilege.Where(x => x.CanGetMail == true).Select(s => s.RoleId).ToList();
                                    List<string> roleIds_sms = applicationPrivilege.Where(x => x.CanGetSMS == true).Select(s => s.RoleId).ToList();

                                    _scheme_bal.ApplicationSendMail(model.ApplicationId, roleIds_mail, "");
                                    //_scheme_bal.ApplicationSendSMS(model.ApplicationId, roleIds_sms);
                                }
                            }
                            catch (Exception ex)
                            {
                                Log.Error(ex, ex.Message);
                            }
                        }

                        return Task.CompletedTask;
                    });


                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = true,
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
        [Consumes("application/json", "multipart/form-data")]
        public ResponseViewModel Application_Approval_File_Upload([FromForm] ApplicationApprovalFileSaveModel model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.Ida))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = null,
                        Message = "Id required."
                    };
                }

                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                ApplicationApprovalFileModel _model = new ApplicationApprovalFileModel();

                _model.Ida = model.Ida;
                _model.ApprovalCommentId = model.ApprovalCommentId;
                _model.ApplicationId = model.ApplicationId;
                _model.StatusId = model.StatusId;
                _model.DocCategoryId = model.DocCategoryId;
                _model.IsActive = model.IsActive;

                if (model.File != null)
                {
                    FTPModel fTPModel = new FTPModel();
                    fTPModel.file = model.File;
                    fTPModel.FileName = Convert.ToString(Guid.NewGuid()) + Path.GetExtension(model.File?.FileName);
                    if (_ftpHelper.UploadFile(fTPModel))
                    {
                        _model.OriginalFileName = model.File?.FileName ?? "";
                        _model.SavedFileName = fTPModel.FileName;
                    }
                }

                string Id = _schemeBAL.Application_Approval_File_Save(_model, auditColumnsModel);

                if (!string.IsNullOrWhiteSpace(Id))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = Id,
                        Message = "File saved successfully."
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = Id,
                        Message = "Somthing went wrong."
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
        public ResponseViewModel Application_Approval_File_Delete(string Id)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                ApplicationApprovalFileModel _model = new ApplicationApprovalFileModel();

                _model.Ida = Id;
                _model.IsActive = false;

                string resId = _schemeBAL.Application_Approval_File_Save(_model, auditColumnsModel);

                if (!string.IsNullOrWhiteSpace(resId))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = resId,
                        Message = "File saved successfully."
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = resId,
                        Message = "Somthing went wrong."
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
        public IActionResult Application_Approval_File_Download(string Id)
        {
            try
            {
                ApplicationApprovalFileModel? list = _schemeBAL.Application_Approval_Doc_Category_GetSavedFileNames(Id);

                if (list != null)
                {
                    FileInfo info = new FileInfo(list.SavedFileName);

                    string base64encodedstring = _ftpHelper.DownloadFile(new FTPModel() { FileName = list.SavedFileName });

                    byte[] bytes = Convert.FromBase64String(base64encodedstring);
                    MemoryStream memory = new MemoryStream(bytes);

                    memory.Position = 0;
                    string MimeType = StringFunctions.GetMimeType(info.Extension);

                    return File(memory, MimeType, list.OriginalFileName);
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

        [HttpGet("[action]")]
        public ResponseViewModel Application_Approve_Get_Status_List(string ApplicationId)
        {
            try
            {
                ApproveStatusViewModel model = new ApproveStatusViewModel();
                List<ApproveStatusItemModel> list = _schemeBAL.ApplicationApprovalStatusList(ApplicationId);
                if (list != null && list.Count > 0)
                {
                    List<string> calletterBeforeStatus = _schemeBAL.Callletter_Get_Configured_StatusId(list[0].SchemeId);

                    string roleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";
                    List<ApplicationPrivilegeMaster> applicationPrivilege = _settingsBAL.Application_Privilege_Get(SchemeId: list[0].SchemeId, RoleId: roleId);

                    model.StatusList = new List<ApproveStatusItemModel>();
                    model.Reason = _settingsBAL.Configuration_Get(IsActive: true, CategoryCode: "REASON").Select(x => new SelectListItem()
                    {
                        Text = x.Value,
                        Value = x.Value,
                    }).ToList();


                    ApplicationPrivilegeMaster? privi2 = applicationPrivilege.Find(x => x.StatusId == list[0].CurrentStatus);
                    if (privi2 != null)
                    {
                        if (privi2.UcUpload == true)
                        {
                            model.IsUcRequired = true;
                        }
                        if (privi2.Form3Upload == true)
                        {
                            model.IsForm3Required = true;
                        }
                    }

                    foreach (ApproveStatusItemModel item in list)
                    {
                        ApplicationPrivilegeMaster? privi = applicationPrivilege.Find(x => x.StatusId == item.CurrentStatus);

                        if (privi != null && (privi?.CanApprove ?? false) && item.Status == "APPROVED")
                        {
                            if (calletterBeforeStatus.Contains(item.StatusId))
                            {
                                model.ShowCheckMeetingTimePopup = true;
                            }

                            ApprovalDocConfigViewModel? docConfig = _settingsBAL.Config_Scheme_Approval_Doc_Config_Get(item.SchemeId, item.StatusId).FirstOrDefault();
                            if (docConfig != null)
                            {
                                model.IsDocumentRequired = docConfig.IsDocumentRequired;
                                model.ShowAssertVerfication = docConfig.IsAssertVerificationStatus;
                                model.DocumentFieldLabel = docConfig.DocumentLabel;
                            }

                            item.StatusName = "(Approve) - " + item.StatusName;
                            model.StatusList.Add(item);
                        }
                        if (privi != null && (privi?.CanReturn ?? false) && item.Status == "RETURNED")
                        {
                            item.StatusName = "(Return) - " + item.StatusName;
                            model.StatusList.Add(item);
                        }
                    }

                    ApproveStatusItemModel? reject = list.Where(x => x.StatusCode == "REJECTED").FirstOrDefault();
                    if (reject != null)
                    {
                        reject.StatusName = "(Reject) - " + reject.StatusName;
                        model.StatusList.Add(reject);
                    }


                    model.CurrentStatus = list[0].CurrentStatus;
                    model.CurrentStatusName = list[0].CurrentStatusName;

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

        [HttpPost("[action]")]
        public ResponseViewModel Application_BulkApprove(BulkApprovalModel model)
        {
            try
            {
                if (model.ApplicationIds != null && model.ApplicationIds.Count > 0)
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;

                    string Id = _schemeBAL.Application_bulk_approval_comments_Save(model, auditColumnsModel);

                    if (!string.IsNullOrEmpty(Id))
                    {
                        return new ResponseViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = true,
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
        public ResponseViewModel Application_Bulk_Approve_Get_Status_List(string StatusId, string SchemeId)
        {
            try
            {
                ApproveStatusViewModel model = new ApproveStatusViewModel();

                List<ApproveStatusItemModel> list = _schemeBAL.ApplicationBulkApprovalStatusList(StatusId, SchemeId);
                if (list != null && list.Count > 0)
                {
                    string roleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";
                    List<ApplicationPrivilegeMaster> applicationPrivilege = _settingsBAL.Application_Privilege_Get(SchemeId: list[0].SchemeId, RoleId: roleId);

                    model.StatusList = new List<ApproveStatusItemModel>();
                    model.Reason = _settingsBAL.Configuration_Get(IsActive: true, CategoryCode: "REASON").Select(x => new SelectListItem()
                    {
                        Text = x.Value,
                        Value = x.Value,
                    }).ToList();

                    foreach (ApproveStatusItemModel item in list)
                    {
                        if ((applicationPrivilege.Find(x => x.StatusId == item.CurrentStatus)?.CanApprove ?? false) && item.Status == "APPROVED")
                        {
                            item.StatusName = "(Approve) - " + item.StatusName;
                            model.StatusList.Add(item);
                        }
                        if ((applicationPrivilege.Find(x => x.StatusId == item.CurrentStatus)?.CanReturn ?? false) && item.Status == "RETURNED")
                        {
                            item.StatusName = "(Return) - " + item.StatusName;
                            model.StatusList.Add(item);
                        }
                    }

                    ApproveStatusItemModel? reject = list.Where(x => x.StatusCode == "REJECTED").FirstOrDefault();
                    if (reject != null)
                    {
                        reject.StatusName = "(Reject) - " + reject.StatusName;
                        model.StatusList.Add(reject);
                    }


                    model.CurrentStatus = list[0].CurrentStatus;
                    model.CurrentStatusName = list[0].CurrentStatusName;

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

        #endregion Approval

        #region Member Data Change Approval
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
                        new SelectListItem() { Text = "DM Deleted", Value = "DM_DELETED" },
                        new SelectListItem() { Text = "HQ Deleted", Value = "HQ_DELETED" },

                        //new SelectListItem() { Text = "Restore", Value = "RESTORE" },
                        new SelectListItem() { Text = "Returned", Value = "RETURNED" },
                        new SelectListItem() { Text = "Completed", Value = "COMPLETED" },
                     
                       
                    };
                    model.ApprovedStatusList = new List<SelectListItem>()
                    {
                         new SelectListItem() { Text = "Saved", Value = "SAVED" },
                        new SelectListItem() { Text = "Submitted", Value = "SUBMITTED" },

                         new SelectListItem() { Text = "Waiting For Approval(DC)", Value = "WAITING_FOR_APPROVAL(DC)" },
                        new SelectListItem() { Text = "Waiting For Approval(DM)", Value = "WAITING_FOR_APPROVAL(DM)" },
                        new SelectListItem() { Text = "Waiting For Approval(HQ)", Value = "WAITING_FOR_APPROVAL(HQ)" },
                       

                        new SelectListItem() { Text = "DC Approved", Value = "DC_APPROVED" },
                        new SelectListItem() { Text = "DM Approved", Value = "DM_APPROVED" },
                        new SelectListItem() { Text = "HQ Approved", Value = "HQ_APPROVED" },



                       new SelectListItem() { Text = "Returned(DC)", Value = "DC_RETURNED" },
                        new SelectListItem() { Text = "Returned(DM)", Value = "DM_RETURNED" },
                        
                        new SelectListItem() { Text = "Returned(HQ)", Value = "HQ_RETURNED" },

                         new SelectListItem() { Text = "Rejected", Value = "REJECTED" },

                         new SelectListItem() { Text = "DM Deleted", Value = "DM_DELETED" },
                        new SelectListItem() { Text = "HQ Deleted", Value = "HQ_DELETED" }



                    };

                    if (user.DistrictIdList?.Count() > 0)
                    {
                        model.DistrictList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "DISTRICT")
                        .Where(x => user.DistrictIdList.Contains(x.Value)).ToList();
                    }
                    else
                    {
                        model.DistrictList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "DISTRICT");
                    }

                    if (user.DivisionIdList?.Count() > 0)
                    {
                        model.DivisionList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "DIVISION")
                        .Where(x => user.DivisionIdList.Contains(x.Value)).ToList();
                    }
                    else
                    {
                        model.DivisionList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "DIVISION");
                    }

                    model.TypeOfWorkList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "TYPE_OF_WORK");
                    model.OrganizationTypeList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "ORGANIZATION_TYPE");
                    model.LocaBodyList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "LOCAL_BODY");
                    model.NameofLocalBodyList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "NAME_OF_THE_LOCAL_BODY");
                       
                    

                    model.RoleList = _settingsBAL.Account_Role_Get(IsActive: true).Select(x => new SelectListItem()
                    {
                        Text = x.RoleName,
                        Value = x.Id
                    }).OrderBy(o => o.Value).ToList();

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
        [HttpPost("[action]")]
        public ResponseViewModel MemberDataApprovalGridGet(MemberDataApprovalGridFilterModel filter)
        {
            try
            {
                if (filter.Where.GetAll)
                {
                    int TotalCount = 0;
                    string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    string userRoleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";

                    AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    filter.Where.IsCompleted = true;
                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                    {
                        filter.Where.DistrictIds = user.DistrictIdList;
                    }

                    if (filter.Where.StatusIds != null && filter.Where.StatusIds.Contains("HQ_DELETED"))
                    {
                        if (user.RoleCode == "HQ") {
                            //filter.Where.IsActive = false;
                            filter.Where.IsDeleted = true;
                            filter.Where.MemberIsActive = false;
                        }
                        else
                        {
                            filter.Where.IsDeleted = false;
                            filter.Where.MemberIsActive = true;
                        }
                    }


                    List<MemberDataApprovalGridModel> memberList = _userBAL.MemberDataApprovalGridGet(filter, out TotalCount);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = memberList,
                        TotalRecordCount = TotalCount
                    };
                }
                else
                {
                    string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    string userRoleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";

                    AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    if (user != null)
                    {
                        filter.Where.RoleId = userRoleId;
                        filter.Where.IsCompleted = false;
                        if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                        {
                            filter.Where.DistrictIds = user.DistrictIdList;
                        }

                        if (filter.Where.StatusIds != null && filter.Where.StatusIds.Contains("HQ_DELETED"))
                        {
                            if (user.RoleCode == "HQ") {
                                //filter.Where.IsActive = false;
                                filter.Where.IsDeleted = true;
                                filter.Where.MemberIsActive = false;
                            }else
                            {
                                filter.Where.IsDeleted = false;
                                filter.Where.MemberIsActive = true;
                            }
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
       
        [HttpPost("ExportMemberApprovalData")]
        public IActionResult ExportMemberApprovalData([FromBody] ExportRequestModelForApproval request)
        {
            string userId = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";
            string userRoleId = User.Claims.FirstOrDefault(x => x.Type == Constants.RoleId)?.Value ?? "";
            string jobId = Guid.NewGuid().ToString();

            // 1️⃣ Add job as pending
            ExportJobStore.Add(jobId, new ExportJobStatus { Status = "Pending" });

            // 2️⃣ Queue background export job
            _backgroundTaskQueue.QueueBackgroundWorkItem(async token =>
            {
                try
                {
                    // --- Step 1: Get User Info ---
                    var user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    if (user == null) throw new Exception("User not found.");

                    var filter = request.Filter;
                    if (filter == null)
                        throw new Exception("Invalid filter.");

                    // --- Step 2: Set Filter Conditions ---
                    if (filter.Where.GetAll)
                    {
                        filter.Where.IsCompleted = true;
                    }
                    else
                    {
                        filter.Where.RoleId = userRoleId;
                        filter.Where.IsCompleted = false;
                    }

                    if (filter.Where.DistrictIds == null || !filter.Where.DistrictIds.Any())
                        filter.Where.DistrictIds = user.DistrictIdList;

                    // --- Step 3: Fetch Data ---
                    int totalCount = 0;
                    var memberList = _userBAL.MemberDataApprovalGridGet(filter, out totalCount);
                    if (memberList == null || memberList.Count == 0)
                        throw new Exception("No data found.");

                    // --- Step 4: Generate File ---
                    byte[] fileBytes;
                    string fileName;
                    string mimeType;

                    if (request.ExportType?.ToLower() == "excel")
                    {
                        using var workbook = new ClosedXML.Excel.XLWorkbook();
                        var ws = workbook.Worksheets.Add("ApprovalData");
                        var props = typeof(MemberDataApprovalGridModel).GetProperties();

                        // Write headers
                        for (int i = 0; i < props.Length; i++)
                            ws.Cell(1, i + 1).Value = props[i].Name;

                        // Write data rows
                        int row = 2;
                        foreach (var item in memberList)
                        {
                            for (int i = 0; i < props.Length; i++)
                                ws.Cell(row, i + 1).Value = props[i].GetValue(item)?.ToString() ?? "";
                            row++;
                        }

                        using var ms = new MemoryStream();
                        workbook.SaveAs(ms);
                        fileBytes = ms.ToArray();

                        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"MemberApprovalExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                    }
                    else
                    {
                        fileBytes = Document.Create(container =>
                        {
                            container.Page(page =>
                            {
                                page.Margin(20);
                                page.Header().Text("Member Data Approval Report").FontSize(18).Bold().AlignCenter();
                                page.Content().Table(table =>
                                {
                                    var props = typeof(MemberDataApprovalGridModel).GetProperties().Take(10).ToList();
                                    table.ColumnsDefinition(cols =>
                                    {
                                        foreach (var _ in props)
                                            cols.RelativeColumn();
                                    });
                                    table.Header(header =>
                                    {
                                        foreach (var prop in props)
                                            header.Cell().Text(prop.Name).Bold();
                                    });
                                    foreach (var item in memberList)
                                    {
                                        foreach (var prop in props)
                                            table.Cell().Text(prop.GetValue(item)?.ToString() ?? "");
                                    }
                                });
                            });
                        }).GeneratePdf();

                        mimeType = "application/pdf";
                        fileName = $"MemberApprovalExport_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    }

                    // --- Step 5: Store Completed Result ---
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Completed",
                        FileBytes = fileBytes,
                        MimeType = mimeType,
                        FileName = fileName
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Approval Data Export Failed");
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Failed",
                        ErrorMessage = ex.Message
                    });
                }
            });

            // 3️⃣ Return Download URL immediately (non-blocking)
            var downloadUrl = $"{Request.Scheme}://{Request.Host}/api/User/Export/WaitAndDownload/{jobId}";
            return Ok(new { Message = "Approval data export started.", DownloadUrl = downloadUrl });
        }

        [HttpGet("[action]")]

        public ResponseViewModel MemberDataApprovalForm(string RequestId)

        {

            string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


            AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();

            try

            {

                return new ResponseViewModel()

                {

                    Status = ResponseConstants.Success,

                    Data = _userBAL.MemberDataApprovalForm(RequestId, user)

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
        public ResponseViewModel MemberData_Approve(MemberDataApprovalFromSubmitModel model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: auditColumnsModel.SavedBy).FirstOrDefault();

                var result = _userBAL.MemberDataApproval(model, auditColumnsModel);
                var userId = auditColumnsModel.SavedBy;
                var userName = auditColumnsModel.SavedByUserName;


                _logService.LogAsync(new Model.LogModel.UserActivityLogModel
                {
                    ActivityLogId = Guid.NewGuid().ToString(),
                    UserId = userId,
                    UserName = userName,
                    RoleId = model.CurrentRoleId,
                    RoleName = user.RoleName,
                    ModuleName = "Member Approvals",
                    EventType = "Member_" + model.SelectedRoleText.ToUpper(),
                    EventDescription = $"Member approval completed",
                    EventStatus = 2,
                    FailureCount = 0,
                    SuccessCount = 1
                }).GetAwaiter().GetResult();

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = result,
                    Message = "Action completed successfully."
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
        public ResponseViewModel MemberData_BulkApprove(MemberDataBulkApprovalFromSubmitModel model)
         
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;
                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: auditColumnsModel.SavedBy).FirstOrDefault();
                model.CurrentRoleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";
                string DistrictroleId = _userBAL.GetApprovalRoleId("District");
                string HQroleId = _userBAL.GetApprovalRoleId("HQ");
                if (model.SelectedRoleText == "Approve")
                {
                    model.SelectedRoleId = HQroleId;

                }
                if (model.SelectedRoleText == "Return")
                {
                    model.SelectedRoleId = DistrictroleId;

                }

                if (model.SelectedRoleText == "Restore")
                {
                    model.SelectedRoleId = DistrictroleId;

                }

                var result = _userBAL.MemberDataBulkApproval(model, auditColumnsModel);

                var userId = auditColumnsModel.SavedBy;
                var userName = auditColumnsModel.SavedByUserName;

                _logService.LogAsync(new Model.LogModel.UserActivityLogModel
                {
                    ActivityLogId = Guid.NewGuid().ToString(),
                    UserId = userId,
                    UserName = userName,
                    RoleId = model.CurrentRoleId,
                    RoleName = user.RoleName,
                    ModuleName = "Member Approvals",
                    EventType = "BULK_" + model.SelectedRoleText.ToUpper(),
                    EventDescription = $"{model.SelectedRoleText} operation completed for {model.RequestId.Count} records",
                    EventStatus = 2,
                    FailureCount = 0,
                    SuccessCount = model.RequestId.Count
                }).GetAwaiter().GetResult();


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = result,
                    Message = "Action completed successfully."
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

        #endregion Member Data Change Approval

        #region Member Card Change Approval

        [HttpGet("[action]")]
        public ResponseViewModel MemberCardApprovalGridFilter()
        {
            try
            {
                MemberCardApprovalFilterModel model = new MemberCardApprovalFilterModel();

                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();

                if (user != null && user.CardPrintStatusIdList != null)
                {
                    model.DistrictList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "DISTRICT");
                    model.StatusList = _settingsBAL.ConfigurationSelectList_Get(IsActive: true, CategoryCode: "CARD_PRINTING_STATUS")
                        .Where(x => user.CardPrintStatusIdList.Contains(x.Value)).ToList();
                }

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
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

        [HttpPost("[action]")]
        public ResponseViewModel MemberCardApprovalGridGet(MemberCardApprovalGridFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                string userRoleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";

                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (user != null)
                {
                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                    {
                        filter.Where.DistrictIds = user.DistrictIdList;
                    }
                    if (filter.Where.StatusIds == null || filter.Where.StatusIds.Count() == 0)
                    {
                        filter.Where.StatusIds = user.CardPrintStatusIdList;
                    }

                    int TotalCount = 0;

                    List<Member_Card_Approval_Master_Grid_Model> list = _userBAL.MemberCardApprovalGridGet(filter, out TotalCount);

                    list.ForEach(x =>
                    {
                        //if (x.IsCompleted)
                        //{
                        //    x.Status = "Completed";
                        //}
                        //else if (x.IsPrinted)
                        //{
                        //    x.Status = "Printed";
                        //}
                        //else if (x.IsRejected)
                        //{
                        //    x.Status = "Rejected";
                        //}

                        if (x.IsCompleted || x.IsPrinted || x.IsRejected || !x.IsActive)
                        {
                            x.CanApprove = false;
                        }
                        else if (user.CardPrintStatusIdList != null && user.CardPrintStatusIdList.Contains(x.StatusId) == false)
                        {
                            x.CanApprove = false;
                        }
                        else
                        {
                            x.CanApprove = true;
                        }
                    });

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

        // [06-11-2025] Updated by Sivasankar K: Modified To Export All Data
        [HttpPost("ExportMemberCardApprovalGrid")]
        public IActionResult ExportMemberCardApprovalGrid([FromBody] ExportCardApprovalFilterModel request)
        {
            string userId = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";
            string jobId = Guid.NewGuid().ToString();

            // 🟡 Mark job as pending
            ExportJobStore.Add(jobId, new ExportJobStatus { Status = "Pending" });

            // 🟢 Queue background export work
            _backgroundTaskQueue.QueueBackgroundWorkItem(async token =>
            {
                try
                {
                    var user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    if (user == null)
                        throw new Exception("User not found.");

                    var filter = request.Filter;
                    if (filter == null)
                        throw new Exception("Invalid or missing filter.");

                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                        filter.Where.DistrictIds = user.DistrictIdList;

                    if (filter.Where.StatusIds == null || filter.Where.StatusIds.Count() == 0)
                        filter.Where.StatusIds = user.CardPrintStatusIdList;

                    int totalCount = 0;
                    List<Member_Card_Approval_Master_Grid_Model> list = _userBAL.MemberCardApprovalGridGet(filter, out totalCount);

                    list.ForEach(x =>
                    {
                        if (x.IsCompleted || x.IsPrinted || x.IsRejected || !x.IsActive)
                            x.CanApprove = false;
                        else if (user.CardPrintStatusIdList != null && user.CardPrintStatusIdList.Contains(x.StatusId) == false)
                            x.CanApprove = false;
                        else
                            x.CanApprove = true;
                    });

                    if (list == null || list.Count == 0)
                        throw new Exception("No data found to export.");

                    // 🧾 Generate file
                    byte[] fileBytes;
                    string mimeType;
                    string fileName;

                    if (request.ExportType?.ToLower() == "excel")
                    {
                        using var workbook = new ClosedXML.Excel.XLWorkbook();
                        var ws = workbook.Worksheets.Add("CardApprovalList");
                        var props = typeof(Member_Card_Approval_Master_Grid_Model).GetProperties();

                        for (int i = 0; i < props.Length; i++)
                            ws.Cell(1, i + 1).Value = props[i].Name;

                        int row = 2;
                        foreach (var item in list)
                        {
                            for (int i = 0; i < props.Length; i++)
                                ws.Cell(row, i + 1).Value = props[i].GetValue(item)?.ToString() ?? "";
                            row++;
                        }

                        using var ms = new MemoryStream();
                        workbook.SaveAs(ms);
                        fileBytes = ms.ToArray();
                        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"CardApprovalExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                    }
                    else
                    {
                        fileBytes = Document.Create(container =>
                        {
                            container.Page(page =>
                            {
                                page.Margin(20);
                                page.Header().Text("Member Card Approval Export").FontSize(18).Bold().AlignCenter();
                                page.Content().Table(table =>
                                {
                                    var props = typeof(Member_Card_Approval_Master_Grid_Model).GetProperties().Take(8).ToList();
                                    table.ColumnsDefinition(cols =>
                                    {
                                        foreach (var _ in props)
                                            cols.RelativeColumn();
                                    });
                                    table.Header(header =>
                                    {
                                        foreach (var prop in props)
                                            header.Cell().Text(prop.Name).Bold();
                                    });
                                    foreach (var item in list)
                                    {
                                        foreach (var prop in props)
                                            table.Cell().Text(prop.GetValue(item)?.ToString() ?? "");
                                    }
                                });
                            });
                        }).GeneratePdf();

                        mimeType = "application/pdf";
                        fileName = $"CardApprovalExport_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    }

                    // 🟢 Store result in memory
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Completed",
                        FileBytes = fileBytes,
                        MimeType = mimeType,
                        FileName = fileName
                    });
                }
                catch (Exception ex)
                {
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Failed",
                        ErrorMessage = ex.Message
                    });
                    _logger.LogError(ex, "Background export failed for MemberCardApprovalGrid.");
                }
            });

            // 🔹 Return immediate response (no UI freeze)
            var downloadUrl = $"{Request.Scheme}://{Request.Host}/api/User/Export/WaitAndDownload/{jobId}";
            return Ok(new { Message = "Export started.", DownloadUrl = downloadUrl });
        }


        [HttpGet("[action]")]
        public ResponseViewModel MemberCardApprovalForm(string Id, string MemberId)
        {
            try
            {
                Member_Card_Approval_Master_From model = _userBAL.MemberCardApprovalForm(Id, MemberId);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
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

        [HttpPost("[action]")]
        public ResponseViewModel MemberCardApproval(Member_Card_Approval_Save_Model model)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                auditColumnsModel.SavedDate = DateTime.Now;

                string pId = _userBAL.MemberCardApproval(model, auditColumnsModel);

                if (!string.IsNullOrEmpty(pId))
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = null,
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

        //[HttpPost("[action]")]
        //public ResponseViewModel MemberCard_BulkApprove(Member_Card_BulkApproval_Save_Model model)
        //{
        //    try
        //    {
        //        if (model.Member_Id != null && model.Member_Id.Count > 0)
        //        {
        //            AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
        //            auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
        //            auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
        //            auditColumnsModel.SavedDate = DateTime.Now;

        //            string pId = _userBAL.MemberCardBulkApproval(model, auditColumnsModel);

        //            if (!string.IsNullOrEmpty(pId))
        //            {
        //                return new ResponseViewModel()
        //                {
        //                    Status = ResponseConstants.Success,
        //                    Data = true,
        //                };
        //            }
        //            else
        //            {
        //                return new ResponseViewModel()
        //                {
        //                    Status = ResponseConstants.Failed,
        //                    Data = null,
        //                    Message = "Somthing went wrong"
        //                };
        //            }
        //        }
        //        return new ResponseViewModel()
        //        {
        //            Status = ResponseConstants.Failed,
        //            Data = null,
        //            Message = "Somthing went wrong"
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

        [HttpPost("[action]")]
        public ResponsesViewModel MemberCard_BulkApprove(Member_Card_BulkApproval_Save_Model model)
        {
            try
            {
                if (model.Member_Id != null && model.Member_Id.Count > 0)
                {
                    AuditColumnsModel auditColumnsModel = new AuditColumnsModel();
                    auditColumnsModel.SavedBy = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedByUserName = User.Claims.Where(x => x.Type == Constants.Name)?.FirstOrDefault()?.Value ?? "";
                    auditColumnsModel.SavedDate = DateTime.Now;
                    AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: auditColumnsModel.SavedBy).FirstOrDefault();

                    //MemberIdMessageViewModel result = _userBAL.MemberCardBulkApproval(model, auditColumnsModel);
                    //var result = _userBAL.MemberCardBulkApproval(model, auditColumnsModel);
                    List<MemberIdMessageViewModel> result = _userBAL.MemberCardBulkApproval(model, auditColumnsModel);
                    int totalFailed = result.Count(x => !string.Equals(x.Messages, "Success", StringComparison.OrdinalIgnoreCase));
                    int totalSuccess = result.Count - totalFailed;

                    _logService.LogAsync(new Model.LogModel.UserActivityLogModel
                    {
                        ActivityLogId = Guid.NewGuid().ToString(),
                        UserId = auditColumnsModel.SavedBy,
                        UserName = auditColumnsModel.SavedByUserName,
                        RoleId = User.Claims.FirstOrDefault(x => x.Type == Constants.RoleId)?.Value ?? "",
                        RoleName = user.RoleName,
                        ModuleName = "Card Status",
                        EventType = "BULK_APPROVE",
                        EventDescription = $"Bulk Member Card Approval done. Approved: {totalSuccess}, Returned: {totalFailed}",
                        EventStatus = totalFailed > 0 ? 1 : 2,
                        FailureCount = totalFailed,
                        SuccessCount = totalSuccess
                    }).GetAwaiter().GetResult();

                    if (result != null && result.Any())
                    {
                        return new ResponsesViewModel()
                        {
                            Status = ResponseConstants.Success,
                            Data = result.Select(x => new { x.MasterId, x.Messages }).ToList(),
                            TotalRecordCount = new[] { new { TotalFailed = totalFailed, TotalSuccess = totalSuccess } }
                        };
                    }

                    return new ResponsesViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Data = new List<object>(),
                        TotalRecordCount = new[] { new { TotalFailed = totalFailed, TotalSuccess = totalSuccess } },
                        Message = "No records found"
                    };
                }
                return new ResponsesViewModel()
                {
                    Status = ResponseConstants.Failed,
                    Data = null,
                    Message = "Somthing went wrong"
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponsesViewModel()
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel MemberCardApprovalHistoryGet(MemberCardApprovalHistoryFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                string userRoleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";

                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (user != null)
                {
                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                    {
                        filter.Where.DistrictIds = user.DistrictIdList;
                    }
                    if (filter.Where.StatusIds == null || filter.Where.StatusIds.Count() == 0)
                    {
                        filter.Where.StatusIds = user.CardPrintStatusIdList;
                    }

                    int TotalCount = 0;

                    List<Member_Card_Approval_History_Master_Model> list = _userBAL.MemberCardApprovalHistoryGet(filter, out TotalCount);

                    list.ForEach(x =>
                    {
                        if (x.IsCompleted)
                        {
                            x.Status = "Completed";
                        }
                        else if (x.IsRejected)
                        {
                            x.Status = "Rejected";
                        }
                    });

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

        // [06-11-2025] Updated by Sivasankar K: Modified To Export All Data
        [HttpPost("ExportMemberCardApprovalHistory")]
        public IActionResult ExportMemberCardApprovalHistory([FromBody] ExportCardApprovalHistoryFilterModel request)
        {
            string userId = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "";
            string jobId = Guid.NewGuid().ToString();

            // 🟡 Mark job as pending
            ExportJobStore.Add(jobId, new ExportJobStatus { Status = "Pending" });

            // 🟢 Queue background export work
            _backgroundTaskQueue.QueueBackgroundWorkItem(async token =>
            {
                try
                {
                    var user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                    if (user == null)
                        throw new Exception("User not found.");

                    var filter = request.Filter;
                    if (filter == null)
                        throw new Exception("Invalid or missing filter.");

                    // Apply district and status permissions
                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                        filter.Where.DistrictIds = user.DistrictIdList;

                    if (filter.Where.StatusIds == null || filter.Where.StatusIds.Count() == 0)
                        filter.Where.StatusIds = user.CardPrintStatusIdList;

                    int totalCount = 0;
                    List<Member_Card_Approval_History_Master_Model> list = _userBAL.MemberCardApprovalHistoryGet(filter, out totalCount);

                    list.ForEach(x =>
                    {
                        if (x.IsCompleted)
                            x.Status = "Completed";
                        else if (x.IsRejected)
                            x.Status = "Rejected";
                    });

                    if (list == null || list.Count == 0)
                        throw new Exception("No data found to export.");

                    // 🧾 Generate file
                    byte[] fileBytes;
                    string mimeType;
                    string fileName;

                    if (request.ExportType?.ToLower() == "excel")
                    {
                        using var workbook = new ClosedXML.Excel.XLWorkbook();
                        var ws = workbook.Worksheets.Add("CardApprovalHistory");
                        var props = typeof(Member_Card_Approval_History_Master_Model).GetProperties();

                        for (int i = 0; i < props.Length; i++)
                            ws.Cell(1, i + 1).Value = props[i].Name;

                        int row = 2;
                        foreach (var item in list)
                        {
                            for (int i = 0; i < props.Length; i++)
                                ws.Cell(row, i + 1).Value = props[i].GetValue(item)?.ToString() ?? "";
                            row++;
                        }

                        using var ms = new MemoryStream();
                        workbook.SaveAs(ms);
                        fileBytes = ms.ToArray();
                        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"CardApprovalHistoryExport_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                    }
                    else
                    {
                        fileBytes = Document.Create(container =>
                        {
                            container.Page(page =>
                            {
                                page.Margin(20);
                                page.Header().Text("Member Card Approval History").FontSize(18).Bold().AlignCenter();
                                page.Content().Table(table =>
                                {
                                    var props = typeof(Member_Card_Approval_History_Master_Model).GetProperties().Take(8).ToList();
                                    table.ColumnsDefinition(cols =>
                                    {
                                        foreach (var _ in props)
                                            cols.RelativeColumn();
                                    });
                                    table.Header(header =>
                                    {
                                        foreach (var prop in props)
                                            header.Cell().Text(prop.Name).Bold();
                                    });
                                    foreach (var item in list)
                                    {
                                        foreach (var prop in props)
                                            table.Cell().Text(prop.GetValue(item)?.ToString() ?? "");
                                    }
                                });
                            });
                        }).GeneratePdf();

                        mimeType = "application/pdf";
                        fileName = $"CardApprovalHistoryExport_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    }

                    // 🟢 Store result in memory
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Completed",
                        FileBytes = fileBytes,
                        MimeType = mimeType,
                        FileName = fileName
                    });
                }
                catch (Exception ex)
                {
                    ExportJobStore.Update(jobId, new ExportJobStatus
                    {
                        Status = "Failed",
                        ErrorMessage = ex.Message
                    });
                    _logger.LogError(ex, "Background export failed for MemberCardApprovalHistory.");
                }
            });

            // 🔹 Return immediate response (no UI freeze)
            var downloadUrl = $"{Request.Scheme}://{Request.Host}/api/User/Export/WaitAndDownload/{jobId}";
            return Ok(new { Message = "Export started.", DownloadUrl = downloadUrl });
        }

        #endregion Member Card Change Approval

        #region Others
        [HttpGet("[action]")]
        public ResponseViewModel User_Filter_Dropdowns()
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";

                var user = _settingsBAL.User_Get(IsActive: true, UserId: userId)?.FirstOrDefault();
                if (user == null)
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Failed,
                        Message = "User not found",
                        Data = null
                    };
                }

                if (string.IsNullOrEmpty(user.RoleId))
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Failed,
                        Message = "User role not assigned",
                        Data = null
                    };
                }

                List<ApplicationPrivilegeMaster> applicationPrivilege = _settingsBAL.Application_Privilege_Get(RoleId: user.RoleId) ?? new List<ApplicationPrivilegeMaster>();

                UserApplicationFilterModel model = new UserApplicationFilterModel();

                // District dropdown
                model.DistrictSelectList = _settingsBAL.ConfigurationSelectList_Get(true, CategoryCode: "DISTRICT") ?? new();
                if (user.DistrictIdList != null && user.DistrictIdList.Count > 0)
                {
                    model.DistrictSelectList = model.DistrictSelectList
                        .Where(x => user.DistrictIdList.Contains(x.Value))
                        .ToList();
                }

                // Scheme dropdown
                model.SchemeSelectList = _settingsBAL.ConfigurationSelectList_Get(true, CategoryCode: "SCHEME") ?? new();
                if (user.SchemeIdList != null && user.SchemeIdList.Count > 0)
                {
                    model.SchemeSelectList = model.SchemeSelectList
                        .Where(x => user.SchemeIdList.Contains(x.Value))
                        .ToList();
                }

                // Card status dropdown
                model.CardStatusSelectList = _settingsBAL.ConfigurationSelectList_Get(true, CategoryCode: "CARD_PRINTING_STATUS") ?? new();
                user.IsUrbanRural = (user?.RoleCode == "ADM" || user?.RoleCode == "HQ") ? false : user.IsUrbanRural;
                // Urban/Rural Logic
                if (user.IsUrbanRural)
                {
                    model.LocalBodyIds = !string.IsNullOrWhiteSpace(user.LocalBodyIds)
                        ? user.LocalBodyIds.Split(',')
                            .Select(id => new SelectListItem { Value = id.Trim(), Text = id.Trim() }).ToList()
                        : new();

                    model.NameOfLocalBodyIds = !string.IsNullOrWhiteSpace(user.NameOfLocalBodyIds)
                        ? user.NameOfLocalBodyIds.Split(',')
                            .Select(id => new SelectListItem { Value = id.Trim(), Text = id.Trim() }).ToList()
                        : new();

                    // Safe wrapper for GetConfigSelectedValues
                    model.BlockIds = SafeGetConfig(user.DistrictIds, "BLOCK", user.BlockIds);
                    model.VillagePanchayatIds = SafeGetConfig(user.BlockIds, "VILLAGEPANCHAYAT", user.VillagePanchayatIds);
                    model.TownPanchayatIds = SafeGetConfig(user.DistrictIds, "TOWNPANCHAYAT", user.TownPanchayatIds);
                    model.MunicipalityIds = SafeGetConfig(user.DistrictIds, "MUNICIPALITY", user.MunicipalityIds);
                    model.CorporationIds = SafeGetConfig(user.DistrictIds, "CORPORATION", user.CorporationIds);
                    model.ZoneIds = SafeGetConfig("", "ZONE", user.ZoneIds);
                    model.IsUrbanRural = user.IsUrbanRural;
                    model.CollectedByPhoneNo = !string.IsNullOrWhiteSpace(user.Mobile)
                        ? user.Mobile.Split(',')
                            .Select(id => new SelectListItem { Value = id.Trim(), Text = id.Trim(), Selected = true }).ToList()
                        : new();
                }
                else
                {
                    model.LocalBodyIds = new List<SelectListItem>();

                    if (!string.IsNullOrWhiteSpace(user.DistrictIds))
                    {
                        var districtIdList = user.DistrictIds.Split(',', StringSplitOptions.RemoveEmptyEntries);
                        int count = districtIdList.Length;

                        bool showType = (count >= 2 && count <= 5);
                        bool showNameOnly = (count == 1 || count > 5);

                        if (showType)
                        {
                            List<SelectListItem> result = new List<SelectListItem>();


                            foreach (var districtId in districtIdList)
                            {
                                var response = General_Configuration_GetAreaList_ByDistrict(districtId);
                                if (response?.Data == null) continue;

                                var areas = response.Data as IEnumerable<dynamic>;
                                if (areas == null) continue;

                                foreach (var area in areas)
                                {
                                    string id = Convert.ToString(area?.Id) ?? "";
                                    if (string.IsNullOrEmpty(id)) continue;

                                    string type = Convert.ToString(area?.Type) ?? "";
                                    string name = Convert.ToString(area?.Name) ?? "";

                                    string text = showType ? $"{type} - {name}" : name;
                                    result.Add(new SelectListItem { Value = id, Text = text });
                                }
                            }

                            model.LocalBodyIds = result;
                        }
                    }
                }

                // Status dropdown
                if (user.SchemeIdList != null && user.SchemeIdList.Count > 0)
                {
                    model.StatusSelectList = applicationPrivilege
                        .Where(x => user.SchemeIdList.Contains(x.SchemeId))
                        .Select(s => new SelectListItem
                        {
                            Text = s.Status ?? "",
                            Value = s.StatusId
                        })
                        .OrderBy(o => o.Text)
                        .ToList();
                }

                return new ResponseViewModel
                {
                    Status = ResponseConstants.Success,
                    Data = model
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in User_Filter_Dropdowns");

                return new ResponseViewModel
                {
                    Status = ResponseConstants.Error,
                    Message = "Internal server error",
                    Data = null
                };
            }
        }

        [HttpGet("[action]")]
        public ResponseViewModel User_Filter_DropdownswithUserId(string userId)
        {
            try
            {
               
                var user = _settingsBAL.User_Get(IsActive: true, UserId: userId)?.FirstOrDefault();
                if (user == null)
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Failed,
                        Message = "User not found",
                        Data = null
                    };
                }

                if (string.IsNullOrEmpty(user.RoleId))
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Failed,
                        Message = "User role not assigned",
                        Data = null
                    };
                }

                List<ApplicationPrivilegeMaster> applicationPrivilege = _settingsBAL.Application_Privilege_Get(RoleId: user.RoleId) ?? new List<ApplicationPrivilegeMaster>();

                UserApplicationFilterModel model = new UserApplicationFilterModel();

                // District dropdown
                model.DistrictSelectList = _settingsBAL.ConfigurationSelectList_Get(true, CategoryCode: "DISTRICT") ?? new();
                if (user.DistrictIdList != null && user.DistrictIdList.Count > 0)
                {
                    model.DistrictSelectList = model.DistrictSelectList
                        .Where(x => user.DistrictIdList.Contains(x.Value))
                        .ToList();
                }

                // Scheme dropdown
                model.SchemeSelectList = _settingsBAL.ConfigurationSelectList_Get(true, CategoryCode: "SCHEME") ?? new();
                if (user.SchemeIdList != null && user.SchemeIdList.Count > 0)
                {
                    model.SchemeSelectList = model.SchemeSelectList
                        .Where(x => user.SchemeIdList.Contains(x.Value))
                        .ToList();
                }

                // Card status dropdown
                model.CardStatusSelectList = _settingsBAL.ConfigurationSelectList_Get(true, CategoryCode: "CARD_PRINTING_STATUS") ?? new();
                user.IsUrbanRural = (user?.RoleCode == "ADM" || user?.RoleCode == "HQ") ? false : user.IsUrbanRural;
                // Urban/Rural Logic
                if (user.IsUrbanRural)
                {
                    model.LocalBodyIds = !string.IsNullOrWhiteSpace(user.LocalBodyIds)
                        ? user.LocalBodyIds.Split(',')
                            .Select(id => new SelectListItem { Value = id.Trim(), Text = id.Trim() }).ToList()
                        : new();

                    model.NameOfLocalBodyIds = !string.IsNullOrWhiteSpace(user.NameOfLocalBodyIds)
                        ? user.NameOfLocalBodyIds.Split(',')
                            .Select(id => new SelectListItem { Value = id.Trim(), Text = id.Trim() }).ToList()
                        : new();

                    // Safe wrapper for GetConfigSelectedValues
                    model.BlockIds = SafeGetConfig(user.DistrictIds, "BLOCK", user.BlockIds);
                    model.VillagePanchayatIds = SafeGetConfig(user.BlockIds, "VILLAGEPANCHAYAT", user.VillagePanchayatIds);
                    model.TownPanchayatIds = SafeGetConfig(user.DistrictIds, "TOWNPANCHAYAT", user.TownPanchayatIds);
                    model.MunicipalityIds = SafeGetConfig(user.DistrictIds, "MUNICIPALITY", user.MunicipalityIds);
                    model.CorporationIds = SafeGetConfig(user.DistrictIds, "CORPORATION", user.CorporationIds);
                    model.ZoneIds = SafeGetConfig("", "ZONE", user.ZoneIds);
                    model.IsUrbanRural = user.IsUrbanRural;
                    model.CollectedByPhoneNo = !string.IsNullOrWhiteSpace(user.Mobile)
                        ? user.Mobile.Split(',')
                            .Select(id => new SelectListItem { Value = id.Trim(), Text = id.Trim(), Selected = true }).ToList()
                        : new();
                }
                else
                {
                    model.LocalBodyIds = new List<SelectListItem>();

                    if (!string.IsNullOrWhiteSpace(user.DistrictIds))
                    {
                        var districtIdList = user.DistrictIds.Split(',', StringSplitOptions.RemoveEmptyEntries);
                        int count = districtIdList.Length;

                        bool showType = (count >= 2 && count <= 5);
                        bool showNameOnly = (count == 1 || count > 5);

                        if (showType)
                        {
                            List<SelectListItem> result = new List<SelectListItem>();


                            foreach (var districtId in districtIdList)
                            {
                                var response = General_Configuration_GetAreaList_ByDistrict(districtId);
                                if (response?.Data == null) continue;

                                var areas = response.Data as IEnumerable<dynamic>;
                                if (areas == null) continue;

                                foreach (var area in areas)
                                {
                                    string id = Convert.ToString(area?.Id) ?? "";
                                    if (string.IsNullOrEmpty(id)) continue;

                                    string type = Convert.ToString(area?.Type) ?? "";
                                    string name = Convert.ToString(area?.Name) ?? "";

                                    string text = showType ? $"{type} - {name}" : name;
                                    result.Add(new SelectListItem { Value = id, Text = text });
                                }
                            }

                            model.LocalBodyIds = result;
                        }
                    }
                }

                // Status dropdown
                if (user.SchemeIdList != null && user.SchemeIdList.Count > 0)
                {
                    model.StatusSelectList = applicationPrivilege
                        .Where(x => user.SchemeIdList.Contains(x.SchemeId))
                        .Select(s => new SelectListItem
                        {
                            Text = s.Status ?? "",
                            Value = s.StatusId
                        })
                        .OrderBy(o => o.Text)
                        .ToList();
                }

                return new ResponseViewModel
                {
                    Status = ResponseConstants.Success,
                    Data = model
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in User_Filter_Dropdowns");

                return new ResponseViewModel
                {
                    Status = ResponseConstants.Error,
                    Message = "Internal server error",
                    Data = null
                };
            }
        }

        // Safe wrapper for GetConfigSelectedValues
        private List<SelectListItem> SafeGetConfig(string district, string type, string ids)
        {
            try
            {
                return GetConfigSelectedValues(district, type, ids) ?? new();
            }
            catch (Exception ex)
            {
                Log.Error(ex, $"Error in GetConfigSelectedValues for type {type}");
                return new();
            }
        }

        private ResponseViewModel General_Configuration_GetAreaList_ByDistrict(string DistrictId)
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

        [HttpGet("[action]")]
        public ResponseViewModel GetStatusListByScheme(string SchemeId, bool IsBulkApproval = false)
        {
            try
            {
                string roleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";
                List<ApplicationPrivilegeMaster> applicationPrivilege = _settingsBAL.Application_Privilege_Get(RoleId: roleId);

                if (applicationPrivilege != null && applicationPrivilege.Count > 0)
                {
                    List<SelectListItem> StatusSelectList = _settingsBAL.Get_Status_Select_List_By_Scheme(SchemeId, IsBulkApproval).Where(x => applicationPrivilege.Select(u => u.StatusId).Contains(x.Value)).ToList();

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = StatusSelectList,
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
        public ResponseViewModel Key_Contacts(KeyContactPayloadModel model)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();

                string districtIds = "";
                string schemeIds = "";

                if (user != null)
                {
                    districtIds = user.DistrictIds;
                    schemeIds = user.SchemesIds;
                }

                if (model != null && model.DistrictIds != null && model.DistrictIds.Count > 0)
                {
                    districtIds = string.Join(",", model.DistrictIds);
                }

                List<AccountUserModel> contacts = _settingsBAL.Account_Key_Contact_User_Get(userId, districtIds, schemeIds, model?.RoleIds ?? new List<string>());
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Data = contacts,
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


        [HttpPost("DuplicateMemberGet")]
        public IActionResult DuplicateMemberGridGet([FromBody] DuplicateMemberFilterModel filter)
        {
            try
            {
                int totalCount = 0;

                // Default Take if not set
                if (filter.Take <= 0)
                    filter.Take = 10;

                var list = _userBAL.DuplicateMemberGridGet(filter, out totalCount);

                return Ok(new
                {
                    Status = "Success",
                    Data = list,
                    TotalRecordCount = totalCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Status = "Error", 
                    Message = ex.Message
                });
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel MoveToTrash(TrashRequestModel request)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";

                if (request.ApplicationIds == null || request.ApplicationIds.Count == 0)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "No applications selected"
                    };
                }

                bool result = _schemeBAL.MoveApplicationsToTrash(request.ApplicationIds, userId);

                if (result)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Applications moved to trash successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "Failed to move applications to trash"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
        public ResponseViewModel RestoreFromTrash(TrashRequestModel request)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";

                if (request.ApplicationIds == null || request.ApplicationIds.Count == 0)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "No applications selected"
                    };
                }

                bool result = _schemeBAL.RestoreApplicationsFromTrash(request.ApplicationIds, userId);

                if (result)
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Applications restored successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Failed,
                        Message = "Failed to restore applications"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Error,
                    Message = ex.Message
                };
            }
        }

        public class TrashRequestModel
        {
            public List<string> ApplicationIds { get; set; } = new List<string>();
        }




        [HttpPost("RemoveDuplicateMembers")]
        public IActionResult RemoveDuplicateMembers([FromBody] RemoveDuplicateMembersModel model)
        {
            try
            {

                // Validate input
                if (model == null || model.MemberIds == null || !model.MemberIds.Any())
                {
                    return BadRequest(new
                    {
                        Status = "Failed",
                        Message = "Please select at least one Member ID."
                    });
                }

                // Call BAL/DAL
                bool result = _userBAL.RemoveDuplicateMembers(model);


                if (result)
                {
                    return Ok(new
                    {
                        Status = "Success",
                        Message = "Duplicate members removed successfully."
                    });
                }
                else
                {
                    return Ok(new
                    {
                        Status = "Warning",
                        Message = "No Member IDs were removed."
                    });
                }
            }
            catch (Exception ex)
            {
                // Return internal server error if something goes wrong
                return StatusCode(500, new
                {
                    Status = "Error",
                    Message = $"Error removing duplicate members: {ex.Message}"
                });
            }
        }

        #endregion Others

        private List<SelectListItem> GetConfigSelectedValues(
    string parentIds,
    string categoryCode,
    string userSelectedIds)
        {
            bool isActive = true;

            var configList = _settingBAL.Configuration_Get(
                isActive,
                "",
                "",
                parentIds ?? "",
                "",
                categoryCode,
                ""
            );

            var allItems = configList.Select(x => new SelectListItem
            {
                Text = x.Value + (string.IsNullOrWhiteSpace(x.ValueTamil) ? "" : (" / " + x.ValueTamil)),
                Value = x.Id
            }).OrderBy(o => o.Text).ToList();

            var selectedIds = (userSelectedIds ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(x => x.Trim())
                .ToList();

            return allItems.Where(x => selectedIds.Contains(x.Value)).ToList();
        }

    }
}