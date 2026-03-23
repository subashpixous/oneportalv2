using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.CardApprpvalModels
{
    public class Member_Card_Approval_Master_From
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string NextStatusId { get; set; } = string.Empty;
        public string NextStatus { get; set; } = string.Empty;
        public string PreviousStatusId { get; set; } = string.Empty;
        public string PreviousStatus { get; set; } = string.Empty;
        public string IsActive { get; set; } = string.Empty;
        public string IsCompleted { get; set; } = string.Empty;
        public string IsPrinted { get; set; } = string.Empty;

        public string SelectedStatus { get; set; } = string.Empty;
        public string FromStatusId { get; set; } = string.Empty;
        public string ToStatusId { get; set; } = string.Empty;

        public string ApprovalComment { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;

        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedByUserName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public string Modifiedby { get; set; } = string.Empty;
        public string ModifiedByUserName { get; set; } = string.Empty;
        public DateTime ModifiedDate { get; set; }
        public List<SelectListItem>? StatusList { get; set; }
        public List<SelectListItem>? ReasonList { get; set; }
        public List<Member_Card_Approval_Master_History>? ApprovalHistory { get; set; }
    }
    public class MemberIdMessageViewModel
    {
        public string MasterId { get; set; }
        public string Messages { get; set; }
    }

    public class TotalCountViewModel
    {
        public int TotalFailed { get; set; }
        public int TotalSuccess { get; set; }
    }

}
