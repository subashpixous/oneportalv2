using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ConfigSchemeStatusMappingModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public int SortOrder { get; set; } 

        // View
        public string SchemeName { get; set; } = string.Empty;
        public string SchemeCode { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public string StatusCode { get; set; } = string.Empty;
        public bool IsDisabled { get; set; }
    }
}
