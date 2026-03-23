using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.CardApprpvalModels
{
    public class Member_Card_Approval_Master_Grid_Model : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string LastActionStatus { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public bool IsPrinted { get; set; }
        public bool IsRejected { get; set; }
        public bool CanApprove { get; set; }
        public bool IsActive { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string DOB { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string LocalBody { get; set; } = string.Empty;
        public string OrganizationType { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public string MemberCode { get; set; } = string.Empty;
        public string ApprovalComment { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string CardDisbursedStatus { get; set; } = string.Empty;

        public string? DistrictId { get; set; }
        public string? OrganizationTypeId { get; set; }
        public string? LocalBodyCode { get; set; }
        public string? ZoneId { get; set; }

    }
}
