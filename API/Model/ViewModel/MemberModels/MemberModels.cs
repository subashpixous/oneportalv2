
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Newtonsoft.Json;

namespace Model.ViewModel.MemberModels
{
    public class BankDetails
    {
        public string Account_Holder_Name { get; set; } = string.Empty;
        public string Account_Number { get; set; } = string.Empty;
        public string IFSC_Code { get; set; } = string.Empty;
        public string Bank_Name { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
    }
    public class Datum
    {
        public MemberDetails? member_details { get; set; }
        public OrganizationInfo? organization_info { get; set; }
        public WorkAddress? work_address { get; set; }
        public PermanentAddress? permanent_address { get; set; }
        public TemporaryAddress? temporary_address { get; set; }
        public BankDetails? bank_details { get; set; }
        public List<Documents>? documents { get; set; }
        public List<FamilyMember>? family_members { get; set; }

        public DataCollectedBy data_Collectedby { get; set; }
    }
    public class District
    {
        public string id { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
        public string code { get; set; } = string.Empty;
    }
    public class Documents
    {
        public string Category_id { get; set; } = string.Empty;
        public string Accepted_id { get; set; } = string.Empty;
        public string Card_File { get; set; } = string.Empty;
        public string Doc_Name { get; set; } = string.Empty;
    }
    public class FamilyMember
    {
        public string f_id { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
        public string phone_number { get; set; } = string.Empty;
        public string relation { get; set; } = string.Empty;
        public string sex { get; set; } = string.Empty;
        public string age { get; set; } = string.Empty;
        public string education { get; set; } = string.Empty;
        public string Standard { get; set; } = string.Empty;
        public string School_Status { get; set; } = string.Empty;
        public string EMIS_No { get; set; } = string.Empty;
        public string School_Address { get; set; } = string.Empty;
        public string Course { get; set; } = string.Empty;
        public string Degree_Name { get; set; } = string.Empty;
        public string College_Status { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Year_Of_Completion { get; set; } = string.Empty;
        public string College_Address { get; set; } = string.Empty;
        public string occupation { get; set; } = string.Empty;
        public string disability { get; set; } = string.Empty;
        public string status { get; set; } = string.Empty;
    }
    public class MemberDetails
    {
        public string Id { get; set; } = string.Empty;
        public string Member_ID { get; set; } = string.Empty;
        public string First_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
        public string Father_Name { get; set; } = string.Empty;
        public string Date_Of_Birth { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Religion { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string Marital_Status { get; set; } = string.Empty;
        public string Aadhaar_Number { get; set; } = string.Empty;
        public string Phone_Number { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string Profile_Picture { get; set; } = string.Empty;
        public string DM_Status { get; set; } = string.Empty;
        public string HQ_Status { get; set; } = string.Empty;
        public string Id_Card_Status { get; set; } = string.Empty;
        public string IS_Approved { get; set; } = string.Empty;
        public bool pIsCompleted { get; set; }
        public string pStatus { get; set; }
    }
    public class OfficeDistrict
    {
        public string id { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
    }
    public class OrganizationInfo
    {
        public string Type_of_Work { get; set; } = string.Empty;
        public string Core_Sanitary_Worker_Type { get; set; } = string.Empty;
        public string Organization_Type { get; set; } = string.Empty;
        public string Nature_of_Job { get; set; } = string.Empty;
        public string Local_Body { get; set; } = string.Empty;
        //[JsonProperty("Name_of_Local Body")]
        public string Name_of_Local_Body { get; set; } = string.Empty;
        public string Already_a_Member_of_CWWB { get; set; } = string.Empty;
        public string Private_Organisation_Name { get; set; } = string.Empty;
        public string Private_Designation { get; set; } = string.Empty;
        public string Private_Address { get; set; } = string.Empty;
        public string Block { get; set; } = string.Empty;
        public string Village_Panchayat { get; set; } = string.Empty;
        public string Corporation { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public string Municipality { get; set; } = string.Empty;
        public string Town_Panchayat { get; set; } = string.Empty;
        public string New_Yellow_Card_Number { get; set; } = string.Empty;
        public string Health_Id { get; set; } = string.Empty;
        public District? District { get; set; }
    }
    public class PermanentAddress
    {
        public string Permanent_Address { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string Door_No { get; set; } = string.Empty;
        public string City_Village { get; set; } = string.Empty;
        public District? District { get; set; }
        public string Taluk { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
    }
    public class MemberRootModel
    {
        public bool status { get; set; }
        public string message { get; set; } = string.Empty;
        public List<Datum>? data { get; set; }
    }
    public class TemporaryAddress
    {
        public string Street { get; set; } = string.Empty;
        public string City_Village { get; set; } = string.Empty;
        public string Taluk { get; set; } = string.Empty;
        public District? District { get; set; }
        public string Pincode { get; set; } = string.Empty;
    }
    public class WorkAddress
    {
        public string Office_Address { get; set; } = string.Empty;
        public string Office_Door_No { get; set; } = string.Empty;
        public string Office_Street { get; set; } = string.Empty;
        public string Office_Village_Area_City { get; set; } = string.Empty;
        public string Office_Taluk { get; set; } = string.Empty;
        public OfficeDistrict? Office_District { get; set; }
        public string Office_Pincode { get; set; } = string.Empty;
    }
    public class TwoColumnConfigValues
    {
        public string MemberGenderId { get; set; } = string.Empty;
        public string MemberReligionId { get; set; } = string.Empty;
        public string MemberCommunityId { get; set; } = string.Empty;
        public string MemberMaritalStatusId { get; set; } = string.Empty;
        public string MemberEducationId { get; set; } = string.Empty;

        public string OrgTypeOfWorkId { get; set; } = string.Empty;
        public string OrgCoreSanitaryWorkerTypeId { get; set; } = string.Empty;
        public string OrgTypeId { get; set; } = string.Empty;
        public string OrgNatureOfJobId { get; set; } = string.Empty;
        public string OrgLocalBodyId { get; set; } = string.Empty;
        public string OrgNameOfLocalBodyId { get; set; } = string.Empty;
        public string OrgBlockId { get; set; } = string.Empty;
        public string OrgVillagePanchayatId { get; set; } = string.Empty;
        public string OrgCorporationId { get; set; } = string.Empty;
        public string OrgZoneId { get; set; } = string.Empty;
        public string OrgMunicipalityId { get; set; } = string.Empty;
        public string OrgTownPanchayatId { get; set; } = string.Empty;
        public string OrgDistrictId { get; set; } = string.Empty;

        public string PermanentDistrictId { get; set; } = string.Empty;

        public string PermanentTalukId { get; set; } = string.Empty;
        public string TempTalukId { get; set; } = string.Empty;
        public string TempDistrictId { get; set; } = string.Empty;

        public string WorkStreetId { get; set; } = string.Empty;
        public string WorkVillageAreaCityId { get; set; } = string.Empty;
        public string WorkTalukId { get; set; } = string.Empty;
        public string WorkDistrictId { get; set; } = string.Empty;

        public string BankId { get; set; } = string.Empty;
        public string BranchId { get; set; } = string.Empty;
    }
    public class TwoColumnConfigValuesForFamily
    {
        public string Relation { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string Disability { get; set; } = string.Empty;
    }

    public class DataCollectedBy
    {
        public string Data_Collected_By { get; set; } = string.Empty;
        public string Data_Collected_PhoneNumber { get; set; } = string.Empty;
        public string Data_Submitted { get; set; } = string.Empty;
    }
}
