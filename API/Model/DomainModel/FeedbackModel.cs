using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class FeedbackModel
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
    public class FeedbackViewModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
    }
}
