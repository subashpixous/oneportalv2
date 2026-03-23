using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{


    public class MemberGridViewModel

    {

        public string Id { get; set; } = string.Empty;

        public string Member_Id { get; set; } = string.Empty;

        public string District { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string MemberFirstName { get; set; } = string.Empty;

        public string MemberLastName { get; set; } = string.Empty;

        public string MemberFatherOrHusbandName { get; set; } = string.Empty;

        public string MemberBirthday { get; set; } = string.Empty;

        public string Gender { get; set; } = string.Empty;

        public string Religion { get; set; } = string.Empty;

        public string MemberCommunity { get; set; } = string.Empty;

        public string Caste { get; set; } = string.Empty;

        public string MemberMaritalStatus { get; set; } = string.Empty;

        public string MemberAadhaarNumber { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string MemberRationCardNumber { get; set; } = string.Empty;

        public string MemberProfileImage { get; set; } = string.Empty;

        public string IsApprovalPending { get; set; } = string.Empty;
        public string IsApprovalCompleted { get; set; } = string.Empty;

        public string ChangedDetailRecord { get; set; } = string.Empty;

        public string DataApprovalId { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string ApprovedByRole { get; set; } = string.Empty;
        public string IsApproved { get; set; } = string.Empty;

        public string DMApproved { get; set; } = string.Empty;

        public string HQApproved { get; set; } = string.Empty;

        public string IsRejected { get; set; } = string.Empty;

        public string CardStatus { get; set; } = string.Empty;
        public string CardDisbursedStatus { get; set; } = string.Empty;
        public string OrganizationId { get; set; } = string.Empty;

        public string OrganizationType { get; set; } = string.Empty;

        public string GovernmentOrganisationName { get; set; } = string.Empty;

        public string GovernmentDesignation { get; set; } = string.Empty;

        public string GovernmentNatureOfJob { get; set; } = string.Empty;

        public string GovernmentAddress { get; set; } = string.Empty;

        public string PrivateOrganisationName { get; set; } = string.Empty;

        public string PrivateDesignation { get; set; } = string.Empty;

        public string PrivateAddress { get; set; } = string.Empty;

        public string LocalBody { get; set; } = string.Empty;

        public string Block { get; set; } = string.Empty;

        public string VillagePanchayat { get; set; } = string.Empty;

        public string NameOfLocalBody { get; set; } = string.Empty;

        public string Corporation { get; set; } = string.Empty;

        public string Municipality { get; set; } = string.Empty;

        public string TownPanchayat { get; set; } = string.Empty;

        public string Zone { get; set; } = string.Empty;

        public string TypeofWork { get; set; } = string.Empty;

        public string NewYellowCardNumber { get; set; } = string.Empty;

        public string HealthId { get; set; } = string.Empty;

        public string PermanentAddress { get; set; } = string.Empty;

        public string TemporaryAddress { get; set; } = string.Empty;
        public string MLA_Constituency { get; set; } = string.Empty;
        public string MP_Constituency { get; set; } = string.Empty;
        public string Employer_Type { get; set; } = string.Empty;
        public string Work_Office { get; set; } = string.Empty;

        public string CollectedByName { get; set; } = string.Empty;

        public string CollectedByPhoneNumber { get; set; } = string.Empty;

        public string CollectedOn { get; set; } = string.Empty;

        public string UpdatedBy { get; set; } = string.Empty;

        public string UpdatedByUserName { get; set; } = string.Empty;

        public DateTime UpdatedDate { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public string CreatedByUserName { get; set; } = string.Empty;

        public string CreatedDate { get; set; } = string.Empty;

        public string DeletedBy { get; set; } = string.Empty;

        public string DeletedByUserName { get; set; } = string.Empty;

        public string DeletedDate { get; set; } = string.Empty;

        public bool IsSubmitted { get; set; }

        public bool IsAbleToCancelRequest { get; set; }

        public bool CanEdit { get; set; }
        public bool CanApprove { get; set; }
        public string Remarks { get; set; } = string.Empty;

        public string DistrictId { get; set; } = string.Empty;
        public string CardStatusId { get; set; } = string.Empty;
        public string OrganizationTypeId { get; set; } = string.Empty;
        public string BlockId { get; set; } = string.Empty;
        public string ZoneId { get; set; } = string.Empty;
        public bool AadhaarVerified { get; set; }
        public bool PdsVerified { get; set; }
        public string MLA_ConstituencyId { get; set; } = string.Empty;
        public string MP_ConstituencyId { get; set; } = string.Empty;
        public string Employer_TypeId { get; set; } = string.Empty;
        public string Work_OfficeId { get; set; } = string.Empty;
        public string TypeofWorkId { get; set; } = string.Empty;
        public string NextApprovalRole { get; set; } = string.Empty;

    }




    public class DatewiseApprovalModel

    {

       
        public string Member_Id { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;

        public string District { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

  

        public string MemberAadhaarNumber { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;



        public string Status { get; set; } = string.Empty;

        public string ApprovedBy { get; set; } = string.Empty;
        public string Approved_For { get; set; } = string.Empty;
        public string ApprovedDate { get; set; } = string.Empty;



      
        public string LocalBody { get; set; } = string.Empty;
        public string Type_of_Work { get; set; } = string.Empty;
        public string OrganizationType { get; set; } = string.Empty;

        public string NameOfLocalBody { get; set; } = string.Empty;
        public string CollectedByName { get; set; } = string.Empty;

        public string CollectedByPhoneNumber { get; set; } = string.Empty;

        public string CollectedOn { get; set; } = string.Empty;


        public string CreatedBy { get; set; } = string.Empty;

        public string CreatedByUserName { get; set; } = string.Empty;

        public string CreatedDate { get; set; } = string.Empty;

        
       

    }


               //modified by Sivasankar K on 20-12-2025 for viewing datewise approved report


    public class FamilyMemberApprovalModel
    {
        public string Name { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;

        public string Organization_Type { get; set; } = string.Empty;
        public string MaritalStatus { get; set; } = string.Empty;

        public string Occupation { get; set; } = string.Empty;

        public string Mem_Education { get; set; } = string.Empty;



        public string Mem_CreatedDate { get; set; } = string.Empty;


        public string LocalBody { get; set; } = string.Empty;

        public string BlockName { get; set; } = string.Empty;

        public string NameOfLocalBody { get; set; } = string.Empty;

        public string Community { get; set; } = string.Empty;
        public string Village { get; set; } = string.Empty;

        public string LocalBodyDetails { get; set; } = string.Empty;

        public string HomeAddress { get; set; } = string.Empty;
        public string WorkAddress { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;
        public string Aadhaar_Number { get; set; } = string.Empty;

        public string Mem_AadharNumber { get; set; } = string.Empty;

        public string RationCardNumber { get; set; } = string.Empty;

        public string FamilyMemberName { get; set; } = string.Empty;
        public string DistrictName { get; set; } = string.Empty;
        public string RelationType { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;

        public string Age { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string CurrentEducationStatus { get; set; } = string.Empty;
        public string Course { get; set; } = string.Empty;
        public string Standard { get; set; } = string.Empty;
        public string Degree_Name { get; set; } = string.Empty;


        public string Date_Of_Birth { get; set; } = string.Empty;

        public string EMIS_No { get; set; } = string.Empty;
        public string School_Address { get; set; } = string.Empty;

        public string FamilyMemberOccupation { get; set; } = string.Empty;
        public string Disability { get; set; } = string.Empty;

        public string Year_Of_Completion { get; set; } = string.Empty;
        public DateTime? FamilyMemberCreatedDate { get; set; }

        public string CardStatus { get; set; } = string.Empty;

        public string Scheme { get; set; } = string.Empty;

        public string SchemeId { get; set; } = string.Empty;

        public string StatusValue { get; set; } = string.Empty;

        public string SchemeCode { get; set; } = string.Empty;

        public string StatusCode { get; set; } = string.Empty;

        public string? OrganizationTypeId { get; set; }
        public string? DistrictId { get; set; }
        public string? RelationTypeId { get; set; }
        public string? GenderId { get; set; }
        public string? FamilyOccupationId { get; set; }
        public string? DisabilityId { get; set; }
        public string? MaritalStatusId { get; set; }
        public string? CommunityId { get; set; }
        public string? BlockId { get; set; }
        public string? ZoneId { get; set; }
        public string? CourseId { get; set; }
        public string? EducationId { get; set; }

        //public string? SchemeId { get; set; }

        public string? Status { get; set; }
        public string? StatusId { get; set; }


    }







    public class DepartmentWiseApprovalModel
    {
        public string DistrictName { get; set; } = string.Empty;

        public int CSW { get; set; }
        public int CW { get; set; }
        public int MW { get; set; }
        public int RP { get; set; }
        public int Others { get; set; }

        public int Total_Count { get; set; }
    }

    public class GetDatewiseProgressiveReportModel
    {
        public string DistrictName { get; set; } = string.Empty;

        public int Year_1 { get; set; }
        public int Year_2 { get; set; }
        public int Year_3 { get; set; }
    }






    public class MemberGridFilterModel
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string IsApprovalPending { get; set; } = string.Empty;
        public bool IsAbleToCancelRequest { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public DateTime UpdatedDate { get; set; }
    }



    public class MemberReportModel
    {
        public string Member_Id { get; set; } = string.Empty;
        public string Member_IdString { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;

        public string District { get; set; } = string.Empty;
        public string District_Id_String { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;
        public string Member_Name { get; set; } = string.Empty;



        public string MemberAadhaarNumber { get; set; } = string.Empty;

        public string Phone_Number { get; set; } = string.Empty;
        public string Aadhaar_Number { get; set; } = string.Empty;



        public string Status { get; set; } = string.Empty;

        public string Local_Body { get; set; } = string.Empty;
        public string Type_of_Work { get; set; } = string.Empty;
        public string Type_of_Work_String { get; set; } = string.Empty;
        public string OrganizationType { get; set; } = string.Empty;
        public string Organization_Type_String { get; set; } = string.Empty;

        public string Name_of_Local_Body { get; set; } = string.Empty;
        public string CollectedByName { get; set; } = string.Empty;

        public string CollectedByPhoneNumber { get; set; } = string.Empty;

        public string CollectedOn { get; set; } = string.Empty;


        public string CreatedBy { get; set; } = string.Empty;

        public string CreatedByUserName { get; set; } = string.Empty;

        public string CreatedDate { get; set; } = string.Empty;
    }



    public class WorkTypeReportModel
    {
        public string WorkType { get; set; } = "";

        public int SC { get; set; }
        public int ST { get; set; }
        public int BC { get; set; }
        public int BCM { get; set; }
        public int MBC { get; set; }
        public int General { get; set; }

        public int Total { get; set; }
    }
    public class LocalBodyCountModel
    {
        public string LocalBody { get; set; } = "";
        public int MemberCount { get; set; }
    }
    public class LocalBodyTypeReportModel
    {
        public string LocalBodyType { get; set; } = "";
        public int MemberCount { get; set; }
    }
    public class MemberReportResponseModel
    {
        public List<WorkTypeReportModel> WorkTypeReport { get; set; } 
        public List<LocalBodyCountModel> LocalBodyCounts { get; set; } 
        public List<LocalBodyTypeReportModel> LocalBodyTypeReport { get; set; }
    }
}
