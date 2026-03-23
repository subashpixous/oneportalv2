using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class UserBankBranchForFilterModel
    {
        public string BankIds {  get; set; } = string.Empty;
        public string BranchIds {  get; set; } = string.Empty;
        public string DistrictIds {  get; set; } = string.Empty;
        public string SchemesIds {  get; set; } = string.Empty;
    }
}
