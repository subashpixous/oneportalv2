using AutoMapper;
using BAL.Interface;
using DAL;
using DocumentFormat.OpenXml.Office2010.ExcelAc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.CardApprpvalModels;
using Model.DomainModel.MemberModels;
using Model.MailTemplateHelper;
using Model.ViewModel;
using Model.ViewModel.MemberModels;
using Org.BouncyCastle.Tls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utils;
using Utils.Cache.Configuration;
using Utils.Interface;
using Utils.UtilModels;

namespace BAL
{
    public class UserBAL : IUserBAL
    {
        private readonly SettingsDAL _settingDAL;
        private readonly GeneralDAL _generalDAL;
        private readonly SchemeDAL _schemeDAL;
        private readonly UserDAL _userDAL;
        private readonly MemberDAL _memberDAL;
        private readonly IMapper _mapper;
        private readonly IFTPHelpers _fTPHelpers;
        private readonly ISMSHelper _smsHelpers;
        private readonly IMailHelper _mailHelpers;
        private readonly IConfiguration _configuration;
        private readonly IConfigurationCacheService _configCache;


        public UserBAL(IMySqlDapperHelper mySqlDapperHelper, IMySqlHelper mySqlHelper, IMapper mapper, IConfiguration configuration, IFTPHelpers fTPHelpers, IMailHelper mailHelpers, ISMSHelper SmsHelpers, IConfigurationCacheService configCache)
        {
            _settingDAL = new SettingsDAL(configuration);
            _generalDAL = new GeneralDAL(configuration);
            _schemeDAL = new SchemeDAL(mySqlDapperHelper, mySqlHelper, configuration);
            _userDAL = new UserDAL(mySqlDapperHelper, mySqlHelper, configuration);
            _memberDAL = new MemberDAL(configuration);
            _configuration = configuration;
            _mapper = mapper;
            _fTPHelpers = fTPHelpers;
            _smsHelpers = SmsHelpers;
            _mailHelpers = mailHelpers;
            _configCache = configCache;
        }

        public List<ApplicationGridViewModel> Application_GetList(string Id = "", string ApplicationId = "", string Mobile = "", string Email = "", string MemberId = "")
        {
            return _schemeDAL.Application_GetList(Id, ApplicationId, Mobile, Email, false, _generalDAL.ApplicationExpiryDays(), MemberId);
        }
        public UserBankBranchForFilterModel Application_Get_Bank_Branch_Filter_Value(string UserId)
        {
            return _userDAL.Application_Get_Bank_Branch_Filter_Value(UserId);
        }


        #region Member Data Change Approval
        //public List<MemberDataApprovalGridModel> MemberDataApprovalGridGet(MemberDataApprovalGridFilterModel filter, out int TotalCount)
        //{

        //    if (!string.IsNullOrWhiteSpace(filter?.SearchString))
        //    {
        //        var districtMaps = _configCache.Get("DISTRICT");

        //        var matchedDistrictIds = districtMaps
        //            .Where(x => x.Value.Contains(
        //                filter.SearchString,
        //                StringComparison.OrdinalIgnoreCase))
        //            .Select(x => x.Key)
        //            .ToList();

        //        if (matchedDistrictIds.Count > 0)
        //        {
        //            filter.Where ??= new MemberDataApprovalGridWhereClauseProperties();
        //            filter.Where.DistrictIds = matchedDistrictIds;
        //        }
        //    }

        //    var list = _userDAL.MemberDataApprovalGridGet(filter, out TotalCount);


        //    if (list == null || list.Count == 0)
        //        return list;

        //    var districtMap = _configCache.Get("DISTRICT");
        //    var zoneMap = _configCache.Get("ZONE");

        //    foreach (var row in list)
        //    {
        //        if (!string.IsNullOrEmpty(row.DistrictId) &&
        //            districtMap.TryGetValue(row.DistrictId, out var district))
        //            row.District = district;

        //        if (!string.IsNullOrEmpty(row.ZoneId) &&
        //            zoneMap.TryGetValue(row.ZoneId, out var zone))
        //            row.ZoneName = zone;
        //    }

        //    return list;

        //    //return _userDAL.MemberDataApprovalGridGet(filter, out TotalCount);
        //}

        public List<MemberDataApprovalGridModel> MemberDataApprovalGridGet(MemberDataApprovalGridFilterModel filter,out int TotalCount)
        {

            if (!string.IsNullOrWhiteSpace(filter?.SearchString))
            {
                var districtMap = _configCache.Get("DISTRICT");

                var matchedDistrictIds = districtMap
                    .Where(x => x.Value.Contains(
                        filter.SearchString,
                        StringComparison.OrdinalIgnoreCase))
                    .Select(x => x.Key)
                    .ToList();

                if (matchedDistrictIds.Count > 0)
                {
                    filter.Where ??= new MemberDataApprovalGridWhereClauseProperties();
                    filter.Where.DistrictIds = matchedDistrictIds;
                }
            }

            if (filter.ColumnSearch?.Count > 0)
            {
                var districtColumnSearch = filter.ColumnSearch
                    .FirstOrDefault(x =>
                        x.FieldName.Equals("District", StringComparison.OrdinalIgnoreCase)
                        && !string.IsNullOrWhiteSpace(x.SearchString));

                if (districtColumnSearch != null)
                {
                    var districtMap = _configCache.Get("DISTRICT");

                    var matchedDistrictIds = districtMap
                        .Where(x => x.Value.Contains(
                            districtColumnSearch.SearchString,
                            StringComparison.OrdinalIgnoreCase))
                        .Select(x => x.Key)
                        .ToList();

                    if (matchedDistrictIds.Count > 0)
                    {
                        filter.Where ??= new MemberDataApprovalGridWhereClauseProperties();
                        filter.Where.DistrictIds = matchedDistrictIds;
                    }

                    filter.ColumnSearch.Remove(districtColumnSearch);
                }
            }


            var list = _userDAL.MemberDataApprovalGridGet(filter, out TotalCount);

            if (list == null || list.Count == 0)
                return list;

            var districtLookup = _configCache.Get("DISTRICT");
            var zoneLookup = _configCache.Get("ZONE");

            foreach (var row in list)
            {
                if (!string.IsNullOrEmpty(row.DistrictId) &&
                    districtLookup.TryGetValue(row.DistrictId, out var district))
                {
                    row.District = district;
                }

                if (!string.IsNullOrEmpty(row.ZoneId) &&
                    zoneLookup.TryGetValue(row.ZoneId, out var zone))
                {
                    row.ZoneName = zone;
                }
            }

            return list;
        }


        public MemberDataApprovalFormModel MemberDataApprovalForm(string RequestId, AccountUserModel user)
        {
            MemberDataApprovalFormModel model = new MemberDataApprovalFormModel();
            model.StatusList = new List<SelectListItem>();
            model.ReasonList = _settingDAL.Configuration_Get(IsActive: true, CategoryCode: "MEMBER_DATA_APPROVAL_REASON").Select(x => new SelectListItem()
            {
                Text = x.Value,
                Value = x.Value,
            }).ToList();

            model.RequestId = RequestId;
            model.ApprovalHistory = _memberDAL.Member_Data_Approval_History_Get(RequestId: RequestId);

            List<ApprovalFlowMaster> approvalFlowList = _settingDAL.ApprovalFlow_Get();
            MemberDataApprovalMaster? request = _memberDAL.Member_Data_Approval_Master_Get(Id: RequestId).FirstOrDefault();
            if (request != null)
            {
                model.ChangeRequestCode = request.Changed_Detail_Record;

                model.CurrentRoleName = request.ApprovalForDesignation;
                ApprovalFlowMaster? currentRole = approvalFlowList.Find(x => x.RoleId == request.Approval_For);
                if (currentRole != null)
                {
                    model.FromRoleId = currentRole.RoleId;
                    model.CurrentRoleId = currentRole.RoleId;

                    if (currentRole.IsFinal == true && model.CurrentRoleName == user.RoleName)
                    {
                        model.StatusList.Add(new SelectListItem() { Text = "Approve", Value = model.CurrentRoleId });
                    }

                    ApprovalFlowMaster? nextRole = approvalFlowList.Find(x => x.OrderNumber == currentRole.OrderNumber + 1);
                    if (nextRole != null)
                    {
                        model.NextRoleName = nextRole.RoleName;
                        model.NextRoleId = nextRole.RoleId;

                        model.StatusList.Add(new SelectListItem()
                        {
                            Text = "Approve (" + nextRole.RoleName + ")",
                            Value = nextRole.RoleId
                        });
                    }

                    ApprovalFlowMaster? previousRole = approvalFlowList.Find(x => x.OrderNumber == currentRole.OrderNumber - 1);
                    if (previousRole != null && !string.IsNullOrEmpty(request.ApprovedBy))
                    {
                        model.StatusList.Add(new SelectListItem()
                        {
                            Text = "Return (" + previousRole.RoleName + ")",
                            Value = previousRole.RoleId
                        });
                    }
                    else
                    {
                        model.StatusList.Add(new SelectListItem()
                        {
                            Text = "Return",
                            Value = "RETURNED_TO_MEMBER"
                        });
                    }

                }
            }

            if ( model.CurrentRoleName == user.RoleName)
            {
                model.StatusList.Add(new SelectListItem() { Text = "Reject", Value = "REJECTED" });
            }

            return model;
        }
        
        
        
        //created by surya

        #region Member Data Change Approval with SMS
        //public string MemberDataApproval(MemberDataApprovalFromSubmitModel model, AuditColumnsModel audit)
        //{
        //    if (model.SelectedRoleText.Contains("Approve"))
        //    {
        //        model.Status = "IN_PROGRESS";
        //        model.Status2 = "Approved";
        //    }
        //    else if (model.SelectedRoleText.Contains("Return"))
        //    {
        //        model.Status = "RETURNED";
        //        model.Status2 = "Returned";
        //    }
        //    else if (model.SelectedRoleText.Contains("Reject"))
        //    {
        //        model.Status = "REJECTED";
        //        model.Status2 = "Rejected";
        //    }
        //    // First, update DB
        //    var result = _userDAL.MemberDataApproval(model, audit);

        //    // Only send SMS after DB update is done
        //    if (model.SelectedRoleText.Contains("Approve"))
        //    {
        //        var memberDetails = _memberDAL.GetMemberDetailsByRequestId(model.RequestId);
        //        if (memberDetails != null && memberDetails.pIsCompleted)
        //        {
        //            SendApprovalSMS(memberDetails);
        //        }
        //    }

        //    return result;
        //}
        //#endregion
        //private void SendApprovalSMS(MemberDetails memberDetails)
        //{
        //    try
        //    {
        //        if (string.IsNullOrWhiteSpace(memberDetails.Phone_Number))
        //        {
        //            Console.WriteLine("Cannot send SMS - Phone number is missing");
        //            return;
        //        }

        //        var mobileNumbers = new List<string> { memberDetails.Phone_Number };
        //        string fullName = $"{memberDetails.First_Name} {memberDetails.Last_Name}".Trim();

        //        var messageReplaces = new Dictionary<string, string>
        //{
        //    { "{#name#}", fullName },
        //    { "{#member_id#}", memberDetails.Member_ID ?? "N/A" }
        //};

        //        // Send English SMS
        //        string englishMessage;
        //        bool englishSent = _smsHelpers.SentSMS(
        //            mobileNumbers,
        //            "MEMBER_APPROVED_EN_ N",
        //            messageReplaces,
        //            out englishMessage);

        //        // Send Tamil SMS
        //        string tamilMessage;
        //        bool tamilSent = _smsHelpers.SentSMS(
        //            mobileNumbers,
        //            "MEMBER_APPROVED_EN_TAMIL",
        //            messageReplaces,
        //            out tamilMessage, 8);

        //        // Log results
        //        if (englishSent && tamilSent)
        //        {
        //            Console.WriteLine($"Approval SMS sent successfully to {mobileNumbers.First()}");
        //        }
        //        else
        //        {
        //            if (!englishSent) Console.WriteLine($"English SMS failed: {englishMessage}");
        //            if (!tamilSent) Console.WriteLine($"Tamil SMS failed: {tamilMessage}");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Error sending approval SMS: {ex.Message}");
        //    }
        //}

        //       public string MemberDataApproval(MemberDataApprovalFromSubmitModel model, AuditColumnsModel audit)
        //       {
        //           if (model.SelectedRoleText.Contains("Approve"))
        //           {
        //               model.Status = "IN_PROGRESS";
        //               model.Status2 = "Approved";
        //           }
        //           else if (model.SelectedRoleText.Contains("Return"))
        //           {
        //               model.Status = "RETURNED";
        //               model.Status2 = "Returned";
        //           }
        //           else if (model.SelectedRoleText.Contains("Reject"))
        //           {
        //               model.Status = "REJECTED";
        //               model.Status2 = "Rejected";
        //           }
        //           // First, update DB
        //           var result = _userDAL.MemberDataApproval(model, audit);

        //           // Only send SMS after DB update is done
        //           if (model.SelectedRoleText.Contains("Approve") || model.SelectedRoleText.Contains("Approve (Headquarters)"))
        //           {
        //               var memberDetails = _memberDAL.GetMemberDetailsByRequestId(model.RequestId);
        //               //if (memberDetails != null && memberDetails.pIsCompleted)
        //               if (memberDetails != null)
        //               {
        //                   SendApprovalSMS(memberDetails, model.SelectedRoleText);
        //                   SendApprovalMail(memberDetails, model.SelectedRoleText);
        //               }
        //           }

        //           return result;
        //       }
        //       #endregion
        //       private void SendApprovalSMS(MemberDetails memberDetails, string SelectedRoleText)
        //       {
        //           try
        //           {
        //               if (string.IsNullOrWhiteSpace(memberDetails.Phone_Number))
        //               {
        //                   Console.WriteLine("Cannot send SMS - Phone number is missing");
        //                   return;
        //               }

        //               var mobileNumbers = new List<string> { memberDetails.Phone_Number };
        //               string fullName = $"{memberDetails.First_Name} {memberDetails.Last_Name}".Trim();

        //               string memberIdValue = memberDetails.Member_ID ?? "N/A";

        //               // status depends on role
        //               string statusText = SelectedRoleText.Contains("Approve (Headquarters)")
        //                   ? "approved by DM"
        //                   : "approved by HQ";

        //               var messageReplaces = new Dictionary<string, string>
        //                   {
        //                       // use app_no for ID
        //                       { "{#app_no#}", memberIdValue },

        //                       // use status for the approval text
        //                       { "{#status#}", statusText },

        //                       // make common_text hold the name + membership meaning
        //                       { "{#common_text#}", $"Hi {fullName}, your membership (ID: {memberIdValue}) has been Regestered " }
        //                   };

        //               var messageReplaces_Ta = new Dictionary<string, string>
        //                   {
        //                       { "{#name#}", fullName },
        //                       { "{#member_id#}", memberIdValue }
        //                   };

        //               // Send English SMS

        //               //string englishMessage;
        //               //bool englishSent = _smsHelpers.SentSMS(
        //               //    mobileNumbers,
        //               //    "MEMBER_APPROVED_EN_ N",
        //               //    messageReplaces,
        //               //    out englishMessage);
        //               string englishMessage;
        //               bool englishSent = _smsHelpers.SentSMS(
        //                   mobileNumbers,
        //                   "COMMON",
        //                   messageReplaces,
        //                   out englishMessage);


        //               // Send Tamil SMS
        //               string tamilMessage;
        //               bool tamilSent = _smsHelpers.SentSMS(
        //                   mobileNumbers,
        //                   "MEMBER_APPROVED_EN_TAMIL",
        //                   messageReplaces_Ta,
        //                   out tamilMessage, 8);

        //               // Log results
        //               if (englishSent && tamilSent)
        //               {
        //                   Console.WriteLine($"Approval SMS sent successfully to {mobileNumbers.First()}");
        //               }
        //               else
        //               {
        //                   if (!englishSent) Console.WriteLine($"English SMS failed: {englishMessage}");
        //                   if (!tamilSent) Console.WriteLine($"Tamil SMS failed: {tamilMessage}");
        //               }
        //           }
        //           catch (Exception ex)
        //           {
        //               Console.WriteLine($"Error sending approval SMS: {ex.Message}");
        //           }
        //       }

        //       private void SendApprovalMail(MemberDetails memberDetails, string SelectedRoleText)
        //       {
        //           try
        //           {
        //               if (string.IsNullOrWhiteSpace(memberDetails.Email))
        //               {
        //                   Console.WriteLine("Cannot send Email - Email address is missing");
        //                   return;
        //               }

        //               // Decide mail template

        //               string mailCode = ApplicationEmailTemplateCode.APPLICANT_DEFAULTMAILTEMPLATE;


        //               // Get template
        //               EmailSMSTemplate _templateClass = new EmailSMSTemplate();
        //               EmailTemplateModel template = _templateClass.GetEmailTemplate(mailCode);
        //               CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
        //               _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);
        //               CallletterUserModel? manager = _settingDAL.GetUserByRoleAndDistrict(memberDetails.District_Id, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();

        //               if (template == null) return;

        //               // Status mapping
        //               string statusText = SelectedRoleText.Contains("Approve (Headquarters)")
        //                   ? "Approved by DM"
        //                   : "Approved by HQ";

        //               // Build Email
        //               EmailModel email = new EmailModel();
        //               email.To = new List<string> { memberDetails.Email };
        //               email.Subject = template.Subject;
        //               email.Body = template.Body;

        //               // Subject placeholders
        //               email.SubjectPlaceHolders = new Dictionary<string, string>()
        //       {
        //           { "{APPLICATION_ID}", memberDetails.Member_ID ?? "N/A" }
        //       };

        //               // Body placeholders
        //               email.BodyPlaceHolders = new Dictionary<string, string>()
        //       {
        //                    { "{APPLICATION_ID}", memberDetails.Member_ID ?? "" },

        //{"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
        //{"{MANAGER_NAME}", manager?.FirstName + " " + manager?.LastName ?? ""},
        //{"{MANAGER_EMAIL}", manager?.Email ?? ""},
        //{"{MANAGER_CONTACT}", manager?.Mobile ?? ""},

        //           { "{RECIPIENTFIRSTNAME}", memberDetails.First_Name ?? "" },
        //           { "{RECIPIENTLASTNAME}", memberDetails.Last_Name ?? "" },
        //           { "{MEMBER_ID}", memberDetails.Member_ID ?? "N/A" },
        //           { "{STATUS}", statusText }
        //       };

        //               string Subject = "";
        //               string Body = "";

        //               bool isMailSent = _mailHelpers.SendMail(email, out Body, out Subject);

        //               if (isMailSent)
        //               {
        //                   Console.WriteLine($"Approval Email sent successfully to {memberDetails.Email}");
        //               }
        //               else
        //               {
        //                   Console.WriteLine($"Approval Email failed for {memberDetails.Email}");
        //               }
        //           }
        //           catch (Exception ex)
        //           {
        //               Console.WriteLine($"Error sending approval Email: {ex.Message}");
        //           }
        //       }

        public string MemberDataApproval(MemberDataApprovalFromSubmitModel model, AuditColumnsModel audit)
        {
            if (model.SelectedRoleText.Contains("Approve"))
            {
                model.Status = "IN_PROGRESS";
                model.Status2 = "Approved";
            }
            else if (model.SelectedRoleText.Contains("Return"))
            {
                model.Status = "RETURNED";
                model.Status2 = "Returned";
            }
            else if (model.SelectedRoleText.Contains("Reject"))
            {
                model.Status = "REJECTED";
                model.Status2 = "Rejected";
            }
            else if (model.SelectedRoleText.Contains("Delete"))
            {
                model.Status = "DELETED";
                model.Status2 = "Deleted";
            }
            else if (model.SelectedRoleText.Contains("Restore"))
            {
                model.Status = "RESTORED";
                model.Status2 = "Restored";
            }
            // First, update DB
            var result = _userDAL.MemberDataApproval(model, audit);

            // Only send SMS after DB update is done
            if (model.SelectedRoleText != null)

            {
                var memberDetails = _memberDAL.GetMemberDetailsByRequestId(model.RequestId);

                if(string.IsNullOrEmpty(memberDetails.Member_ID))
                {
                    _memberDAL.GenerateMemberId(memberDetails.Id);
                }
                if (memberDetails != null)
                {
                    SendApprovalSMS(memberDetails, model.SelectedRoleText);
                    SendApprovalMail(memberDetails, model.SelectedRoleText);

                
                }
            }
            return result;
        }
        #endregion
        private void SendApprovalSMS(MemberDetails memberDetails, string SelectedRoleText)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(memberDetails.Phone_Number))
                {
                    Console.WriteLine("Cannot send SMS - Phone number is missing");
                    return;
                }

                var mobileNumbers = new List<string> { memberDetails.Phone_Number };
                string fullName = $"{memberDetails.First_Name} {memberDetails.Last_Name}".Trim();
                string memberIdValue = memberDetails.Member_ID ?? "N/A";

                // Decide status text
                string statusText = string.Empty;
                string commonText = $"Hi {fullName}, your membership (ID: {memberIdValue}) has been Approved";


                if (SelectedRoleText.Contains("Approve (Headquarters)"))
                {
                    statusText = "approved by DM";
                }
                else if (SelectedRoleText.Contains("Approve"))
                {
                    statusText = "approved by HQ";
                }
                else if (SelectedRoleText.Contains("Return") || SelectedRoleText.Contains("Return (District Manager)"))
                {
                    statusText = "returned for correction";
                    commonText = $"Hi {fullName}, your membership (ID: {memberIdValue}) has been Returned";
                }
                else if (SelectedRoleText.Contains("Reject"))
                {
                    statusText = "rejected";
                    commonText = $"Hi {fullName}, your membership (ID: {memberIdValue}) has been Rejected";
                }

                // Stop if no status matched
                if (string.IsNullOrEmpty(statusText))
                {
                    return;
                }

                var messageReplaces = new Dictionary<string, string>
        {
            { "{#app_no#}", memberIdValue },
            { "{#status#}", statusText },
            { "{#common_text#}", commonText }
        };

                var messageReplaces_Ta = new Dictionary<string, string>
        {
            { "{#name#}", fullName },
            { "{#member_id#}", memberIdValue }
        };

                // Send English SMS
                string englishMessage;
                bool englishSent = _smsHelpers.SentSMS(
                    mobileNumbers,
                    "COMMON",
                    messageReplaces,
                    out englishMessage);

                // Send Tamil SMS
                if (SelectedRoleText.Contains("Approve") || SelectedRoleText.Contains("Approve (Headquarters)"))
                {
                    string tamilMessage;
                    bool tamilSent = _smsHelpers.SentSMS(
                        mobileNumbers,
                        "MEMBER_APPROVED_EN_TAMIL",
                        messageReplaces_Ta,
                        out tamilMessage, 8);
                    // Log results
                    if (tamilSent)
                    {
                        Console.WriteLine($"Approval SMS sent successfully to {mobileNumbers.First()}");
                    }
                    else
                    {
                        if (!englishSent) Console.WriteLine($"English SMS failed: {englishMessage}");
                        if (!tamilSent) Console.WriteLine($"Tamil SMS failed: {tamilMessage}");
                    }
                }


                // Log results
                if (englishSent)
                {
                    Console.WriteLine($"Approval SMS sent successfully to {mobileNumbers.First()}");
                }
                else
                {
                    if (!englishSent) Console.WriteLine($"English SMS failed: {englishMessage}");
                    //if (!tamilSent) Console.WriteLine($"Tamil SMS failed: {tamilMessage}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending approval SMS: {ex.Message}");
            }
        }

        //written by indu for member approval email
        private void SendApprovalMail(MemberDetails memberDetails, string SelectedRoleText)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(memberDetails.Email))
                {
                    Console.WriteLine("Cannot send Email - Email address is missing");
                    return;
                }     // status depends on role
                      //string statusText = SelectedRoleText.Contains("Approve (Headquarters)")
                      //    ? "approved by DM"
                      //    : "approved by HQ";

                // Decide mail template

                string mailCode = ApplicationEmailTemplateCode.APPLICANT_DEFAULTMAILTEMPLATE;


                // Get template
                EmailSMSTemplate _templateClass = new EmailSMSTemplate();
                EmailTemplateModel template = _templateClass.GetEmailTemplate(mailCode);
                CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
                _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);
                CallletterUserModel? manager = _settingDAL.GetUserByRoleAndDistrict(memberDetails.District_Id, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();

                if (template == null) return;

          
                string statusText = string.Empty;

                if (SelectedRoleText.Contains("Approve (Headquarters)"))
                {
                    statusText = "Approved by DM";
                }
                else if (SelectedRoleText.Contains("Approve"))
                {
                    statusText = "Approved by HQ";
                }
                else if (SelectedRoleText.Contains("Return") || SelectedRoleText.Contains("Return (District Manager)"))
                {
                    statusText = "Returned for correction";
                }
                else if (SelectedRoleText.Contains("Reject"))
                {
                    statusText = "Rejected";
                }


                // Build Email
                EmailModel email = new EmailModel();
                email.To = new List<string> { memberDetails.Email };
                email.Subject = template.Subject;
                email.Body = template.Body;

                // Subject placeholders
                email.SubjectPlaceHolders = new Dictionary<string, string>()
       {
           { "{APPLICATION_ID}", memberDetails.Member_ID ?? "N/A" }
       };

                // Body placeholders
                email.BodyPlaceHolders = new Dictionary<string, string>()
       {
                    { "{APPLICATION_ID}", memberDetails.Member_ID ?? "" },

{"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
{"{MANAGER_NAME}", manager?.FirstName + " " + manager?.LastName ?? ""},
{"{MANAGER_EMAIL}", manager?.Email ?? ""},
{"{MANAGER_CONTACT}", manager?.Mobile ?? ""},

           { "{RECIPIENTFIRSTNAME}", memberDetails.First_Name ?? "" },
           { "{RECIPIENTLASTNAME}", memberDetails.Last_Name ?? "" },
           { "{MEMBER_ID}", memberDetails.Member_ID ?? "N/A" },
           { "{STATUS}", statusText }
       };

                string Subject = "";
                string Body = "";

                bool isMailSent = _mailHelpers.SendMail(email, out Body, out Subject);

                if (isMailSent)
                {
                    Console.WriteLine($"Approval Email sent successfully to {memberDetails.Email}");
                }
                else
                {
                    Console.WriteLine($"Approval Email failed for {memberDetails.Email}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending approval Email: {ex.Message}");
            }
        }



        #endregion Member Data Change Approval

        #region DuplicatesGet

        public List<DuplicateMemberGridModel> DuplicateMemberGridGet(DuplicateMemberFilterModel filter, out int totalCount)
        {
            return _userDAL.DuplicateMemberGridGet(filter, out totalCount);
        }
        #endregion DuplicatesGet

        public bool RemoveDuplicateMembers(RemoveDuplicateMembersModel model)
        {
            // Simply call DAL, no error handling here
            return _userDAL.RemoveDuplicateMembers(model);
        }

        #region Member Card Change Approval
        public List<Member_Card_Approval_Master_Grid_Model> MemberCardApprovalGridGet(MemberCardApprovalGridFilterModel filter, out int TotalCount)
        {
            //return _userDAL.MemberCardApprovalGridGet(filter, out TotalCount);

            // Updated to handle search by mapped values - district, org type, local body, zone, taluk for better performance [Elanjsuriyan S  05-01-2025]

            var list = _userDAL.MemberCardApprovalGridGet(filter, out TotalCount);

            if (list == null || list.Count == 0)
                return list ?? new List<Member_Card_Approval_Master_Grid_Model>();

            var statusMap = _configCache.Get("CARD_PRINTING_STATUS");
            var districtMap = _configCache.Get("DISTRICT");
            var orgTypeMap = _configCache.Get("ORGANIZATION_TYPE");
            var localBodyMap = _configCache.Get("LOCAL_BODY");
            var zoneMap = _configCache.Get("ZONE");
            var talukMap = _configCache.Get("TALUK");

            foreach (var row in list)
            {
                row.Status = statusMap.GetValueOrDefault(row.StatusId);
                row.District = districtMap.GetValueOrDefault(row.DistrictId);
                row.OrganizationType = orgTypeMap.GetValueOrDefault(row.OrganizationTypeId);
                row.LocalBody = localBodyMap.GetValueOrDefault(row.LocalBodyCode);
                row.Zone = zoneMap.GetValueOrDefault(row.ZoneId);
            }

            if (filter?.ColumnSearch?.Count > 0)
            {
                foreach (var cs in filter.ColumnSearch)
                {
                    if (string.IsNullOrWhiteSpace(cs.SearchString) ||
                        string.IsNullOrWhiteSpace(cs.FieldName))
                        continue;

                    string search = cs.SearchString.Trim().ToLower();

                    list = cs.FieldName switch
                    {
                        "Status" => list.Where(x =>
                            (x.Status ?? "").ToLower().Contains(search)).ToList(),

                        "District" => list.Where(x =>
                            (x.District ?? "").ToLower().Contains(search)).ToList(),

                        "OrganizationType" => list.Where(x =>
                            (x.OrganizationType ?? "").ToLower().Contains(search)).ToList(),

                        "LocalBody" => list.Where(x =>
                            (x.LocalBody ?? "").ToLower().Contains(search)).ToList(),

                        "Zone" => list.Where(x =>
                            (x.Zone ?? "").ToLower().Contains(search)).ToList(),

                        "Name" => list.Where(x =>
                            (x.Name ?? "").ToLower().Contains(search)).ToList(),

                        "PhoneNumber" => list.Where(x =>
                            (x.PhoneNumber ?? "").ToLower().Contains(search)).ToList(),

                        _ => list
                    };
                }
            }


            if (!string.IsNullOrWhiteSpace(filter?.SearchString))
            {
                string s = filter.SearchString.Trim().ToLower();

                list = list.Where(x =>
                    (x.MemberCode ?? "").ToLower().Contains(s) ||
                    (x.Name ?? "").ToLower().Contains(s) ||
                    (x.PhoneNumber ?? "").ToLower().Contains(s) ||
                    (x.Status ?? "").ToLower().Contains(s) ||
                    (x.District ?? "").ToLower().Contains(s) ||
                    (x.OrganizationType ?? "").ToLower().Contains(s) ||
                    (x.LocalBody ?? "").ToLower().Contains(s) ||
                    (x.Zone ?? "").ToLower().Contains(s) ||
                    //(x.Taluk ?? "").ToLower().Contains(s) ||
                    (x.ApprovalComment ?? "").ToLower().Contains(s) ||
                    (x.Reason ?? "").ToLower().Contains(s)
                ).ToList();
            }

            TotalCount = list.Count;

            return list;
        }
        public Member_Card_Approval_Master_From MemberCardApprovalForm(string Id, string MemberId)
        {
            Member_Card_Approval_Master_From res = _userDAL.Member_Card_Approval_Master_From(Id, MemberId);

            res.ReasonList = _settingDAL.Configuration_Get(IsActive: true, CategoryCode: "REASON")
            .Select(x => new SelectListItem()
            {
                Text = x.Value,
                Value = x.Value,
            }).ToList();

            res.ApprovalHistory = _userDAL.Member_Card_Approval_Master_History_Get(Id);

            res.StatusList = new List<SelectListItem>();
            res.StatusList.Add(new SelectListItem() { Text = "Approve", Value = "APPROVED" });
            if (!string.IsNullOrWhiteSpace(res.PreviousStatus))
            {
                res.StatusList.Add(new SelectListItem() { Text = "Return", Value = "RETURNED" });
            }
            res.StatusList.Add(new SelectListItem() { Text = "Reject", Value = "REJECTED" });

            return res;
        }
        public string MemberCardApproval(Member_Card_Approval_Save_Model pmodel, AuditColumnsModel audit)
        {
            Member_Card_Approval_Master_From model = _userDAL.Member_Card_Approval_Master_From(pmodel.Id, pmodel.Member_Id);

            if (pmodel.SelectedStatus == "APPROVED")
            {
                model.FromStatusId = model.StatusId;
                if (string.IsNullOrWhiteSpace(model.NextStatusId))
                {
                    model.ToStatusId = "COMPLETED";
                    SendCardIssuedSMS(pmodel.Member_Id);
                    SendCardIssuedMail(pmodel.Member_Id);
                }
                else
                {
                    model.ToStatusId = model.NextStatusId;
                }
            }
            else if (pmodel.SelectedStatus == "RETURNED")
            {
                model.FromStatusId = model.StatusId;
                if (string.IsNullOrWhiteSpace(model.PreviousStatusId))
                {
                    model.FromStatusId = model.StatusId;
                }
                else
                {
                    model.ToStatusId = model.PreviousStatusId;
                }
            }
            else if (pmodel.SelectedStatus == "REJECTED")
            {
                model.FromStatusId = model.StatusId;
                model.ToStatusId = "REJECTED";
            }

            model.ApprovalComment = pmodel.ApprovalComment;
            model.Reason = pmodel.Reason;

            return _userDAL.MemberCardApproval(model, audit);
        }
        private void SendCardIssuedSMS(string memberId)
        {
            try
            {
                // Get member details using existing DAL method
                var memberData = _memberDAL.Member_Get_All(memberId);

                if (memberData?.MemberDetails != null && !string.IsNullOrEmpty(memberData.MemberDetails.Phone_Number))
                {
                    // Prepare common SMS parameters
                    var smsParams = new Dictionary<string, string>
      {
          { "{#name#}", $"{memberData.MemberDetails.First_Name} {memberData.MemberDetails.Last_Name}" },
          { "{#var#}", "https:/tncwwb-dev.pixous.info" } // Dummy URL
      };

                    // Prepare mobile numbers
                    var mobileNumbers = new List<string> { memberData.MemberDetails.Phone_Number };

                    // Send English SMS
                    string englishMessage;
                    bool englishSent = _smsHelpers.SentSMS(
                        mobileNumbers,
                        "CARD_ISSUED_EN_TA",  // English template
                        smsParams,
                        out englishMessage);

                    // Send Tamil SMS (regardless of member's preference)
                    string tamilMessage;
                    bool tamilSent = _smsHelpers.SentSMS(
                        mobileNumbers,
                        "CARD_ISSUED_EN_TAMIL",  // Tamil template
                        smsParams,
                        out tamilMessage, 8);

                    // Log results
                    if (!englishSent || !tamilSent)
                    {
                        string errorMessage = "";
                        if (!englishSent) errorMessage += $"English SMS failed: {englishMessage}. ";
                        if (!tamilSent) errorMessage += $"Tamil SMS failed: {tamilMessage}";
                        Console.WriteLine($"SMS sending partially failed: {errorMessage}");
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error
                Console.WriteLine($"Error sending card issued SMS: {ex.Message}");
            }
        }


        private void SendCardIssuedMail(string memberId)
        {
            try
            {
                var memberData = _memberDAL.Member_Get_All(memberId);

                if (memberData?.MemberDetails != null && !string.IsNullOrEmpty(memberData.MemberDetails.Email))
                {
                    string mailCode = ApplicationEmailTemplateCode.CARD_ISSUED;

                    EmailSMSTemplate _templateClass = new EmailSMSTemplate();
                    EmailTemplateModel template = _templateClass.GetEmailTemplate(mailCode);
                    CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
                    _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);
                    CallletterUserModel? _manager = _settingDAL.GetUserByRoleAndDistrict(memberData.OrganizationDetail.District_Id, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();

                    if (template == null) return;

                    EmailModel email = new EmailModel
                    {
                        To = new List<string> { memberData.MemberDetails.Email },
                        Subject = template.Subject,
                        Body = template.Body,
                        BodyPlaceHolders = new Dictionary<string, string>
                {
                    { "{RECIPIENTFIRSTNAME}", memberData.MemberDetails.First_Name ?? "" },
                    { "{RECIPIENTLASTNAME}", memberData.MemberDetails.Last_Name ?? "" },
                    { "{MEMBER_ID}", memberData.MemberDetails.Member_ID ?? "N/A" },
                         {"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
                          {"{MANAGER_NAME}", _manager.FirstName + " " + _manager.LastName},
               {"{MANAGER_EMAIL}", _manager.Email},
            {"{MANAGER_CONTACT}", _manager.Mobile}
                }
                    };

                    string subject, body;
                    bool sent = _mailHelpers.SendMail(email, out body, out subject);

                    Console.WriteLine(sent
                        ? $"Card Issued Email sent to {memberData.MemberDetails.Email}"
                        : $"Card Issued Email failed for {memberData.MemberDetails.Email}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending card issued Email: {ex.Message}");
            }
        }

        //public List<MemberIdMessageViewModel> MemberCardBulkApproval(Member_Card_BulkApproval_Save_Model pmodel, AuditColumnsModel audit)
        //{
        //    var allResults = new List<MemberIdMessageViewModel>();

        //    foreach (var memberId in pmodel.Member_Id)
        //    {
        //        Member_Card_Approval_Master_From model = _userDAL.Member_Card_Approval_Master_From("", memberId);

        //        if (pmodel.SelectedStatus == "APPROVED")
        //        {
        //            model.FromStatusId = model.StatusId;
        //            model.ToStatusId = string.IsNullOrWhiteSpace(model.NextStatusId) ? "COMPLETED" : model.NextStatusId;
        //        }
        //        else if (pmodel.SelectedStatus == "RETURNED")
        //        {
        //            model.FromStatusId = model.StatusId;
        //            model.ToStatusId = string.IsNullOrWhiteSpace(model.PreviousStatusId) ? model.StatusId : model.PreviousStatusId;
        //        }
        //        else if (pmodel.SelectedStatus == "REJECTED")
        //        {
        //            model.FromStatusId = model.StatusId;
        //            model.ToStatusId = "REJECTED";
        //        }

        //        model.ApprovalComment = pmodel.ApprovalComment;
        //        model.Reason = pmodel.Reason;

        //        var results = _userDAL.MemberCardBulkApproval(model, audit);
        //        allResults.AddRange(results);
        //    }

        //    return allResults;
        //}

        // Elanjsuriyan -09092025
        public List<MemberIdMessageViewModel> MemberCardBulkApproval(Member_Card_BulkApproval_Save_Model pmodel, AuditColumnsModel audit)
        {
            // Get all member info in one shot (bulk)
            //var model = _userDAL.Member_Card_Approval_Master_Bulk_From("", pmodel.Member_Id);
            var model = _userDAL.Member_Card_Approval_Master_Bulk_From("", string.Join(",", pmodel.Member_Id));
            model.SelectedStatus = pmodel.SelectedStatus;

            model.Member_Id = string.Join(",", pmodel.Member_Id);

            if (pmodel.SelectedStatus == "APPROVED")
            {
                model.FromStatusId = model.StatusId;
                model.ToStatusId = string.IsNullOrWhiteSpace(model.NextStatusId) ? "COMPLETED" : model.NextStatusId;
            }
            else if (pmodel.SelectedStatus == "RETURNED")
            {
                model.FromStatusId = model.StatusId;
                model.ToStatusId = string.IsNullOrWhiteSpace(model.PreviousStatusId) ? model.StatusId : model.PreviousStatusId;
            }
            else if (pmodel.SelectedStatus == "REJECTED")
            {
                model.FromStatusId = model.StatusId;
                model.ToStatusId = "REJECTED";
            }

            model.ApprovalComment = pmodel.ApprovalComment;
            model.Reason = pmodel.Reason;

            var results = _userDAL.MemberCardBulkApproval(model, audit);

            return results;
        }

        public List<Member_Card_Approval_History_Master_Model> MemberCardApprovalHistoryGet(MemberCardApprovalHistoryFilterModel filter, out int TotalCount)
        {
            return _userDAL.MemberCardApprovalHistoryGet(filter, out TotalCount);
        }
        public string GetApprovalRoleId ( string pRole)
        {
            string roleId = _userDAL.GetApprovalRoleId(pRole);
            return roleId;
        }
        public string GetRoleId( string pRole)
        {
            string roleId = _userDAL.GetRoleId(pRole);
            return roleId;
        }

        //written by indu for bulk data approval on 01-09-2025
        public List<string> MemberDataBulkApproval(MemberDataBulkApprovalFromSubmitModel model, AuditColumnsModel audit)
        {
            if (model.SelectedRoleText.Contains("Approve"))
            {
                model.Status = "IN_PROGRESS";
                model.Status2 = "Approved";
            }
            else if (model.SelectedRoleText.Contains("Return"))
            {
                model.Status = "RETURNED";
                model.Status2 = "Returned";
            }
            else if (model.SelectedRoleText.Contains("Reject"))
            {
                model.Status = "REJECTED";
                model.Status2 = "Rejected";
            }else if(model.SelectedRoleText.Contains("Delete"))
            {
                model.Status = "DELETED";
                model.Status2 = "Deleted";
            }
            else if (model.SelectedRoleText.Contains("Restore"))
            {
                model.Status = "RESTORED";
                model.Status2 = "Restored";
            }
            // First, update DB
            var result = _userDAL.MemberDataBulkApproval(model, audit);

            // Only send SMS after DB update is done
            if (model.RequestId != null && model.RequestId.Any())
            {
                foreach (var requestId in model.RequestId)
                {
                    var memberDetails = _memberDAL.GetMemberDetailsByRequestId(requestId);

                    if (memberDetails != null)
                    {
                        // Generate memberId if missing
                        if (string.IsNullOrEmpty(memberDetails.Member_ID))
                        {
                            _memberDAL.GenerateMemberId(memberDetails.Id);
                        }

                       // Notifications
                        SendApprovalSMS(memberDetails, model.SelectedRoleText);
                        SendApprovalMail(memberDetails, model.SelectedRoleText);
                    }
                }
            }
            return result;
        }

        #endregion Member Card Change Approval
    }
}
