using Model.DomainModel;
using Model.DomainModel.MemberModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class MemberDataApprovalFormModel
    {
        public string RequestId {  get; set; } = string .Empty;
        public string CurrentRoleName {  get; set; } = string .Empty;
        public string ChangeRequestCode {  get; set; } = string .Empty;
        public string NextRoleName {  get; set; } = string .Empty;
        public string NextRoleId {  get; set; } = string .Empty;
        public string CurrentRoleId {  get; set; } = string .Empty;
        public string FromRoleId {  get; set; } = string .Empty;
        public List<SelectListItem>? StatusList { get; set; }
        public List<SelectListItem>? ReasonList { get; set; }
        public List<MemberDataApprovalHistoryView>? ApprovalHistory { get; set; }
    }
    public class MemberDataApprovalFromSubmitModel
    {
        public string RequestId { get; set; } = string.Empty;
        public string? Status { get; set; } = string.Empty;
        public string? Status2 { get; set; } = string.Empty;
        public string SelectedRoleText { get; set; } = string.Empty;
        public string SelectedRoleId { get; set; } = string.Empty;
        public string CurrentRoleId { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
    }
    public class MemberDataBulkApprovalFromSubmitModel
    {
        public List<string> RequestId { get; set; } 
        public string? Status { get; set; } = string.Empty;
        public string? Status2 { get; set; } = string.Empty;
        public string SelectedRoleText { get; set; } = string.Empty;
        public string SelectedRoleId { get; set; } = string.Empty;
        public string CurrentRoleId { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
    }
}
