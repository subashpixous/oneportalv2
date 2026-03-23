using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class SchemeEligibilityModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public string SchemeName { get; set; } = string.Empty;
        public bool IsApplicable { get; set; }
        public List<ExistApplicationIdModel>? ExistApplications { get; set; }
    }
}
