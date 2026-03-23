using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class MemberDetailsFormModel
    {
        public List<SelectListItem>? Religion_SelectList { get; set; }
        public List<SelectListItem>? Community_SelectList { get; set; }
        public List<SelectListItem>? Caste_SelectList { get; set; }
        public List<SelectListItem>? Marital_Status_SelectList { get; set; }
        public List<SelectListItem>? Gender_SelectList { get; set; }
        public List<SelectListItem>? Education_SelectList { get; set; }
    }
}
