using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.Report
{
    public class DistrictWiseCountCost
    {
        public List<DistrictWiseCount>? Count { get; set; }
        public List<DistrictWiseCost>? Cost { get; set; }
    }
    public class DistrictWiseCount
    {
        public string DistrictName {  get; set; } = string.Empty;
        public int Count {  get; set; }
    }
    public class DistrictWiseCost
    {
        public string DistrictName { get; set; } = string.Empty;
        public decimal Cost { get; set; }
    }
}
