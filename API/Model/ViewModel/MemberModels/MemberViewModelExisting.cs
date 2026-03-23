using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.MemberModels
{
    public class MemberViewModelExisting
    {
        public OrganizationalViewModelExisting OrganizationalDetail { get; set; } = null!;
        public MemberDetailsViewModelExisting MemberDetail { get; set; } = null!;
        public AddressViewModelExisting PermanentAddress { get; set; } = null!;
        public AddressViewModelExisting TemproraryAddress { get; set; } = null!;
        public List<FamilyMemberViewModelExisting> FamilyMembers { get; set; } = null!;
        public List<FamilyMemberEducation> FamilyMembersWithEducation { get; set; } = null!;
        public BankViewModelExisting BankDetails { get; set; } = null!;
        public List<MemberDocumentMasterModelExisting> MemberDocuments { get; set; } = null!;
        public List<MemberDocumentMasterModelExisting> MemberNonMandatoryDocuments { get; set; } = null!;
    }

    public class MemberDiffViewModel
    {
        public OrganizationalViewModelExisting OrganizationalDetail { get; set; } = null!;
        public OrganizationalViewModelExisting OrganizationalDetail_Temp { get; set; } = null!;

        public MemberDetailsViewModelExisting MemberDetail { get; set; } = null!;
        public MemberDetailsViewModelExisting MemberDetail_Temp { get; set; } = null!;

        public AddressViewModelExisting PermanentAddress { get; set; } = null!;
        public AddressViewModelExisting PermanentAddress_Temp { get; set; } = null!;

        public AddressViewModelExisting TemproraryAddress { get; set; } = null!;
        public AddressViewModelExisting TemproraryAddress_Temp { get; set; } = null!;

        public List<FamilyMemberViewModelExisting> FamilyMembers { get; set; } = null!;
        public List<FamilyMemberViewModelExisting> FamilyMembers_Temp { get; set; } = null!;

        public List<FamilyMemberEducation> FamilyMembersWithEducation { get; set; } = null!;
        public List<FamilyMemberEducation> FamilyMembersWithEducation_Temp { get; set; } = null!;

        public BankViewModelExisting BankDetails { get; set; } = null!;
        public BankViewModelExisting BankDetails_Temp { get; set; } = null!;

        public List<MemberDocumentMasterModelExisting> MemberDocuments { get; set; } = null!;
        public List<MemberDocumentMasterModelExisting> MemberDocuments_Temp { get; set; } = null!;

        public List<MemberDocumentMasterModelExisting> MemberNonMandatoryDocuments { get; set; } = null!;
        public List<MemberDocumentMasterModelExisting> MemberNonMandatoryDocuments_Temp { get; set; } = null!;
    }

    public class MemberDocumentMasterModelExisting
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string DocumentCategory { get; set; } = string.Empty;
        public string AcceptedDocumentType { get; set; } = string.Empty;
        public string DocumentCategoryId { get; set; } = string.Empty;
        public string AcceptedDocumentTypeId { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<SelectListItem>? AcceptedDocumentTypeSelectList { get; set; }
        public bool IsApprovalPending { get; set; }
        public bool IsAbleToCancelRequest { get; set; }
        public bool IsTemp { get; set; }
    }


    public class OrganizationalViewModelExisting
    {
        public string TypeOfWork { get; set; } = string.Empty;
        public string TypeOfCoreSanitoryWorker { get; set; } = string.Empty;
        // Updated By Sivasankar K on 14/01/2026 for Health Worker 
        public string HealthWorkerType { get; set; } = string.Empty;
        public string OrganizationType { get; set; } = string.Empty;
        public string NatureOfJob { get; set; } = string.Empty;
        public string DistritName { get; set; } = string.Empty;
        public string LocalBody { get; set; } = string.Empty;
        public string Block { get; set; } = string.Empty;
        public string VillagePanchayat { get; set; } = string.Empty;
        public string NameoftheLocalBody { get; set; } = string.Empty;
        public string Corporation { get; set; } = string.Empty;
        public string Municipality { get; set; } = string.Empty;
        public string TownPanchayat { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public bool IsTemp { get; set; }

        public string HealthId { get; set; } = string.Empty;
        public string YellowCardNumber { get; set; } = string.Empty;
        public string WorkOrganisationName { get; set; } = string.Empty;
        public string WorkDesignation { get; set; } = string.Empty;
        public string WorkAddress { get; set; } = string.Empty;
        public string MLAConstituency { get; set; } = string.Empty;
        public string MPConstituency { get; set; } = string.Empty;
        public string workOffice { get; set; } = string.Empty;
        public string employer_type { get; set; } = string.Empty;
        public string Private_Organisation_Name { get; set; } = string.Empty;

        public string Private_Designation { get; set; } = string.Empty;

        public string Private_Address { get; set; } = string.Empty;
    }
    public class MemberDetailsViewModelExisting
    {
        public string ProfileImageName { get; set; } = string.Empty;
        public string Profile_Picture { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string Caste { get; set; } = string.Empty;
        public string Caste_String { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FathersName { get; set; } = string.Empty;
        public string MaritalStatus { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string RationCard { get; set; } = string.Empty;
        public string AadharNumber { get; set; } = string.Empty;
        public string DOB { get; set; } = string.Empty;
        public bool IsAlreadyMember { get; set; }
        public string MemberId { get; set; } = string.Empty;
        public string HealthId { get; set; } = string.Empty;
        public string YellowCardNumber { get; set; } = string.Empty;
        public string WorkOrganisationName { get; set; } = string.Empty;
        public string WorkDesignation { get; set; } = string.Empty;
        public string WorkAddress { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public bool IsTemp { get; set; }
        public bool IsSubmitted { get; set; }
        public bool IsNewMember { get; set; }
        public string? CollectedByName { get; set; } = string.Empty;
        public string? CollectedByPhoneNumber { get; set; } = string.Empty;
        public string? CollectedOn { get; set; } = string.Empty;
    }
    public class AddressViewModelExisting
    {
        public string DoorNo { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string StreetName { get; set; } = string.Empty;
        public string TalukName { get; set; } = string.Empty;
        public string VillageorCity { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public bool IsTemp { get; set; }
    }
    public class FamilyMemberViewModelExisting
    {
        public string Name { get; set; } = string.Empty;
        public string RelationShip { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Age { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string AadharNumber { get; set; } = string.Empty;
        public string phone_number { get; set; } = string.Empty;
        public EduDetailSchoolViewModelExisting School { get; set; } = null!;
        public EduDetailCollegeViewModelExisting College { get; set; } = null!;
        public string Occupation { get; set; } = string.Empty;
        public string DifferentlyAbled { get; set; } = string.Empty;
        public bool IsTemp { get; set; }
        public string date_of_birth { get; set; } = string.Empty;
        public List<MemberDocumentMasterModelExisting> MandatoryDocuments { get; set; } = null!;
        public List<MemberDocumentMasterModelExisting> NonMandatoryDocuments { get; set; } = null!;
    }
    public class EduDetailSchoolViewModelExisting
    {
        public string Standard { get; set; } = string.Empty;
        public string School_Name { get; set; } = string.Empty;
        public string School_Address { get; set; } = string.Empty;
        public string EducationalStatus { get; set; } = string.Empty;
        public string EMISNo { get; set; } = string.Empty;
        public string CompletedYear { get; set; } = string.Empty;
        public string DiscontinuedYear { get; set; } = string.Empty;
        public string NameandAddressofSchool { get; set; } = string.Empty;
        public bool IsTemp { get; set; }
    }
    public class EduDetailCollegeViewModelExisting
    {
        public string Course { get; set; } = string.Empty;
        public string DegreName { get; set; } = string.Empty;
        public string College_Name { get; set; } = string.Empty;
        public string College_Address { get; set; } = string.Empty;
        public string EducationalStatus { get; set; } = string.Empty;
        public string EducationalYear { get; set; } = string.Empty;
        public string CompletedYear { get; set; } = string.Empty;
        public string DiscontinuedYear { get; set; } = string.Empty;
        public string NameandAddressofCollege { get; set; } = string.Empty;
        public bool IsTemp { get; set; }
    }
    public class BankViewModelExisting
    {
        public string AccountHolderName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string IFSC { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public bool IsTemp { get; set; }
    }

    public class FamilyMemberEducation
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string RelationShip { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Age { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;
        public string DifferentlyAbled { get; set; } = string.Empty;
        public string AadharNumber { get; set; } = string.Empty;
        public string phone_number { get; set; } = string.Empty;

        public string Standard { get; set; } = string.Empty;
        public string EducationalStatus { get; set; } = string.Empty;
        public string EMISNo { get; set; } = string.Empty;
        public string CompletedYear { get; set; } = string.Empty;
        public string DiscontinuedYear { get; set; } = string.Empty;
        public string NameandAddressofSchool { get; set; } = string.Empty;

        public string Course { get; set; } = string.Empty;
        public string College_Name { get; set; } = string.Empty;
        public string School_Name { get; set; } = string.Empty;
        public string School_Address { get; set; } = string.Empty;
        public string College_Address { get; set; } = string.Empty;
        public string DegreName { get; set; } = string.Empty;
        public string EducationalYear { get; set; } = string.Empty;
        public string NameandAddressofCollege { get; set; } = string.Empty;

        public bool IsTemp { get; set; }
        public bool ActiveApplicationExist { get; set; }
        public string date_of_birth { get; set; } = string.Empty;

        public List<MemberDocumentMasterModelExisting> MandatoryDocuments { get; set; } = null!;
        public List<MemberDocumentMasterModelExisting> NonMandatoryDocuments { get; set; } = null!;
    }
}
