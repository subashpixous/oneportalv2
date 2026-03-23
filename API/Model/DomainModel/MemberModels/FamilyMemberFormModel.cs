using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class FamilyMemberFormModel
    {
        public List<SelectListItem>? Family_Member_SelectList { get; set; }
        public List<SelectListItem>? Gender_SelectList { get; set; }
        public List<SelectListItem>? Education_SelectList { get; set; }
        public List<SelectListItem>? Occupation_SelectList { get; set; }
        public List<SelectListItem>? Disability_SelectList { get; set; }

        public List<SelectListItem>? Education_2_SelectList { get; set; }
        public List<SelectListItem>? Education_Status_SelectList { get; set; }
        public List<SelectListItem>? Education_Year_SelectList { get; set; }
        public List<SelectListItem>? Education_Standard_SelectList { get; set; }
        public List<SelectListItem>? District_SelectList { get; set; }
    }
}
