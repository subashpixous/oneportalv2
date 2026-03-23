using Model.CustomeAttributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class AccountUserModel
    {
        public string UserId { get; set; } = null!;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Telephone { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string RoleId { get; set; } = string.Empty;
        public bool IsUrbanRural { get; set; }

        public string UserGroup { get; set; } = string.Empty;
        public DateTime? DOB { get; set; }

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
        public string DivisionIds { get; set; } = string.Empty;
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

        public List<string>? DivisionIdList { get; set; }
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

        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedByUserName { get; set; } = string.Empty;
        public DateTime? CreatedDate { get; set; }
        public string ModifiedBy { get; set; } = string.Empty;
        public string ModifiedByUserName { get; set; } = string.Empty;
        public DateTime? ModifiedDate { get; set; }
        public string DeletedBy { get; set; } = string.Empty;
        public string DeletedByUserName { get; set; } = string.Empty;
        public DateTime? DeletedDate { get; set; }

        public string SavedBy { get; set; } = string.Empty;
        public string SavedByUserName { get; set; } = string.Empty;
        public DateTime SavedDate { get; set; }
    }
    // Updated by sivasankar On 11/12/2025 for user log report
    public class UserActivityLogModels
    {
        public string ActivityLogId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;

        public string RoleId { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
            
        public string ModuleName { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string EventDescription { get; set; } = string.Empty;

        public int EventStatus { get; set; }
        public string EventStatusText { get; set; } = string.Empty;

        public int? FailureCount { get; set; }
        public int? SuccessCount { get; set; }

        public DateTime? CreatedAt { get; set; }

        public string DistrictId { get; set; } = string.Empty;
        public string DistrictName { get; set; }= string.Empty;
    }

    public class UserActivityLogWhere
    {
        public string UserName { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string ModuleName { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string DistrictName { get; set; } = string.Empty;
        public int? EventStatus { get; set; }
    }
    public class UserActivityLogFilter
    {
        public string SearchString { get; set; }=string.Empty;
        public UserActivityLogWhere Where { get; set; }

        public string RoleId { get; set; } = string.Empty;
        public string DistrictIds { get; set; } = string.Empty;

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        public int Take { get; set; } = 10;
        public int Skip { get; set; } = 0;
        public bool GetLastLogPerUser { get; set; } = false;
    }

}
