using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.Report
{
    public class ApplicationStatusReport
    {
        public List<ApplicationAllStatus> ApplicationAllStatusCount { get; set; } = null!;

        public List<ApplicationStatusCount> ApplicationReceived { get; set; } = null!;
        public List<ApplicationStatusCount> TaskForceCommittee { get; set; } = null!;
        public List<ApplicationStatusCount> ForwardedToLendingBank { get; set; } = null!;
        public List<ApplicationStatusCount> ApprovedByLendingBank { get; set; } = null!;
        public List<ApplicationStatusCount> SubsidyReleasedToLendingBank { get; set; } = null!;
        public List<ApplicationStatusCount> SubsidyReleasedByHq { get; set; } = null!;
    }

    public class ApplicationStatusCount
    {
        public string Scheme { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class ApplicationAllStatus
    {
        public string Scheme { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;

        public int TotalCount { get; set; }

        public int ApplicationReceived { get; set; }
        public int TaskForceCommittee { get; set; }
        public int ForwardedToLendingBank { get; set; }
        public int ApprovedByLendingBank { get; set; }
        public int SubsidyReleasedToLendingBank { get; set; }
        public int SubsidyReleasedByHq { get; set; }
    }

   


}
