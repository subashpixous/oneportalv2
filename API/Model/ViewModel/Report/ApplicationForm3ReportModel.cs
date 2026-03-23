using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.Report
{
    public class ApplicationForm3ReportModel
    {
        public string ApplicationNumber { get; set; } = string.Empty;
        public string Scheme { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string NameAndAddress { get; set; } = string.Empty;
        public string NameOfTrade { get; set; } = string.Empty;
        public string RefNumber { get; set; } = string.Empty;
        public decimal Subsidy { get; set; }
        public decimal PromotorContribution { get; set; }
        public decimal BankLoan { get; set; }
        public decimal TotalUtilCost { get; set; }
    }
}
