using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ConfigurationBranchDropdownModel
    {
        public string BranchId {  get; set; } = string.Empty;
        public string Branch {  get; set; } = string.Empty;
        public string BankId {  get; set; } = string.Empty;
        public string Bank {  get; set; } = string.Empty;
        public string IFSCCode {  get; set; } = string.Empty;
        public string District {  get; set; } = string.Empty;
    }

    public class ConfigurationBankBranchGroupViewModel
    {
        public string Value { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public List<BranchModel> Items { get; set; } = new List<BranchModel>();
    }

    public class BranchModel
    {
        public string Value { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }
}
