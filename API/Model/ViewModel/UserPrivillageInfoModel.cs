using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class UserPrivillageInfoModel
    {
        public string UserId { get; set; } = string.Empty;
        public string RoleId { get; set; } = string.Empty;
        public List<string>? DistrictIdList { get; set; }
        public List<string>? BankIdList { get; set; }
        public List<string>? BranchIdList { get; set; }
        public List<string>? SchemeIdList { get; set; }
    }
}
