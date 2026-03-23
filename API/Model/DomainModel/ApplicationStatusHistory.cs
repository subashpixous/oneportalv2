using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationStatusHistory : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string FromStatusId { get; set; } = string.Empty;
        public string ToStatusId { get; set; } = string.Empty;
    }
}
