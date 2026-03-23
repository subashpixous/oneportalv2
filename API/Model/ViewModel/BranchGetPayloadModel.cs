using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class BranchGetPayloadModel
    {
        public List<string> BankIds { get; set; } = null!;
        public List<string> DistrictIds { get; set; } = null!;
    }
}
