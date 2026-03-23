using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class BankDetailModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty; // PK
        public string Member_Id { get; set; } = string.Empty;
        public string Account_Holder_Name { get; set; } = string.Empty;
        public string Account_Number { get; set; } = string.Empty;
        public string IFSC_Code { get; set; } = string.Empty;
        public string Bank_Name { get; set; } = string.Empty;
        public string Bank_Id { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Branch_Id { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }

        public bool IsApprovalPending { get; set; }
        public bool IsAbleToCancelRequest { get; set; }
    }

    public class BankDetailSaveModel
    {
        public string UniqueId { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty; // PK
        public string Member_Id { get; set; } = string.Empty;
        public string Account_Holder_Name { get; set; } = string.Empty;
        public string Account_Number { get; set; } = string.Empty;
        public string IFSC_Code { get; set; } = string.Empty;
        public string Bank_Name { get; set; } = string.Empty;
        public string Bank_Id { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Branch_Id { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }


        public bool IsValid { get; set; }
        public bool IsProcessed { get; set; }
        public int Row { get; set; }
        public string Error { get; set; } = string.Empty;
        public List<string> ErrorList { get; set; } = new List<string>();
    }
}
