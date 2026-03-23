using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.Report
{
    public class FinancialYearAnalysisModel
    {
        public string SchemeName { get; set; } = string.Empty;
        public List<FinancialYearAnalysisReadModel>? Data { get; set; }
    }

    public class FinancialYearAnalysisReadModel
    {
        public string SchemeName { get; set; } = string.Empty;
        public int FromYear { get; set; }
        public int ToYear { get; set; }
        public int RecordCount { get; set; }
        public decimal TotalCost { get; set; }
    }
}
