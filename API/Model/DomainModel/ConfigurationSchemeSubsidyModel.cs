using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ConfigurationSchemeSubsidyModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public long TotalSubsidyCost { get; set; }
        public long TotalProjectCost { get; set; }
        public long MaxProjectCost { get; set; }
        public decimal SubsidyPercentage { get; set; }
        public long SubsidyCost { get; set; }
        public int MaxApplicationCount { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public bool IsActive { get; set; }
        public List<ConfigurationdDistrictsWiseSubsidyModel> DistrictsWiseSubsidyModels { get; set; } = null!;
    }
    public class ConfigurationdDistrictsWiseSubsidyModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string ConfigurationSchemeSubsidyId { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public long MaxPojectCost { get; set; }
        public long MaxSubsidyCost { get; set; }
        public int MaxApplicationCount { get; set; }

        public string District { get; set; } = string.Empty;
    }
}
