using AutoMapper;
using BAL.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DomainModel;
using Model.ViewModel;
using Serilog;
using Utils.Interface;
using System.Linq;

namespace API.Controllers
{
    public class DashboardController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly ISettingBAL _settingBAL;
        private readonly IMapper _mapper;
        private readonly IFTPHelpers _ftpHelper;
        private readonly IMemberBAL _memberBAL;
        private readonly ISettingBAL _settingsBAL;
        private readonly ISchemeBAL _schemeBAL;
        private readonly IReportBAL _reportBAL;

        public DashboardController(ILogger<AccountController> logger, ISettingBAL settingBAL, IMapper mapper,
            IFTPHelpers ftpHelper, IMemberBAL memberBAL, ISettingBAL settingsBAL, ISchemeBAL schemeBAL, IReportBAL reportBAL)
        {
            _logger = logger;
            _settingBAL = settingBAL;
            _mapper = mapper;
            _ftpHelper = ftpHelper;
            _memberBAL = memberBAL;
            _settingsBAL = settingsBAL;
            _schemeBAL = schemeBAL;
            _reportBAL = reportBAL;
        }

        [HttpPost("[action]")]
        public ResponseViewModel Application_GetCount(DashboardFilterValueModel filter)
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

                    DashboardApplicationCountModel applicationCount = _schemeBAL.DashboardApplicationCount(applicationPrivilege, filter, userPrivilege);

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

        [HttpPost("[action]")]
        public ResponseViewModel Member_GetCount(DashboardFilterValueModel filter)
        {
            try
            {
                string userId = User.Claims.Where(x => x.Type == Constants.UserId)?.FirstOrDefault()?.Value ?? "";

                AccountUserModel? user = _settingsBAL.User_Get(IsActive: true, UserId: userId).FirstOrDefault();
                if (user != null)
                {
                    string RoleCode = user.RoleCode;

                    UserPrivillageInfoModel userPrivilege = new UserPrivillageInfoModel();
                    userPrivilege.UserId = userId;
                    userPrivilege.RoleId = user.RoleId;
                    userPrivilege.DistrictIdList = user.DistrictIdList;
                    userPrivilege.BankIdList = user.BankIdList;
                    userPrivilege.BranchIdList = user.BranchIdList;
                    userPrivilege.SchemeIdList = user.SchemeIdList;

                    List<ApplicationPrivilegeMaster> applicationPrivilege =
                        _settingsBAL.Application_Privilege_Get(RoleId: user.RoleId);

                    // ✅ SAFE JOIN FIX
                    string districtListString = string.Join(",", userPrivilege.DistrictIdList.Select(x => x.ToString()));

                    string Mobile = "";

                    // ✅ FINAL FIX (NO string.Join ambiguity)
                    if (RoleCode == "DO")
                    {
                        Mobile = user.Mobile != null ? user.Mobile.ToString() : "";
                    }

                    if (RoleCode == "ADM" || RoleCode == "HQ")
                    {
                        districtListString = "";
                    }

                    // ✅ ALL JOIN FIXED
                    string LocalBodyIdList = string.Join(",", user.LocalBodyIds.Select(x => x.ToString()));
                    string NameOfLocalBodyIdList = string.Join(",", user.NameOfLocalBodyIds.Select(x => x.ToString()));
                    string BlockIdList = string.Join(",", user.BlockIds.Select(x => x.ToString()));
                    string CorporationIdList = string.Join(",", user.CorporationIds.Select(x => x.ToString()));
                    string MunicipalityIdList = string.Join(",", user.MunicipalityIds.Select(x => x.ToString()));
                    string TownPanchayatIdList = string.Join(",", user.TownPanchayatIds.Select(x => x.ToString()));
                    string VillagePanchayatIdList = string.Join(",", user.VillagePanchayatIds.Select(x => x.ToString()));
                    string ZoneIdList = string.Join(",", user.ZoneIds.Select(x => x.ToString()));

                    MemberDetailCount applicationCount = _memberBAL.MemberDashboardCountGet(
                        districtListString,
                        Mobile,
                        LocalBodyIdList,
                        NameOfLocalBodyIdList,
                        BlockIdList,
                        CorporationIdList,
                        MunicipalityIdList,
                        TownPanchayatIdList,
                        VillagePanchayatIdList,
                        ZoneIdList
                    );

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

        [AllowAnonymous]
        [HttpPost("[action]")]
        public ResponseViewModel Dashboard_GetCount(DashboardFilterValueModel filter)
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

                    List<ApplicationPrivilegeMaster> applicationPrivilege =
                        _settingsBAL.Application_Privilege_Get(RoleId: user.RoleId);

                    DashboardResponseCountModel dashboardCount =
                        _schemeBAL.DashboardCount(applicationPrivilege, filter, userPrivilege);

                    return new ResponseViewModel()
                    {
                        Status = ResponseConstants.Success,
                        Data = dashboardCount
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
    }
}
