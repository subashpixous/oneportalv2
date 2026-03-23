using DAL;
using Model.DomainModel;
using Model.DomainModel.CardApprpvalModels;
using Model.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BAL.Interface
{
    public interface IUserBAL
    {
        public List<ApplicationGridViewModel> Application_GetList(string Id = "", string ApplicationId = "", string Mobile = "", string Email = "", string MemberId = "");
        public UserBankBranchForFilterModel Application_Get_Bank_Branch_Filter_Value(string UserId);

        #region Member Data Change Approval
        public List<MemberDataApprovalGridModel> MemberDataApprovalGridGet(MemberDataApprovalGridFilterModel filter, out int TotalCount);
        public MemberDataApprovalFormModel MemberDataApprovalForm(string RequestId, AccountUserModel user);
        public string MemberDataApproval(MemberDataApprovalFromSubmitModel model, AuditColumnsModel audit);
        #endregion Member Data Change Approval

        #region Member Card Change Approval
        public List<Member_Card_Approval_Master_Grid_Model> MemberCardApprovalGridGet(MemberCardApprovalGridFilterModel filter, out int TotalCount);
        public Member_Card_Approval_Master_From MemberCardApprovalForm(string Id, string MemberId);
        public string GetApprovalRoleId(string pRole);
        public string GetRoleId(string pRole);
        public List<Member_Card_Approval_History_Master_Model> MemberCardApprovalHistoryGet(MemberCardApprovalHistoryFilterModel filter, out int TotalCount);
        public string MemberCardApproval(Member_Card_Approval_Save_Model model, AuditColumnsModel audit);
        //public string MemberCardBulkApproval(Member_Card_BulkApproval_Save_Model model, AuditColumnsModel audit);
        public List<MemberIdMessageViewModel> MemberCardBulkApproval(Member_Card_BulkApproval_Save_Model model, AuditColumnsModel audit);
        public List<string> MemberDataBulkApproval(MemberDataBulkApprovalFromSubmitModel model, AuditColumnsModel audit);
        #endregion Member Card Change 

        List<DuplicateMemberGridModel> DuplicateMemberGridGet(DuplicateMemberFilterModel filter, out int totalCount);

        bool RemoveDuplicateMembers(RemoveDuplicateMembersModel model);
    }
}
