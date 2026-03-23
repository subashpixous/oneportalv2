using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class AccountLoginOtpValidationModel
    {
        public string Id { get; set; } = string.Empty;
        public string ValidationCode { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public bool IsExpired { get; set; }
        public DateTime ExpireOn { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
