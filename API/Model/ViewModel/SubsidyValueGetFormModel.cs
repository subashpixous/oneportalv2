using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class SubsidyValueGetFormModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public decimal Cost { get; set; }
    }
    public class SubsidyValueGetResponseModel
    {
        public decimal SubsidyCost { get; set; }
        public decimal MaxProjectCost { get; set; }
        public decimal SubsidyPercentage_Config { get; set; }
        public decimal SubsidyCost_Config { get; set; }
    }
}
