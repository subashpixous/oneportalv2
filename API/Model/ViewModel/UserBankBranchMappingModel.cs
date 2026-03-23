using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class UserBankBranchMappingModel
    {
        public string UserId { get; set; } = string.Empty;
        public List<UserBankBranch> BankBranch { get; set; } = null!;
    }

    public class UserBankBranch
    {
        public string BankName { get; set; } = string.Empty;
        public string BankId { get; set; } = string.Empty;
        public bool IsAllBranch { get; set; }
        public List<string> SelectedBranchIds { get; set; } = null!;
        public List<SelectListItem>? BranchList { get; set; }
        public int? TotalBranchCount { get; set; }
        public int? SelectedBranchCount { get; set; }
    }


    public class UserBankModel
    {
        public string UserId { get; set; } = string.Empty;
        public List<string> BankIds { get; set; } = null!;
        public List<string> DistrictIds { get; set; } = null!;
    }

    public class UserBankBranchMappingSavedModel
    {
        public string UserId { get; set; } = string.Empty;
        public string BankId { get; set; } = string.Empty;
        public string BranchIds { get; set; } = string.Empty;
        public bool IsAllBranch { get; set; }
    }

    public class BankBranchMappingSavedModel
    {
        public List<ConfigurationModel> BankList { get; set; } = null!;
        public List<ConfigurationModel> BranchList { get; set; } = null!;
        public List<UserBankBranchMappingSavedModel> Mappings { get; set; } = null!;
    }


}
