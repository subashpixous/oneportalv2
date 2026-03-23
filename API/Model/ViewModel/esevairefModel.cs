using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class esevairefModel
    {
        public string UserId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string OprCode { get; set; } = string.Empty;
        public string UniqueId { get; set; } = string.Empty;
        public string REQID { get; set; } = string.Empty;
        public string ServiceID { get; set; } = string.Empty;
        public string DepartmentID { get; set; } = string.Empty;
        public string CentreCode { get; set; } = string.Empty;
        public string CentreType { get; set; } = string.Empty;
        public string Checksum { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string ServiceCode { get; set; } = string.Empty;
        public string PaidAmount { get; set; } = string.Empty;
        public string UserCharge { get; set; } = string.Empty;
        public string ApplicationReferenceNo { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerContactNo { get; set; } = string.Empty;

        public string CenterType { get; set; } = string.Empty;
        public string TYPE { get; set; } = string.Empty;
        public string TRANNO { get; set; } = string.Empty;
        public string PayMode { get; set; } = string.Empty;

        public string? CreatedBy { get; set; }
        public string? CreatedByUserName { get; set; }
        public int PaymentStatus { get; set; }
        public DateTime? PaidDate { get; set; }

    }
    public class EsevaResponseModel
    {
        public int RESCODE { get; set; }
        public string RESPMSG { get; set; }
        public string EDISTTXNNO { get; set; }
        public string RECEIPTDATA { get; set; }
    }
    public class TnegaRequestLogSaveModel : esevairefModel
    {
        public int PaymentStatus { get; set; }
    }
}