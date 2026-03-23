using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationUtilizationCirtificateModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string NameAndAddress { get; set; } = string.Empty;
        public string NameOfTrade { get; set; } = string.Empty;
        public string NodalNumber { get; set; } = string.Empty;
        public decimal Subsidy { get; set; }
        public decimal PromotorContribution { get; set; }
        public decimal BankLoan { get; set; }
        public decimal TotalAmountReleased { get; set; }
        public DateTime DateOfLoanSanction { get; set; }
        public DateTime DateOfDisbursement { get; set; }
        public DateTime DateOfAssetCreated { get; set; }
        public DateTime DateOfAssetVerified { get; set; }
        public string LoanAccountNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public string SavedFileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
    }

    public class ApplicationUtilizationCirtificateSaveModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string NameAndAddress { get; set; } = string.Empty;
        public string NameOfTrade { get; set; } = string.Empty;
        public string NodalNumber { get; set; } = string.Empty;
        public decimal Subsidy { get; set; }
        public decimal PromotorContribution { get; set; }
        public decimal BankLoan { get; set; }
        public decimal TotalAmountReleased { get; set; }
        public DateTime DateOfLoanSanction { get; set; }
        public DateTime DateOfDisbursement { get; set; }
        public DateTime DateOfAssetCreated { get; set; }
        public DateTime DateOfAssetVerified { get; set; }
        public string LoanAccountNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class ApplicationUtilizationCirtificateUploadFormModel
    {
        public string Id { get; set; } = string.Empty;
        public IFormFile File { get; set; } = null!;
    }
}
