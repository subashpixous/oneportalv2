using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class FamilyMemberImportModel
    {
        public string MemberAadhar { get; set; } = string.Empty;
        public string ApprovedMemberId { get; set; } = string.Empty;
        public string FamilyMember_Aadhar { get; set; } = string.Empty;
        public string FamilyMemberName { get; set; } = string.Empty;
        public string FamilyMemberRelation { get; set; } = string.Empty;
        public string FamilyMemberGender { get; set; } = string.Empty;
        public string FamilyMemberAge { get; set; } = string.Empty;
        public string FamilyMemberEducation { get; set; } = string.Empty;
        public string FamilyMemberCourse { get; set; } = string.Empty;
        public string Standard_Or_Degreename { get; set; } = string.Empty;
        public string EmisOrUmisNo { get; set; } = string.Empty;

        public string SchoolOrCollegeDistrict { get; set; } = string.Empty;
        public string SchoolOrCollegeName { get; set; } = string.Empty;
        public string SchoolOrCollegeAddress { get; set; } = string.Empty;

        public string CurrentStatus { get; set; } = string.Empty;
        public string YearOfCompletion { get; set; } = string.Empty;

        public string Disability { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;

        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedByUserName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public string BatchId { get; set; } = string.Empty;

    }

}
