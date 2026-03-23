using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ConfigurationDistrictModel : AuditColumnsModel
    {
        public string DistrictId { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Latitude { get; set; } = string.Empty;
        public string Longitude { get; set; } = string.Empty;
    }

    public class ConfigurationDistrictSaveModel 
    {
        public string DistrictId { get; set; } = string.Empty;
        public string Latitude { get; set; } = string.Empty;
        public string Longitude { get; set; } = string.Empty;
    }
}
