using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.CardApprpvalModels
{
    public class Member_Card_Approval_Master_History
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string MemberCode { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string MasterId { get; set; } = string.Empty;
        public string FromStatusId { get; set; } = string.Empty;
        public string FromStatus { get; set; } = string.Empty;
        public string ToStatusId { get; set; } = string.Empty;
        public string ToStatus { get; set; } = string.Empty;
        public string StatusCode { get; set; } = string.Empty;
        public string ApprovalComment { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedByUserName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }
}
