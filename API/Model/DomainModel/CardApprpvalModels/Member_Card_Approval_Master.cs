using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.CardApprpvalModels
{
    public class Member_Card_Approval_Master : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string LastActionStatus { get; set; } = string.Empty;
        public string IsActive { get; set; } = string.Empty;
        public string IsCompleted { get; set; } = string.Empty;
        public string IsPrinted { get; set; } = string.Empty;
    }
}
