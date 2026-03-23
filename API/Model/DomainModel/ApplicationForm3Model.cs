using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationForm3Model : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string NameAndAddress { get; set; } = string.Empty;
        public string NameOfTrade { get; set; } = string.Empty;
        public string RefNumber { get; set; } = string.Empty;
        public decimal Subsidy { get; set; }
        public decimal PromotorContribution { get; set; }
        public decimal BankLoan { get; set; }
        public decimal TotalUtilCost { get; set; }
        public bool IsActive { get; set; }

        public string SavedFileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
    }

    public class ApplicationForm3SaveModel 
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string NameAndAddress { get; set; } = string.Empty;
        public string NameOfTrade { get; set; } = string.Empty;
        public string RefNumber { get; set; } = string.Empty;
        public decimal Subsidy { get; set; }
        public decimal PromotorContribution { get; set; }
        public decimal BankLoan { get; set; }
        public decimal TotalUtilCost { get; set; }
        public bool IsActive { get; set; }
    }

    public class ApplicationForm3UploadFormModel
    {
        public string Id { get; set; } = string.Empty;
        public IFormFile File { get; set; } = null!;
    }
}
