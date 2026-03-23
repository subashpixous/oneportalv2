using DAL;
using Model.DomainModel;
using Model.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utils.UtilModels;

namespace BAL.Interface
{
    public interface IGeneralBAL
    {
        public string FileMaster_SaveUpdate(FileMasterModel model);
        public List<FileMasterModel> FileMaster_Get(bool IsActive, string Id = "", string Type = "", string TypeId = "", string SavedFileName = "");
        public Task<byte[]> GetImage(string ImageName);
        public void SendMessage(List<EmailModel> email, List<SMSModel> sms, CurrentUserModel user);
        public List<RecordHistoryModel> GetRecordHistory(TableFilterModel model, out int TotalCount);

        #region Mail SMS Log
        public string MailSMSLog_Save(MailSMSLog model);
        public List<MailSMSLog> MailSMSLog_Get(MailSMSLog model);
        #endregion Mail SMS Log

        #region Comment
        public string Comment_SaveUpdate(CommentMasterModel model);
        public List<CommentMasterModel> Comment_Get(string Type = "", string TypeId = "", string CommentsFrom = "", string ParentId = "");
        public List<CommentMasterModel> Comment_Get(CommentFilterModel model, out int TotalCount);
        #endregion Comment

        #region Feedback
        public string FeedbackSaveUpdate(FeedbackModel model, AuditColumnsModel audit);
        public List<FeedbackViewModel> FeedbackList(FeedbackFilterModel filter, out int TotalCount);
        #endregion Feedback

        #region General Configuration
        public List<ConfigurationGeneralModel> General_Configuration_GetByKey(string ConfigKey = "");
        public string General_Configuration_SaveUpdate(ConfigurationGeneralModel model, AuditColumnsModel audit);
        #endregion General Configuration
    }
}
