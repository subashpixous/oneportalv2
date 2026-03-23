using Model.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class MemberDetailsModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty; // PK
        public string Member_ID { get; set; } = string.Empty;
        public string First_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
        public string Father_Name { get; set; } = string.Empty;
        public string Date_Of_Birth { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string Caste { get; set; } = string.Empty;
        public string Marital_Status { get; set; } = string.Empty;
        public string Aadhaar_Number { get; set; } = string.Empty;
        public string Phone_Number { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public bool AadhaarVerified { get; set; }
        public string Religion { get; set; } = string.Empty;
        public string Profile_Picture { get; set; } = string.Empty;
        public string DM_Status { get; set; } = string.Empty;
        public string HQ_Status { get; set; } = string.Empty;
        public string Id_Card_Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }
        public bool IsSubmitted { get; set; }
        public bool IsNewMember { get; set; }
        public bool IsApproved { get; set; }
        public bool IsPermanentAddressSameAsTemporaryAddress { get; set; }

        public string GenderString { get; set; } = string.Empty;
        public string CommunityString { get; set; } = string.Empty;
        public string CasteString { get; set; } = string.Empty;
        public string Marital_StatusString { get; set; } = string.Empty;
        public string EducationString { get; set; } = string.Empty;
        public string ReligionString { get; set; } = string.Empty;

        public string Ration_Card_Number { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Member_json { get; set; } = string.Empty;
        public string? CollectedByName { get; set; } = string.Empty;
        public string? CollectedByPhoneNumber { get; set; } = string.Empty;
        public string? CollectedOn { get; set; } = string.Empty;
        public bool IsApprovalPending {  get; set; }
        public bool IsAbleToCancelRequest {  get; set; }
        public bool IsApprovedRecord {  get; set; }
        public string? RoleIdForApproval {  get; set; } = string.Empty;
        public string? Aadhaar_json {  get; set; } = string.Empty;
    }

    public class MemberDetailsSaveModel
    {
        public string Id { get; set; } = string.Empty; // PK
        public string Member_ID { get; set; } = string.Empty;
        public string First_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
        public string Father_Name { get; set; } = string.Empty;
        public string Date_Of_Birth { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string Religion { get; set; } = string.Empty;
        public string Marital_Status { get; set; } = string.Empty;
        public string Aadhaar_Number { get; set; } = string.Empty;
        public string Phone_Number { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string Profile_Picture { get; set; } = string.Empty;
        public string DM_Status { get; set; } = string.Empty;
        public string HQ_Status { get; set; } = string.Empty;
        public bool DM_Status_Approval { get; set; }
        public bool HQ_Status_Approval { get; set; }
        public string Id_Card_Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }
        public bool IsPermanentAddressSameAsTemporaryAddress { get; set; }

        public string Member_json { get; set; } = string.Empty;
        public string? CollectedByName { get; set; } = string.Empty;
        public string? CollectedByPhoneNumber { get; set; } = string.Empty;
        public string? CollectedOn { get; set; } = string.Empty;


        public string Caste { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Health_Id { get; set; } = string.Empty;
        public string Ration_Card_Number { get; set; } = string.Empty;
        public bool IsSubmit { get; set; }

        public bool IsValid { get; set; }
        public bool IsForceSave { get; set; }
        public bool IsProcessed { get; set; }
        public int Row { get; set; }
        public string Error { get; set; } = string.Empty;
        public List<string> ErrorList { get; set; } = new List<string>();
        public string Profile_Picture_url { get; set; } = string.Empty;

        public bool IsApprovedRecord { get; set; }
        public string? RoleIdForApproval { get; set; } = string.Empty;
        public string? PrimaryDistrict { get; set; } = string.Empty;
        public MemberExistGeneralInfo? ExistMember { get; set; }
        public bool? AadhaarVerified { get; set; }
    }

    public class MemberInitSaveModel
    {
        public string Id { get; set; } = string.Empty;
        public string First_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Aadhaar_Json { get; set; } = string.Empty;
        
        public string Email { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string Phone_Number { get; set; } = string.Empty;
        public string? Aadhaar_Number { get; set; }
        public string OTP { get; set; } = string.Empty;
        public string PrimaryDistrict { get; set; } = string.Empty;
        public bool AadhaarVerified { get; set; }
    }
}