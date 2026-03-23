using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationGeneralDetailModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public bool IsMobileValidated { get; set; }
        public string Rank { get; set; } = string.Empty;
        public string ServedIn { get; set; } = string.Empty;
        public DateTime? DateOfEnrollment { get; set; }
        public DateTime? DateOfDischarge { get; set; }
        public decimal TotalYearsinService { get; set; }
        public bool IsSelf { get; set; }
        public string IdCardNo { get; set; } = string.Empty;
        public string PpoNo { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string Religion { get; set; } = string.Empty;
        public string MaritalStatus { get; set; } = string.Empty;
        public DateTime? Dob { get; set; }
        public string FathersName { get; set; } = string.Empty;
        public string DependentId { get; set; } = string.Empty;
        public string ProjectDistrict { get; set; } = string.Empty;
        public bool IsSubmit { get; set; }
        public bool DeclarationAccepted { get; set; }
        public string ServiceNumber { get; set; } = string.Empty;

        public bool IsNativeTamilNadu { get; set; }
        public string DependentName { get; set; } = string.Empty;
        public bool IsFirstEntrepreneur { get; set; }

        public DateTime? DependentDob { get; set; }
    }
}
