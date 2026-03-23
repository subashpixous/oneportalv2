using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class MemberIdCardInfoModel
    {
        public string Id { get; set; } = string.Empty;
        public string NameEnglish { get; set; } = string.Empty;
        public string NameTamil { get; set; } = string.Empty;
        public string FatherNameEnglish { get; set; } = string.Empty;
        public string FatherNameTamil { get; set; } = string.Empty;
        public string MemberId { get; set; } = string.Empty;
        public string DateOfBirth { get; set; } = string.Empty;
        public string DistrictEnglish { get; set; } = string.Empty;
        public string DistrictTamil { get; set; } = string.Empty;
        public string GenderEnglish { get; set; } = string.Empty;
        public string GenderTamil { get; set; } = string.Empty;
        public string TalukEnglish { get; set; } = string.Empty;
        public string TalukTamil { get; set; } = string.Empty;
        public string DoorNo { get; set; } = string.Empty;
        public string StreetName { get; set; } = string.Empty;
        public string VilllageTownCity { get; set; } = string.Empty; 
             public string StreetNameTamil { get; set; } = string.Empty;
        public string VilllageTownCityTamil { get; set; } = string.Empty;

        public string Pincode { get; set; } = string.Empty;
        public string Profile_Picture { get; set; } = string.Empty;
        public string CanSendPhysicalCard { get; set; } = string.Empty;
        public string NameOfLocalBody { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public List<FamilyMemberNameModel>? FamilyMember { get; set; }
    }

    public class FamilyMemberNameModel
    {
        public string NameEnglish { get; set; } = string.Empty;
        public string NameTamil { get; set; } = string.Empty;
    }
}
