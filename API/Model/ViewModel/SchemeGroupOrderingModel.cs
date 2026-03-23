using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class SchemeGroupOrderingModel
    {
        public string Id { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public string GroupNameTamil { get; set; } = string.Empty;
        public string GroupNameEnglish { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }

    public class SchemeOrderingModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeName { get; set; } = string.Empty;
        public string SchemeNameEnglish { get; set; } = string.Empty;
        public string SchemeNameTamil { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }
}
