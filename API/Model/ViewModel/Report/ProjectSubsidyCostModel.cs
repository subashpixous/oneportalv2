using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.Report
{
    public class ProjectSubsidyCostModel
    {
        public int FromYear { get; set; }
        public int ToYear { get; set; }
        public decimal ProjectCost { get; set; }
        public decimal SubsidyCost { get; set; }
    }
}
