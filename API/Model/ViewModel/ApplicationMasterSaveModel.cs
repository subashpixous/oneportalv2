using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{//modified by Indu on 25-10-2025 for storing collected by details for scheme
    public class ApplicationMasterSaveModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string MemberId { get; set; } = string.Empty;
        public string FromStatusId { get; set; } = string.Empty; 
        public string ToStatusId { get; set; } = string.Empty;
        public string MemberName { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string ? AadharNumber { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;

        public string CollectedByName { get; set; } = string.Empty;
        public string CollectedByPhoneNumber { get; set; } = string.Empty;
        public string CollectedOn { get; set; } = string.Empty;
        public bool IsSubmit { get; set; }
        public MemberEligibilityModel SelectedMember { get; set; } = null!;

   
    }

    public class ApplicationSelectListModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty; 
        public string ApplicationNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;

    }
    public class ApplicationDetailsForSMS
    {
        public string Application_Id { get; set; }
        public string First_Name { get; set; }
        public string Last_Name { get; set; }
        public string Email { get; set; }
        public string District_Id { get; set; }
        public string Mobile_Number { get; set; }
        public string Scheme_Name_English { get; set; }
        public string Scheme_Name_Tamil { get; set; }

        public decimal Amount { get; set; }


    }
}
