using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class AddressDetailFormModel
    {
        public List<SelectListItem>? District_SelectList { get; set; }
        public List<SelectListItem>? Taluk_SelectList { get; set; }
        public List<SelectListItem>? Pincode_SelectList { get; set; }
    }
}
