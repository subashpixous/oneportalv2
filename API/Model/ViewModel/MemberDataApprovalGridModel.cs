using DocumentFormat.OpenXml.Wordprocessing;
using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
 
namespace Model.ViewModel
{ 
    public class MemberDataApprovalGridModel
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string Member_Id_Text { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Changed_Detail_Record { get; set; } = string.Empty;
        public string Changed_Date { get; set; } = string.Empty;
        public string Changed_Time { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string ApprovedByName { get; set; } = string.Empty;
        public string ApprovedByRole { get; set; } = string.Empty;
        public string NextApprovalRole { get; set; } = string.Empty;
        public string UpdatedByUserName { get; set; } = string.Empty;
        public DateTime? UpdatedDate { get; set; }

        public string LastApprovalStatus { get; set; } = string.Empty;
        public string LastApprovalComment { get; set; } = string.Empty;
        public string LastApprovalReason { get; set; } = string.Empty;

        public string FamilyMembers { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        public string Districts { get; set; } = string.Empty;
        public string Date_Of_Birth { get; set; } = string.Empty;
        public string Phone_Number { get; set; } = string.Empty;
        public string Father_Name { get; set; } = string.Empty;
        public string Profile_Picture_url { get; set; } = string.Empty;
        public string ProfileImage { get; set; } = string.Empty;

        public string QRCodeURL { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string ZoneCode { get; set; } = string.Empty;

        public bool? CardStatus { get; set; }

        public string DistrictId { get; set; } = string.Empty;
        public string ZoneId { get; set; } = string.Empty;

    }

    public class MemberDataApprovalFilterModel
    {
        public List<SelectListItem>? Changed_Detail_Record_Types { get; set; }
        public List<SelectListItem>? StatusList { get; set; }
        public List<SelectListItem>? ApprovedStatusList { get; set; }
        public List<SelectListItem>? DistrictList { get; set; }

        public List<SelectListItem>? DivisionList { get; set; }
        public List<SelectListItem>? RoleList { get; set; }
        public List<SelectListItem>? OrganizationTypeList { get; set; }
        public List<SelectListItem>? LocaBodyList { get; set; }
        public List<SelectListItem>? NameofLocalBodyList { get; set; }
        public List<SelectListItem>? TypeOfWorkList { get; set; }
    }
}
