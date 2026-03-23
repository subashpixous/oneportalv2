using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.Report
{
    public class ApplicationInfoReportModel
    {
        public string ApplicationId { get; set; } = string.Empty;
        public string ApplicationNumber { get; set; } = string.Empty;
        public string Scheme { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ProjectDistrict { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Rank { get; set; } = string.Empty;
        public string ServedInString { get; set; } = string.Empty;
        public string Dobb { get; set; } = string.Empty;
        public int Age { get; set; }
        public string DateOfEnrollment { get; set; } = string.Empty;
        public string DateOfDischarge { get; set; } = string.Empty;
        public string TotalYearsinService { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Religion { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string MaritalStatus { get; set; } = string.Empty;
        public string FathersName { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string DoorNo { get; set; } = string.Empty;
        public string StreetName { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Taluk { get; set; } = string.Empty;
        public string Village { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public string AadharNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string ActivityLane { get; set; } = string.Empty;
        public string VentureCategory { get; set; } = string.Empty;
        public decimal ProjectOutlayCost { get; set; }
        public decimal LandCost { get; set; }
        public string LandCostInWords { get; set; } = string.Empty;
        public decimal BuildingCost { get; set; }
        public decimal EquipmentCost { get; set; }
        public decimal WorkingCost { get; set; }
        public decimal PreopertaiveExpense { get; set; }
        public decimal OtherExpense { get; set; }
        public decimal TotalCost { get; set; }
        public string TotalCostInWords { get; set; } = string.Empty;
        public decimal SubsidyCost { get; set; }
        public decimal BeneficiaryCost { get; set; }
        public string IFSC { get; set; } = string.Empty;
        public string Bank { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string Modifiedby { get; set; } = string.Empty;
        public string ModifiedByUserName { get; set; } = string.Empty;
        public string Rank_String { get; set; } = string.Empty;
        public DateTime ModifiedDate { get; set; }

        public bool DeclarationAccepted { get; set; }
        public string ServiceNumber { get; set; } = string.Empty;
        public string TypeOfTraining { get; set; } = string.Empty;
        public string ActivityLaneOther { get; set; } = string.Empty;


        public bool IsReEmployed { get; set; }
        public bool IsNativeTamilNadu { get; set; }
        public string EmployementOthers { get; set; } = string.Empty;

        public string DependentName { get; set; } = string.Empty;
        public bool IsFirstEntrepreneur { get; set; }
        public bool IsSubmitted { get; set; }
        public bool IsSelf { get; set; }
        public DateTime? DependentDob { get; set; }
    }



    public class GCCReportModel
        {
        public string ZoneName { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public string Organization_Type { get; set; } = string.Empty;
        public string PrivateId { get; set; } = string.Empty;
        public string GovernmentId { get; set; } = string.Empty;
        public string GovernmentandPrivateId { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Private { get; set; } = string.Empty;
        public string Government { get; set; } = string.Empty;
        public string GovernmentandPrivate { get; set; } = string.Empty;
        public int Saved { get; set; }
        public int Submitted { get; set; }
        public int CardRejected { get; set; }
        public int ApprovedCount { get; set; }
        public int CardIssued { get; set; }
        public int CardtobeIssued { get; set; }
        public int Beneficiaries { get; set; }
        public int Total { get; set; }


        }
    public class ReportModel
    {
        public string District { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string PrivateId { get; set; } = string.Empty;
        public string GovernmentId { get; set; } = string.Empty;
        public string GovernmentandPrivateId { get; set; } = string.Empty;
        public string Private { get; set; } = string.Empty;
        public string Government { get; set; } = string.Empty;
        public string GovernmentandPrivate { get; set; } = string.Empty;
        public string Organization_Type { get; set; } = string.Empty;
        public int Saved { get; set; }
        public int Submitted { get; set; }
        public int ApprovedCount { get; set; }
        public int CardIssued { get; set; }
        public int CardtobeIssued { get; set; }

        public int CardRejected { get; set; }
        public int Total { get; set; }


    }
    public class CardReportModel
    {
        public string District { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public int CardIssued { get; set; }
        public int CardtobeIssued { get; set; }
        public int CardRejected { get; set; }
        public int Total { get; set; }
    }


    public class CoreSanitaryWorkersReportModel
    {
        public string District { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Core_Sanitary_Worker_Type { get; set; } = string.Empty;
        public int SanitaryWorkers { get; set; }
        public int STPFSTPMaintenance { get; set; }
        public int Multiple { get; set; }
        public int SepticTankDeSludging { get; set; }
        public int ToiletCleaning { get; set; }
        public int SewerMaintenance { get; set; }
        public int DrainCleaning { get; set; }
        public int OMWastewaterTreatment { get; set; }
        public string SanitaryWorkersId { get; set; }
        public string STPFSTPMaintenanceId { get; set; }
        public string MultipleId { get; set; }
        public string SepticTankDeSludgingId { get; set; }
        public string ToiletCleaningId { get; set; }
        public string SewerMaintenanceId { get; set; }
        public string DrainCleaningId { get; set; }
        public string OMWastewaterTreatmentId { get; set; }

    }
    public class ByBlockModel
    {
        public string District { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Block { get; set; } = string.Empty;
        public string Block_Id { get; set; } = string.Empty;
        public int Total { get; set; } 
        
    }
    public class ByVillagePanchayatModel
    {
        public string District { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Block { get; set; } = string.Empty;
        public string VillagePanchayat { get; set; } = string.Empty;
        public string Village_Panchayat_Id { get; set; } = string.Empty;
        public int Total { get; set; }

    }
    public class ByCorporationModel
    {
        public string District { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Corporation { get; set; } = string.Empty;
        public string Corporation_Id { get; set; } = string.Empty;
      
        public int Total { get; set; }

    }
    public class ByTownPanchayatModel
    {
        public string District { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string TownPanchayat { get; set; } = string.Empty;
      
        public int Total { get; set; }

    }
    public class ByMunicipalityModel
    {
        public string District { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Municipality { get; set; } = string.Empty;
        public string Municipality_Id { get; set; } = string.Empty;

        public int Total { get; set; }

    }

    public class MemberdetailedReportModel
    {
        public string District { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Member_id { get; set; } = string.Empty;
        public string Member_Guidid { get; set; } = string.Empty;
        public string Phone_Number { get; set; } = string.Empty;
        //public string Private { get; set; } = string.Empty;
        //public string Government { get; set; } = string.Empty;
        //public string GovernmentandPrivate { get; set; } = string.Empty;
        public string TownPanchayat { get; set; } = string.Empty;
        public string Municipality { get; set; } = string.Empty;
        public string Corporation { get; set; } = string.Empty;
        public string VillagePanchayat { get; set; } = string.Empty;
        public string Block { get; set; } = string.Empty;
        public string Organization_Type { get; set; } = string.Empty;
        public string Local_Body { get; set; } = string.Empty;
        public string CollectedByName { get; set; } = string.Empty;
        public string CollectedByPhoneNumber { get; set; } = string.Empty;
        

        //public int Saved { get; set; }
        //public int Submitted { get; set; }
        //public int ApprovedCount { get; set; }
         int CardIssued { get; set; }
        //public int CardtobeIssued { get; set; }

        public int CardRejected { get; set; }
        


    }
    public class CardCollectionModel
    {
        public string District { get; set; } = string.Empty;
        public string CollectedByPhoneNumber { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string CollectedByName { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        
        public int TotalMembers { get; set; }
        public int Saved { get; set; }
        public int Submitted { get; set; }
        public int DMApproved { get; set; }
        public int HQApproved { get; set; }

        
        public int CardRejected { get; set; }
        public int ApprovedCount { get; set; }
        public int CardIssued { get; set; }
        public int CardtobeIssued { get; set; }
      

    }

    public class PrintModuleReportModel
    {
        public string Member_Id { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public string ApprovalId { get; set; } = string.Empty;
        public string ApprovalRoleId { get; set; } = string.Empty;
        public string RequestId { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string NameinTamil { get; set; } = string.Empty;
        public string Phone_Number { get; set; } = string.Empty;
        public string Father_Name { get; set; } = string.Empty;
        public string Father_NameinTamil { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Date_Of_Birth { get; set; } = string.Empty;
        public string DistrictinTAMIL { get; set; } = string.Empty;
        public string Profile_Picture_url { get; set; } = string.Empty;
        public string ProfileImage { get; set; } = string.Empty;
       
        public string QRCodeURL { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string AddressinTamil { get; set; } = string.Empty;
        public string ZoneCode { get; set; } = string.Empty;
        public string ZoneinEnglish { get; set; } = string.Empty;
        public string ZoneinTamil { get; set; } = string.Empty;
        public string FamilyMembers { get; set; } = string.Empty;
        public string OrganizationType { get; set; } = string.Empty;
        public string LocalBody { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        public string ModifiedByUserName { get; set; } = string.Empty;
        public DateTime ModifiedDate { get; set; }
  }
    public class TranslateRequest
    {
        public string[] Texts { get; set; }
        public string TargetLanguage { get; set; } = "ta";
    }
    public class DownloadedFileModel
    {
        
        public IFormFile File { get; set; } = null!;
    }
    public class MemberApplySchemeCountModel
    {
        public string District { get; set; } = string.Empty;
        public string SchemeName { get; set; } = string.Empty;
        public int Total { get; set; }
        public int Saved { get; set; }
        public int Submitted { get; set; }
        public int DMApproved { get; set; }
        public int HQApproved { get; set; }
    }
    public class SchemeGCCReportModel
    {
        public string Zone { get; set; } = string.Empty;
        public string SchemeName { get; set; } = string.Empty;
        public int Total { get; set; }
        public int Saved { get; set; }
        public int Submitted { get; set; }
        public int DMApproved { get; set; }
        public int HQApproved { get; set; }
    }

    public class SchemeCostReportModel
    {
        public string District { get; set; } = string.Empty;
        public string SchemeName { get; set; } = string.Empty;
        //public string Category { get; set; } = string.Empty;
        //public string Community { get; set; } = string.Empty;
        public int TotalAppliedAmount { get; set; }
        public int TotalPaidAmount { get; set; }
        public int PendingAmount { get; set; }

    }
}
