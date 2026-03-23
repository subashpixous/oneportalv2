using Model.CustomeAttributes;
using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class AccountUserViewModel
    {
        public string UserId { get; set; } = null!;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Telephone { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string RoleId { get; set; } = string.Empty;
        public string UserGroup { get; set; } = string.Empty;
        public DateTime DOB { get; set; }
        public string GenderId { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PofileImageId { get; set; } = string.Empty;
        public string PofileThumbnileImageId { get; set; } = string.Empty;
        
        public string JobTitle { get; set; } = string.Empty;
        public string ForgotPasswordOTP { get; set; } = string.Empty;
        public bool IsSuperAdmin { get; set; }

        public string Prefix { get; set; } = string.Empty;
        public string Suffix { get; set; } = string.Empty;
        public int RunningNumber { get; set; }
        public string UserNumber { get; set; } = string.Empty;

        public string DistrictIds { get; set; } = string.Empty;

        public string LocalBodyIds { get; set; } = string.Empty;
        public string NameOfLocalBodyIds { get; set; } = string.Empty;
        public string BlockIds { get; set; } = string.Empty;
        public string CorporationIds { get; set; } = string.Empty;
        public string MunicipalityIds { get; set; } = string.Empty;
        public string TownPanchayatIds { get; set; } = string.Empty;
        public string VillagePanchayatIds { get; set; } = string.Empty;
        public string ZoneIds { get; set; } = string.Empty;
        public string SchemesIds { get; set; } = string.Empty;
        public string BankIds { get; set; } = string.Empty;
        public string BranchIds { get; set; } = string.Empty;
        public string CardPrintStatusIds { get; set; } = string.Empty;

        public string Schemes { get; set; } = string.Empty;
        public string Districts { get; set; } = string.Empty;
        public string Banks { get; set; } = string.Empty;
        public string Branches { get; set; } = string.Empty;
        public string CardPrintStatuses { get; set; } = string.Empty;

        public List<string>? SchemeIdList { get; set; }
        public List<string>? DistrictIdList { get; set; }
        public List<string>? LocalBodyIdList { get; set; }

        public List<string>? NameOfLocalBodyIdList { get; set; }
        public List<string>? BlockIdList { get; set; }
        public List<string>? CorporationIdList { get; set; }
        public List<string>? MunicipalityIdList { get; set; }
        public List<string>? TownPanchayatIdList { get; set; }
        public List<string>? VillagePanchayatIdList { get; set; }
        public List<string>? ZoneIdList { get; set; }

        public List<string>? BankIdList { get; set; }
        public List<string>? BranchIdList { get; set; }
        public List<string>? CardPrintStatusIdList { get; set; }

        public string UserGroupName { get; set; } = string.Empty;
        public string UserGroupCode { get; set; } = string.Empty;
        public string RoleCode { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string LoginId { get; set; } = string.Empty;

        public string LastUpdatedBy { get; set; } = string.Empty;
        public string LastUpdatedUserName { get; set; } = string.Empty;
        public DateTime? LastUpdatedDate { get; set; }
    }

    public class AccountUserFormDetailModel
    {
        public List<SelectListItem> RoleList { get; set; } = null!;
        public List<SelectListItem> GenderList { get; set; } = null!;
        public List<SelectListItem> UserGroupList { get; set; } = null!;

        public List<SelectListItem> DistrictList { get; set; } = null!;
        public List<SelectListItem> NameOfTheLocalBodyList { get; set; } = null!;
        public List<SelectListItem> LocalBodyList { get; set; } = null!;
        public List<SelectListItem> BlockList { get; set; } = null!;
        public List<SelectListItem> CorporationList { get; set; } = null!;
        public List<SelectListItem> MunicipalityList { get; set; } = null!;
        public List<SelectListItem> TownPanchayatList { get; set; } = null!;
        public List<SelectListItem> VillagePanchayatList { get; set; } = null!;
        public List<SelectListItem> ZoneList { get; set; } = null!;

        public List<SelectListItem> BankList { get; set; } = null!;
        public List<SelectListItem> BranchList { get; set; } = null!;
        public List<SelectListItem> SchemeList { get; set; } = null!;
        public List<SelectListItem> CardPrintStatusList { get; set; } = null!;
    }


}
