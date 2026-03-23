using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel.MemberModels
{
    public class MemberDataApprovalMaster :AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty; // PK
        public string Member_Id { get; set; } =string.Empty;
        public string ChangeRequestCode { get; set; } =string.Empty;
        public string Name { get; set; } =string.Empty;
        public string Mobile { get; set; } =string.Empty;
        public string Changed_Detail_Record {  get; set; } =string.Empty;
        public DateOnly  Changed_Date {  get; set; }
        public string  Changed_Date_String {  get; set; } = string.Empty;
        public TimeOnly Changed_Time { get; set; }
        public string Changed_Time_String { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ApprovedBy { get; set; } =string.Empty;
        public string ApprovedByDesignation { get; set; } =string.Empty;
        public string ApprovedDate { get; set;} =string.Empty;

        public string ModifiedByUserName { get; set; } = string.Empty;
        public string Approval_For { get; set;} =string.Empty;
        public string ApprovalForDesignation { get; set;} =string.Empty;
        public bool IsActive { get; set; }
        public bool IsCompleted { get; set; }
        public List<MemberDataApprovalHistoryView>? History {  get; set; }
    }
    public class MemberDataApprovalHistory
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Detail_Approval_Master_Id { get; set; } = string.Empty;
        public string From_Role { get; set; } = string.Empty;
        public string To_Role { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
        public string ApprovedBy { get; set; } = string.Empty;
    }
    public class MemberDataApprovalHistoryView
    {
        public string Id { get; set; } = string.Empty;
        public string MemberDetailApprovalMasterId { get; set; } = string.Empty;
        public string FromRoleId { get; set; } = string.Empty;
        public string FromRoleName { get; set; } = string.Empty;
        public string FromRoleCode { get; set; } = string.Empty;
        public string ToRoleId { get; set; } = string.Empty;
        public string ToRoleName { get; set; } = string.Empty;
        public string ToRoleCode { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
        public string ChangedDetailRecord {  get; set; } = string.Empty;
        public string ChangedDateString { get; set; } = string.Empty; 
        public string ChangedTimeString { get; set; } = string.Empty;
        public string ApprovedBy { get; set; } = string.Empty;
        public string ApprovedByName { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}