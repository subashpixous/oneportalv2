using AutoMapper;
using BAL.BackgroundWorkerService;
using BAL.Interface;
using DAL;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Model.Constants;
using Model.CustomeAttributes;
using Model.DomainModel;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using Serilog;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Schema;
using Utils;
using Utils.Interface;
using Utils.UtilModels;

namespace BAL
{
    public class GeneralBAL : IGeneralBAL
    {
        private readonly GeneralDAL _generalDAL;
        private readonly SettingsDAL _settingsDAL;

        private readonly IMapper _mapper;
        private readonly IFTPHelpers _ftpHelper;

        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public GeneralBAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IMapper mapper,
            IConfiguration configuration, IFTPHelpers ftpHelper, IBackgroundTaskQueue backgroundTaskQueue, IServiceScopeFactory serviceScopeFactory)
        {
            _generalDAL = new GeneralDAL(configuration);
            _mapper = mapper;
            _ftpHelper = ftpHelper;
            _settingsDAL = new SettingsDAL(configuration);

            _backgroundTaskQueue = backgroundTaskQueue;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public string FileMaster_SaveUpdate(FileMasterModel model)
        {
            #region Save Difference
            FileMasterModel? exist = FileMaster_Get(true, model.Id)?.FirstOrDefault() ?? new FileMasterModel();
            if (string.IsNullOrWhiteSpace(exist.Id))
            {
                exist = FileMaster_Get(false, model.Id)?.FirstOrDefault() ?? new FileMasterModel();
            }
            ObjectDifference diff = new ObjectDifference(model, exist);
            diff.Properties = StringFunctions.GetPropertiesWithAttribute<FileMasterModel, LogFieldAttribute>();
            if (model.IsActive == false)
            {
                diff.IsDeleted = true;
            }
            diff.SavedBy = model.SavedBy;
            diff.SavedByUserName = model.SavedByUserName;
            diff.SavedDate = model.SavedDate;
            _generalDAL.SaveRecordDifference(diff);
            #endregion Save Difference

            return _generalDAL.FileMaster_SaveUpdate(model);
        }
        public List<FileMasterModel> FileMaster_Get(bool IsActive, string Id = "", string Type = "", string TypeId = "", string SavedFileName = "")
        {
            return _generalDAL.FileMaster_Get(IsActive, Id, Type, TypeId, SavedFileName);
        }
        public Task<byte[]> GetImage(string ImageName)
        {
            return _ftpHelper.DownloadFile_bytes(new Utils.FTPModel() { FileName = ImageName });
        }
        public void SendMessage(List<EmailModel> email, List<SMSModel> sms, CurrentUserModel user)
        {
            try
            {
                _backgroundTaskQueue.QueueBackgroundWorkItem(workItem: token =>
                {
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        var scopedService = scope.ServiceProvider;
                        ISMSHelper _smsHelper = scopedService.GetRequiredService<ISMSHelper>();
                        IMailHelper _mailHelper = scopedService.GetRequiredService<IMailHelper>();

                        try
                        {
                            DoBackgroundWork(_smsHelper, _mailHelper, email, sms, user);
                        }
                        catch (Exception ex)
                        {
                            Log.Error(ex, ex.Message);
                        }
                    }

                    return Task.CompletedTask;
                });
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
            }
        }
        private void DoBackgroundWork(ISMSHelper smsHelper, IMailHelper mailHelper, List<EmailModel> email, List<SMSModel> sms, CurrentUserModel user)
        {
            if (email.Count > 0)
            {
                email.ForEach(x =>
                {

                    string _subject = string.Empty;
                    string _body = string.Empty;

                    bool res = mailHelper.SendMail(x, out _body, out _subject);
                    if (res)
                    {
                        MailSMSLog _log = new MailSMSLog();

                        _log.RecordType = "MAIL";
                        _log.SentAddress = string.Join(',', x.To).ToString();
                        _log.Subject = _subject;
                        _log.Body = _body;
                        _log.Type = x.Type;
                        _log.TypeId = x.TypeId;
                        _log.ReceivedBy = x.ReceivedBy;
                        _log.CreatedBy = x.SavedBy;
                        _log.CreatedByUserName = x.SavedByUserName;
                        _log.CreatedDate = x.SavedDate;

                        _generalDAL.MailSMSLog_Save(_log);
                    }
                });
            }
            if (sms.Count > 0)
            {
                sms.ForEach(x =>
                {
                    string _message = string.Empty;
                    bool res = smsHelper.SentSMS(x.MobileNumbers, x.TemplateCode, x.MessageReplaces, out _message);
                    if (res)
                    {
                        MailSMSLog _log = new MailSMSLog();

                        _log.RecordType = "SMS";
                        _log.SentAddress = string.Join(',', x.MobileNumbers).ToString();
                        _log.Subject = x.TemplateCode;
                        _log.Body = _message;
                        _log.Type = x.Type;
                        _log.TypeId = x.TypeId;
                        _log.ReceivedBy = x.ReceivedBy;
                        _log.CreatedBy = x.SavedBy;
                        _log.CreatedByUserName = x.SavedByUserName;
                        _log.CreatedDate = x.SavedDate;

                        _generalDAL.MailSMSLog_Save(_log);
                    }
                });
            }
        }
        public List<RecordHistoryModel> GetRecordHistory(TableFilterModel model, out int TotalCount)
        {
            return _generalDAL.GetRecordHistory(model, out TotalCount);
        }

        #region Mail SMS Log
        public string MailSMSLog_Save(MailSMSLog model)
        {
            return _generalDAL.MailSMSLog_Save(model);
        }
        public List<MailSMSLog> MailSMSLog_Get(MailSMSLog model)
        {
            return _generalDAL.MailSMSLog_Get(model);
        }
        #endregion Mail SMS Log

        #region Comment
        public string Comment_SaveUpdate(CommentMasterModel model)
        {
            return _generalDAL.Comment_SaveUpdate(model);
        }
        public List<CommentMasterModel> Comment_Get(string Type = "", string TypeId = "", string CommentsFrom = "", string ParentId = "")
        {
            return _generalDAL.Comment_Get(Type, TypeId, CommentsFrom, ParentId);
        }
        public List<CommentMasterModel> Comment_Get(CommentFilterModel model, out int TotalCount)
        {
            return _generalDAL.Comment_Get(model, out TotalCount);
        }
        #endregion Comment

        #region Feedback
        public string FeedbackSaveUpdate(FeedbackModel model, AuditColumnsModel audit)
        {
            return _generalDAL.FeedbackSaveUpdate(model, audit);
        }
        public List<FeedbackViewModel> FeedbackList(FeedbackFilterModel filter, out int TotalCount)
        {
            return _generalDAL.FeedbackList(filter, out TotalCount);
        }
        #endregion Feedback

        #region General Configuration

        public List<ConfigurationGeneralModel> General_Configuration_GetByKey(string ConfigKey = "")
        {
            return _generalDAL.General_Configuration_GetByKey(ConfigKey);
        }

        public string General_Configuration_SaveUpdate(ConfigurationGeneralModel model, AuditColumnsModel audit)
        {
            return _generalDAL.General_Configuration_SaveUpdate(model, audit);
        }

        #endregion General Configuration

    }
}
