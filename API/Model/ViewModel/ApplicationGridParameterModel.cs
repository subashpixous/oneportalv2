using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationGridParameterModel
    {
        public List<string> SchemeIds { get; set; } = null!;
        public List<string> DistrictIds { get; set; } = null!;
        public List<string> StatusCodes { get; set; } = null!;
        public List<string>? BankIds { get; set; }
        public List<string>? BranchIds { get; set; }
        public List<string>? Mobile { get; set; }

        public DateTime From { get; set; }
        public DateTime To { get; set; }

        public string Type { get; set; } = string.Empty;
        public int Skip { get; set; } 
        public int Take { get; set; } 
        public string SearchString { get; set; } = string.Empty;
        public string OrderByColumn { get; set; } = string.Empty;
        public string OrderDirection { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string RoleId { get; set; } = string.Empty;
        public bool IsExpired { get; set; }
        public bool IsBulkApprovalGet { get; set; }
        public string CollectedByName { get; set; } = string.Empty;
        public string CollectedByPhoneNumber { get; set; } = string.Empty;

        public List<ColumnSearchModel>? ColumnSearch { get; set; }

        public bool ShowInactiveOnly { get; set; } = false;
    }
}
