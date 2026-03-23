using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class DocumentGroupConfigurationOrderModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public string DocumentGroupId { get; set; } = string.Empty;
        public string DocumentGroupName { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }
}
