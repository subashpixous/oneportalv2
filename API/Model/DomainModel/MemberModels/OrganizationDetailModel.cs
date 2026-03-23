using Model.ViewModel.MemberModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class OrganizationDetailModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string Type_of_Work { get; set; } = string.Empty;
        public string Core_Sanitary_Worker_Type { get; set; } = string.Empty;
        // Updated By Sivasankar K on 14/01/2026 for Health Worker 
        public string Health_Worker_Type { get; set; } = string.Empty;
        public string Organization_Type { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Nature_of_Job { get; set; } = string.Empty;
        public string Local_Body { get; set; } = string.Empty;
        public string Name_of_Local_Body { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public string Organisation_Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Block { get; set; } = string.Empty;
        public string Village_Panchayat { get; set; } = string.Empty;
        public string Corporation { get; set; } = string.Empty;
        public string Municipality { get; set; } = string.Empty;
        public string Town_Panchayat { get; set; } = string.Empty;
        public string New_Yellow_Card_Number { get; set; } = string.Empty;
        public string Health_Id { get; set; } = string.Empty;
        public string Private_Organisation_Name { get; set; } = string.Empty;
        public string Private_Designation { get; set; } = string.Empty;
        public string Private_Address { get; set; } = string.Empty;
        public bool Already_a_Member_of_CWWB { get; set; }
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }

        public string Type_of_WorkString { get; set; } = string.Empty;
        public string Core_Sanitary_Worker_TypeString { get; set; } = string.Empty;
        public string Health_Worker_TypeString { get; set; } = string.Empty;
        public string Organization_TypeString { get; set; } = string.Empty;
        public string DistrictString { get; set; } = string.Empty;
        public string Nature_of_JobString { get; set; } = string.Empty;
        public string Name_of_Local_BodyString { get; set; } = string.Empty;
        public string ZoneString { get; set; } = string.Empty;
        public string DesignationString { get; set; } = string.Empty;
        public string BlockString { get; set; } = string.Empty;
        public string Village_PanchayatString { get; set; } = string.Empty;
        public string CorporationString { get; set; } = string.Empty;
        public string MunicipalityString { get; set; } = string.Empty;
        public string Town_PanchayatString { get; set; } = string.Empty;
        public string MLA_ConstituencyString { get; set; } = string.Empty;
        public string MP_ConstituencyString { get; set; } = string.Empty;
        public string work_officeString { get; set; } = string.Empty;
        public string Employer_TypeString { get; set; } = string.Empty;
        public string MLA_Constituency { get; set; } = string.Empty;
        public string MP_Constituency { get; set; } = string.Empty;
        public string work_office { get; set; } = string.Empty;
        public string Work_Office_Others { get; set; } = string.Empty;
        public string Employer_Type { get; set; } = string.Empty;

        public bool IsApprovalPending { get; set; }
        public bool IsAbleToCancelRequest { get; set; }

    }
    public class OrganizationDetailSaveModel 
    {
        public string UniqueId { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string Type_of_Work { get; set; } = string.Empty;
        public string Core_Sanitary_Worker_Type { get; set; } = string.Empty;
        // Updated By Sivasankar K on 14/01/2026 for Health Worker 
        public string Health_Worker_Type { get; set; } = string.Empty;
        public string Organization_Type { get; set; } = string.Empty;
        public string District_Id { get; set; } = string.Empty;
        public string Nature_of_Job { get; set; } = string.Empty;
        public string Local_Body { get; set; } = string.Empty;
        public string Name_of_Local_Body { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public string Organisation_Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Block { get; set; } = string.Empty;
        public string Village_Panchayat { get; set; } = string.Empty;
        public string Corporation { get; set; } = string.Empty;
        public string Municipality { get; set; } = string.Empty;
        public string Town_Panchayat { get; set; } = string.Empty;
        public string New_Yellow_Card_Number { get; set; } = string.Empty;
        public string Health_Id { get; set; } = string.Empty;
        public string Private_Organisation_Name { get; set; } = string.Empty;
        public string Private_Designation { get; set; } = string.Empty;
        public string Private_Address { get; set; } = string.Empty;
        public string MLA_Constituency { get; set; } = string.Empty;
        public string MP_Constituency { get; set; } = string.Empty;
        public string Employer_Type { get; set; } = string.Empty;
        public string Work_Office { get; set; } = string.Empty;
        public string? Work_Office_Others { get; set; } = string.Empty;
        public bool Already_a_Member_of_CWWB { get; set; }
        public bool IsSubmitted { get; set; }
        public bool IsNewMember { get; set; }
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }
        public bool IsValid { get; set; }
        public bool IsProcessed { get; set; }
        public int Row { get; set; }
        public string Error { get; set; } = string.Empty;
        public List<string> ErrorList { get; set; } = new List<string>();
    }
}
