using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class SchemeStatusMappingViewModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsDisabled { get; set; }
    }

    public class SchemeStatusMappingSaveModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public List<string> StatusIds { get; set; } = null!;
    }
}
