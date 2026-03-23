using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApprovalDocConfigViewModel
    {
        public string MappingId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public string DocumentLabel { get; set; } = string.Empty;
        public bool IsAssertVerificationStatus { get; set; }
        public bool IsDocumentRequired { get; set; }
        public int SortOrder { get; set; }
    }
}
