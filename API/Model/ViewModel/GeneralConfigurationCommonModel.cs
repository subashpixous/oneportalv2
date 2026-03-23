using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class GeneralConfigurationCommonModel
    {
        public List<string> RuralDistricts { get; set; } = new List<string>();
        public List<string> UrbanDistricts { get; set; } = new List<string>();
        public int ApplicationExpiryDays { get; set; }
        public List<string> MemberDocumentCategories { get; set; } = new List<string>();
        public List<string> MemberNonMandatoryDocumentCategories { get; set; } = new List<string>();
        public List<string> FamilyMemberMandatoryDocumentCategories { get; set; } = new List<string>();
        public List<string> FamilyMemberNonMandatoryDocumentCategories { get; set; } = new List<string>();
        public string CanSendPhysicalCard { get; set; } = string.Empty;
        public string QuickContactName { get; set; } = string.Empty;
        public string QuickContactPhone { get; set; } = string.Empty;
        public string QuickContactEmail { get; set; } = string.Empty;
    }
}
