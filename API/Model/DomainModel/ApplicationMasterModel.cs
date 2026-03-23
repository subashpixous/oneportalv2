using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationMasterModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;

        public string TemporaryPrefix { get; set; } = string.Empty;
        public string TemporarySuffix { get; set; } = string.Empty;
        public string TemporaryRunningNumber { get; set; } = string.Empty;
        public string TemporaryNumber { get; set; } = string.Empty;

        public string Prefix { get; set; } = string.Empty;
        public string Suffix { get; set; } = string.Empty;
        public string ApplicationRunningNumber { get; set; } = string.Empty;
        public string ApplicationNumber { get; set; } = string.Empty;
    }
}
