using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.Report
{
    public class ReportFilterModel
    {
        public int FromYear {  get; set; }
        public int ToYear {  get; set; }
        public List<string>? SchemeIds { get; set; }
        public List<string>? DistrictIds { get; set; }
        public List<string>? StatusIds { get; set; }
        public List<string>? BankIds { get; set; }
        public List<string>? BranchIds { get; set; }
    }


    public class ReportTopFilterModel
    {
        public List<SelectListItem>? SchemeSelectList { get; set; }
        public List<SelectListItem>? DistrictSelectList { get; set; }
        public List<SelectListItem>? StatusSelectList { get; set; }
        public List<SelectListItem>? FinancialYearSelectList { get; set; }
        public List<SelectListItem>? ReportTypeSelectList { get; set; }

        public List<SelectListItem>? ChartReportSelectList { get; set; }
        public List<SelectListItem>? TableReportSelectList { get; set; }
    }

    public class ApplicationInfoFilterModel : TableFilterModel
    {
        public int FromYear { get; set; }
        public int ToYear { get; set; }
        public List<string>? SchemeIds { get; set; }
        public List<string>? DistrictIds { get; set; }
        public List<string>? StatusIds { get; set; }
        public List<string>? BankIds { get; set; }
        public List<string>? BranchIds { get; set; }
    }

    public class MemberInfoFilterModel
    {
        public string Year { get; set; } = string.Empty;
        public List<string>? DistrictIds { get; set; }
    }

}
