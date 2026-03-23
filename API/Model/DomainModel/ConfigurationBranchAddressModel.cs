using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ConfigurationBranchAddressModel : AuditColumnsModel
    {
        public string BankId { get; set; } = string.Empty;
        public string BranchId { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class ConfigurationBranchAddressSaveModel 
    {
        public string BankId { get; set; } = string.Empty;
        public string BranchId { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
