using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.Report
{
    public class SchemeCountModel
    {
        public int FromYear {  get; set; }
        public int ToYear {  get; set; }
        public int Count {  get; set; }
        public int Actual {  get; set; }
    }

    public class SchemeCostModel
    {
        public int FromYear { get; set; }
        public int ToYear { get; set; }
        public decimal Cost { get; set; }
        public decimal Actual { get; set; }
    }

    public class CountModel
    {
        public List<SchemeCountModel> Count { get; set; } = null!;
        public List<SchemeCostModel> Cost { get; set; } = null!;
    }
}
