using API.Infrastructure;
using AutoMapper;
using AutoMapper.Execution;
using BAL.Interface;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.CardApprpvalModels;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using Model.ViewModel.Report;
using OfficeOpenXml;
using Serilog;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Utils;
using Utils.Interface;
using static System.Net.Mime.MediaTypeNames;

namespace API.Controllers
{
    public class ReportController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAccountBAL _accountBAL;
        private readonly ISettingBAL _settingsBAL;
        private readonly ISchemeBAL _schemeBAL;
        private readonly IGeneralBAL _generalBAL;
        private readonly IReportBAL _reportBAL;
        private readonly IUserBAL _userBAL;
        private readonly IMapper _mapper;
        private readonly IJwtAuthManager _jwtAuthManager;
        private readonly ISMSHelper _smsHelper;
        private readonly IFTPHelpers _ftpHelper;
        private readonly IHttpClientFactory _httpClientFactory;
        private const string GoogleApiKey = "AIzaSyDFV2G6DFlHYrTQXrEaom3GdoVuLoO_0C4";
        private const string TranslateUrl = "https://translation.googleapis.com/language/translate/v2?key=" + GoogleApiKey;


        public ReportController(ILogger<AccountController> logger,
           IAccountBAL accountBAL,
           IMapper mapper,
           IJwtAuthManager jwtAuthManager,
           ISettingBAL settingsBAL,
           ISchemeBAL schemeBAL,
           ISMSHelper smsHelper,
           IFTPHelpers ftpHelper, IGeneralBAL generalBAL, IReportBAL reportBAL, IUserBAL userBAL, IHttpClientFactory httpClientFactory)
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
            _reportBAL = reportBAL;
            _userBAL = userBAL;
            _httpClientFactory = httpClientFactory;
        }

        #region Member
        [HttpPost("[action]")]
        [AllowAnonymous]
        public IActionResult GetAllMemberAsExcel(MemberInfoFilterModel filter)
        {
            try
            {
                byte[] excelBytes = _reportBAL.GetAllMemberAsExcel(filter);
                if (excelBytes != null)
                {
                    string exportFile = DateTime.Now.ToString("yyyyMMddHHmmssfftt") + "_Members.xlsx";
                    return File(excelBytes, StringFunctions.GetMimeType(Path.GetExtension(exportFile)), exportFile);
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return StatusCode(500, "Error while downloading file - " + ex.Message);
            }
        }
        #endregion Member

        [HttpGet("[action]")]
        public ResponseViewModel Report_Filter_Dropdowns()
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();

                if (user != null)
                {
                    List<ApplicationPrivilegeMaster> applicationPrivilege = _settingsBAL.Application_Privilege_Get(RoleId: user.RoleId);
                    ReportTopFilterModel model = new ReportTopFilterModel();

                    model.DistrictSelectList = _settingsBAL.ConfigurationSelectList_Get(true, CategoryCode: "DISTRICT");
                    if (user.DistrictIdList != null && user.DistrictIdList.Count > 0)
                    {
                        model.DistrictSelectList = model.DistrictSelectList.Where(x => user.DistrictIdList.Contains(x.Value)).ToList();
                    }

                    model.SchemeSelectList = _settingsBAL.ConfigurationSelectList_Get(true, CategoryCode: "SCHEME");
                    if (user.SchemeIdList != null && user.SchemeIdList.Count > 0)
                    {
                        model.SchemeSelectList = model.SchemeSelectList.Where(x => user.SchemeIdList.Contains(x.Value)).ToList();
                    }

                    if (user.SchemeIdList != null && user.SchemeIdList.Count > 0)
                    {
                        model.StatusSelectList = applicationPrivilege.Where(x => user.SchemeIdList.Contains(x.SchemeId)).Select(s => new SelectListItem()
                        {
                            Text = s.Status ?? "",
                            Value = s.StatusId

                        }).OrderBy(o => o.Text).ToList();
                    }

                    int fromYear = 2020;
                    int toYear = DateTime.Now.Year + 1;
                    model.FinancialYearSelectList = Utils.StringFunctions.GenerateFinancialYearSeries(fromYear, toYear).Select(x => new SelectListItem()
                    {
                        Text = x,
                        Value = x

                    }).ToList();

                    model.ReportTypeSelectList = new List<SelectListItem>()
                    {
                        new SelectListItem(){ Text = "Chart", Value = "chart" },
                        new SelectListItem(){ Text = "Table", Value = "table" }
                    };

                    model.ChartReportSelectList = new List<SelectListItem>()
                    {
                        new SelectListItem(){ Text = "Scheme Performance", Value = "scheme_performance" },
                        new SelectListItem(){ Text = "District Distribution", Value = "district_distribution" },
                        new SelectListItem(){ Text = "Comparison of Scheme Subsidy vs Project Amount", Value = "comparision_of_scheme" },
                        new SelectListItem(){ Text = "Financial Year Analysis", Value = "financial_year_analysis" },
                        new SelectListItem(){ Text = "Avg. Days by Application(s) Status", Value = "avg_days_by_applications" },
                        new SelectListItem(){ Text = "Demographic and Beneficiary Insights", Value = "demographic_and_beneficiary_insights" }
                    };

                    model.TableReportSelectList = new List<SelectListItem>()
                    {
                        new SelectListItem(){ Text = "Application Info", Value = "application_info" },
                        new SelectListItem(){ Text = "Application Document", Value = "application_document" },
                        new SelectListItem(){ Text = "Application Status", Value = "application_status" },
                        new SelectListItem(){ Text = "Form 3", Value = "form3" },
                        new SelectListItem(){ Text = "Utilization Certificate", Value = "uc" }
                    };

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
        public ResponseViewModel GetStatusListByScheme(List<string> SchemeIds)
        {
            try
            {
                string roleId = User.Claims.Where(x => x.Type == Constants.RoleId)?.FirstOrDefault()?.Value ?? "";
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                List<ApplicationPrivilegeMaster> applicationPrivilege = _settingsBAL.Application_Privilege_Get(RoleId: roleId);

                if (applicationPrivilege != null && applicationPrivilege.Count > 0)
                {
                    List<SelectListItem> StatusSelectList = new List<SelectListItem>();

                    if (SchemeIds.Count == 1)
                    {
                        StatusSelectList = _settingsBAL.Get_Status_Select_List_By_Scheme(SchemeIds[0]).Where(x => applicationPrivilege.Select(u => u.StatusId).Contains(x.Value)).ToList();
                    }
                    else
                    {
                        if (SchemeIds != null && SchemeIds.Count > 0)
                        {
                            StatusSelectList = applicationPrivilege.Where(x => SchemeIds.Contains(x.SchemeId)).Select(s => new SelectListItem()
                            {
                                Text = s.Status ?? "",
                                Value = s.StatusId

                            }).OrderBy(o => o.Text).ToList();
                        }
                    }

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
        public ResponseViewModel ApplicationInfo(ApplicationInfoFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                int TotalCount = 0;
                List<ApplicationInfoReportModel> list = _reportBAL.ApplicationInfo(filter, out TotalCount);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = list,
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

        [HttpPost("[action]")]
        public ResponseViewModel ApplicationForm3(ApplicationInfoFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                int TotalCount = 0;
                List<ApplicationForm3ReportModel> list = _reportBAL.ApplicationForm3(filter, out TotalCount);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = list,
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

        [HttpPost("[action]")]
        public ResponseViewModel ApplicationUC(ApplicationInfoFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                int TotalCount = 0;
                List<ApplicationUCReportModel> list = _reportBAL.ApplicationUC(filter, out TotalCount);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = list,
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

        [HttpPost("[action]")]
        public ResponseViewModel ApplicationStatus(ApplicationInfoFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                int TotalCount = 0;
                List<ApplicationStatusReportModel> list = _reportBAL.ApplicationStatus(filter, out TotalCount);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = list,
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

        [HttpPost("[action]")]
        public ResponseViewModel ApplicationDocument(ApplicationInfoFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                int TotalCount = 0;
                List<ApplicationDocumentReportModel> list = _reportBAL.ApplicationDocument(filter, out TotalCount);

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = list,
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

        [HttpPost("[action]")]
        public ResponseViewModel DemographicAndBenificiaryInsights(ReportFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _reportBAL.DemographicAndBenificiaryInsights(filter),
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

        #region reports

        [HttpGet("[action]")]
        [AllowAnonymous]
        public ResponseViewModel GCCReport()
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();    

                List<GCCReportModel> gcc = _reportBAL.GCCReport();


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
        public ResponseViewModel DistrictWiseCountReport(string pDistrictId ="",string pOrganization_Type="")
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
               

                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (string.IsNullOrEmpty(pDistrictId))
                {
                    pDistrictId = user.DistrictIds;
                }
                List<ReportModel> gcc = _reportBAL.DistrictWiseCountReport(pDistrictId, pOrganization_Type);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
        public ResponseViewModel DistrictWiseCardReport(string pDistrictId = "", string pOrganization_Type = "")
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (string.IsNullOrEmpty(pDistrictId))
                {
                    pDistrictId = user.DistrictIds;
                }
                List<CardReportModel> gcc = _reportBAL.DistrictWiseCardReport(pDistrictId, pOrganization_Type);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
        public ResponseViewModel CoreSanitaryWorkersReport(string pDistrictId = "")
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (string.IsNullOrEmpty(pDistrictId))
                {
                    pDistrictId = user.DistrictIds;
                }

                List<CoreSanitaryWorkersReportModel> gcc = _reportBAL.CoreSanitaryWorkersReport(pDistrictId);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
      
        public ResponseViewModel ByBlock(string pDistrictId = "", string pBlock = "")
        {
            try
            {

                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (string.IsNullOrEmpty(pDistrictId))
                {
                    pDistrictId = user.DistrictIds;
                }
                List<ByBlockModel> gcc = _reportBAL.ByBlock(pDistrictId, pBlock);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
    
        public ResponseViewModel ByCorporationReport(string pDistrictId = "", string pByCorporation = "")
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (string.IsNullOrEmpty(pDistrictId))
                {
                    pDistrictId = user.DistrictIds;
                }
                List<ByCorporationModel> gcc = _reportBAL.ByCorporationReport(pDistrictId, pByCorporation);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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

        public ResponseViewModel ByTownPanchayatReport(string pDistrictId = "", string pTownPanchayat = "")
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (string.IsNullOrEmpty(pDistrictId))
                {
                    pDistrictId = user.DistrictIds;
                }
                List<ByTownPanchayatModel> gcc = _reportBAL.ByTownPanchayatReport(pDistrictId, pTownPanchayat);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
       
        public ResponseViewModel CardCollection(string pDistrictId = "")
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (string.IsNullOrEmpty(pDistrictId))
                {
                    pDistrictId = user.DistrictIds;
                }
                List<CardCollectionModel> gcc = _reportBAL.CardCollection(pDistrictId);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
        
        public ResponseViewModel PrintModuleReport(string pStatus="" )
        {
            try
            {
                
               
              
                List<PrintModuleReportModel> gcc = _reportBAL.PrintModuleReport(pStatus);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
        public ResponseViewModel Member_Report(MemberReportFilterModel filter)
        {
            try
            {
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
                    if (Privillage.Contains("FORM_CREATE"))
                    {

                        filter.Where.CollectedByName = user.UserName;
                        //filter.Where.CollectedByPhoneNumber = user.Mobile;

                    }
                }


                int TotalCount = 0;

                if (user != null)
                {
                    if (filter.Where.DistrictIds == null || filter.Where.DistrictIds.Count() == 0)
                    {
                        filter.Where.DistrictIds = user.DistrictIdList;
                    }
                    if (Privillage.Contains("APPLICATION_LOCALBODY_VIEW") && user.RoleCode != "ADM")
                    {

                        filter.Where.CollectedByPhoneNumber = _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);

                    }
                    List<MemberReportModel> memberlist = _reportBAL.MemberReport(filter, out TotalCount);

                
                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = memberlist,
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
        [AllowAnonymous]
        public ResponseViewModel Member_Report_Chart(MemberReportFilterModel filter)
        {
            try
            {
                string userId = User.Claims
                    .Where(x => x.Type == Constants.UserId)
                    ?.FirstOrDefault()?.Value ?? "";

                AccountUserModel? user =
                    _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();

                List<string> Privillage = new List<string>();

                if (user?.RoleCode == "ADM")
                {
                    Privillage = _settingsBAL
                        .Account_Role_Privilege_Get_All(user.RoleId)?
                        .Select(x => x.PrivilegeCode)
                        ?.ToList() ?? new List<string>();
                }
                else if (user != null)
                {
                    Privillage = _settingsBAL
                        .Account_Role_Privilege_Login_Get(user.RoleId)?
                        .Select(x => x.PrivilegeCode)
                        ?.ToList() ?? new List<string>();

                    if (Privillage.Contains("FORM_CREATE"))
                    {
                        filter.Where.CollectedByName = user.UserName;
                    }
                }

                if (user != null)
                {
                    if (filter.Where.DistrictIds == null ||
                        filter.Where.DistrictIds.Count == 0)
                    {
                        filter.Where.DistrictId =  string.Join(",", user.DistrictIdList.Select(x => x.ToString())); ;
                    }

                    if (Privillage.Contains("APPLICATION_LOCALBODY_VIEW") &&
                        user.RoleCode != "ADM")
                    {
                        filter.Where.CollectedByPhoneNumber =
                            _settingsBAL.getUserMobile(pZoneIds: user.ZoneIds);
                    }


                    MemberReportResponseModel chartData = _reportBAL.Member_Report_Chart(filter);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Message = "Action completed successfully",
                        Data = chartData
                    };
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

        #endregion reports

        [HttpPost("TranslateBatch")]
        public async Task<IActionResult> TranslateBatch([FromBody] TranslateRequest request)
        {
            if (request == null || request.Texts == null || request.Texts.Length == 0)
                return BadRequest("No text to translate");

            var client = _httpClientFactory.CreateClient();
            var batchSize = 500; // batch 500 texts at a time
            var translations = new List<string>();

            for (int i = 0; i < request.Texts.Length; i += batchSize)
            {
                var batch = request.Texts.Skip(i).Take(batchSize).ToArray();
                var payload = new
                {
                    q = batch,
                    target = request.TargetLanguage,
                    format = "text"
                };
                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await client.PostAsync(TranslateUrl, content);

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, "Google Translate API failed");

                var resultJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(resultJson);
                var batchTranslations = doc.RootElement
                    .GetProperty("data")
                    .GetProperty("translations")
                    .EnumerateArray()
                    .Select(t => t.GetProperty("translatedText").GetString())
                    .ToList();

                translations.AddRange(batchTranslations);
            }

            return Ok(translations);
        }
        [HttpGet("[action]")]
       
        public ResponseViewModel ByMunicipalityReport(string pDistrictId = "", string pMunicipality = "")
        {
            try
            {

                List<ByMunicipalityModel> gcc = _reportBAL.ByMunicipalityReport(pDistrictId, pMunicipality);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
       
        public ResponseViewModel ByVillagePanchayatReport(string pDistrictId = "", string pBlock = "",string pVillagePanchayat = "")
        {
            try
            {

                List<ByVillagePanchayatModel> gcc = _reportBAL.ByVillagePanchayatReport(pDistrictId, pBlock,pVillagePanchayat);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
        
        public ResponseViewModel UpdatePrintStatus(string pStatus)
        {
            try
            {
                AuditColumnsModel auditColumnsModel = new AuditColumnsModel
                {
                    SavedBy = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "",
                    SavedByUserName = User.Claims.FirstOrDefault(x => x.Type == Constants.Name)?.Value ?? "",
                    SavedDate = DateTime.Now
                };

                List<PrintModuleReportModel> list = _reportBAL.PrintModuleReport(pStatus);
                List<string> processedIds = new List<string>();
                bool hasFailure = false;

                foreach (var item in list)
                {
                    var model = new Member_Card_Approval_Save_Model
                    {
                        Member_Id = item.Id,
                        SelectedStatus = "APPROVED",
                        Id = item.ApprovalId
                    };

                    string result = _userBAL.MemberCardApproval(model, auditColumnsModel);

                    if (string.IsNullOrEmpty(result))
                    {
                        hasFailure = true;
                    }
                    else
                    {
                        processedIds.Add(result);
                    }
                }

                //string updateResult = _reportBAL.UpdatePrintStatus();

                if (!hasFailure )
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Success,
                        Data = processedIds,
                        Message = "Action completed successfully"
                    };
                }
                else
                {
                    return new ResponseViewModel
                    {
                        Status = ResponseConstants.Failed,
                        Data = processedIds,
                        Message = "Some records could not be updated"
                    };
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);

                return new ResponseViewModel
                {
                    Status = ResponseConstants.Error,
                    Data = null,
                    Message = ex.Message
                };
            }
        }

        [HttpPost("[action]")]
      
        [Consumes("multipart/form-data")]
        public ResponseViewModel saveDownloadedPrintFile([FromForm] DownloadedFileModel model)
        {
            try
            {
                if (model.File == null )
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
                        fileMasterModel.TypeId = Guid.NewGuid().ToString();
                        fileMasterModel.Type = FileUploadTypeCode.DownloadedPrintFile;
                        fileMasterModel.TypeName = "Downloaded PrintFile";
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
                            List<FileMasterModel> existRecords = _generalBAL.FileMaster_Get(true, Type: FileUploadTypeCode.DownloadedPrintFile, TypeId: "");
                            if (existRecords?.Count > 0)
                            {
                                existRecords?.ForEach(x =>
                                {
                                    if (x.Id != res)
                                    {
                                        x.IsActive = true;
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

        [HttpGet("GetFileHistory")]
        
        public ResponseViewModel GetFileHistory()
        {
            var files = _generalBAL.FileMaster_Get(true, Type: FileUploadTypeCode.DownloadedPrintFile, TypeId: "");

            // Defensive: handle null
            if (files == null || files.Count == 0)
                return null;

            // Order by SavedDate descending and take only latest 10
            var latestFiles = files
                .OrderByDescending(f => f.CreatedDate)
                .Take(10)
                .ToList();

            return new ResponseViewModel()
            {
                Status = ResponseConstants.Success,
                Data = latestFiles,
                Message = "File saved successfully"
            };
        }



    

        //[HttpPost("DeleteByFile")]
        //[AllowAnonymous]
        //public async Task<IActionResult> DeleteByFile(IFormFile file, [FromForm] string comments)
        //{
        //    AuditColumnsModel auditColumnsModel = new AuditColumnsModel
        //    {
        //        SavedBy = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "",
        //        SavedByUserName = User.Claims.FirstOrDefault(x => x.Type == Constants.Name)?.Value ?? "",
        //        SavedDate = DateTime.Now,
        //        ModifiedBy = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "",
        //        ModifiedByUserName = User.Claims.FirstOrDefault(x => x.Type == Constants.Name)?.Value ?? ""
        //    };

        //    if (file == null || file.Length == 0)
        //        return BadRequest("No file uploaded.");

        //    List<string> ids = new List<string>();

        //    using (var reader = new StreamReader(file.OpenReadStream()))
        //    {
        //        while (!reader.EndOfStream)
        //        {
        //            var line = await reader.ReadLineAsync();
        //            if (!string.IsNullOrWhiteSpace(line))
        //                ids.Add(line.Trim()); // each line contains one Id (GUID)
        //        }
        //    }

        //    if (ids.Count == 0)
        //        return BadRequest("No IDs found in file.");

        //    int successCount = 0;
        //    int failureCount = 0;

        //    foreach (var id in ids)
        //    {
        //        var record = _reportBAL.GetId(id).FirstOrDefault();

        //        if (record != null)
        //        {
        //            var model = new MemberDataApprovalFromSubmitModel
        //            {
        //               RequestId=record.RequestId,
        //                SelectedRoleText = "Return (District Manager)",
        //                SelectedRoleId = record.ApprovalRoleId,
        //                Comment=comments,

                       
        //                CurrentRoleId = auditColumnsModel.SavedBy,

        //            };

        //            //string result = _userBAL.MemberCardApproval(model, auditColumnsModel);
        //            string result = _userBAL.MemberDataApproval(model, auditColumnsModel);
        //            //int deletedCount = _reportBAL.UpdateAsCardDisbursed(model,auditColumnsModel);

        //            if (!string.IsNullOrEmpty(result))
        //                successCount++;
        //            else
        //                failureCount++;
        //        }
        //        else
        //        {
        //            failureCount++;
        //        }
        //    }

        //    return Ok(new
        //    {
        //        message = $"{successCount} records processed successfully, {failureCount} failed."
        //    });
        //}




      
       [HttpPost("DeleteByFile")]
      
    public async Task<IActionResult> DeleteByFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var auditColumnsModel = new AuditColumnsModel
        {
            SavedBy = User.Claims.FirstOrDefault(x => x.Type == Constants.UserId)?.Value ?? "",
            SavedByUserName = User.Claims.FirstOrDefault(x => x.Type == Constants.Name)?.Value ?? "",
            SavedDate = DateTime.Now,
            ModifiedBy = User.Claims.FirstOrDefault(x => x.Type == Constants.RoleId)?.Value ?? "",
            ModifiedByUserName = User.Claims.FirstOrDefault(x => x.Type == Constants.Name)?.Value ?? ""
        };

        int successCount = 0;
        int failureCount = 0;
            try
            {
                using (var stream = file.OpenReadStream())
                using (var workbook = new XLWorkbook(stream))
                {

                    var worksheet = workbook.Worksheet(1); // first worksheet

                    if (worksheet == null)
                        return BadRequest("Excel file is empty or invalid.");

                    var headerRow = worksheet.Row(1);

                    // ✅ Check headers
                    var expectedHeaders = new[] { "memberId", "comment" };
                    var actualHeader1 = headerRow.Cell(1).GetString().Trim();
                    var actualHeader2 = headerRow.Cell(2).GetString().Trim();

                    if (!string.Equals(actualHeader1, expectedHeaders[0], StringComparison.OrdinalIgnoreCase) ||
                        !string.Equals(actualHeader2, expectedHeaders[1], StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest($"Invalid file format. Expected headers: {string.Join(", ", expectedHeaders)}");
                    }

                    // ✅ Check for data rows
                    var rows = worksheet.RowsUsed().Skip(1).ToList(); // skip header
                    if (rows.Count == 0)
                    {
                        return BadRequest("Excel file contains no data rows.");
                    }


                    foreach (var row in rows)
                    {
                        var memberId = row.Cell(1).GetString(); // Column A
                        var comment = row.Cell(2).GetString();  // Column B

                        if (string.IsNullOrWhiteSpace(memberId))
                        {
                            failureCount++;
                            continue;
                        }

                        // Get actual ID using your method
                        var record = _reportBAL.GetId(memberId).FirstOrDefault();
                        if (record != null)
                        {
                            var model = new MemberDataApprovalFromSubmitModel
                            {
                                RequestId = record.RequestId,
                                SelectedRoleText = "Return (District Manager)",
                                SelectedRoleId = record.ApprovalRoleId,
                                Comment = comment,
                                CurrentRoleId = auditColumnsModel.ModifiedBy
                            };

                            string result = _userBAL.MemberDataApproval(model, auditColumnsModel);

                            if (!string.IsNullOrEmpty(result))
                                successCount++;
                            else
                                failureCount++;
                        }
                        else
                        {
                            failureCount++;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Invalid Excel file. Error: {ex.Message}");
            }
            return Ok(new
        {
            message = $"{successCount} records processed successfully, {failureCount} failed."
        });
    }


    [HttpGet("[action]")]
       
        public ResponseViewModel MemberdetailedReport(string DistrictId = "", string Municipality = "", string TownPanchayat = "",
            string pByCorporation = "", string VillagePanchayat = "", string Block = "", string Local_Body = "", string Organization_Type = "", string CardIssued = ""
            , string Core_Sanitary_Worker_Type = "", string Zone = "", string Status = "",
            string CardtobeIssued = "", string CardRejected = "",string CollectedByName="",string CollectedByPhoneNumber="")
        {
            try
            {

                List<MemberdetailedReportModel> gcc = _reportBAL.MemberdetailedReport(DistrictId, Municipality, TownPanchayat, pByCorporation, VillagePanchayat,
                Block, Local_Body, Organization_Type, CardIssued,Core_Sanitary_Worker_Type, Zone,Status, CardtobeIssued, CardRejected, CollectedByName,CollectedByPhoneNumber);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
        
        public ResponseViewModel MemberApplySchemeCount(string DistrictId = "", string SchemeId = "")
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (string.IsNullOrEmpty(DistrictId))
                {
                    DistrictId = user.DistrictIds;
                }
                List<MemberApplySchemeCountModel> gcc = _reportBAL.MemberApplySchemeCount(DistrictId, SchemeId);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
       
        public ResponseViewModel SchemeGCCReport(string ZoneId = "", string SchemeId = "")
        {
            try
            {
                //string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                //AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                //if (string.IsNullOrEmpty(pDistrictId))
                //{
                //  pDistrictId = user.DistrictIds;
                //}

                List<SchemeGCCReportModel> gcc = _reportBAL.SchemeGCCReport(ZoneId, SchemeId);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
    
        public ResponseViewModel SchemeCostReport(string DistrictId = "", string SchemeId = "")
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";


                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (string.IsNullOrEmpty(DistrictId))
                {
                    DistrictId = user.DistrictIds;
                }
                List<SchemeCostReportModel> gcc = _reportBAL.SchemeCostReport(DistrictId, SchemeId);


                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = gcc,
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
        public ResponseViewModel FinancialYearAnalysis(ReportFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _reportBAL.FinancialYearAnalysis(filter),
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
        public ResponseViewModel ComparisionSchemeSubsidyAmount(ReportFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _reportBAL.ComparisionSchemeSubsidyAmount(filter),
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
        public ResponseViewModel DistrictDistribution(ReportFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _reportBAL.DistrictDistribution(filter),
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
        public ResponseViewModel SchemePerformance(ReportFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _reportBAL.SchemePerformance(filter),
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
        public ResponseViewModel ApplicationStatusWiseReport(ReportFilterModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                UserBankBranchForFilterModel bb = _userBAL.Application_Get_Bank_Branch_Filter_Value(userId);
                if (bb != null)
                {
                    if (!string.IsNullOrEmpty(bb.BankIds))
                    {
                        filter.BankIds = bb.BankIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.BranchIds))
                    {
                        filter.BranchIds = bb.BranchIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.SchemesIds) && filter.SchemeIds?.Count == 0)
                    {
                        filter.SchemeIds = bb.SchemesIds.Split(',').ToList();
                    }
                    if (!string.IsNullOrEmpty(bb.DistrictIds) && filter.DistrictIds?.Count == 0)
                    {
                        filter.DistrictIds = bb.DistrictIds.Split(',').ToList();
                    }
                }

                filter.ToYear = filter.ToYear + 1;

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _reportBAL.ApplicationStatusWiseReport(filter),
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
        public ResponseViewModel GetNestedGroupedReportAsync(List<HierarchyField> hierarchy)
        {
            try
            {

                return new ResponseViewModel()
                {
                    Status = ResponseConstants.Success,
                    Message = "Action completed successfully",
                    Data = _reportBAL.GetNestedGroupedReportAsync(hierarchy),
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

        [HttpPost("GetMemberListByAnimator")]
        public IActionResult GetMemberListByCollector([FromBody] MemberFilterModelForAnimator filter)
        {
            try
            {
                // ✅ Extract userId from audit column (JWT, token, or custom claim)
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User not authenticated" });

                var data = _reportBAL.GetMemberListByCollector(filter, userId, out int totalCount);

                return Ok(new
                {
                    success = true,
                    totalCount,
                    data
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // [29-Oct-2025] Updated by Sivasankar K: Modified to fetch Animator entries

        [HttpPost("GetApplicationListByAnimator")]
        public IActionResult GetApplicationListByCollector([FromBody] ApplicationFilterModelForAnimator filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User not found in token" });

                var result = _reportBAL.GetApplicationListByCollector(filter, userId, out int totalCount);

                return Ok(new
                {
                    totalCount,
                    data = result
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

    }
}
