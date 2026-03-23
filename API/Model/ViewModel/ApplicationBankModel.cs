using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationBankModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty; // PK
        public string Application_Id { get; set; } = string.Empty;
        public string Account_Holder_Name { get; set; } = string.Empty;
        public string Account_Number { get; set; } = string.Empty;
        public string IFSC_Code { get; set; } = string.Empty;
        public string Bank_Name { get; set; } = string.Empty;
        public string Bank_Id { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Branch_Id { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class ApplicationBankDetailSaveModel
    {
        public string Id { get; set; } = string.Empty; // PK
        public string Application_Id { get; set; } = string.Empty;
        public string Account_Holder_Name { get; set; } = string.Empty;
        public string Account_Number { get; set; } = string.Empty;
        public string IFSC_Code { get; set; } = string.Empty;
        public string Bank_Name { get; set; } = string.Empty;
        public string Bank_Id { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Branch_Id { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }
    }
}
