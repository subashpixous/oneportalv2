using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class FamilyMemberModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty; // PK
        public string Member_Id { get; set; } = string.Empty;
        public string f_id { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
        public string phone_number { get; set; } = string.Empty;
        public string relation { get; set; } = string.Empty;
        public string relationString { get; set; } = string.Empty;
        public string sex { get; set; } = string.Empty;
        public string sexString { get; set; } = string.Empty;
        public string age { get; set; } = string.Empty;
        public string education { get; set; } = string.Empty;
        public string Standard { get; set; } = string.Empty;
        public string School_Status { get; set; } = string.Empty;
        public string EMIS_No { get; set; } = string.Empty;
        public string School_Name { get; set; } = string.Empty;
        public string School_District { get; set; } = string.Empty;
        public string School_Address { get; set; } = string.Empty;
        public string Course { get; set; } = string.Empty;
        public string Degree_Name { get; set; } = string.Empty;
        public string College_Status { get; set; } = string.Empty;
        public string UMIS_No { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Year_Of_Completion { get; set; } = string.Empty;
        public string College_Name { get; set; } = string.Empty;
        public string College_District { get; set; } = string.Empty;
        public string College_Address { get; set; } = string.Empty;
        public string occupation { get; set; } = string.Empty;
        public string disability { get; set; } = string.Empty;
        public string status { get; set; } = string.Empty;
        public string DiscontinuedYear { get; set; } = string.Empty;
        public string AadharNumber { get; set; } = string.Empty;
        public bool? EMISVerified { get; set; }
        public bool? UMISVerified { get; set; }
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }
        public bool IsSaved { get; set; }
        public bool IsApprovalPending { get; set; }
        public bool IsAbleToCancelRequest { get; set; }
        public bool ActiveApplicationExist { get; set; }
        public string date_of_birth { get; set; } = string.Empty;
        public ExistApplicationIdModel ExistApplication { get; set; }
    }

    public class FamilyMemberSaveModel
    {
        public string UniqueId { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty; // PK
        public string Member_Id { get; set; } = string.Empty;
        public string f_id { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
        public string phone_number { get; set; } = string.Empty;
        public string relation { get; set; } = string.Empty;
        public string sex { get; set; } = string.Empty;
        public string age { get; set; } = string.Empty;
        public string date_of_birth { get; set; } = string.Empty;
        public string education { get; set; } = string.Empty;
        public string Standard { get; set; } = string.Empty;
        public string School_Status { get; set; } = string.Empty;
        public string EMIS_No { get; set; } = string.Empty;
        public string School_Name { get; set; } = string.Empty;
        public string School_District { get; set; } = string.Empty;
        public string School_Address { get; set; } = string.Empty;
        public string Course { get; set; } = string.Empty;
        public string Degree_Name { get; set; } = string.Empty;
        public string College_Status { get; set; } = string.Empty;
        public string UMIS_No { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        public string Year_Of_Completion { get; set; } = string.Empty;
        public string College_Name { get; set; } = string.Empty;
        public string College_District { get; set; } = string.Empty;
        public string College_Address { get; set; } = string.Empty;
        public string occupation { get; set; } = string.Empty;
        public string disability { get; set; } = string.Empty;
        public string status { get; set; } = string.Empty;
        public string DiscontinuedYear { get; set; } = string.Empty;
        public string AadharNumber { get; set; } = string.Empty;
        public bool? PdsVerified { get; set; }
        public bool? EMISVerified { get; set; }
        public bool? UMISVerified { get; set; }
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }


        public bool IsValid { get; set; }
        public bool IsProcessed { get; set; }
        public int Row { get; set; }
        public string Error { get; set; } = string.Empty;
        public List<string> ErrorList { get; set; } = new List<string>();
    }
}
