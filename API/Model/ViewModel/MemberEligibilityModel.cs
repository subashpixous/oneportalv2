using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class MemberEligibilityModel
    {
        public string Id {  get; set; } = string.Empty;
        public string Name {  get; set; } = string.Empty;
        public string Relation {  get; set; } = string.Empty;
        public bool IsFamilyMember {  get; set; }
        public bool ShowApplyOption {  get; set; }
        public ExistApplicationIdModel? ExistApplication { get; set; }
    }
}
