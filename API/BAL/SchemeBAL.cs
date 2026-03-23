using AutoMapper;
using BAL.BackgroundWorkerService;
using BAL.Interface;
using DAL;
using DAL.Helpers;
using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using MySqlX.XDevAPI;
using System.Data;
using Utils;
using Utils.Interface;
using Utils.UtilModels;
using static System.Net.Mime.MediaTypeNames;
using Log = Serilog.Log;

namespace BAL
{
    public class SchemeBAL : ISchemeBAL
    {
        private readonly SettingsDAL _settingDAL;
        private readonly GeneralDAL _generalDAL;
        private readonly SchemeDAL _schemeDAL;
        private readonly IMapper _mapper;
        private readonly IFTPHelpers _fTPHelpers;
        private readonly IConfiguration _configuration;
        private readonly IMailHelper _mailHelpers;
        private readonly ISMSHelper _smsHelpers;

        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IMySqlDapperHelper _mySqlDapperHelper;
        private readonly DapperContext _dapperContext;
        private readonly string connectionId = "Default";

        public SchemeBAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IMapper mapper, IConfiguration configuration,
            IFTPHelpers fTPHelpers, IBackgroundTaskQueue backgroundTaskQueue, IServiceScopeFactory serviceScopeFactory, IMailHelper mailHelpers, ISMSHelper smsHelpers)
        {
            _settingDAL = new SettingsDAL(configuration);
            _generalDAL = new GeneralDAL(configuration);
            _schemeDAL = new SchemeDAL(mySqlDapperHelper, mySqlHelper, configuration);
            _mapper = mapper;
            _fTPHelpers = fTPHelpers;
            _backgroundTaskQueue = backgroundTaskQueue;
            _serviceScopeFactory = serviceScopeFactory;
            _configuration = configuration;
            _mailHelpers = mailHelpers;
            _smsHelpers = smsHelpers;
            _dapperContext = new DapperContext(_configuration.GetConnectionString(connectionId));
        }

        // In Use
        public string Application_Master_Save(bool IsSubmit, ApplicationMasterSaveModel model, AuditColumnsModel audit)
        {
            if (IsSubmit)
            {
                model.FromStatusId = _settingDAL.Configuration_Get(Code: "SAVED")?.FirstOrDefault()?.Id ?? "";
                model.ToStatusId = _settingDAL.Configuration_Get(Code: "SUBMITTED")?.FirstOrDefault()?.Id ?? "";
            }
            else
            {
                model.FromStatusId = _settingDAL.Configuration_Get(Code: "SAVED")?.FirstOrDefault()?.Id ?? "";
                model.ToStatusId = model.FromStatusId;
            }
            return _schemeDAL.Application_Master_Save(model, audit);
        }
        public IEnumerable<(string SchemeId, string SchemeSubCategoryId, string SchemeSubCategory, decimal Amount)> GetSelectedSubCategoryAndAmount(string ApplicationId)
        {
            return _schemeDAL.GetSelectedSubCategoryAndAmount(ApplicationId);
        }
        public ApplicationCostDetails Application_Get_Cost_Details(SelectedSchemeSubCategoryGetPayload model, string SubCategoryId)
        {
            return _schemeDAL.Application_Get_Cost_Details(model, SubCategoryId);
        }
        //created by surya


        #region scheme_save_with_sms
        public void Application_Save_Cost_Details(List<ApplicationCostDetails> model, AuditColumnsModel audit, string actionType)
        {
            bool isSubmit = actionType?.ToLower() == "submit";

            foreach (var item in model)
            {
                // Save the cost details first
                _schemeDAL.Application_Save_Cost_Details(item, audit);

                // Get application details for SMS (including scheme names)
                var applicationDetails = _schemeDAL.Application_Get_Details_For_SMS(item.ApplicationId);

                if (applicationDetails != null && !string.IsNullOrEmpty(applicationDetails.Mobile_Number))
                {
                    // Use the scheme names from the database (English and Tamil)
                    SendSchemeSaveSMS(applicationDetails, isSubmit);
                }
                if (!string.IsNullOrEmpty(applicationDetails.Email))
                {
                    SendSchemeSaveMail(applicationDetails, isSubmit);
                }
            }
        }

        private void SendSchemeSaveSMS(ApplicationDetailsForSMS applicationDetails, bool isSubmit)
        {
            try
            {
                var mobileNumbers = new List<string> { applicationDetails.Mobile_Number };
                string fullName = $"{applicationDetails.First_Name} {applicationDetails.Last_Name}".Trim();

                // Prepare message replacements for both languages
                var englishMessageReplaces = new Dictionary<string, string>
        {
            { "{#name#}", fullName },
            { "{#scheme_name#}", applicationDetails.Scheme_Name_English ?? "the scheme" }
        };

                var tamilMessageReplaces = new Dictionary<string, string>
        {
            { "{#name#}", fullName },
            { "{#scheme_name#}", applicationDetails.Scheme_Name_Tamil ?? "திட்டம்" }
        };

                // Select templates based on action type
                string englishTemplate = isSubmit ? "SCHEME_APPLIED_EN_TA" : "SCHEME_SAVED_EN_TA";
                string tamilTemplate = isSubmit ? "SCHEME_APPLIED_EN_TAMIL" : "SCHEME_SAVED_EN_TAMIL";

                // Send English SMS
                string englishMessage;
                bool englishSent = _smsHelpers.SentSMS(
                    mobileNumbers,
                    englishTemplate,
                    englishMessageReplaces,
                    out englishMessage);

                // Send Tamil SMS
                string tamilMessage;
                bool tamilSent = _smsHelpers.SentSMS(
                    mobileNumbers,
                    tamilTemplate,
                    tamilMessageReplaces,
                    out tamilMessage, 8);

                // Log results
                if (!englishSent || !tamilSent)
                {
                    Console.WriteLine($"SMS sending partially failed - English: {englishSent}, Tamil: {tamilSent}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending scheme {(isSubmit ? "submit" : "save")} SMS: {ex.Message}");
            }
        }


        private void SendSchemeSaveMail(ApplicationDetailsForSMS applicationDetails, bool isSubmit)
        {
            if (string.IsNullOrWhiteSpace(applicationDetails.Email))
                return;

            string mailCode = isSubmit ? ApplicationEmailTemplateCode.SCHEME_SUBMITTED : ApplicationEmailTemplateCode.SCHEME_SAVED;
            CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
            _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);
            CallletterUserModel? _manager = _settingDAL.GetUserByRoleAndDistrict(applicationDetails.District_Id, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();
           

            EmailSMSTemplate _templateClass = new EmailSMSTemplate();
            EmailTemplateModel template = _templateClass.GetEmailTemplate(mailCode);
            if (template == null) return;

            EmailModel email = new EmailModel
            {
                To = new List<string> { applicationDetails.Email },
                Subject = template.Subject,
                Body = template.Body,
                BodyPlaceHolders = new Dictionary<string, string>
        {
            { "{RECIPIENTFIRSTNAME}", applicationDetails.First_Name ?? "" },
            { "{RECIPIENTLASTNAME}", applicationDetails.Last_Name ?? "" },
            { "{SCHEME_NAME}", applicationDetails.Scheme_Name_English ?? "the scheme" },
                     {"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
                                    {"{MANAGER_NAME}", _manager.FirstName + " " + _manager.LastName},
                                    {"{MANAGER_EMAIL}", _manager.Email},
                                    {"{MANAGER_CONTACT}", _manager.Mobile}
        }
            };

            string subject, body;
            bool sent = _mailHelpers.SendMail(email, out body, out subject);

            Console.WriteLine(sent
                ? $"Scheme {(isSubmit ? "Submit" : "Save")} Email sent to {applicationDetails.Email}"
                : $"Scheme {(isSubmit ? "Submit" : "Save")} Email failed for {applicationDetails.Email}");
        }



       

        #endregion

        public string Application_Scheme_Additional_Information_Update(SchemeAdditionalInformation model)
        {
            return _schemeDAL.Application_Scheme_Additional_Information_Update(model);
        }
        public SchemeAdditionalInformation Application_Scheme_Additional_Information_Get(string ApplicationId)
        {
            return _schemeDAL.Application_Scheme_Additional_Information_Get(ApplicationId);
        }
        public bool Application_IsSingleCategorySelect(string SchemeId)
        {
            return _schemeDAL.Application_IsSingleCategorySelect(SchemeId);
        }


        public string Application_Qualification_SaveUpdate(ApplicantQualificationMasterModel model, AuditColumnsModel audit)
        {
            return _schemeDAL.Application_Qualification_SaveUpdate(model, audit);
        }
        public bool ApplicationSendMail(string ApplicationId, List<string> RolesToSendMail, string mailCode)
        {
            if (!string.IsNullOrEmpty(ApplicationId))
            {
                if (string.IsNullOrEmpty(mailCode))
                {
                    mailCode = ApplicationEmailTemplateCode.APPLICANT_DEFAULTMAILTEMPLATE;
                }

                CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
                _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);

                ApplicationDetailViewModel? application = _schemeDAL.Application_Detail_Get(ApplicationId: ApplicationId).FirstOrDefault();
                if (application != null)
                {
                    CallletterUserModel? _manager = _settingDAL.GetUserByRoleAndDistrict(application.DistrictId, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();

                    List<CallletterUserModel> userlist = new List<CallletterUserModel>();
                    RolesToSendMail.ForEach(x =>
                    {
                        userlist.AddRange(_settingDAL.GetUserByRoleIdAndDistrict(application.DistrictId, x));
                    });

                    //// This block to send mail to applicant, But we don't have email for applicant
                    //if (mailCode != ApplicationEmailTemplateCode.ROLE_BASED)
                    //{
                    //    if (!string.IsNullOrEmpty(application.Email))
                    //    {
                    //        userlist.Add(new CallletterUserModel()
                    //        {
                    //            Email = application.Email,
                    //            FirstName = application.FirstName,
                    //            LastName = application.LastName,
                    //            Mobile = application.Mobile,
                    //        });
                    //    }
                    //}

                    EmailSMSTemplate _templateClass = new EmailSMSTemplate();
                    EmailTemplateModel template = _templateClass.GetEmailTemplate(mailCode);

                    if (_manager != null)
                    {
                        bool isMailSent = false;

                        foreach (CallletterUserModel user in userlist)
                        {
                            if (!string.IsNullOrEmpty(user.Email))
                            {
                                EmailModel email = new EmailModel();
                                email.To = new List<string> { user.Email };
                                email.Subject = template.Subject;
                                email.Body = template.Body;
                                email.CC = new List<string>() { _manager.Email };

                                email.SubjectPlaceHolders = new Dictionary<string, string>() {

                                    {"{APPLICATION_ID}", string.IsNullOrWhiteSpace(application.ApplicationNumber) ? application.TemporaryNumber : application.ApplicationNumber }
                                };

                                email.BodyPlaceHolders = new Dictionary<string, string>() {

                                    {"{APPLICATION_ID}", string.IsNullOrWhiteSpace(application.ApplicationNumber) ? application.TemporaryNumber : application.ApplicationNumber },
                                    {"{RECIPIENTFIRSTNAME}", user.FirstName},
                                    {"{RECIPIENTLASTNAME}", user.LastName},
                                    {"{STATUS}", application.Status },
                                    {"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
                                    {"{MANAGER_NAME}", _manager.FirstName + " " + _manager.LastName},
                                    {"{MANAGER_EMAIL}", _manager.Email},
                                    {"{MANAGER_CONTACT}", _manager.Mobile}
                                };

                                string Subject = "";
                                string Body = "";

                                isMailSent = _mailHelpers.SendMail(email, out Body, out Subject);
                            }
                        }
                    }
                }
            }

            return false;
        }
        public bool ApplicationSendSMS(string ApplicationId, List<string> RolesToSendSMS)
        {
            if (!string.IsNullOrEmpty(ApplicationId))
            {
                ApplicationDetailViewModel? application = _schemeDAL.Application_Detail_Get(ApplicationId: ApplicationId).FirstOrDefault();
                if (application != null)
                {
                    List<CallletterUserModel> userlist = new List<CallletterUserModel>();
                    RolesToSendSMS.ForEach(x =>
                    {
                        userlist.AddRange(_settingDAL.GetUserByRoleIdAndDistrict(application.DistrictId, x));
                    });

                    if (!string.IsNullOrEmpty(application.Mobile))
                    {
                        userlist.Add(new CallletterUserModel()
                        {
                            Email = "",
                            Name = application.Name,
                            FirstName = "",
                            LastName = "",
                            Mobile = application.Mobile,
                        });
                    }

                    bool isSMSSent = false;

                    foreach (CallletterUserModel user in userlist)
                    {
                        if (!string.IsNullOrEmpty(user.Mobile))
                        {

                            IDictionary<string, string> replaces = new Dictionary<string, string>()
                            {
                                {"{#app_no#}", string.IsNullOrWhiteSpace(application.ApplicationNumber) ? application.TemporaryNumber : application.ApplicationNumber },
                                {"{#status#}", application.Status},
                                {"{#common_text#}", "No action required"}
                            };

                            string _message = string.Empty;
                            isSMSSent = _smsHelpers.SentSMS(new List<string>() { application.Mobile }, "COMMON", replaces, out _message);
                        }
                    }
                }
            }

            return false;
        }

        public List<ApplicationDetailViewModel> Application_Detail_Get(string Id = "", string ApplicationId = "")
        {
            List<ApplicationDetailViewModel> list = _schemeDAL.Application_Detail_Get(Id, ApplicationId);

            if (list.Count > 0)
            {
                foreach (ApplicationDetailViewModel x in list)
                {
                    x.ApprovalComments = _schemeDAL.Application_approval_comments_Get(ApplicationId: x.ApplicationId);
                    x.ApplicationDocument = Application_Document_Get_From_Member_Doc_Table(MemberId: x.ApplicantId, SchemeId: x.SchemeId, ApplicationId: x.ApplicationId);

                    x.UcDocument = Application_Utilisation_Certificate_Get(ApplicationId: x.ApplicationId);
                    x.Form3 = Application_Form_3_Get(ApplicationId: x.ApplicationId);
                }
            }

            return list;
        }
        public List<ApplicantQualificationMasterModel> Application_Qualification_Get(string Id = "", string ApplicationId = "")
        {
            return _schemeDAL.Application_Qualification_Get(Id, ApplicationId);
        }
        public List<ApplicationStatusHistoryModel> Application_Status_History_Get(string Id = "", string ApplicationId = "")
        {
            return _schemeDAL.Application_Status_History_Get(Id, ApplicationId);
        }

        public List<ApplicationDocumentFormModel> Application_Document_Get(string Id = "", string ApplicationId = "")
        {
            List<ApplicationDocumentMasterModel> list = _schemeDAL.Application_Document_Get(Id, ApplicationId);

            List<ApplicationDocumentFormModel> list2 = new List<ApplicationDocumentFormModel>();

            List<ConfigurationModel> configuration = _settingDAL.Configuration_Get(IsActive: true, CategoryCode: "ACCEPTEDDOCUMENT");

            if (list.Count > 0)
            {
                var group = list.Select(x => new { x.DocumentGroupName, x.SortOrder }).Distinct().ToList();
                group.ForEach(g =>
                {
                    ApplicationDocumentFormModel model = new ApplicationDocumentFormModel();

                    model.DocumentGroupName = g.DocumentGroupName;
                    model.SortOrder = g.SortOrder;
                    model.Documents = _mapper.Map<List<ApplicationDocumentModel>>(list.Where(d => d.DocumentGroupName == g.DocumentGroupName).OrderBy(o => o.DocumentCategory).ToList());
                    model.Documents.ForEach(dd =>
                    {
                        dd.AcceptedDocumentList = configuration.Where(ad => ad.ConfigurationId == dd.DocumentCategoryId)
                        .Select(sl => new SelectListItem() { Text = sl.Value, Value = sl.Id, Selected = (sl.Id == dd.AcceptedDocumentTypeId) }).OrderBy(o => o.Text).ToList();
                    });

                    list2.Add(model);
                });
            }

            return list2.OrderBy(o => o.SortOrder).ToList();
        }
        public List<ApplicationDocumentMasterModel> Application_Document_GetById(string Id = "", string ApplicationId = "")
        {
            return _schemeDAL.Application_Document_Get(Id, ApplicationId);
        }
        public List<ApplicationDocumentFormModel> Application_Document_Get_From_Member_Doc_Table(string MemberId, string SchemeId, string ApplicationId)
        {
            List<ApplicationDocumentMasterModel> list = _schemeDAL.Application_Document_Get_From_Member_Doc_Table(MemberId, SchemeId, ApplicationId);

            List<ApplicationDocumentFormModel> list2 = new List<ApplicationDocumentFormModel>();

            List<ConfigurationModel> configuration = _settingDAL.Configuration_Get(IsActive: true, CategoryCode: "ACCEPTEDDOCUMENT");

            if (list.Count > 0)
            {
                var group = list.Select(x => new { x.DocumentGroupName, x.SortOrder }).Distinct().ToList();
                group.ForEach(g =>
                {
                    ApplicationDocumentFormModel model = new ApplicationDocumentFormModel();

                    model.DocumentGroupName = g.DocumentGroupName;
                    model.SortOrder = g.SortOrder;
                    model.Documents = _mapper.Map<List<ApplicationDocumentModel>>(list.Where(d => d.DocumentGroupName == g.DocumentGroupName).OrderBy(o => o.DocumentCategory).ToList());
                    model.Documents.ForEach(dd =>
                    {
                        dd.AcceptedDocumentList = configuration.Where(ad => ad.ConfigurationId == dd.DocumentCategoryId)
                        .Select(sl => new SelectListItem() { Text = sl.Value, Value = sl.Id, Selected = (sl.Id == dd.AcceptedDocumentTypeId) }).OrderBy(o => o.Text).ToList();
                    });

                    list2.Add(model);
                });
            }

            return list2.OrderBy(o => o.SortOrder).ToList();
        }
        public string Application_Document_SaveUpdate(ApplicationDocumentMasterModel model, AuditColumnsModel audit)
        {
            return _schemeDAL.Application_Document_SaveUpdate(model, audit);
        }
        public string Application_Document_Delete(string Id, AuditColumnsModel audit)
        {
            return _schemeDAL.Application_Document_Delete(Id, audit);
        }
        public int Application_Document_Verification_SaveUpdate(ApplicationDocumentVerificationMasterModel model, AuditColumnsModel audit)
        {
            return _schemeDAL.Application_Document_Verification_SaveUpdate(model, audit);
        }

        public List<ApplicationMainGridModel> Application_MainGrid_Get_List(List<ApplicationPrivilegeMaster> Privillage, ApplicationFilterModel filter, UserPrivillageInfoModel UserDetails, out int TotalCount)
        {
            List<string> schemeIds = new List<string>();
            List<string> districtIds = new List<string>();
            List<string> statusCodes = new List<string>();
            List<string> mobile = new List<string>();

            if (filter.Where?.SchemeIds?.Count > 0)
            {
                statusCodes = Privillage.Where(y => y.StatusCode != null && y.CanView == true && filter.Where.SchemeIds.Contains(y.SchemeId))?.OrderBy(o => o.Order)?.Select(x => x.StatusCode ?? "")?.Distinct()?.ToList() ?? new List<string>();
            }
            else
            {
                statusCodes = Privillage.Where(y => y.StatusCode != null && y.CanView == true)?.OrderBy(o => o.Order)?.Select(x => x.StatusCode ?? "")?.Distinct()?.ToList() ?? new List<string>();
            }
            if (filter.Where?.StatusIds?.Count > 0)
            {
                statusCodes = new List<string>();
                bool hasReturned = filter.Where.StatusIds.Contains("RETURNED");
                if (hasReturned)
                {
                    statusCodes.Add("RETURNED");
                }
                var normalStatusIds = filter.Where.StatusIds.Where(x => x != "RETURNED").ToList();
                if (normalStatusIds.Count > 0)
                {
                    var mappedStatusCodes = Privillage.Where(y => y.StatusCode != null && y.CanView == true && normalStatusIds.Contains(y.StatusId)).Select(x => x.StatusCode).Distinct().ToList();

                    statusCodes.AddRange(mappedStatusCodes);
                }

                statusCodes = statusCodes.Distinct().ToList();
                //statusCodes = Privillage.Where(y => y.StatusCode != null && y.CanView == true && filter.Where.StatusIds.Contains(y.StatusId))?.Select(x => x.StatusCode ?? "")?.Distinct()?.ToList() ?? new List<string>();
            }

            if (filter.Where?.SchemeIds?.Count > 0)
            {
                schemeIds.AddRange(filter.Where.SchemeIds);
            }
            else
            {
                schemeIds = UserDetails.SchemeIdList ?? new List<string>();
            }

            if (filter.Where?.DistrictIds?.Count > 0)
            {
                districtIds.AddRange(filter.Where.DistrictIds);
            }
            else
            {
                districtIds = UserDetails.DistrictIdList ?? new List<string>();
            }
            if (filter.Where?.Mobile?.Count > 0)
            {
                mobile.AddRange(filter.Where.Mobile);
            }
            
            List<string> Years = filter.Where?.Year?.Split('-')?.ToList() ?? new List<string>();
            DateTime from = new DateTime(Convert.ToInt32(Years[0]), 4, 1);
            DateTime to = new DateTime(Convert.ToInt32(Years[1]), 3, 31, 23, 59, 59);

            #region Ordering

            string sortingstring = "";

            if (filter.Sorting != null)
            {
                if (filter.Sorting.FieldName.ToLower() == ("ApplicationNumber").ToLower())
                {
                    sortingstring = " ORDER BY am.ApplicationNumber <sortorder>, am.TemporaryNumber <sortorder> ";
                }
                else if (filter.Sorting.FieldName.ToLower() == ("Scheme").ToLower())
                {
                    sortingstring = " ORDER BY cscm.Value <sortorder> ";
                }
                else if (filter.Sorting.FieldName.ToLower() == ("Status").ToLower())
                {
                    sortingstring = " ORDER BY csm.Value <sortorder> ";
                }
                else if (filter.Sorting.FieldName.ToLower() == ("Date").ToLower())
                {
                    sortingstring = " ORDER BY am.ModifiedDate <sortorder> ";
                }
                else if (filter.Sorting.FieldName.ToLower() == ("FirstName").ToLower())
                {
                    sortingstring = " ORDER BY (CASE WHEN IFNULL(fmm.Id, '') != '' THEN fmm.name ELSE CONCAT(mmm.First_Name, ' ', mmm.Last_Name) END) <sortorder> ";
                }
                else if (filter.Sorting.FieldName.ToLower() == ("LastName").ToLower())
                {
                    sortingstring = " ORDER BY (CASE WHEN IFNULL(fmm.Id, '') != '' THEN '' ELSE mmm.Last_Name END) <sortorder> ";
                }
                else if (filter.Sorting.FieldName.ToLower() == ("DistrictName").ToLower())
                {
                    sortingstring = " ORDER BY ddm.Value <sortorder> ";
                }
                else if (filter.Sorting.FieldName.ToLower() == ("SubmittedDate").ToLower())
                {
                    sortingstring = " ORDER BY am.SubmittedDate <sortorder> ";
                }
                else if (filter.Sorting.FieldName.ToLower() == ("Observation").ToLower())
                {
                    sortingstring = " ORDER BY AC.Observation <sortorder> ";
                }
                else
                {
                    sortingstring = " ORDER BY am.ApplicationNumber <sortorder>, am.TemporaryNumber <sortorder> ";
                }

                if (!string.IsNullOrEmpty(filter.Sorting.Sort))
                {
                    sortingstring = sortingstring.Replace("<sortorder>", filter.Sorting.Sort);
                }
                else
                {
                    sortingstring = sortingstring.Replace("<sortorder>", "ASC");
                }
            }

            #endregion Ordering

            ApplicationGridParameterModel model = new ApplicationGridParameterModel();

            model.Skip = filter.Skip;
            model.Take = filter.Take;
            model.OrderDirection = sortingstring;
            model.SearchString = filter.SearchString ?? "";
            model.SchemeIds = schemeIds;
            model.DistrictIds = districtIds;
            model.Mobile = mobile;
            model.StatusCodes = statusCodes;
            model.From = from;
            model.To = to;
            model.IsExpired = filter.Where?.IsExpired ?? false;
            model.UserId = UserDetails.UserId;
            model.RoleId = UserDetails.RoleId;
            model.ColumnSearch = filter.ColumnSearch;
            model.BankIds = UserDetails.BankIdList;
            model.BranchIds = UserDetails.BranchIdList;
            model.CollectedByName=filter.Where.CollectedByName ?? "";

            model.IsBulkApprovalGet = filter.Where?.IsBulkApprovalGet ?? false;

            model.ShowInactiveOnly = filter.Where?.ShowInactiveOnly ?? false;

            return _schemeDAL.Application_MainGrid_Get_List(model, _generalDAL.ApplicationExpiryDays(), out TotalCount);
        }
        public ApplicationRecordCountModel ApplicationStatusCountList(List<ApplicationPrivilegeMaster> Privillage, ApplicationCountFilterValueModel filter, UserPrivillageInfoModel UserDetails)
        {
            List<string> schemeIds = new List<string>();
            List<string> districtIds = new List<string>();
            List<string> statusCodes = new List<string>();
            if (!string.IsNullOrEmpty(filter.SchemeId))
            {
                statusCodes = Privillage.Where(y => y.StatusCode != null && y.CanView == true && y.SchemeId == filter.SchemeId)?.OrderBy(o => o.Order)?.Select(x => x.StatusCode ?? "")?.Distinct()?.ToList() ?? new List<string>();
            }
            else
            {
                statusCodes = Privillage.Where(y => y.StatusCode != null && y.CanView == true)?.OrderBy(o => o.Order)?.Select(x => x.StatusCode ?? "")?.Distinct()?.ToList() ?? new List<string>();
            }

            if (statusCodes.Contains("REJECTED"))
            {
                statusCodes = statusCodes.Where(x => x != "REJECTED").ToList();
                statusCodes.Add("REJECTED");
            }

            if (!string.IsNullOrEmpty(filter.SchemeId))
            {
                schemeIds.Add(filter.SchemeId);
            }
            else
            {
                schemeIds = UserDetails.SchemeIdList ?? new List<string>();
            }

            if (!string.IsNullOrEmpty(filter.DistrictId))
            {
                districtIds.Add(filter.DistrictId);
            }
            else
            {
                districtIds = UserDetails.DistrictIdList ?? new List<string>();
            }

            List<RecordCountNew> GetSchemeCountNew = _schemeDAL.ApplicationStatusCountList(schemeIds, districtIds, statusCodes, filter.Year, UserDetails.RoleId, UserDetails.UserId, _generalDAL.ApplicationExpiryDays());

            ApplicationRecordCountModel model = new ApplicationRecordCountModel();
            model.RecordCount = new List<ApplicationCountModel>();

            foreach (string statusCode in statusCodes)
            {
                int count = GetSchemeCountNew.Where(x => x.StatusCode == statusCode)?.Sum(y => y.Count) ?? 0;
                var status = Privillage.Find(x => x.StatusCode == statusCode);
                if (status != null)
                {
                    model.RecordCount.Add(new ApplicationCountModel()
                    {
                        Count = count,
                        StatusCode = statusCode,
                        Status = status.Status ?? "",
                        StatusId = status.StatusId,
                    });
                }
            }

            model.Year = filter.Year;
            model.SchemeId = filter.SchemeId;
            model.DistrictId = filter.DistrictId;

            return model;
        }
        public DashboardApplicationCountModel DashboardApplicationCount(List<ApplicationPrivilegeMaster> Privillage, DashboardFilterValueModel filter, UserPrivillageInfoModel UserDetails)
        {
            DashboardApplicationCountModel model = new DashboardApplicationCountModel();

            List<string> schemeIds = new List<string>();
            List<string> districtIds = new List<string>();
            List<string> statusCodes = new List<string>();

            schemeIds = UserDetails.SchemeIdList ?? new List<string>();
            districtIds = UserDetails.DistrictIdList ?? new List<string>();

            if (filter.IsDistrictWise)
            {
                List<ApplicationDistrictWiseCount> list = _schemeDAL.ApplicationCountListDistrictWise(schemeIds, districtIds, statusCodes, filter.Year, UserDetails.RoleId, UserDetails.UserId, _generalDAL.ApplicationExpiryDays());

                model.MapCount = list.Select(x => new ApplicationCountMap()
                {
                    Count = x.Count,
                    Type = "DISTRICT",
                    TypeId = x.DistrictId,
                    DistrictName = x.DistrictName,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,

                }).ToList();

                model.CardCount = list.Select(x => new ApplicationCountCard()
                {
                    Count = x.Count,
                    Type = "DISTRICT",
                    TypeId = x.DistrictId,
                    Label = x.DistrictName

                }).Where(d => d.Count > 0).OrderBy(o => o.Label).ToList();
            }
            else if (filter.IsSchemeWise)
            {
                List<ApplicationDistrictWiseCount> list = _schemeDAL.ApplicationCountListDistrictWise(schemeIds, districtIds, statusCodes, filter.Year, UserDetails.RoleId, UserDetails.UserId, _generalDAL.ApplicationExpiryDays());

                model.MapCount = list.Select(x => new ApplicationCountMap()
                {
                    Count = x.Count,
                    Type = "DISTRICT",
                    TypeId = x.DistrictId,
                    DistrictName = x.DistrictName,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,

                }).ToList();

                List<ApplicationSchemeWiseCount> schemewiselist = _schemeDAL.ApplicationCountListSchemeWise(schemeIds, districtIds, statusCodes, filter.Year, UserDetails.RoleId, UserDetails.UserId, _generalDAL.ApplicationExpiryDays());

                model.CardCount = schemewiselist.Select(x => new ApplicationCountCard()
                {
                    Count = x.Count,
                    Type = "SCHEME",
                    TypeId = x.SchemeId,
                    Label = x.SchemeName

                }).Where(d => d.Count > 0).OrderBy(o => o.Label).ToList();
            }
            else if (filter.IsDueDateWise)
            {
                List<ApplicationAllForDashboardModel> schemewiselist = _schemeDAL.ApplicationListDashboard(schemeIds, districtIds, statusCodes, filter.Year, UserDetails.RoleId, UserDetails.UserId, _generalDAL.ApplicationExpiryDays());

                model.MapCount = schemewiselist.GroupBy(p => (p.DistrictId, p.DistrictName, p.Latitude, p.Longitude), (keys, g) => new ApplicationCountMap
                {
                    Type = "DISTRICT",
                    TypeId = keys.DistrictId,
                    DistrictName = keys.DistrictName,
                    Latitude = keys.Latitude,
                    Longitude = keys.Longitude,
                    Count = g.Count()
                }).ToList();

                schemewiselist.ForEach(x =>
                {
                    x.DueDays = ((x.DueDays < 0) ? 0 : x.DueDays);
                });

                model.CardCount = schemewiselist.GroupBy(p => p.DueDays, (key, g) => new ApplicationCountCard
                {
                    Type = "",
                    TypeId = "",
                    Label = "Due by " + key + " Days",
                    Count = g.Count()
                }).Where(d => d.Count > 0).OrderBy(o => o.Label).ToList();
            }

            if (!string.IsNullOrEmpty(filter.SchemeId))
            {
                List<RecordCountNew> statusWiseCountList = _schemeDAL.ApplicationStatusCountForAllList(new List<string>() { filter.SchemeId }, districtIds, statusCodes, filter.Year, UserDetails.RoleId, UserDetails.UserId, _generalDAL.ApplicationExpiryDays());
                int TotalCount = statusWiseCountList.Sum(x => x.Count);
                model.StatusCount = new List<ApplicationCountModel>();

                foreach (string statusCode in statusWiseCountList.Select(p => p.StatusCode))
                {
                    int count = statusWiseCountList.Where(x => x.StatusCode == statusCode)?.Sum(y => y.Count) ?? 0;
                    var status = Privillage.Find(x => x.StatusCode == statusCode);
                    if (status != null)
                    {
                        double percentage = 0;

                        if (TotalCount > 0 && count > 0)
                        {
                            percentage = ((Convert.ToDouble(count) / Convert.ToDouble(TotalCount)) * 100);
                        }

                        model.StatusCount.Add(new ApplicationCountModel()
                        {
                            Count = count,
                            Percentage = percentage,
                            StatusCode = statusCode,
                            Status = status.Status ?? "",
                            StatusId = status.StatusId,
                        });
                    }
                }
            }
            else
            {
                model.StatusCount = new List<ApplicationCountModel>();
            }

            model.MapCount = model.MapCount.Where(x => x.Count > 0 && x.Latitude > 0 && x.Longitude > 0).ToList();

            return model;
        }

        public DashboardResponseCountModel DashboardCount(
            List<ApplicationPrivilegeMaster> Privillage,
            DashboardFilterValueModel filter,
            UserPrivillageInfoModel UserDetails)
        {
            DashboardResponseCountModel model = new DashboardResponseCountModel();

            List<string> schemeIds = UserDetails.SchemeIdList ?? new List<string>();
            List<string> districtIds = UserDetails.DistrictIdList ?? new List<string>();
            List<string> statusCodes = new List<string>();

            /* ---------------- DASHBOARD SET I ---------------- */

            DashboardResponseCountModel dashboardsetI =
                _schemeDAL.DashBoardSetI(
                    schemeIds,
                    districtIds,
                    statusCodes,
                    filter.Year,
                    UserDetails.RoleId,
                    UserDetails.UserId,
                    _generalDAL.ApplicationExpiryDays()
                );

            /* ---------------- DASHBOARD SET II ---------------- */

            DashboardResponseCountModel dashboardsetII =
                _schemeDAL.DashBoardSetII(
                    schemeIds,
                    districtIds,
                    statusCodes,
                    filter.Year,
                    UserDetails.RoleId,
                    UserDetails.UserId,
                    _generalDAL.ApplicationExpiryDays()
                );

            /* ---------------- MERGE RESULTS ---------------- */

            model.member_application_count = dashboardsetI.member_application_count;
            model.scheme_application_count = dashboardsetI.scheme_application_count;

            model.member_dashboard_data = dashboardsetI.member_dashboard_data;

            model.scheme_dashboard_data = dashboardsetII.scheme_dashboard_data;

            model.scheme_dashboard_amount_data = dashboardsetII.scheme_dashboard_amount_data;

            return model;
        }


        //    public string Application_approval_comments_Save(ApprovalModel model, AuditColumnsModel audit, bool IsBulkApproval = false)
        //    {
        //        var result = _schemeDAL.Application_approval_comments_Save(model, audit, IsBulkApproval);

        //        if (!string.IsNullOrEmpty(result.ApprovalId)
        //&& model.Status.Equals("APPROVED", StringComparison.OrdinalIgnoreCase)
        //&& result.StatusValue?.ToLower() == "completed")
        //        {
        //            try
        //            {
        //                // Get application details for SMS
        //                var applicationDetails = _schemeDAL.Application_Get_Details_For_SMS(model.ApplicationId);
        //                if (applicationDetails != null && !string.IsNullOrWhiteSpace(applicationDetails.Mobile_Number))
        //                {
        //                    SendSchemeApprovalSMS(applicationDetails);
        //                    SendAmountCreditedSMS(applicationDetails);
        //                }
        //                if (!string.IsNullOrWhiteSpace(applicationDetails.Email))
        //                {
        //                    SendSchemeApprovalEmail(applicationDetails);
        //                    SendAmountCreditedEmail(applicationDetails);
        //                }
        //            }
        //            catch (Exception ex)
        //            {
        //                Console.WriteLine($"Error sending approval SMS: {ex.Message}");
        //            }
        //        }

        //        return result.ApprovalId;
        //    }


        public string Application_approval_comments_Save(ApprovalModel model, AuditColumnsModel audit, bool IsBulkApproval = false)
    {
      var result = _schemeDAL.Application_approval_comments_Save(model, audit, IsBulkApproval);

      if (!string.IsNullOrEmpty(result.ApprovalId)
&& model.Status.Equals("APPROVED", StringComparison.OrdinalIgnoreCase)
&& result.StatusValue?.ToLower() == "completed")
      {
        try
        {
          // Get application details for SMS
          var applicationDetails = _schemeDAL.Application_Get_Details_For_SMS(model.ApplicationId);
          if (applicationDetails != null && !string.IsNullOrWhiteSpace(applicationDetails.Mobile_Number))
          {
            SendSchemeApprovalSMS(applicationDetails);
            SendAmountCreditedSMS(applicationDetails);
          }
                    if (!string.IsNullOrWhiteSpace(applicationDetails.Email))
                    {
                        SendSchemeApprovalEmail(applicationDetails);
                        SendAmountCreditedEmail(applicationDetails);
                    }
                }
        catch (Exception ex)
        {
          Console.WriteLine($"Error sending approval SMS: {ex.Message}");
        }
      }

      //            if (!string.IsNullOrEmpty(result.ApprovalId)
      //&& model.Status.Equals("APPROVED", StringComparison.OrdinalIgnoreCase)
      //&& result.StatusValue?.ToLower() == "DM Reviewed")
      if (!string.IsNullOrEmpty(result.ApprovalId)
          && model.Status.Equals("APPROVED", StringComparison.OrdinalIgnoreCase)
          && (
              string.Equals(result.StatusValue, "DM Reviewed", StringComparison.OrdinalIgnoreCase)
              || string.Equals(result.StatusValue, "Approved By Head Quarter", StringComparison.OrdinalIgnoreCase)
             ))
      {

        try
        {
          // Get application details for SMS
          var applicationDetails = _schemeDAL.Application_Get_Details_For_SMS(model.ApplicationId);
          if (applicationDetails != null && !string.IsNullOrWhiteSpace(applicationDetails.Mobile_Number))
          {
            SendSchemeApprovalSMSForDM_And_HQ(applicationDetails, result.StatusValue);
    
                    }

                    if (!string.IsNullOrWhiteSpace(applicationDetails.Email))
                    {
                        SendSchemeApprovalEmailForDM_And_HQ(applicationDetails, result.StatusValue);
                    }
                }
        catch (Exception ex)
        {
          Console.WriteLine($"Error sending approval SMS: {ex.Message}");
        }
      }

      return result.ApprovalId;
    }
    private void SendSchemeApprovalSMSForDM_And_HQ(ApplicationDetailsForSMS applicationDetails, string dbStatusValue)
    {
      try
      {
        var mobileNumbers = new List<string> { applicationDetails.Mobile_Number };
        string fullName = $"{applicationDetails.First_Name} {applicationDetails.Last_Name}".Trim();

        // Map DB status to friendly text
        string statusValue = dbStatusValue switch
        {
          "DM Reviewed" => "approved by DM",
          "Approved By Head Quarter" => "approved by HQ",
          _ => dbStatusValue
        };

        // Construct name with extra text
        string customizedName = $"{fullName}, you got {statusValue}";

        var messageReplaces = new Dictionary<string, string>
        {
            { "{#name#}", customizedName }, // 👈 with extra string
            { "{#scheme_name#}", applicationDetails.Scheme_Name_English ?? "N/A" }
        };

        string responseMessage;
        bool sent = _smsHelpers.SentSMS(
            mobileNumbers,
            "SCHEME_APPROVED_EN_TA",   // use your approved template code
            messageReplaces,
            out responseMessage
        );

        if (sent)
          Console.WriteLine($"Scheme status SMS sent successfully to {mobileNumbers.First()}");
        else
          Console.WriteLine($"Scheme status SMS failed: {responseMessage}");
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in SendSchemeApprovalSMSForDM_And_HQ: {ex.Message}");
      }
    }
    private void SendSchemeApprovalSMS(ApplicationDetailsForSMS applicationDetails)
        {
            try
            {
                var mobileNumbers = new List<string> { applicationDetails.Mobile_Number };
                string fullName = $"{applicationDetails.First_Name} {applicationDetails.Last_Name}".Trim();

                // English SMS
                var englishMessageReplaces = new Dictionary<string, string>
        {
            { "{#name#}", fullName },
            { "{#scheme_name#}", applicationDetails.Scheme_Name_English ?? "N/A" }
        };

                // Tamil SMS
                var tamilMessageReplaces = new Dictionary<string, string>
        {
            { "{#name#}", fullName },
            { "{#scheme_name#}", applicationDetails.Scheme_Name_Tamil ?? "N/A" }
        };

                // Send English SMS
                string englishMessage;
                bool englishSent = _smsHelpers.SentSMS(
                    mobileNumbers,
                    "SCHEME_APPROVED_EN_TA",
                    englishMessageReplaces,
                    out englishMessage);

                // Send Tamil SMS
                string tamilMessage;
                bool tamilSent = _smsHelpers.SentSMS(
                    mobileNumbers,
                    "SCHEME_APPROVED_EN_TAMIL",  // Note: Changed template code for Tamil
                    tamilMessageReplaces,
                    out tamilMessage, 8);

                // You might want to log the results in production
                if (!englishSent || !tamilSent)
                {
                    Console.WriteLine($"SMS sending failed - English: {englishSent}, Tamil: {tamilSent}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendSchemeApprovalSMS: {ex.Message}");
            }
        }

        private void SendAmountCreditedSMS(ApplicationDetailsForSMS applicationDetails)
        {
            try
            {
                var mobileNumbers = new List<string> { applicationDetails.Mobile_Number };
                string fullName = $"{applicationDetails.First_Name} {applicationDetails.Last_Name}".Trim();

                // English SMS
                var englishMessageReplaces = new Dictionary<string, string>
        {
            { "{#name#}", fullName },
            { "{#scheme_name#}", applicationDetails.Scheme_Name_English ?? "N/A" },
            { "{#amount#}", applicationDetails.Amount.ToString("0.00") }
        };

                // Tamil SMS
                var tamilMessageReplaces = new Dictionary<string, string>
        {
            { "{#name#}", fullName },
            { "{#scheme_name#}", applicationDetails.Scheme_Name_Tamil ?? "N/A" },
            { "{#amount#}", applicationDetails.Amount.ToString("0.00") }
        };

                // Send English SMS
                string englishMessage;
                bool englishSent = _smsHelpers.SentSMS(
                    mobileNumbers,
                    "AMOUNT_CREDITED_EN_TA",
                    englishMessageReplaces,
                    out englishMessage);

                // Send Tamil SMS
                string tamilMessage;
                bool tamilSent = _smsHelpers.SentSMS(
                    mobileNumbers,
                    "AMOUNT_CREDITED_EN_TAMIL",
                    tamilMessageReplaces,
                    out tamilMessage, 8);

                // You might want to log the results in production
                if (!englishSent || !tamilSent)
                {
                    Console.WriteLine($"SMS sending failed - English: {englishSent}, Tamil: {tamilSent}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendAmountCreditedSMS: {ex.Message}");
            }
        }

        private void SendSchemeApprovalEmailForDM_And_HQ(ApplicationDetailsForSMS applicationDetails, string dbStatusValue)
        {
            try
            {
                // Map DB status to friendly text
                string statusValue = dbStatusValue switch
                {
                    "DM Reviewed" => "approved by DM",
                    "Approved By Head Quarter" => "approved by HQ",
                    _ => dbStatusValue
                };

                string fullName = $"{applicationDetails.First_Name} {applicationDetails.Last_Name}".Trim();
                string customizedName = $"{fullName}, your application has been {statusValue}";

                // Load Email Template
                EmailSMSTemplate _templateClass = new EmailSMSTemplate();
                EmailTemplateModel template = _templateClass.GetEmailTemplate(ApplicationEmailTemplateCode.SCHEME_APPROVED_DM_HQ);

                // Get CallLetter Config
                CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
                _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);

                // Manager info if needed
                CallletterUserModel? _manager = _settingDAL
                    .GetUserByRoleAndDistrict(applicationDetails.District_Id, _callletterConfig.DistrictManagerRoleCode)
                    .FirstOrDefault();

                // Build Email
                EmailModel email = new EmailModel();
                email.To = new List<string> { applicationDetails.Email };
                email.CC = new List<string>(); // optional – add HQ/DM emails if required
                email.Subject = template.Subject;
                email.Body = template.Body;

                email.SubjectPlaceHolders = new Dictionary<string, string>()
        {
            {"{APPLICATION_ID}", applicationDetails.Application_Id.ToString()},
            {"{SCHEME_NAME}", applicationDetails.Scheme_Name_English ?? "N/A"}
        };

                email.BodyPlaceHolders = new Dictionary<string, string>()
        {
            {"{RECIPIENTNAME}", customizedName},
            {"{SCHEME_NAME}", applicationDetails.Scheme_Name_English},
                   
            {"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
            {"{MANAGER_NAME}", _manager?.FirstName + " " + _manager?.LastName},
            {"{MANAGER_EMAIL}", _manager?.Email},
            {"{MANAGER_CONTACT}", _manager?.Mobile}
        };

                string body = "";
                string subject = "";

                bool sent = _mailHelpers.SendMail(email, out body, out subject);
                Console.WriteLine(sent
                    ? $"Approval Email (DM/HQ) sent to {applicationDetails.Email}"
                    : $"Failed to send Approval Email (DM/HQ) to {applicationDetails.Email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendSchemeApprovalEmailForDM_And_HQ: {ex.Message}");
            }
        }

        private void SendSchemeApprovalEmail(ApplicationDetailsForSMS applicationDetails)
        {
            try
            {
                EmailSMSTemplate _templateClass = new EmailSMSTemplate();
                EmailTemplateModel template = _templateClass.GetEmailTemplate(ApplicationEmailTemplateCode.SCHEME_APPROVED);
                CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
                _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);
                CallletterUserModel? _manager = _settingDAL.GetUserByRoleAndDistrict(applicationDetails.District_Id, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();

                EmailModel email = new EmailModel();
                email.To = new List<string> { applicationDetails.Email };
                email.CC = new List<string>(); // you can add Manager Email here if needed
                email.Subject = template.Subject;
                email.Body = template.Body;

                email.SubjectPlaceHolders = new Dictionary<string, string>()
        {
            {"{APPLICATION_ID}", applicationDetails.Scheme_Name_English.ToString() }
        };

                email.BodyPlaceHolders = new Dictionary<string, string>()
        {
            {"{APPLICATION_ID}", applicationDetails.Scheme_Name_English.ToString() },
            {"{RECIPIENTFIRSTNAME}", applicationDetails.First_Name},
            {"{RECIPIENTLASTNAME}", applicationDetails.Last_Name},
            {"{SCHEME_NAME}", applicationDetails.Scheme_Name_English},
            {"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
              {"{MANAGER_NAME}", _manager.FirstName + " " + _manager.LastName},
               {"{MANAGER_EMAIL}", _manager.Email},
            {"{MANAGER_CONTACT}", _manager.Mobile}

        };

                string body = "";
                string subject = "";

                bool sent = _mailHelpers.SendMail(email, out body, out subject);
                Console.WriteLine(sent
                    ? $"Approval Email sent to {applicationDetails.Email}"
                    : $"Failed to send Approval Email to {applicationDetails.Email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendSchemeApprovalEmail: {ex.Message}");
            }
        }

        private void SendAmountCreditedEmail(ApplicationDetailsForSMS applicationDetails)
        {
            try
            {
                EmailSMSTemplate _templateClass = new EmailSMSTemplate();
            

                CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
                _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);
                CallletterUserModel? _manager = _settingDAL.GetUserByRoleAndDistrict(applicationDetails.District_Id, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();

                EmailTemplateModel template = _templateClass.GetEmailTemplate(ApplicationEmailTemplateCode.AMOUNT_CREDITED);

                EmailModel email = new EmailModel();
                email.To = new List<string> { applicationDetails.Email };
                email.Subject = template.Subject;
                email.Body = template.Body;

                email.SubjectPlaceHolders = new Dictionary<string, string>()
        {
            {"{APPLICATION_ID}", applicationDetails.Scheme_Name_English.ToString() }
        };

                email.BodyPlaceHolders = new Dictionary<string, string>()
        {
            {"{APPLICATION_ID}", applicationDetails.Application_Id.ToString() },
            {"{RECIPIENTFIRSTNAME}", applicationDetails.First_Name},
            {"{RECIPIENTLASTNAME}", applicationDetails.Last_Name},
            {"{SCHEME_NAME}", applicationDetails.Scheme_Name_English},
            {"{AMOUNT}", applicationDetails.Amount.ToString("0.00")},
             {"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
              {"{MANAGER_NAME}", _manager.FirstName + " " + _manager.LastName},
               {"{MANAGER_EMAIL}", _manager.Email},
            {"{MANAGER_CONTACT}", _manager.Mobile}
        };

                string body = "";
                string subject = "";

                bool sent = _mailHelpers.SendMail(email, out body, out subject);
                Console.WriteLine(sent
                    ? $"Amount Credited Email sent to {applicationDetails.Email}"
                    : $"Failed to send Amount Credited Email to {applicationDetails.Email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SendAmountCreditedEmail: {ex.Message}");
            }
        }

        public string Application_bulk_approval_comments_Save(BulkApprovalModel model, AuditColumnsModel audit)
        {
            return _schemeDAL.Application_bulk_approval_comments_Save(model, audit);
        }
        public List<ApprovalViewModel> Application_approval_comments_Get(string Id = "", string ApplicationId = "")
        {
            return _schemeDAL.Application_approval_comments_Get(Id, ApplicationId);
        }
        public List<ApproveStatusItemModel> ApplicationApprovalStatusList(string ApplicationId)
        {
            return _schemeDAL.ApplicationApprovalStatusList(ApplicationId);
        }
        public List<ApproveStatusItemModel> ApplicationBulkApprovalStatusList(string StatusId, string SchemeId)
        {
            return _schemeDAL.ApplicationBulkApprovalStatusList(StatusId, SchemeId);
        }

        // Callletter
        public List<SelectListItem> Callletter_Application_SelectList_Get(string District = "", string SchemeId = "", string StatusId = "")
        {
            List<SelectListItem> list = new List<SelectListItem>();
            List<ApplicationSelectListModel> applicationList = _schemeDAL.Callletter_Application_SelectList_Get(District, SchemeId, StatusId);
            if (applicationList.Count > 0)
            {
                list = applicationList.Select(x => new SelectListItem() { Text = x.ApplicationNumber + " - (" + x.FirstName + " " + x.LastName + ")", Value = x.Id, Selected = false }).ToList();
            }

            return list;
        }
        public List<CallletterApplicationModel> Callletter_Application_Get(string Id = "", string CallletterId = "", string ApplicationId = "", bool IsActive = true)
        {
            return _schemeDAL.Callletter_Application_Get(Id, CallletterId, ApplicationId, IsActive);
        }
        public string Callletter_Application_SaveUpdate(CallletterMasterSaveModel model, AuditColumnsModel audit)
        {
            string CalletterId = _schemeDAL.Callletter_Application_SaveUpdate(model, audit);

            _schemeDAL.Callletter_Update_Callletter_Status(CalletterId, "Scheduled");

            return CalletterId;
        }
        public List<CallletterGridModel> Callletter_Grid_Get(CallletterFilterModel model, out int TotalCount)
        {
            return _schemeDAL.Callletter_Grid_Get(model, out TotalCount);
        }
        public CallletterMasterSaveModel Callletter_Application_Master_Get(string Id)
        {
            CallletterMasterSaveModel model = _schemeDAL.Callletter_Application_Master_Get(Id);
            if (model != null)
            {
                model.Application = new List<CallletterApplicationModel>();
                model.Application = _schemeDAL.Callletter_Application_Get(CallletterId: Id, IsActive: true);
            }

            return model;
        }
        public string Callletter_Application_Master_Delete(string Id, bool IsActive, AuditColumnsModel audit)
        {
            return _schemeDAL.Callletter_Application_Master_Delete(Id, IsActive, audit);
        }
        public bool CallLetter_SendMessage(string id, string baseUrl, string status, AuditColumnsModel audit, string ApplicationId = "")
        {
            _backgroundTaskQueue.QueueBackgroundWorkItem(workItem: token =>
            {
                using (var scope = _serviceScopeFactory.CreateScope())
                {
                    try
                    {
                        _SendMessageInBackground(id, baseUrl, status, audit, scope, ApplicationId);
                    }
                    catch (Exception ex)
                    {
                        Log.Error(ex, ex.Message);
                    }
                }

                return Task.CompletedTask;
            });

            return false;
        }
        public void _SendMessageInBackground(string id, string baseUrl, string status, AuditColumnsModel audit, IServiceScope _scope, string ApplicationId)
        {
            var _config = _scope.ServiceProvider.GetRequiredService<IConfiguration>();
            var _sms = _scope.ServiceProvider.GetRequiredService<ISMSHelper>();
            var _mail = _scope.ServiceProvider.GetRequiredService<IMailHelper>();
            var _dapper = _scope.ServiceProvider.GetRequiredService<IMySqlDapperHelper>();
            var _mySql = _scope.ServiceProvider.GetRequiredService<IMySqlHelper>();

            SettingsDAL _setting = new SettingsDAL(_config);
            SchemeDAL _scheme = new SchemeDAL(_dapper, _mySql, _config);

            CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
            _config.GetSection("CallLetterConfig").Bind(_callletterConfig);

            List<CallletterApplicationModel> applications = _scheme.Callletter_Application_Get(CallletterId: id, IsActive: true, ApplicationId: ApplicationId);

            if (status == "CANCELED")
            {
                applications = applications.Where(x => x.IsSent == true).ToList();
            }

            if (applications != null && applications.Count > 0)
            {
                List<CallletterStatusModel> status_list = GetCallletterStatus(applications[0].SchemeId);
                CallletterUserModel? _manager = _setting.GetUserByRoleAndDistrict(applications[0].DistrictId, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();

                EmailSMSTemplate _templateClass = new EmailSMSTemplate();

                EmailTemplateModel template = _templateClass.GetEmailTemplate(status);
                if (template.Body == "")
                {
                    template = _templateClass.GetEmailTemplate("APPLICANT_DEFAULTMAILTEMPLATE");
                }

                if (_manager != null)
                {
                    foreach (CallletterApplicationModel application in applications)
                    {
                        bool isMailSent = false;
                        bool isSMSSent = false;

                        if (!string.IsNullOrEmpty(application.Email))
                        {
                            EmailModel email = new EmailModel();
                            email.To = new List<string> { application.Email };
                            email.Subject = template.Subject;
                            email.Body = template.Body;
                            email.CC = new List<string>() { _manager.Email };

                            email.SubjectPlaceHolders = new Dictionary<string, string>() {

                                {"{APPLICATION_ID}", application.ApplicationNumber}
                            };

                            email.BodyPlaceHolders = new Dictionary<string, string>() {

                                {"{APPLICATION_ID}", application.ApplicationNumber},
                                {"{RECIPIENTFIRSTNAME}", application.FirstName},
                                {"{RECIPIENTLASTNAME}", application.LastName},
                                {"{STATUS}", "Call letter sent"},
                                {"{APPLICATION_URL}", baseUrl},
                                {"{MANAGER_NAME}", _manager.FirstName + " " + _manager.LastName},
                                {"{NAME}", application.CallletterName},
                                {"{SUBJECT}", application.CallletterSubject},
                                {"{VENUE}", application.Venue},
                                {"{MANAGER_EMAIL}", _manager.Email},
                                {"{MANAGER_CONTACT}", _manager.Mobile},
                                {"{FROM}", StringFunctions.DateTimeToIST(application.MeetingTimeFrom).ToString("hh:mm tt")},
                                {"{TO}", StringFunctions.DateTimeToIST(application.MeetingTimeTo).ToString("hh:mm tt")},
                                {"{DATE}", StringFunctions.DateTimeToIST(application.MeetingDate).ToString("dd/MM/yyyy")},
                                {"{COMMENT}", application.Comments}
                            };

                            string Subject = "";
                            string Body = "";

                            isMailSent = _mail.SendMail(email, out Body, out Subject);


                            _scheme.CallletterHistorySave(new CallletterHistoryModel()
                            {
                                CallletterId = id,
                                ApplicationId = application.ApplicationId,
                                RecordType = "MAIL",
                                CommunicatedAddress = application.Email,
                                Subject = Subject,
                                Body = Body,
                            }, audit);
                        }
                        if (!string.IsNullOrEmpty(application.Mobile))
                        {
                            IDictionary<string, string> replaces = new Dictionary<string, string>()
                            {
                                {"{#app_no#}", application.ApplicationNumber},
                                {"{#status#}", application.Status},
                                {"{#common_text#}", "Attend Meeting required"}
                            };

                            string _message = string.Empty;
                            isSMSSent = _sms.SentSMS(new List<string>() { application.Mobile }, "CALLLETTER", replaces, out _message);

                            _scheme.CallletterHistorySave(new CallletterHistoryModel()
                            {
                                CallletterId = id,
                                ApplicationId = application.ApplicationId,
                                RecordType = "SMS",
                                CommunicatedAddress = application.Mobile,
                                Subject = _message,
                                Body = _message,
                            }, audit);
                        }

                        if (isMailSent || isSMSSent)
                        {
                            CallletterStatusModel? status_item = status_list.Where(ss => ss.StatusId == application.StatusId).FirstOrDefault();
                            if (status_item != null)
                            {
                                if (status_item.IsNextStatus == false)
                                {
                                    CallletterStatusModel? next_status_item = status_list.Where(ss => ss.PreviousStatusId == application.StatusId).FirstOrDefault();

                                    if (next_status_item != null)
                                    {
                                        ApprovalModel approval = new ApprovalModel();
                                        approval.ApplicationId = application.ApplicationId;
                                        approval.SchemeId = application.SchemeId;
                                        approval.Status = "APPROVED";
                                        approval.ApprovalComment = "";
                                        approval.StatusIdFrom = application.StatusId;
                                        approval.StatusIdTo = next_status_item.StatusId;
                                        approval.Reason = "";
                                        approval.Id = Guid.NewGuid().ToString();

                                        Application_approval_comments_Save(approval, audit, false);
                                    }
                                }
                            }

                            _schemeDAL.CallletterApplicationStatusSave(application.Id, audit);


                        }
                    }

                    if (status == "CANCELED")
                    {
                        _schemeDAL.Callletter_Update_Callletter_Status(id, "Cancelled");
                    }
                    else
                    {
                        _schemeDAL.Callletter_Update_Callletter_Status(id, "SetMessageStatus");
                    }
                }
            }
        }
        public string Callletter_Update_Callletter_Status(string callLetterId, string status)
        {
            return _schemeDAL.Callletter_Update_Callletter_Status(callLetterId, status);
        }
        public List<CallletterStatusModel> GetCallletterStatus(string schemeId)
        {
            List<CallletterStatusModel> list = new List<CallletterStatusModel>();
            List<string> statusList = _schemeDAL.Callletter_Get_StatusId(schemeId);
            if (statusList.Count > 0)
            {
                List<ConfigSchemeStatusMappingModel> statusMappingList = _settingDAL.Scheme_Status_Mapping_Get(schemeId);
                if (statusMappingList.Count > 0)
                {
                    List<CallletterStatusModel> _parent_status_list = statusMappingList.Where(x => statusList.Contains(x.StatusId)).Select(i => new CallletterStatusModel()
                    {
                        StatusId = i.StatusId,
                        Status = i.StatusName,
                        IsNextStatus = false,
                        StatusOrder = i.SortOrder
                    }).ToList();

                    foreach (CallletterStatusModel _parent_status in _parent_status_list)
                    {
                        list.AddRange(statusMappingList.Where(x => x.SortOrder == (_parent_status.StatusOrder + 1)).Select(i => new CallletterStatusModel()
                        {
                            StatusId = i.StatusId,
                            Status = i.StatusName,
                            StatusOrder = i.SortOrder,
                            IsNextStatus = true,
                            PreviousStatusId = _parent_status.StatusId,
                        }));
                    }

                    list.AddRange(_parent_status_list);
                }
            }
            return list.OrderBy(o => o.StatusOrder).ToList();
        }
        public List<string> Callletter_Get_Configured_StatusId(string schemeId)
        {
            return _schemeDAL.Callletter_Get_StatusId(schemeId);
        }
        public List<string> DocRequired_Get_StatusId(string schemeId)
        {
            return _schemeDAL.DocRequired_Get_StatusId(schemeId);
        }
        // UC
        public List<ApplicationUtilizationCirtificateModel> Application_Utilisation_Certificate_Get(string Id = "", string ApplicationId = "")
        {
            return _schemeDAL.Application_Utilisation_Certificate_Get(Id, ApplicationId);
        }
        public string Application_Utilisation_Certificate_SaveUpdate(ApplicationUtilizationCirtificateSaveModel model, AuditColumnsModel audit)
        {
            return _schemeDAL.Application_Utilisation_Certificate_SaveUpdate(model, audit);
        }

        // Form 3
        public List<ApplicationForm3Model> Application_Form_3_Get(string Id = "", string ApplicationId = "")
        {
            return _schemeDAL.Application_Form_3_Get(Id, ApplicationId);
        }
        public string Application_Form_3_SaveUpdate(ApplicationForm3SaveModel model, AuditColumnsModel audit)
        {
            return _schemeDAL.Application_Form_3_SaveUpdate(model, audit);
        }

        // Type of Training
        public List<ApplicationTypeOfTrainingModel> TypeOfTraining_Get(string ApplicationId)
        {
            return _schemeDAL.TypeOfTraining_Get(ApplicationId);
        }
        public string TypeOfTraining_SaveUpdate(ApplicationTypeOfTrainingModel model)
        {
            return _schemeDAL.TypeOfTraining_SaveUpdate(model);
        }

        #region Application Approval File
        public string Application_Approval_File_Save(ApplicationApprovalFileModel model, AuditColumnsModel audit)
        {
            return _schemeDAL.Application_Approval_File_Save(model, audit);
        }
        public List<ApplicationApprovalFileModel> Application_Approval_File_Get(string ApplicationId = "", string StatusId = "", string ApprovalCommentId = "")
        {
            return _schemeDAL.Application_Approval_File_Get(ApplicationId, StatusId, ApprovalCommentId);
        }
        public List<ApplicationApprovalFileModel> Application_Approval_Doc_Category_Get(string ApplicationId, string SchemeId, string StatusId, string ApprovalCommentId)
        {
            return _schemeDAL.Application_Approval_Doc_Category_Get(ApplicationId, SchemeId, StatusId, ApprovalCommentId);
        }
        public ApplicationApprovalFileModel Application_Approval_Doc_Category_GetSavedFileNames(string Id)
        {
            return _schemeDAL.Application_Approval_Doc_Category_GetSavedFileNames(Id);
        }
        #endregion Application Approval File

        public bool MoveApplicationsToTrash(List<string> applicationIds, string userId)
        {
            try
            {
                using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

                string query = @"
          UPDATE application_master 
          SET IsActive = 0,
              ModifiedDate = @ModifiedDate,
              ModifiedBy = @UserId
          WHERE Id IN @ApplicationIds 
          AND StatusId = '43ea8ff6-043a-eccd-d9a0-95841bcb48e1'  -- Only Saved status
          AND IsActive = 1";

                var parameters = new
                {
                    ApplicationIds = applicationIds,
                    UserId = userId,
                    ModifiedDate = DateTime.Now
                };

                int rowsAffected = connection.Execute(query, parameters);
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in MoveApplicationsToTrash");
                return false;
            }
        }

        public bool RestoreApplicationsFromTrash(List<string> applicationIds, string userId)
        {
            try
            {
                using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

                string query = @"
          UPDATE application_master 
          SET IsActive = 1,
              ModifiedDate = @ModifiedDate,
              ModifiedBy = @UserId
          WHERE Id IN @ApplicationIds 
          AND IsActive = 0";

                var parameters = new
                {
                    ApplicationIds = applicationIds,
                    UserId = userId,
                    ModifiedDate = DateTime.Now
                };

                int rowsAffected = connection.Execute(query, parameters);
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in RestoreApplicationsFromTrash");
                return false;
            }
        }
    }
}
