using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.CardApprpvalModels
{
    public class Member_Card_Approval_Save_Model
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string ApprovalComment { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string SelectedStatus { get; set; } = string.Empty;
    }

    public class Member_Card_BulkApproval_Save_Model
    {

        //public string Id { get; set; } = string.Empty;
        //public List<string>? Id { get; set; }
        //public string Member_Id { get; set; } = string.Empty;
        public List<string>? Member_Id { get; set; }
        public string ApprovalComment { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string SelectedStatus { get; set; } = string.Empty;
    }
}
