using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.CardApprpvalModels
{
    public class MemberCardApprovalFilterModel
    {
        public List<SelectListItem> DistrictList { get; set; } = new List<SelectListItem>();
        public List<SelectListItem> StatusList { get; set; } = new List<SelectListItem>();
    }
}
