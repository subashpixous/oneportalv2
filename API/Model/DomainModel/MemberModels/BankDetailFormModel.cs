using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class BankDetailFormModel
    {
        public List<SelectListItem>? Bank_SelectList { get; set; }
        public List<SelectListItem>? Branch_SelectList { get; set; }
    }
}
