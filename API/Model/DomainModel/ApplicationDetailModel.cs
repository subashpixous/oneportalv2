using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationDetailModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
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
        public string Mobile { get; set; } = string.Empty;
        public bool IsMobileValidated { get; set; }

        public string AccountNumber { get; set; } = string.Empty;
        public string IFSC { get; set; } = string.Empty;
        public string Bank { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;


        public string ActivityLane { get; set; } = string.Empty;
        public string VentureCategory { get; set; } = string.Empty;
        public string DoorNo { get; set; } = string.Empty;
        public string StreetName { get; set; } = string.Empty;
        public string VilllageTownCity { get; set; } = string.Empty;
        public string LocalBody { get; set; } = string.Empty;
        public string NameoflocalBody { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Taluk { get; set; } = string.Empty;
        public string Block { get; set; } = string.Empty;
        public string Corporation { get; set; } = string.Empty;
        public string Municipality { get; set; } = string.Empty;
        public string TownPanchayat { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public decimal ProjectOutlayCost { get; set; }
        public decimal LandCost { get; set; }
        public decimal BuildingCost { get; set; }
        public decimal EquipmentCost { get; set; }
        public decimal WorkingCost { get; set; }
        public decimal PreopertaiveExpense { get; set; }
        public decimal OtherExpense { get; set; }
        public decimal TotalCost { get; set; }



        public string ProjectDistrict { get; set; } = string.Empty;
        public decimal SubsidyCost { get; set; }
        public decimal BeneficiaryCost { get; set; }
        public decimal LoanCost { get; set; }
        public decimal SubsidyPercentage_Config { get; set; }
        public decimal SubsidyCost_Config { get; set; }



        public string Resident_doorNo { get; set; } = string.Empty;
        public string Resident_streetName { get; set; } = string.Empty;
        public string Resident_district { get; set; } = string.Empty;
        public string Resident_taluk { get; set; } = string.Empty;
        public string Resident_village { get; set; } = string.Empty;
        public string Resident_pincode { get; set; } = string.Empty;
        public bool IsCorrespondenceSameAsResident { get; set; }
        public string Correspondence_doorNo { get; set; } = string.Empty;
        public string Correspondence_streetName { get; set; } = string.Empty;
        public string Correspondence_district { get; set; } = string.Empty;
        public string Correspondence_taluk { get; set; } = string.Empty;
        public string Correspondence_village { get; set; } = string.Empty;
        public string Correspondence_pincode { get; set; } = string.Empty;
        public string AadharNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool ResidinginSameArea { get; set; }
        public bool IsTrainingUndergone { get; set; }
        public string InstitutionName { get; set; } = string.Empty;
        public DateTime? TrainingDurationFrom { get; set; }
        public DateTime? TrainingDurationTo { get; set; }
        public bool IsEmployed { get; set; }
        public string EmploymentDetails { get; set; } = string.Empty;
        public bool IsRegistered { get; set; }
        public string RegistrationNo { get; set; } = string.Empty;
        public DateTime? RegistrationDate { get; set; }
        public bool HasPreviousExp { get; set; }
        public string PreviousExperience { get; set; } = string.Empty;
    }
}
