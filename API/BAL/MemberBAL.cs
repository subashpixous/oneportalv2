using AutoMapper.Execution;
using BAL.BackgroundWorkerService;
using BAL.Interface;
using DAL;
using Dapper;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Model.Constants;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;
using Model.ViewModel.MemberModels;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NPOI.HPSF;
using NPOI.HSSF.UserModel;
using NPOI.SS.Formula.Functions;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using Utils;
using Utils.Cache.Configuration;
using Utils.Interface;
using Utils.UtilModels;
using static System.Net.Mime.MediaTypeNames;
using ClosedXML.Excel;

namespace BAL
{
    public class MemberBAL : IMemberBAL
    {
        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IConfiguration _configuration;
        private readonly MemberDAL _memberDAL;
        private readonly SettingsDAL _settingsDAL;
        private readonly GeneralDAL _generalDAL;
        private readonly HttpClient _httpClient;
        private IMemoryCache _cache;
        private readonly IFTPHelpers _ftpHelper;
        private readonly ISMSHelper _smsHelpers;
        private readonly IMailHelper _mailHelpers;
        private readonly SettingsDAL _settingDAL;
        private readonly IConfigurationCacheService _configCache;

        private readonly string _memberImportkey = "_keyStatusOfMemberUpload";
        public MemberBAL(IConfiguration configuration, IBackgroundTaskQueue backgroundTaskQueue,
            IServiceScopeFactory serviceScopeFactory, IMemoryCache cache, IFTPHelpers ftpHelper, IMailHelper mailHelpers,
            ISMSHelper smshelper, IConfigurationCacheService configCache)
        {
            _memberDAL = new MemberDAL(configuration);
            _settingsDAL = new SettingsDAL(configuration);
            _generalDAL = new GeneralDAL(configuration);
            _httpClient = new HttpClient();
            _serviceScopeFactory = serviceScopeFactory;
            _configuration = configuration;
            _backgroundTaskQueue = backgroundTaskQueue;
            _cache = cache;
            _ftpHelper = ftpHelper;
            _smsHelpers = smshelper;
            _settingDAL = new SettingsDAL(configuration);
            _mailHelpers = mailHelpers;
            _configCache = configCache;
        }

        #region Common
        //public List<MemberGridViewModel> MemberGridGet(MemberFilterModel filter, out int TotalCount)
        //{
        //    return _memberDAL.MemberGridGet(filter, out TotalCount);
        //} 
        
        // Updated for optimization [29-12-2025] - Elanjsuriyan
        public List<MemberGridViewModel> MemberGridGet(MemberFilterModel filter, out int TotalCount)
        {

            if (!string.IsNullOrWhiteSpace(filter?.SearchString))
            {
                filter.Where ??= new MemberWhereClauseProperties();

                var districtMap = _configCache.Get("DISTRICT");
                var districtIds = districtMap
                    .Where(x => x.Value.Contains(filter.SearchString, StringComparison.OrdinalIgnoreCase))
                    .Select(x => x.Key)
                    .ToList();

                if (districtIds.Any())
                    filter.Where.DistrictIds = districtIds;

                var cardStatusMap = _configCache.Get("CARD_PRINTING_STATUS");
                var cardStatusIds = cardStatusMap
                    .Where(x => x.Value.Contains(filter.SearchString, StringComparison.OrdinalIgnoreCase))
                    .Select(x => x.Key)
                    .ToList();

                if (cardStatusIds.Any())
                    filter.Where.cardstatusId = cardStatusIds;

                var zoneMap = _configCache.Get("ZONE");
                var zoneIds = zoneMap
                    .Where(x => x.Value.Contains(filter.SearchString, StringComparison.OrdinalIgnoreCase))
                    .Select(x => x.Key)
                    .ToList();

                if (zoneIds.Any())
                    filter.Where.Zone = string.Join(",", zoneIds);

                var type_of_workMap = _configCache.Get("TYPE_OF_WORK");
                var type_of_workMapIds = type_of_workMap
                    .Where(x => x.Value.Contains(filter.SearchString, StringComparison.OrdinalIgnoreCase))
                    .Select(x => x.Key)
                    .ToList();

                if (type_of_workMapIds.Any())
                    filter.Where.type_of_workMap = string.Join(",", type_of_workMapIds);


            }

            if (filter?.ColumnSearch?.Count > 0)
            {
                foreach (var col in filter.ColumnSearch)
                {
                    if (string.IsNullOrWhiteSpace(col.SearchString))
                        continue;

                    filter.Where ??= new MemberWhereClauseProperties();

                    if (col.FieldName.Equals("District", StringComparison.OrdinalIgnoreCase))
                    {
                        var districtMap = _configCache.Get("DISTRICT");
                        filter.Where.DistrictIds = districtMap
                            .Where(x => x.Value.Contains(col.SearchString, StringComparison.OrdinalIgnoreCase))
                            .Select(x => x.Key)
                            .ToList();
                    }

                    else if (col.FieldName.Equals("CardStatus", StringComparison.OrdinalIgnoreCase))
                    {
                        var cardStatusMap = _configCache.Get("CARD_PRINTING_STATUS");
                        filter.Where.cardstatusId = cardStatusMap
                            .Where(x => x.Value.Contains(col.SearchString, StringComparison.OrdinalIgnoreCase))
                            .Select(x => x.Key)
                            .ToList();
                    }

                    else if (col.FieldName.Equals("Zone", StringComparison.OrdinalIgnoreCase))
                    {
                        var zoneMap = _configCache.Get("ZONE");
                        var zoneIds = zoneMap
                            .Where(x => x.Value.Contains(col.SearchString, StringComparison.OrdinalIgnoreCase))
                            .Select(x => x.Key)
                            .ToList();

                        if (zoneIds.Any())
                            filter.Where.Zone = string.Join(",", zoneIds);
                    }

                    else if (col.FieldName.Equals("TYPE_OF_WORK", StringComparison.OrdinalIgnoreCase))
                    {
                        var type_of_workMap = _configCache.Get("TYPE_OF_WORK");
                        var type_of_workMapIds = type_of_workMap
                            .Where(x => x.Value.Contains(col.SearchString, StringComparison.OrdinalIgnoreCase))
                            .Select(x => x.Key)
                            .ToList();

                        if (type_of_workMapIds.Any())
                            filter.Where.type_of_workMap = string.Join(",", type_of_workMapIds);
                    }
                }

                filter.ColumnSearch = filter.ColumnSearch
                    .Where(x =>
                        !x.FieldName.Equals("District", StringComparison.OrdinalIgnoreCase) &&
                        !x.FieldName.Equals("CardStatus", StringComparison.OrdinalIgnoreCase) &&
                        !x.FieldName.Equals("Zone", StringComparison.OrdinalIgnoreCase) &&
                        !x.FieldName.Equals("TYPE_OF_WORK", StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            var list = _memberDAL.MemberGridGet(filter, out TotalCount);

            if (list == null || list.Count == 0)
                return list;

            var districtFinalMap = _configCache.Get("DISTRICT");
            var cardStatusFinalMap = _configCache.Get("CARD_PRINTING_STATUS");
            var orgTypeMap = _configCache.Get("ORGANIZATION_TYPE");
            var blockMap = _configCache.Get("BLOCK");
            var zoneFinalMap = _configCache.Get("ZONE");
            var MLAFinalMap = _configCache.Get("MLA");
            var MPFinalMap = _configCache.Get("MP");
            var employerFinalMap = _configCache.Get("EMPLOYERTYPE");
            var workOfficeFinalMap = _configCache.Get("WORKOFFICE");
            var Type_of_WorkFinalMap = _configCache.Get("TYPE_OF_WORK");

            foreach (var row in list)
            {
                if (!string.IsNullOrEmpty(row.DistrictId) &&
                    districtFinalMap.TryGetValue(row.DistrictId, out var district))
                    row.District = district;

                if (!string.IsNullOrEmpty(row.CardStatusId) &&
                    cardStatusFinalMap.TryGetValue(row.CardStatusId, out var cardStatus))
                    row.CardStatus = cardStatus;

                if (!string.IsNullOrEmpty(row.OrganizationTypeId) &&
                    orgTypeMap.TryGetValue(row.OrganizationTypeId, out var orgType))
                    row.OrganizationType = orgType;

                if (!string.IsNullOrEmpty(row.BlockId) &&
                    blockMap.TryGetValue(row.BlockId, out var block))
                    row.Block = block;

                if (!string.IsNullOrEmpty(row.ZoneId) &&
                    zoneFinalMap.TryGetValue(row.ZoneId, out var zone))
                    row.Zone = zone;
                if (!string.IsNullOrEmpty(row.MLA_ConstituencyId) &&
                    MLAFinalMap.TryGetValue(row.MLA_ConstituencyId, out var MLA_Constituency))
                    row.MLA_Constituency = MLA_Constituency;

                if (!string.IsNullOrEmpty(row.MP_ConstituencyId) &&
                    MPFinalMap.TryGetValue(row.MP_ConstituencyId, out var MP_Constituency))
                    row.MP_Constituency = MP_Constituency;

                if (!string.IsNullOrEmpty(row.Employer_TypeId) &&
                    employerFinalMap.TryGetValue(row.Employer_TypeId, out var Employer_Type))
                    row.Employer_TypeId = Employer_Type;

                if (!string.IsNullOrEmpty(row.Work_OfficeId) &&
                    workOfficeFinalMap.TryGetValue(row.Employer_TypeId, out var Work_Office))
                    row.Work_OfficeId = Work_Office;
                if (!string.IsNullOrEmpty(row.TypeofWorkId) &&
                    Type_of_WorkFinalMap.TryGetValue(row.TypeofWorkId, out var TypeofWork))
                    row.TypeofWork = TypeofWork;
            }

            return list;
        }

        public List<MemberGridViewModel> MemberGridGetforLocalBody(MemberFilterModel filter, out int TotalCount)
        {
            return _memberDAL.MemberGridGetforLocalBody(filter, out TotalCount);
        }
        public List<DatewiseApprovalModel> DatewiseAprovedList(MemberFilterModel filter, out int TotalCount)
        {
            return _memberDAL.DatewiseAprovedList(filter, out TotalCount);
        }
        //modified by Sivasankar K on 20-12-2025 for viewing datewise approved report
        public List<GCCReportModels> GetGCCReport(
    MemberFilterModel filter,
    out int totalCount)
        {
            totalCount = 0;

            filter ??= new MemberFilterModel();
            filter.Where ??= new MemberWhereClauseProperties();

            return _memberDAL.GetGCCReport(filter, out totalCount);
        }

        public List<LocalBodyReportModel> GetNameofLocalBodyReport(
     MemberFilterModel filter,
     out int totalCount)
        {
            // Business safety
            filter ??= new MemberFilterModel();
            filter.Where ??= new MemberWhereClauseProperties();

            return _memberDAL.GetNameofLocalBodyReport(filter, out totalCount);
        }
        public List<BlockWiseReportModel> GetBlockWiseReport(
    MemberFilterModel filter,
    out int totalCount)
        {
            
            filter ??= new MemberFilterModel();
            filter.Where ??= new MemberWhereClauseProperties();

          
            return _memberDAL.GetBlockWiseReport(filter, out totalCount);
        }
        public List<AllLocalBodyReportModel> GetAllLocalBodySummary()
        {
            return _memberDAL.GetAllLocalBodySummary();
        }
        public List<DepartmentWiseApprovalModel> GetDatewiseApprovedMembers(MemberFilterModel filter, out int TotalCount)
        {
            return _memberDAL.GetDatewiseApprovedMembers(filter, out TotalCount);
        }

        public List<GetDatewiseProgressiveReportModel> GetDatewiseProgressiveReport(MemberFilterModel filter, out int TotalCount)
        {
            return _memberDAL.GetDatewiseProgressiveReport(filter, out TotalCount);
        }



        #endregion reports

#region Common
        public List<FamilyMemberApprovalModel> FamilyMembersAprovedList(MemberFilterModel filter, out int TotalCount)
        {
            //return _memberDAL.FamilyMembersAprovedList(filter, out TotalCount);

            var list = _memberDAL.FamilyMembersAprovedList(filter, out TotalCount);

            if (list == null || list.Count == 0)
                return list ?? new List<FamilyMemberApprovalModel>();
            var organizationTypes = _configCache.Get("ORGANIZATION_TYPE");
            var districts = _configCache.Get("DISTRICT");
            var relations = _configCache.Get("RELATION");
            var genders = _configCache.Get("GENDER");
            var occupations = _configCache.Get("OCCUPATION");
            var disabilities = _configCache.Get("DISABILITY");
            var maritalStatuses = _configCache.Get("MARITAL_STATUS");
            var communities = _configCache.Get("COMMUNITY");
            var blocks = _configCache.Get("BLOCK");
            var zones = _configCache.Get("ZONE");
            var courses = _configCache.Get("COURSE");
            var educations = _configCache.Get("EDUCATION");
            var schemes = _configCache.Get("SCHEME");
            var statuses = _configCache.Get("STATUS");

            foreach (var row in list)
            {
                row.Organization_Type = organizationTypes.GetValueOrDefault(row.OrganizationTypeId);
                row.DistrictName = districts.GetValueOrDefault(row.DistrictId);
                row.RelationType = relations.GetValueOrDefault(row.RelationTypeId);
                row.Gender = genders.GetValueOrDefault(row.GenderId);
                row.FamilyMemberOccupation = occupations.GetValueOrDefault(row.FamilyOccupationId);
                row.Disability = disabilities.GetValueOrDefault(row.DisabilityId);
                row.MaritalStatus = maritalStatuses.GetValueOrDefault(row.MaritalStatusId);
                row.Community = communities.GetValueOrDefault(row.CommunityId);
                row.BlockName = blocks.GetValueOrDefault(row.BlockId);
                row.LocalBodyDetails = zones.GetValueOrDefault(row.ZoneId);
                row.Course = courses.GetValueOrDefault(row.CourseId);
                row.Mem_Education = educations.GetValueOrDefault(row.EducationId);
                row.Scheme = schemes.GetValueOrDefault(row.SchemeId);
                row.Status = statuses.GetValueOrDefault(row.StatusId);
            }

            return list;
        }

        public MemberFormGeneralInfo MemberFormGeneralInfo_Get(string MemberId)
        {
            return _memberDAL.MemberFormGeneralInfo_Get(MemberId);
        }

        public MemberGetModels  Member_Get_All(string MemberId)
        {
            // Fetch acceptedDocType synchronously as it's used in multiple places
            List<ConfigurationModel> acceptedDocType = _settingsDAL.Configuration_Get(IsActive: true, CategoryCode: "ACCEPTEDDOCUMENT");

            // Prepare tasks for parallel execution
            var memberTask = Task.Run(() => _memberDAL.Member_Get_All(MemberId));
            var memberFormTask = Task.Run(() => _memberDAL.Member_Form_Get(MemberId));
            var orgFormTask = Task.Run(() => _memberDAL.Organization_Form_Get(MemberId));
            var familyFormTask = Task.Run(() => _memberDAL.Family_Form_Get(""));
            var bankFormTask = Task.Run(() => _memberDAL.Bank_Form_Get(MemberId));
            var workAddrFormTask = Task.Run(() => _memberDAL.Address_Form_Get(MemberId, AddressTypeConstants.WorkAddress));
            var permAddrFormTask = Task.Run(() => _memberDAL.Address_Form_Get(MemberId, AddressTypeConstants.PermanentAddress));
            var tempAddrFormTask = Task.Run(() => _memberDAL.Address_Form_Get(MemberId, AddressTypeConstants.TemporaryAddress));

            // Wait for all tasks to complete
            Task.WaitAll(memberTask, memberFormTask, orgFormTask, familyFormTask, bankFormTask, workAddrFormTask, permAddrFormTask, tempAddrFormTask);

            var model = memberTask.Result;

            // Populate select lists for documents
            if (model.MemberDocuments?.Count() > 0)
            {
                model.MemberDocuments.ForEach(x =>
                {
                    if (!string.IsNullOrWhiteSpace(x.DocumentCategoryId))
                    {
                        x.AcceptedDocumentTypeSelectList = acceptedDocType
                            .Where(d => d.ConfigurationId == x.DocumentCategoryId)
                            .Select(y => new SelectListItem() { Text = y.Value, Value = y.Id })
                            .OrderBy(o => o.Text).ToList();
                    }
                });
            }

            if (model.MemberNonMandatoryDocuments?.Count() > 0)
            {
                model.MemberNonMandatoryDocuments.ForEach(x =>
                {
                    if (!string.IsNullOrWhiteSpace(x.DocumentCategoryId))
                    {
                        x.AcceptedDocumentTypeSelectList = acceptedDocType
                            .Where(d => d.ConfigurationId == x.DocumentCategoryId)
                            .Select(y => new SelectListItem() { Text = y.Value, Value = y.Id })
                            .OrderBy(o => o.Text).ToList();
                    }
                });
            }

            if (model.AllAddressMaster != null && model.AllAddressMaster.Count > 0)
            {
                model.WorkAddress = model.AllAddressMaster
                    .Where(x => x.AddressType == AddressTypeConstants.WorkAddress).FirstOrDefault();
                model.PermanentAddress = model.AllAddressMaster
                    .Where(x => x.AddressType == AddressTypeConstants.PermanentAddress).FirstOrDefault();
                model.TemprorayAddress = model.AllAddressMaster
                    .Where(x => x.AddressType == AddressTypeConstants.TemporaryAddress).FirstOrDefault();
            }

            // Assign results from parallel tasks
            model.MemberDetailsForm = memberFormTask.Result;
            model.OrganizationDetailForm = orgFormTask.Result;
            model.FamilyMemberForm = familyFormTask.Result;
            model.BankDetailForm = bankFormTask.Result;
            model.WorkAddressDetailForm = workAddrFormTask.Result;
            model.PermanentAddressDetailForm = permAddrFormTask.Result;
            model.TemporaryAddressDetailForm = tempAddrFormTask.Result;

            return model;
        }
        public void Member_Save_All(MemberSaveAllModels model, AuditColumnsModel audit)
        {
            if (model.MemberDetails != null)
            {
                if (model.IsOfficerSave == true)
                {
                    _memberDAL.Application_Detail_Member_SaveUpdate(model.MemberDetails, audit, model.MemberDetails.IsSubmit, false);
                }
                else
                {
                    _memberDAL.Application_Detail_Member_SaveUpdate(model.MemberDetails, audit, model.MemberDetails.IsSubmit, true);
                }
                 //_memberDAL.Application_Detail_Member_SaveUpdate(model.MemberDetails, audit, true, model.IsNewMember);
            }
            if (model.OrganizationDetail != null)
            {
                _memberDAL.Application_Detail_Organization_SaveUpdate(model.OrganizationDetail, audit);
            }
            if (model.BankDetail != null)
            {
                _memberDAL.Application_Member_Bank_SaveUpdate(model.BankDetail, audit);
            }
            if (model.FamilyMembers != null && model.FamilyMembers.Any())
            {
                foreach (var member in model.FamilyMembers)
                {
                    _memberDAL.Application_Detail_Family_SaveUpdate(member, audit);
                }
            }
            if (model.WorkAddress != null)
            {
                _memberDAL.Member_Address_Master_SaveUpdate(model.WorkAddress, audit);
            }
            if (model.PermanentAddress != null)
            {
                _memberDAL.Member_Address_Master_SaveUpdate(model.PermanentAddress, audit);
            }
            if (model.TemprorayAddress != null)
            {
                _memberDAL.Member_Address_Master_SaveUpdate(model.TemprorayAddress, audit);
            }
            if (model.OrganizationDetail != null)
            {
                _memberDAL.GenerateMemberId(model.OrganizationDetail.Member_Id);
            }
            if (model.OrganizationDetail != null)
            {
                _memberDAL.GenerateMemberId(model.OrganizationDetail.Member_Id);
            }
            //if (model.IsSubmitted)
            //{
            //    _memberDAL.Member_IsSubmitted_Update(model.MemberDetails, audit);
            //}
            if (model.MemberDetails != null && !string.IsNullOrEmpty(model.MemberDetails.Phone_Number) && model.MemberDetails.IsSubmit == true)
            {
                try
                {
                    var mobileNumbers = new List<string> { model.MemberDetails.Phone_Number };
                    string fullName = $"{model.MemberDetails.First_Name} {model.MemberDetails.Last_Name}".Trim();

                    var messageReplaces = new Dictionary<string, string>
        {
            { "{#name#}", fullName }
        };


                    // Print before sending
                    Console.WriteLine("Preparing to send SMS...");
                    Console.WriteLine($"Mobile Number: {mobileNumbers.First()}");
                    Console.WriteLine($"Message Replacements: {string.Join(", ", messageReplaces.Select(kvp => $"{kvp.Key}={kvp.Value}"))}");

                    // Send English SMS
                    string englishMessage = string.Empty;
                    bool englishSent = _smsHelpers.SentSMS(
                        mobileNumbers,
                        "MEMBER_SUBMITTED_EN_TA",  // English template code
                        messageReplaces,
                        out englishMessage);

                    // Send Tamil SMS
                    string tamilMessage = string.Empty;
                    bool tamilSent = _smsHelpers.SentSMS(
                        mobileNumbers,
                        "MEMBER_SUBMITTED_EN_TAMIL",  // Tamil template code
                        messageReplaces,
                        out tamilMessage, 8);

                    // Show results in console
                    if (englishSent && tamilSent)
                    {
                        Console.WriteLine($"Both English and Tamil SMS sent to {mobileNumbers.First()}");
                    }
                    else
                    {
                        if (!englishSent)
                        {
                            Console.WriteLine($"Failed to send English SMS to {mobileNumbers.First()}. Error: {englishMessage}");
                        }
                        if (!tamilSent)
                        {
                            Console.WriteLine($"Failed to send Tamil SMS to {mobileNumbers.First()}. Error: {tamilMessage}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error while sending member save notifications: {ex}");
                }
            }

            if (model.MemberDetails != null && !string.IsNullOrEmpty(model.MemberDetails.Email))
            {
                SendMemberSubmittedMail(model.MemberDetails);
            }
        }
        public MemberIdCodeGetModel Application_Detail_Member_Init_SaveUpdate(MemberInitSaveModel model, AuditColumnsModel audit)
        {

            var result = _memberDAL.Application_Detail_Member_Init_SaveUpdate(model, audit);

            if (result != null)
            {
                SendMemberSavedSMS(model);
                SendMemberSavedMail(model);
            }

            return result;
        }
        public void SendMemberSavedSMS(MemberInitSaveModel model)
        {
            if (model == null || string.IsNullOrEmpty(model.Phone_Number))
                return;

            try
            {
                var mobileNumbers = new List<string> { model.Phone_Number };
                string fullName = (model.First_Name + " " + model.Last_Name) ?? string.Empty;


                var messageReplacements = new Dictionary<string, string>
        {
            { "{#name#}", fullName }
        };

                // Print debug info
                Console.WriteLine("Preparing to send SMS...");
                Console.WriteLine($"Mobile Number: {mobileNumbers.First()}");
                Console.WriteLine($"Message Replacements: {string.Join(", ", messageReplacements.Select(kvp => $"{kvp.Key}={kvp.Value}"))}");

                // Send English SMS
                string englishMessage = string.Empty;
                bool englishSent = _smsHelpers.SentSMS(
                    mobileNumbers,
                    "MEMBER_SAVED_EN_TA",
                    messageReplacements,
                    out englishMessage
                );

                // Send Tamil SMS
                string tamilMessage = string.Empty;
                bool tamilSent = _smsHelpers.SentSMS(
                    mobileNumbers,
                    "MEMBER_SAVED_EN_TAMIL",
                    messageReplacements,
                    out tamilMessage,
                    8
                );

                // Log results
                if (englishSent && tamilSent)
                {
                    Console.WriteLine($"Both English and Tamil SMS sent to {mobileNumbers.First()}");
                }
                else
                {
                    if (!englishSent)
                        Console.WriteLine($"Failed to send English SMS to {mobileNumbers.First()}. Error: {englishMessage}");
                    if (!tamilSent)
                        Console.WriteLine($"Failed to send Tamil SMS to {mobileNumbers.First()}. Error: {tamilMessage}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error while sending member save notifications: {ex}");
            }
        }
        private void SendMemberSavedMail(MemberInitSaveModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Email))
                return;

            string mailCode = ApplicationEmailTemplateCode.APPLICANT_SAVED;
            CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
           
            _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);
            CallletterUserModel? manager = _settingDAL.GetUserByRoleAndDistrict(model.PrimaryDistrict, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();
            EmailSMSTemplate _templateClass = new EmailSMSTemplate();
            EmailTemplateModel template = _templateClass.GetEmailTemplate(mailCode);
            if (template == null) return;

            EmailModel email = new EmailModel
            {
                To = new List<string> { model.Email },
                Subject = template.Subject,
                Body = template.Body,
                BodyPlaceHolders = new Dictionary<string, string>
        {

            { "{APPLICATION_ID}", model.Member_Id ?? "" },
            { "{RECIPIENTFIRSTNAME}", model.First_Name ?? "" },
            { "{RECIPIENTLASTNAME}", model.Last_Name ?? "" },
            { "{MEMBER_ID}", model.Member_Id ?? "N/A" },
            {"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
            {"{MANAGER_NAME}", manager?.FirstName + " " + manager?.LastName ?? ""},
            {"{MANAGER_EMAIL}", manager?.Email ?? ""},
            {"{MANAGER_CONTACT}", manager?.Mobile ?? ""}

        }
            };

            string subject, body;
            bool sent = _mailHelpers.SendMail(email, out body, out subject);

            Console.WriteLine(sent
                ? $"Member Saved Email sent to {model.Email}"
                : $"Member Saved Email failed for {model.Email}");
        }

        private void SendMemberSubmittedMail(MemberDetailsSaveModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Email))
                return;

            string mailCode = ApplicationEmailTemplateCode.APPLICANT_SUBMITTED;

            EmailSMSTemplate _templateClass = new EmailSMSTemplate();
            EmailTemplateModel template = _templateClass.GetEmailTemplate(mailCode);
            CallLetterConfigurationModel _callletterConfig = new CallLetterConfigurationModel();
             _configuration.GetSection("CallLetterConfig").Bind(_callletterConfig);
            CallletterUserModel? manager = _settingDAL.GetUserByRoleAndDistrict(model.PrimaryDistrict, _callletterConfig.DistrictManagerRoleCode).FirstOrDefault();

            if (template == null) return;

            EmailModel email = new EmailModel
            {
                To = new List<string> { model.Email },
                Subject = template.Subject,
                Body = template.Body,

                SubjectPlaceHolders = new Dictionary<string, string>()
        {
            {"{APPLICATION_ID}", model.Member_ID.ToString()?? "" }
        },

                BodyPlaceHolders = new Dictionary<string, string>
        {
             { "{APPLICATION_ID}", model.Member_ID ?? "" },
            { "{RECIPIENTFIRSTNAME}", model.First_Name ?? "" },
            { "{RECIPIENTLASTNAME}", model.Last_Name ?? "" },
            { "{MEMBER_ID}", model.Member_ID ?? "N/A" },
            {"{APPLICATION_URL}", _callletterConfig.ApplicationBaseURL},
            {"{MANAGER_NAME}", manager?.FirstName + " " + manager?.LastName ?? ""},
            {"{MANAGER_EMAIL}", manager?.Email ?? ""},
            {"{MANAGER_CONTACT}", manager?.Mobile ?? ""}

        }
            };

            string subject, body;
            bool sent = _mailHelpers.SendMail(email, out body, out subject);

            Console.WriteLine(sent
                ? $"Member Submitted Email sent to {model.Email}"
                : $"Member Submitted Email failed for {model.Email}");
        }

      
        #endregion Common

        #region Member
        public MemberDetailsFormModel Member_Form_Get(string MemberId)
        {
            return _memberDAL.Member_Form_Get(MemberId);
        }
        public MemberDetailsModel Member_Get(string MemberId)
        {
            return _memberDAL.Application_Member_Get(MemberId);
        }
        public string Application_Detail_Member_SaveUpdate(MemberDetailsSaveModel model, AuditColumnsModel audit)
        {
            return _memberDAL.Application_Detail_Member_SaveUpdate(model, audit);
        }
        public MemberModels Get_Member_All_Details_By_MemberId(string memberId)
        {
            MemberModels memberModels = new MemberModels();
            memberModels.MemberDetails = _memberDAL.Application_Member_Get(Id: memberId);
            memberModels.OrganizationDetailModel = _memberDAL.Member_Organization_Get(MemberId: memberId);
            memberModels.WorkAddressMasters = _memberDAL.Member_Address_Master_Get(MemberId: memberId, AddressType: AddressTypeConstants.WorkAddress).FirstOrDefault();
            memberModels.TemprorayAddressMasters = _memberDAL.Member_Address_Master_Get(MemberId: memberId, AddressType: AddressTypeConstants.TemporaryAddress).FirstOrDefault();
            memberModels.PermanentAddressMasters = _memberDAL.Member_Address_Master_Get(MemberId: memberId, AddressType: AddressTypeConstants.PermanentAddress).FirstOrDefault();
            memberModels.BankDetailModel = _memberDAL.Member_Bank_Get(MemberId: memberId);
            memberModels.FamilyMemberModels = _memberDAL.Member_Family_Get(MemberId: memberId);
            return memberModels;
        }
        public MemberViewModelExisting Get_Member_All_Saved_Details_By_MemberId(string MemberId)
        {
            MemberViewModelExisting model = _memberDAL.Get_Member_All_Saved_Details_By_MemberId(MemberId);
            model.FamilyMembers = new List<FamilyMemberViewModelExisting>();
            if (model.FamilyMembersWithEducation != null)
            {
                foreach (var _familyMember in model.FamilyMembersWithEducation.Where(x => !x.IsTemp))
                {
                    FamilyMemberViewModelExisting item = new FamilyMemberViewModelExisting();
                    item.School = new EduDetailSchoolViewModelExisting();
                    item.College = new EduDetailCollegeViewModelExisting();

                    item.Name = _familyMember.Name;
                    item.RelationShip = _familyMember.RelationShip;
                    item.Gender = _familyMember.Gender;
                    item.Age = _familyMember.Age;
                    item.Education = _familyMember.Education;
                    item.Occupation = _familyMember.Occupation;
                    item.DifferentlyAbled = _familyMember.DifferentlyAbled;

                    item.AadharNumber = _familyMember.AadharNumber;
                    item.phone_number = _familyMember.phone_number;

                    item.School.Standard = _familyMember.Standard;
                    item.School.EducationalStatus = _familyMember.EducationalStatus;
                    item.School.EMISNo = _familyMember.EMISNo;
                    item.School.CompletedYear = _familyMember.CompletedYear;
                    item.School.DiscontinuedYear = _familyMember.DiscontinuedYear;
                    item.School.NameandAddressofSchool = _familyMember.NameandAddressofSchool;
                    item.School.School_Name = _familyMember.School_Name;
                    item.School.School_Address = _familyMember.School_Address;

                    item.College.Course = _familyMember.Course;
                    item.College.College_Name = _familyMember.College_Name;
                    
                    item.College.College_Address = _familyMember.College_Address;
                    item.College.DegreName = _familyMember.DegreName;
                    item.College.EducationalStatus = _familyMember.EducationalStatus;
                    item.College.EducationalYear = _familyMember.EducationalYear;
                    item.College.CompletedYear = _familyMember.CompletedYear;
                    item.College.DiscontinuedYear = _familyMember.DiscontinuedYear;
                    item.College.NameandAddressofCollege = _familyMember.NameandAddressofCollege;

                    item.MandatoryDocuments = _familyMember.MandatoryDocuments;
                    item.NonMandatoryDocuments = _familyMember.NonMandatoryDocuments;

                    model.FamilyMembers.Add(item);
                }

                model.FamilyMembersWithEducation.Clear();
            }

            return model;
        }
        public MemberDiffViewModel Get_Member_All_Saved_Details_Diff_By_MemberId(string MemberId)
        {
            return _memberDAL.Get_Member_All_Saved_Details_Diff_By_MemberId(MemberId);
        }
        public MemberDetailsViewModelExisting Get_Member_View(string MemberId)
        {
            return _memberDAL.Get_Member_View(MemberId);
        }
        public string LookupMemberInLocal(string SearchString)
        {
            return _memberDAL.LookupMemberInLocal(SearchString);
        }
        public int UpdateMemberCodeRunningNumber(string MemberId, int AutoGeneratedNumber)
        {
            return _memberDAL.UpdateMemberCodeRunningNumber(MemberId, AutoGeneratedNumber);
        }
        public bool IsMobileNumberExist(string MemberId, string MobileNumber)
        {
            return _memberDAL.IsMobileNumberExist(MemberId, MobileNumber);
        }
        public List<SelectListItem> Application_NameOfTheLocalBody_Select_Get(string MemberId, string DistrictId)
        {
            return _memberDAL.Application_NameOfTheLocalBody_Select_Get(MemberId, DistrictId);
        }
        #endregion Member

        #region Organization
        public OrganizationDetailFormModel Organization_Form_Get(string MemberId)
        {
            return _memberDAL.Organization_Form_Get(MemberId);
        }
        public string Application_Detail_Organization_SaveUpdate(OrganizationDetailSaveModel model, AuditColumnsModel audit)
        {
            return _memberDAL.Application_Detail_Organization_SaveUpdate(model, audit);
        }
        public OrganizationDetailModel Member_Organization_Get(string Id = "", string MemberId = "")
        {
            return _memberDAL.Member_Organization_Get(Id, MemberId);
        }
        #endregion Organization

        #region Family
        public FamilyMemberFormModel Family_Form_Get(string FamilyMemberId)
        {
            return _memberDAL.Family_Form_Get(FamilyMemberId);
        }
        public string Application_Detail_Family_SaveUpdate(FamilyMemberSaveModel model, AuditColumnsModel audit)
        {
            return _memberDAL.Application_Detail_Family_SaveUpdate(model, audit);
        }
        public List<FamilyMemberModel> Member_Family_Get(string FamilyMemberId, string MemberId, bool IsTemp = false)
        {
            return _memberDAL.Member_Family_Get(FamilyMemberId, MemberId, IsTemp);
        }

        public string Member_New_Family_Member_Save(string MemberId, string MemberName, AuditColumnsModel model)
        {
            return _memberDAL.Member_New_Family_Member_Save(MemberId, MemberName, model);
        }
        public int Family_Member_Has_Application(string FamilyMemberId)
        {
            return _memberDAL.Family_Member_Has_Application(FamilyMemberId);
        }
        #endregion Family

        #region Bank
        public BankDetailFormModel Bank_Form_Get(string MemberId)
        {
            return _memberDAL.Bank_Form_Get(MemberId);
        }
        public string Application_Detail_Bank_SaveUpdate(BankDetailSaveModel model, AuditColumnsModel audit)
        {
            return _memberDAL.Application_Member_Bank_SaveUpdate(model, audit);
        }
        public BankDetailModel Member_Bank_Get(string Id = "", string MemberId = "")
        {
            return _memberDAL.Member_Bank_Get(Id, MemberId);
        }
        #endregion Bank

        #region Application_Member_Bank
        public string Application_Member_Bank_SaveUpdate(ApplicationBankDetailSaveModel model, AuditColumnsModel audit)
        {
            return _memberDAL.Application_Detail_Bank_SaveUpdate(model, audit);
        }
        public ApplicationBankModel Application_Member_Bank_Get(string Id = "", string Application_Id = "")
        {
            return _memberDAL.Application_Member_Bank_Get(Id, Application_Id);
        }
        #endregion Application_Member_Bank

        #region Address
        public AddressDetailFormModel Address_Form_Get(string MemberId, string AddressType)
        {
            return _memberDAL.Address_Form_Get(MemberId, AddressType);
        }
        public string Member_Address_Master_SaveUpdate(ApplicationAddressMaster model, AuditColumnsModel audit)
        {
            return _memberDAL.Member_Address_Master_SaveUpdate(model, audit);
        }
        public List<ApplicationAddressMaster> Member_Address_Master_Get(string Id = "", string MemberId = "", string AddressType = "")
        {
            return _memberDAL.Member_Address_Master_Get(Id, MemberId, AddressType);
        }
        #endregion Address

        #region Member Document
        public string Member_Document_SaveUpdate(MemberDocumentSaveMaster model, AuditColumnsModel audit)
        {
            return _memberDAL.Member_Document_SaveUpdate(model, audit);
        }
        public List<MemberDocumentMaster> Member_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            List<MemberDocumentMaster> list = _memberDAL.Member_Document_Get(Id, MemberId, IsTemp);

            List<SelectListItem> documentCategoryList = _settingsDAL.Configuration_Get(IsActive: true, CategoryCode: "DOCUMENTCATEGORY")
                .Select(x => new SelectListItem() { Text = x.Value, Value = x.Id }).OrderBy(o => o.Text).ToList();
            List<ConfigurationModel> acceptedDocType = _settingsDAL.Configuration_Get(IsActive: true, CategoryCode: "ACCEPTEDDOCUMENT");

            if (list.Count > 0)
            {
                list.ForEach(x =>
                {
                    x.DocumentCategorySelectList = documentCategoryList;
                    if (!string.IsNullOrWhiteSpace(x.DocumentCategoryId))
                    {
                        x.AcceptedDocumentTypeSelectList = acceptedDocType.Where(d => d.ConfigurationId == x.DocumentCategoryId)
                        .Select(x => new SelectListItem() { Text = x.Value, Value = x.Id }).OrderBy(o => o.Text).ToList();
                    }
                });
            }

            return list;
        }
        public List<MemberDocumentMaster> Member_NonMandatory_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            List<MemberDocumentMaster> list = _memberDAL.Member_NonMandatory_Document_Get(Id, MemberId, IsTemp);

            List<SelectListItem> documentCategoryList = _settingsDAL.Configuration_Get(IsActive: true, CategoryCode: "DOCUMENTCATEGORY")
                .Select(x => new SelectListItem() { Text = x.Value, Value = x.Id }).OrderBy(o => o.Text).ToList();
            List<ConfigurationModel> acceptedDocType = _settingsDAL.Configuration_Get(IsActive: true, CategoryCode: "ACCEPTEDDOCUMENT");

            if (list.Count > 0)
            {
                list.ForEach(x =>
                {
                    x.DocumentCategorySelectList = documentCategoryList;
                    if (!string.IsNullOrWhiteSpace(x.DocumentCategoryId))
                    {
                        x.AcceptedDocumentTypeSelectList = acceptedDocType.Where(d => d.ConfigurationId == x.DocumentCategoryId)
                        .Select(x => new SelectListItem() { Text = x.Value, Value = x.Id }).OrderBy(o => o.Text).ToList();
                    }
                });
            }

            return list;
        }
        public List<MemberDocumentMaster> Family_Member_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            List<MemberDocumentMaster> list = _memberDAL.Family_Member_Document_Get(Id, MemberId, IsTemp);
            List<SelectListItem> documentCategoryList = _settingsDAL.Configuration_Get(IsActive: true, CategoryCode: "DOCUMENTCATEGORY")
                .Select(x => new SelectListItem() { Text = x.Value, Value = x.Id }).OrderBy(o => o.Text).ToList();
            List<ConfigurationModel> acceptedDocType = _settingsDAL.Configuration_Get(IsActive: true, CategoryCode: "ACCEPTEDDOCUMENT");
            if (list.Count > 0)
            {
                list.ForEach(x =>
                {
                    x.DocumentCategorySelectList = documentCategoryList;
                    if (!string.IsNullOrWhiteSpace(x.DocumentCategoryId))
                    {
                        x.AcceptedDocumentTypeSelectList = acceptedDocType.Where(d => d.ConfigurationId == x.DocumentCategoryId)
                        .Select(x => new SelectListItem() { Text = x.Value, Value = x.Id }).OrderBy(o => o.Text).ToList();
                    }
                });
            }
            return list;
        }
        public List<MemberDocumentMaster> Family_Member_NonMandatory_Document_Get(string Id = "", string MemberId = "", bool IsTemp = false)
        {
            List<MemberDocumentMaster> list = _memberDAL.Family_Member_NonMandatory_Document_Get(Id, MemberId, IsTemp);
            List<SelectListItem> documentCategoryList = _settingsDAL.Configuration_Get(IsActive: true, CategoryCode: "DOCUMENTCATEGORY")
                .Select(x => new SelectListItem() { Text = x.Value, Value = x.Id }).OrderBy(o => o.Text).ToList();
            List<ConfigurationModel> acceptedDocType = _settingsDAL.Configuration_Get(IsActive: true, CategoryCode: "ACCEPTEDDOCUMENT");
            if (list.Count > 0)
            {
                list.ForEach(x =>
                {
                    x.DocumentCategorySelectList = documentCategoryList;
                    if (!string.IsNullOrWhiteSpace(x.DocumentCategoryId))
                    {
                        x.AcceptedDocumentTypeSelectList = acceptedDocType.Where(d => d.ConfigurationId == x.DocumentCategoryId)
                        .Select(x => new SelectListItem() { Text = x.Value, Value = x.Id }).OrderBy(o => o.Text).ToList();
                    }
                });
            }
            return list;
        }
        public List<MemberDocumentMaster> Member_Document_Get_By_Id(string Id = "", string MemberId = "")
        {
            return _memberDAL.Member_Document_Get_By_Id(Id, MemberId);
        }
        public IEnumerable<(string OriginalFileName, string SavedFileName)> Member_Document_Get_By_DocCategoryAndMember(string DocumentCategoryId, string MemberId)
        {
            return _memberDAL.Member_Document_Get_By_DocCategoryAndMember(DocumentCategoryId, MemberId);
        }
        public string Member_Document_Delete(string Id, bool IsTemp, AuditColumnsModel audit)
        {
            return _memberDAL.Member_Document_Delete(Id, IsTemp, audit);
        }
        public bool Member_Document_Delete_From_Application(string MemberId, string DocumentCategoryId, string ApplicationId = "")
        {
            return _memberDAL.Member_Document_Delete_From_Application(MemberId, DocumentCategoryId, ApplicationId);
        }

        #endregion Member Document

        #region Member Search
        public bool Search_Member(string SearchText, AuditColumnsModel audit)
        {
            try
            {
                MemberRootModel? responce_model = new MemberRootModel();
                string _url = _configuration.GetSection("MemberAPIs").GetSection("Member_GET_URL").Value.ToString();
                _url = _url + "?Search=" + SearchText;
                HttpResponseMessage message = _httpClient.GetAsync(_url).Result;
                if (message.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    string ResponceString = message.Content.ReadAsStringAsync().Result;
                    if (!string.IsNullOrEmpty(ResponceString))
                    {
                        JObject obj = JObject.Parse(ResponceString);
                        responce_model = obj?.ToObject<MemberRootModel>();
                        if (responce_model != null && responce_model.data != null && responce_model.data.Count > 0)
                        {
                            foreach (Datum item in responce_model.data)
                            {
                                TwoColumnConfigValues Ids = _memberDAL.Get_ConfigValue_Ids(item);
                                bool IsApproved = false;
                                if ((item.member_details?.IS_Approved ?? string.Empty).Trim().ToLower() == "yes")
                                {
                                    IsApproved = true;
                                }
                                bool DM_Status = true;
                                bool HQ_Status = true;

                                // Only check if record is NOT fully approved
                                if (!IsApproved)
                                {
                                    string dmStatusRaw = item.member_details?.DM_Status?.Trim();
                                    string hqStatusRaw = item.member_details?.HQ_Status?.Trim();

                                    // 1️ If DM is still pending (In Progress), send to DM
                                    if (string.Equals(dmStatusRaw, "In Progress", StringComparison.OrdinalIgnoreCase))
                                    {
                                        DM_Status = false; // Needs DM approval
                                        HQ_Status = true;  // HQ not yet applicable
                                        IsApproved = true;
                                    }
                                    // 2️ If DM is approved but HQ is still pending, send to HQ
                                    else if (string.Equals(dmStatusRaw, "DM Approved", StringComparison.OrdinalIgnoreCase) &&
                                             string.Equals(hqStatusRaw, "In Progress", StringComparison.OrdinalIgnoreCase))
                                    {
                                        DM_Status = true;  // DM done
                                        HQ_Status = false;
                                        IsApproved = true;// Needs HQ approval
                                    }
                                    // 3️ Optional: If both are "In Progress" , send to DM first
                                    else if (string.Equals(dmStatusRaw, "In Progress", StringComparison.OrdinalIgnoreCase) &&
                                             string.Equals(hqStatusRaw, "In Progress", StringComparison.OrdinalIgnoreCase))
                                    {
                                        DM_Status = false;
                                        HQ_Status = true;
                                        IsApproved = true;
                                    }
                                }

                                    #region Member
                                    MemberDetailsSaveModel memberDetailsSave = new MemberDetailsSaveModel
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    Member_ID = item.member_details?.Member_ID ?? string.Empty,
                                    First_Name = item.member_details?.First_Name ?? string.Empty,
                                    Last_Name = item.member_details?.Last_Name ?? string.Empty,
                                    Father_Name = item.member_details?.Father_Name ?? string.Empty,
                                    Date_Of_Birth = item.member_details?.Date_Of_Birth ?? string.Empty,
                                    Aadhaar_Number = item.member_details?.Aadhaar_Number ?? string.Empty,
                                    Phone_Number = item.member_details?.Phone_Number ?? string.Empty,
                                    Profile_Picture = item.member_details?.Profile_Picture ?? string.Empty,
                                    DM_Status = item.member_details?.DM_Status ?? string.Empty,
                                    HQ_Status = item.member_details?.HQ_Status ?? string.Empty,
                                    Id_Card_Status = item.member_details?.Id_Card_Status ?? string.Empty,
                                    IsActive = true,
                                    Gender = Ids?.MemberGenderId ?? string.Empty,
                                    Religion = Ids?.MemberReligionId ?? string.Empty,
                                    Community = Ids?.MemberCommunityId ?? string.Empty,
                                    Marital_Status = Ids?.MemberMaritalStatusId ?? string.Empty,
                                    Education = Ids?.MemberEducationId ?? string.Empty,
                                    Member_json = JsonConvert.SerializeObject(item),
                                        DM_Status_Approval = DM_Status,
                                        HQ_Status_Approval = HQ_Status,
                                        CollectedByName = item.data_Collectedby?.Data_Collected_By ?? string.Empty,
                                        CollectedByPhoneNumber = item.data_Collectedby?.Data_Collected_PhoneNumber ?? string.Empty,
                                        CollectedOn = item.data_Collectedby?.Data_Submitted ?? string.Empty
                                    };
                                var memberGUID = _memberDAL.Application_Detail_Member_SaveUpdate(memberDetailsSave, audit, IsApproved, false);

                                if (!string.IsNullOrWhiteSpace(item.member_details?.Member_ID))
                                {
                                    if (int.TryParse(StringFunctions.GetLastCodeSegment(item.member_details.Member_ID), out int number))
                                    {
                                        _memberDAL.UpdateMemberCodeRunningNumber(memberGUID, number);
                                    }
                                }
                                if (!string.IsNullOrWhiteSpace(memberDetailsSave.Profile_Picture))
                                {
                                    List<string> profilesavelist = new List<string>() { "1" };
                                    profilesavelist.ForEach(async x =>
                                    {
                                        string Profile_Picture_saved_name = await UploadFileToFTPAsync(memberDetailsSave.Profile_Picture);

                                        if (!string.IsNullOrWhiteSpace(Profile_Picture_saved_name))
                                        {
                                            FileMasterModel fileMasterModel = new FileMasterModel();
                                            if (string.IsNullOrWhiteSpace(fileMasterModel.Id))
                                            {
                                                fileMasterModel.Id = Guid.NewGuid().ToString();
                                            }
                                            fileMasterModel.TypeId = memberGUID;
                                            fileMasterModel.Type = FileUploadTypeCode.MemberProfile;
                                            fileMasterModel.TypeName = FileUploadTypeCode.MemberProfile;
                                            fileMasterModel.FileType = Path.GetExtension(Profile_Picture_saved_name);
                                            fileMasterModel.OriginalFileName = Path.GetFileName(WebUtility.UrlDecode(new Uri(memberDetailsSave.Profile_Picture).LocalPath));
                                            fileMasterModel.SavedFileName = Profile_Picture_saved_name;
                                            fileMasterModel.IsActive = true;
                                            fileMasterModel.SavedBy = audit.SavedBy;
                                            fileMasterModel.SavedByUserName = audit.SavedByUserName;
                                            fileMasterModel.SavedDate = DateTime.Now;

                                            string res = _generalDAL.FileMaster_SaveUpdate(fileMasterModel);
                                        }
                                    });
                                }
                                #endregion Member

                                #region Organization
                                OrganizationDetailSaveModel organizationDetailSave = new OrganizationDetailSaveModel
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    Member_Id = memberGUID,
                                    Health_Id = item.organization_info?.Health_Id ?? string.Empty,
                                    Already_a_Member_of_CWWB = (item.organization_info?.Already_a_Member_of_CWWB ?? string.Empty).ToLower() == "yes",
                                    Private_Organisation_Name = item.organization_info?.Private_Organisation_Name ?? string.Empty,
                                    Private_Designation = item.organization_info?.Private_Designation ?? string.Empty,
                                    Private_Address = item.organization_info?.Private_Address ?? string.Empty,
                                    New_Yellow_Card_Number = item.organization_info?.New_Yellow_Card_Number ?? string.Empty,
                                    Village_Panchayat = item.organization_info?.Village_Panchayat ?? string.Empty,
                                    IsActive = true,
                                    Type_of_Work = Ids?.OrgTypeOfWorkId ?? string.Empty,
                                    Core_Sanitary_Worker_Type = Ids?.OrgCoreSanitaryWorkerTypeId ?? string.Empty,
                                    Organization_Type = Ids?.OrgTypeId ?? string.Empty,
                                    Nature_of_Job = Ids?.OrgNatureOfJobId ?? string.Empty,
                                    Local_Body = Ids?.OrgLocalBodyId ?? string.Empty,
                                   // Local_Body = item.organization_info?.Local_Body ?? string.Empty,
                                    Name_of_Local_Body = item.organization_info?.Name_of_Local_Body ?? string.Empty,
                                    District_Id = Ids?.OrgDistrictId ?? string.Empty,
                                    Zone = Ids?.OrgZoneId ?? string.Empty,
                                    Block = Ids?.OrgBlockId ?? string.Empty,
                                    Corporation = Ids?.OrgCorporationId ?? string.Empty,
                                    Municipality = Ids?.OrgMunicipalityId ?? string.Empty,
                                    Town_Panchayat = Ids?.OrgTownPanchayatId ?? string.Empty,
                                };
                                _memberDAL.Application_Detail_Organization_SaveUpdate(organizationDetailSave, audit);
                                if (string.IsNullOrEmpty(memberDetailsSave.Member_ID))
                                {
                                    _memberDAL.GenerateMemberId(memberGUID);
                                }
                                #endregion Organization

                                #region Permanent Address
                                ApplicationAddressMaster applicationAddressMasterPermanent = new ApplicationAddressMaster
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    DoorNo = item.permanent_address?.Door_No ?? string.Empty,
                                    StreetName = item.permanent_address?.Street ?? string.Empty,
                                    VilllageTownCity = item.permanent_address?.City_Village ?? string.Empty,
                                    Taluk = Ids?.PermanentTalukId ?? string.Empty,
                                    District = Ids?.PermanentDistrictId ?? string.Empty,
                                    Pincode = item.permanent_address?.Pincode ?? string.Empty,
                                    MemberId = memberGUID,
                                    AddressType = AddressTypeConstants.PermanentAddress,
                                    IsActive = true,
                                };
                                _memberDAL.Member_Address_Master_SaveUpdate(applicationAddressMasterPermanent, audit);
                                #endregion Permanent Address

                                #region Temporary Address
                                ApplicationAddressMaster applicationAddressMasterTemporary = new ApplicationAddressMaster
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    DoorNo = item.permanent_address?.Door_No ?? string.Empty,
                                    StreetName = item.temporary_address?.Street ?? string.Empty,
                                    VilllageTownCity = item.temporary_address?.City_Village ?? string.Empty,
                                    Taluk = Ids?.TempTalukId ?? string.Empty,
                                    District = Ids?.TempDistrictId ?? string.Empty,
                                    Pincode = item.temporary_address?.Pincode ?? string.Empty,
                                    MemberId = memberGUID,
                                    AddressType = AddressTypeConstants.TemporaryAddress,
                                };
                                _memberDAL.Member_Address_Master_SaveUpdate(applicationAddressMasterTemporary, audit);
                                #endregion Temporary Address

                                #region Work Address
                                var workAddressInfo = new
                                {
                                    pId = Guid.NewGuid().ToString(),
                                    pOffice_Address = item.work_address?.Office_Address ?? string.Empty,
                                    pDoorNo = item.work_address?.Office_Door_No ?? string.Empty,
                                    pStreetName = item.work_address?.Office_Street ?? string.Empty,
                                    pVilllageTownCity = item.work_address?.Office_Village_Area_City ?? string.Empty,
                                    pTaluk = Ids?.WorkTalukId ?? string.Empty,
                                    pDistrict = Ids?.WorkDistrictId ?? string.Empty,
                                    pOffice_Pincode = item.work_address?.Office_Pincode ?? string.Empty,
                                    pMemberId = memberGUID,
                                    pAddressType = AddressTypeConstants.WorkAddress,
                                };
                                _memberDAL.Member_Address_Master_SaveUpdate(applicationAddressMasterTemporary, audit);
                                #endregion Work Address

                                #region Bank Details
                                BankDetailSaveModel bankDetailSaveModel = new BankDetailSaveModel
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    Member_Id = memberGUID,
                                    Account_Holder_Name = item.bank_details?.Account_Holder_Name ?? string.Empty,
                                    Account_Number = item.bank_details?.Account_Number ?? string.Empty,
                                    IFSC_Code = item.bank_details?.IFSC_Code ?? string.Empty,
                                    Bank_Id = item.bank_details?.IFSC_Code ?? string.Empty,
                                    Bank_Name = item.bank_details?.Bank_Name ?? string.Empty,
                                    Branch_Id = Ids?.BranchId ?? string.Empty,
                                    Branch = item.bank_details?.Branch ?? string.Empty,
                                    IsActive = true,
                                };
                                _memberDAL.Application_Member_Bank_SaveUpdate(bankDetailSaveModel, audit);
                                #endregion Bank Details

                                #region Family Members
                                if (item.family_members != null)
                                {
                                    foreach (var familyMember in item.family_members)
                                    {
                                        var familymemberTwoColumnParams = new
                                        {
                                            prelation = familyMember.relation ?? string.Empty,
                                            psex = familyMember.sex ?? string.Empty,
                                            peducation = familyMember.education ?? string.Empty,
                                            pdisability = familyMember.disability ?? string.Empty,
                                        };
                                        TwoColumnConfigValuesForFamily memberFamilyIds = _memberDAL.Get_ConfigValue_Ids_For_Family(familyMember);
                                        FamilyMemberSaveModel familyMember1 = new FamilyMemberSaveModel
                                        {
                                            Id = Guid.NewGuid().ToString(),
                                            Member_Id = memberGUID,
                                            f_id = familyMember.f_id ?? string.Empty,
                                            name = familyMember.name ?? string.Empty,
                                            phone_number = familyMember.phone_number ?? string.Empty,
                                            relation = memberFamilyIds.Relation,
                                            sex = memberFamilyIds.Sex,
                                            age = familyMember.age ?? string.Empty,
                                            education = memberFamilyIds.Education,
                                            Standard = familyMember.Standard ?? string.Empty,
                                            School_Status = familyMember.School_Status ?? string.Empty,
                                            EMIS_No = familyMember.EMIS_No ?? string.Empty,
                                            School_Address = familyMember.School_Address ?? string.Empty,
                                            Course = familyMember.Course ?? string.Empty,
                                            Degree_Name = familyMember.Degree_Name ?? string.Empty,
                                            College_Status = familyMember.College_Status ?? string.Empty,
                                            Year = familyMember.Year ?? string.Empty,
                                            Year_Of_Completion = familyMember.Year_Of_Completion ?? string.Empty,
                                            College_Address = familyMember.College_Address ?? string.Empty,
                                            occupation = familyMember.occupation ?? string.Empty,
                                            disability = memberFamilyIds.Disability,
                                            IsActive = true
                                        };
                                        _memberDAL.Application_Detail_Family_SaveUpdate(familyMember1, audit);
                                    }
                                }
                                #endregion Family Members

                                #region Document
                                if (item.documents != null)
                                {
                                    item.documents.ForEach(async document =>
                                    {
                                        string savedFileName = await UploadFileToFTPAsync(document.Card_File);
                                        MemberDocumentSaveMaster model = new MemberDocumentSaveMaster();
                                        if (!string.IsNullOrWhiteSpace(savedFileName))
                                        {
                                            model.DocumentCategoryId = document.Category_id;
                                            model.AcceptedDocumentTypeId = document.Accepted_id;
                                            model.SavedFileName = savedFileName;
                                            model.OriginalFileName = Path.GetFileName(WebUtility.UrlDecode(new Uri(document.Card_File).LocalPath));
                                            model.Member_Id = memberGUID;
                                            model.Id = Guid.NewGuid().ToString();
                                            string docId = _memberDAL.Member_Document_SaveUpdate(model, audit);
                                        }
                                    });
                                }
                                #endregion Document

                                if ((item.member_details?.IS_Approved ?? string.Empty).Trim().ToLower() == "yes")
                                {
                                    _memberDAL.Update_Member_As_Approved(memberGUID);
                                }
                            }

                            return true;
                        }
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        #endregion Member Search

        #region Member Eligibility
        public List<MemberEligibilityModel> Member_Eligibilty_Get(string MemberId, string SchemeId)
        {
            List<MemberEligibilityModel> list = new List<MemberEligibilityModel>();

            MemberDetailsModel member = _memberDAL.Application_Member_Get(MemberId);
            List<FamilyMemberModel> familyMemberList = _memberDAL.Member_Family_Get(MemberId: MemberId);

            bool ShowApplyOption = false;
            //if ((member.IsSubmitted == true && member.IsNewMember == false) || member.IsApproved == true)
            //{
            //    ShowApplyOption = true;
            //}
            if ((member.IsSubmitted == true &&  member.IsApproved == true))
            {
                ShowApplyOption = true;
            }

            string schemeELigibilityType = _settingsDAL.Config_Scheme_Get_Eligibility_Type(SchemeId: SchemeId);

            if ((schemeELigibilityType == "SELF" || schemeELigibilityType == "BOTH") && _settingsDAL.Config_Scheme_Check_Eligibility_of_member(SchemeId, MemberId, ""))
            {
                list.Add(new MemberEligibilityModel()
                {
                    Id = MemberId,
                    Name = member.First_Name + " " + member.Last_Name,
                    Relation = "",
                    IsFamilyMember = false,
                    ShowApplyOption = ShowApplyOption,
                });
            }

            if ((schemeELigibilityType == "DEPENDENT" || schemeELigibilityType == "BOTH") && familyMemberList?.Count > 0)
            {
                foreach (var familyMember in familyMemberList)
                {
                    if (_settingsDAL.Config_Scheme_Check_Eligibility_of_member(SchemeId, MemberId, familyMember.Id))
                    {
                        list.Add(new MemberEligibilityModel()
                        {
                            Id = familyMember.Id,
                            Name = familyMember.name,
                            Relation = familyMember.relationString,
                            IsFamilyMember = true,
                            ShowApplyOption = ShowApplyOption,
                        });
                    }
                }
            }

            list.ForEach(item =>
            {
                item.ExistApplication = _settingsDAL.GetMemberExistApplication(SchemeId, item.Id).FirstOrDefault();
            });

            return list;
        }



        public List<ConfigurationSchemeViewModel> Member_Eligibilty_Get_By_Scheme(string MemberId, string SchemeGroupId)
        {
            List<ConfigurationSchemeViewModel> Schemelist = _settingsDAL.Config_Scheme_Get(SchemeGroupId: SchemeGroupId).Select(y => new ConfigurationSchemeViewModel()
            {
                SchemeId = y.SchemeId,
                SchemeName = y.SchemeName,
                Description = y.Description,
                IsApplicable = false,
                SortOrder = y.SortOrder,
                SchemeNameEnglish = y.SchemeNameEnglish,
                SchemeNameTamil = y.SchemeNameTamil,
                IsSelfOrFamilyMember = y.IsSelfOrFamilyMember,
                EligibleMembers = new List<FamilyMemberModel>() // Indha list-ah initialize pandrom
            }).ToList();

            if (!string.IsNullOrWhiteSpace(MemberId))
            {
                List<FamilyMemberModel> familyMemberList = _memberDAL.Member_Family_Get(MemberId: MemberId);
                var memberSelf = _memberDAL.Member_Get_By_Id(MemberId);

                Schemelist.ForEach(item =>
                {
                    // --- 1. SELF LOGIC ---
                    if ((item.IsSelfOrFamilyMember == "SELF" || item.IsSelfOrFamilyMember == "BOTH"))
                    {
                        bool selfEligible = _settingsDAL.Config_Scheme_Check_Eligibility_of_member(item.SchemeId, MemberId, "");

                        if (selfEligible && memberSelf != null)
                        {
                            item.IsApplicable = true;
                            // Object overwrite aagama irukka Clone pandrom
                            var selfClone = JsonConvert.DeserializeObject<FamilyMemberModel>(JsonConvert.SerializeObject(memberSelf));
                            item.EligibleMembers.Add(selfClone);
                        }
                    }

                    // --- 2. DEPENDENT LOGIC ---
                    if ((item.IsSelfOrFamilyMember == "DEPENDENT" || item.IsSelfOrFamilyMember == "BOTH") && familyMemberList?.Count > 0)
                    {
                        foreach (var familyMember in familyMemberList)
                        {
                            bool familyEligible = _settingsDAL.Config_Scheme_Check_Eligibility_of_member(item.SchemeId, MemberId, familyMember.Id);

                            if (familyEligible)
                            {
                                item.IsApplicable = true;
                                var dependentClone = JsonConvert.DeserializeObject<FamilyMemberModel>(JsonConvert.SerializeObject(familyMember));
                                item.EligibleMembers.Add(dependentClone);
                            }
                        }
                    }
                });

                Schemelist.ForEach(scheme =>
                {
                    scheme.EligibleMembers.ForEach(member =>
                    {
                        member.ExistApplication = _settingsDAL.GetMemberExistApplication(scheme.SchemeId, member.Id).FirstOrDefault();
                    });
                });
            }

            return Schemelist;
        }


        //public List<ConfigurationSchemeViewModel> Member_Eligibilty_Get_By_Scheme(string MemberId,string SchemeGroupId)
        //    {
        //        List<ConfigurationSchemeViewModel> Schemelist =
        //            _settingsDAL.Config_Scheme_Get(SchemeGroupId: SchemeGroupId)
        //            .Select(y => new ConfigurationSchemeViewModel()
        //            {
        //                SchemeId = y.SchemeId,
        //                SchemeName = y.SchemeName,
        //                Description = y.Description,
        //                IsApplicable = false,
        //                SortOrder = y.SortOrder,
        //                SchemeNameEnglish = y.SchemeNameEnglish,
        //                SchemeNameTamil = y.SchemeNameTamil,
        //                IsSelfOrFamilyMember = y.IsSelfOrFamilyMember,
        //                EligibleMembers = new List<FamilyMemberModel>()
        //            })
        //            .ToList();

        //        if (!string.IsNullOrWhiteSpace(MemberId))
        //        {
        //            var familyMemberList = _memberDAL.Member_Family_Get(MemberId);
        //            var memberSelf = _memberDAL.Member_Get_By_Id(MemberId);

        //            Schemelist.ForEach(item =>
        //            {
        //                // SELF
        //                if (item.IsSelfOrFamilyMember == "SELF"
        //                    || item.IsSelfOrFamilyMember == "BOTH")
        //                {
        //                    bool selfEligible =
        //                        _settingsDAL.Config_Scheme_Check_Eligibility_of_member(
        //                            item.SchemeId, MemberId, "");

        //                    if (selfEligible)
        //                    {
        //                        item.IsApplicable = true;

        //                        if (memberSelf != null)
        //                            item.EligibleMembers.Add(memberSelf);
        //                    }
        //                }

        //                // FAMILY  ← FIXED
        //                if ((item.IsSelfOrFamilyMember == "DEPENDENT"
        //                    || item.IsSelfOrFamilyMember == "BOTH")
        //                    && familyMemberList?.Count > 0)
        //                {
        //                    foreach (var familyMember in familyMemberList)
        //                    {
        //                        bool familyEligible =
        //                            _settingsDAL.Config_Scheme_Check_Eligibility_of_member(
        //                                item.SchemeId,
        //                                MemberId,
        //                                familyMember.Id);

        //                        if (familyEligible)
        //                        {
        //                            item.IsApplicable = true;
        //                            item.EligibleMembers.Add(familyMember);
        //                        }
        //                    }
        //                }
        //            });
        //        }

        //        return Schemelist;
        //    }

        public List<SchemeEligibleFamilyMemberViewModel> Member_Eligible_FamilyMembers_By_SchemeGroup(string MemberId, string SchemeGroupId)
        {
            if (string.IsNullOrWhiteSpace(MemberId))
                return new List<SchemeEligibleFamilyMemberViewModel>();

            return _settingsDAL.Config_Scheme_Get_Eligible_FamilyMembers(MemberId, SchemeGroupId);
        }
        #endregion Member Eligibility

        #region Member_Detail_Approval_Master_And_History
        public List<MemberDataApprovalMaster> Member_Data_Approval_Master_Get(string Id, string MemberId)
        {
            List<MemberDataApprovalMaster> list = _memberDAL.Member_Data_Approval_Master_Get(Id, MemberId);

            list.ForEach(x =>
            {
                if (!string.IsNullOrEmpty(x.Changed_Time_String))
                {
                    x.Changed_Time = TimeOnly.ParseExact(x.Changed_Time_String, "HH:mm:ss", null);
                }
                if (!string.IsNullOrEmpty(x.Changed_Date_String))
                {
                    x.Changed_Date = DateOnly.ParseExact(x.Changed_Date_String, "dd-MM-yyyy", null);
                }
            });

            return list.OrderByDescending(x => x.CreatedDate).ToList();
        }
        public List<MemberDataApprovalHistoryView> Member_Data_Approval_History_Get(string Id = "", string RequestId = "")
        {
            return _memberDAL.Member_Data_Approval_History_Get(Id, RequestId).OrderByDescending(x => x.CreatedOn).ToList();
        }

        public string Member_Detail_Approval_Master_SaveUpdate(MemberDataApprovalMaster memberDataApprovalMaster, AuditColumnsModel audit)
        {
            return _memberDAL.Member_Detail_Approval_Master_SaveUpdate(memberDataApprovalMaster, audit);
        }
        public string Member_Data_Approval_History_SaveUpdate(MemberDataApprovalHistory memberDataApprovalHistory, AuditColumnsModel audit)
        {
            return _memberDAL.Member_Data_Approval_History_SaveUpdate(memberDataApprovalHistory, audit);
        }
        #endregion Member_Detail_Approval_Master_And_History

        #region Dashboard
        public MemberDetailCount MemberDashboardCountGet(string District, string Mobile, string LocalBody, string NameOfLocalBody, string Block, string Corporation, string Municipality, string TownPanchayat, string VillagePanchayat, string Zone)
        {
            var count = _memberDAL.MemberDashboardCountGet(District, Mobile, LocalBody, NameOfLocalBody, Block, Corporation, Municipality, TownPanchayat, VillagePanchayat, Zone);
            var tt = count.MemberApprovalCount
                            .Where(x => string.IsNullOrEmpty(x.OrganizationType)
                                     && string.IsNullOrEmpty(x.LocalBody)
                                     && string.IsNullOrEmpty(x.NameOfLocalBody)
                                     && string.IsNullOrEmpty(x.RoleName)
                                     && string.IsNullOrEmpty(x.CardPrintingStatus))
                            .LastOrDefault()?.RecordCount ?? 0;
            var tt1 = count.CardApprovalCount
                       .Where(x => string.IsNullOrEmpty(x.OrganizationType)
                                && string.IsNullOrEmpty(x.LocalBody)
                                && string.IsNullOrEmpty(x.NameOfLocalBody)
                                && string.IsNullOrEmpty(x.RoleName)
                                && string.IsNullOrEmpty(x.CardPrintingStatus))
 .LastOrDefault()?.RecordCount ?? 0;
            tt += count.CardApprovalCount
                            .Where(x => string.IsNullOrEmpty(x.OrganizationType)
                                     && string.IsNullOrEmpty(x.LocalBody)
                                     && string.IsNullOrEmpty(x.NameOfLocalBody)
                                     && string.IsNullOrEmpty(x.RoleName)
                                     && string.IsNullOrEmpty(x.CardPrintingStatus))
                            //.FirstOrDefault()?.RecordCount ?? 0;
                            .LastOrDefault()?.RecordCount ?? 0;
            var root = new MemberDetailCount
            {
                Key = "Dashboard",
                Value = "Total",
                ForwardIcon = "pi pi-print",
                BackwardIcon = "pi pi-chevron-down",
                //Count = tt,
                Count = tt1,
                Items = new List<MemberDetailCount>()
            };

            // ──────── ROLES BRANCH ────────
            foreach (var role in count.Roles ?? new())
            {
                var roleItem = new MemberDetailCount
                {
                    Key = role.Value,
                    Value = role.Value,
                    ForwardIcon = "pi pi-users",
                    Count = count.MemberApprovalCount
                                .Where(x => x.RoleName == role.Value
                                         && string.IsNullOrEmpty(x.OrganizationType))
                                .LastOrDefault()?.RecordCount ?? 0,
                    Items = new List<MemberDetailCount>()
                };

                foreach (var org in count.OrganizationTypes ?? new())
                {
                    var orgItem = new MemberDetailCount
                    {
                        Key = org.Value,
                        Value = org.Value,
                        ForwardIcon = "pi pi-building",
                        Count = count.MemberApprovalCount
                                    .Where(x => x.RoleName == role.Value
                                             && x.OrganizationType == org.Value
                                             && string.IsNullOrEmpty(x.LocalBody))
                                    .LastOrDefault()?.RecordCount ?? 0,
                        Items = new List<MemberDetailCount>()
                    };

                    foreach (var lb in count.LocalBody ?? new())
                    {
                        var lbItem = new MemberDetailCount
                        {
                            Key = lb.Value,
                            Value = lb.Value,
                            ForwardIcon = "pi pi-map-marker",
                            Count = count.MemberApprovalCount
                                        .Where(x => x.RoleName == role.Value
                                                 && x.OrganizationType == org.Value
                                                 && x.LocalBody == lb.Code
                                                 && string.IsNullOrEmpty(x.NameOfLocalBody))
                                        .LastOrDefault()?.RecordCount ?? 0,
                            Items = new List<MemberDetailCount>()
                        };

                        if (lb.Value == "Urban" && count.NameofLocalBody != null)
                        {
                            foreach (var nlb in count.NameofLocalBody)
                            {
                                var nlbItem = new MemberDetailCount
                                {
                                    Key = nlb.Value,
                                    Value = nlb.Value,
                                    ForwardIcon = "pi pi-map",
                                    Count = count.MemberApprovalCount
                                                .Where(x => x.RoleName == role.Value
                                                         && x.OrganizationType == org.Value
                                                         && x.LocalBody == lb.Code
                                                         && x.NameOfLocalBody == nlb.Code)
                                                .LastOrDefault()?.RecordCount ?? 0
                                };
                                lbItem.Items.Add(nlbItem);
                            }
                        }

                        orgItem.Items.Add(lbItem);
                    }

                    roleItem.Items.Add(orgItem);
                }

                root.Items.Add(roleItem);
            }

            // ──────── CARD APPROVAL STATUS BRANCH ────────
            foreach (var status in count.CardApprovalStatus ?? new())
            {
                var statusItem = new MemberDetailCount
                {
                    Key = status.Value,
                    Value = status.Value,
                    ForwardIcon = "pi pi-id-card",
                    Count = count.CardApprovalCount
                                .Where(x => x.CardPrintingStatus == status.Value
                                         && string.IsNullOrEmpty(x.OrganizationType))
                                //.FirstOrDefault()?.RecordCount ?? 0,
                                .LastOrDefault()?.RecordCount ?? 0,
                    Items = new List<MemberDetailCount>()
                };

                foreach (var org in count.OrganizationTypes ?? new())
                {
                    var orgItem = new MemberDetailCount
                    {
                        Key = org.Value,
                        Value = org.Value,
                        ForwardIcon = "pi pi-building",
                        Count = count.CardApprovalCount
                                    .Where(x => x.CardPrintingStatus == status.Value
                                             && x.OrganizationType == org.Value
                                             && string.IsNullOrEmpty(x.LocalBody))
                                    //.FirstOrDefault()?.RecordCount ?? 0,
                                    .LastOrDefault()?.RecordCount ?? 0,
                        Items = new List<MemberDetailCount>()
                    };

                    foreach (var lb in count.LocalBody ?? new())
                    {
                        var lbItem = new MemberDetailCount
                        {
                            Key = lb.Value,
                            Value = lb.Value,
                            ForwardIcon = "pi pi-map-marker",
                            Count = count.CardApprovalCount
                                        .Where(x => x.CardPrintingStatus == status.Value
                                                 && x.OrganizationType == org.Value
                                                 && x.LocalBody == lb.Code
                                                 && string.IsNullOrEmpty(x.NameOfLocalBody))
                                        //.FirstOrDefault()?.RecordCount ?? 0,
                                        .LastOrDefault()?.RecordCount ?? 0,
                            Items = new List<MemberDetailCount>()
                        };

                        if (lb.Value == "Urban" && count.NameofLocalBody != null)
                        {
                            foreach (var nlb in count.NameofLocalBody)
                            {
                                var nlbItem = new MemberDetailCount
                                {
                                    Key = nlb.Value,
                                    Value = nlb.Value,
                                    ForwardIcon = "pi pi-map",
                                    Count = count.CardApprovalCount
                                                .Where(x => x.CardPrintingStatus == status.Value
                                                         && x.OrganizationType == org.Value
                                                         && x.LocalBody == lb.Code
                                                         && x.NameOfLocalBody == nlb.Code)
                                                //.FirstOrDefault()?.RecordCount ?? 0
                                                .LastOrDefault()?.RecordCount ?? 0
                                };
                                lbItem.Items.Add(nlbItem);
                            }
                        }

                        orgItem.Items.Add(lbItem);
                    }

                    statusItem.Items.Add(orgItem);
                }

                root.Items.Add(statusItem);
            }

            return root;
        }


        #endregion

        #region Member Import
        public string GetMemberImportProcessStatus()
        {
            string value;

            if (_cache.TryGetValue(_memberImportkey, out value))
            {
                return value;
            }
            return "";
        }

        public void MemberImport(IFormFile postedFile, string path, AuditColumnsModel audit)
        {
            if (postedFile != null)
            {
                IWorkbook workbook;

                using (MemoryStream stream = new MemoryStream())
                {
                    string sFileExtention = Path.GetExtension(postedFile.FileName).ToLower();
                    postedFile.CopyTo(stream);
                    stream.Position = 0;

                    if (sFileExtention == ".xls")
                    {
                        workbook = new HSSFWorkbook(stream);
                    }
                    else
                    {
                        workbook = new XSSFWorkbook(stream);
                    }

                    postedFile = null;
                }

                // Max 17
                #region Member
                List<MemberDetailsSaveModel> _memberData = new List<MemberDetailsSaveModel>();
                if (_memberData != null)
                {
                    ISheet sheet = workbook.GetSheetAt(0);
                    for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++)
                    {
                        MemberDetailsSaveModel data_item = new MemberDetailsSaveModel();

                        IRow row = sheet.GetRow(i);
                        if (row == null) continue;
                        if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;

                        data_item.Row = i;
                        data_item.Id = (row.GetCell(0) != null && row.GetCell(0).ToString() != "" ? row.GetCell(0).ToString() : "")?.Trim() ?? "";
                        data_item.Member_ID = (row.GetCell(1) != null && row.GetCell(1).ToString() != "" ? row.GetCell(1).ToString() : "")?.Trim() ?? "";
                        data_item.First_Name = (row.GetCell(2) != null && row.GetCell(2).ToString() != "" ? row.GetCell(2).ToString() : "") ?? "";
                        data_item.Last_Name = (row.GetCell(3) != null && row.GetCell(3).ToString() != "" ? row.GetCell(3).ToString() : "")?.Trim() ?? "";
                        data_item.Father_Name = (row.GetCell(4) != null && row.GetCell(4).ToString() != "" ? row.GetCell(4).ToString() : "")?.Trim() ?? "";
                        data_item.Date_Of_Birth = (row.GetCell(5) != null && row.GetCell(5).ToString() != "" ? row.GetCell(5).ToString() : "")?.Trim() ?? "";
                        data_item.Gender = (row.GetCell(6) != null && row.GetCell(6).ToString() != "" ? row.GetCell(6).ToString() : "")?.Trim() ?? "";
                        data_item.Religion = (row.GetCell(7) != null && row.GetCell(7).ToString() != "" ? row.GetCell(7).ToString() : "")?.Trim() ?? "";
                        data_item.Community = (row.GetCell(8) != null && row.GetCell(8).ToString() != "" ? row.GetCell(8).ToString() : "")?.Trim() ?? "";
                        data_item.Caste = (row.GetCell(9) != null && row.GetCell(9).ToString() != "" ? row.GetCell(9).ToString() : "")?.Trim() ?? "";
                        data_item.Marital_Status = (row.GetCell(10) != null && row.GetCell(10).ToString() != "" ? row.GetCell(10).ToString() : "")?.Trim() ?? "";
                        data_item.Aadhaar_Number = (row.GetCell(11) != null && row.GetCell(11).ToString() != "" ? row.GetCell(11).ToString() : "")?.Trim() ?? "";
                        data_item.Phone_Number = (row.GetCell(12) != null && row.GetCell(12).ToString() != "" ? row.GetCell(12).ToString() : "")?.Trim() ?? "";
                        data_item.Education = (row.GetCell(13) != null && row.GetCell(13).ToString() != "" ? row.GetCell(13).ToString() : "")?.Trim() ?? "";
                        data_item.Profile_Picture_url = (row.GetCell(14) != null && row.GetCell(14).ToString() != "" ? row.GetCell(14).ToString() : "")?.Trim() ?? "";
                        if (((row.GetCell(15) != null && row.GetCell(15).ToString() != "") ? row.GetCell(15).ToString() : "")?.Trim().ToLower() == "yes")
                        {
                            data_item.IsForceSave = true;
                        }
                        else
                        {
                            data_item.IsForceSave = false;
                        }
                        if (((row.GetCell(16) != null && row.GetCell(16).ToString() != "") ? row.GetCell(16).ToString() : "")?.Trim().ToLower() == "yes")
                        {
                            data_item.IsApprovedRecord = true;
                        }
                        else
                        {
                            data_item.IsApprovedRecord = false;
                        }
                        data_item.RoleIdForApproval = (row.GetCell(17) != null && row.GetCell(17).ToString() != "" ? row.GetCell(17).ToString() : "")?.Trim() ?? "";

                        _memberData.Add(data_item);
                    }
                }
                #endregion

                // Max 20
                #region Organization
                List<OrganizationDetailSaveModel> _organizationData = new List<OrganizationDetailSaveModel>();
                if (_organizationData != null)
                {
                    ISheet sheet = workbook.GetSheetAt(1);
                    for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++)
                    {
                        OrganizationDetailSaveModel data_item = new OrganizationDetailSaveModel();

                        IRow row = sheet.GetRow(i);
                        if (row == null) continue;
                        if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;

                        data_item.Row = i;
                        data_item.UniqueId = (row.GetCell(0) != null && row.GetCell(0).ToString() != "" ? row.GetCell(0).ToString() : "")?.Trim() ?? "";
                        data_item.Id = (row.GetCell(1) != null && row.GetCell(1).ToString() != "" ? row.GetCell(1).ToString() : "")?.Trim() ?? "";
                        data_item.Type_of_Work = (row.GetCell(2) != null && row.GetCell(2).ToString() != "" ? row.GetCell(2).ToString() : "")?.Trim() ?? "";
                        data_item.Core_Sanitary_Worker_Type = (row.GetCell(3) != null && row.GetCell(3).ToString() != "" ? row.GetCell(3).ToString() : "") ?? "";
                        data_item.Organization_Type = (row.GetCell(4) != null && row.GetCell(4).ToString() != "" ? row.GetCell(4).ToString() : "")?.Trim() ?? "";
                        data_item.District_Id = (row.GetCell(5) != null && row.GetCell(5).ToString() != "" ? row.GetCell(5).ToString() : "")?.Trim() ?? "";
                        data_item.Nature_of_Job = (row.GetCell(6) != null && row.GetCell(6).ToString() != "" ? row.GetCell(6).ToString() : "")?.Trim() ?? "";
                        data_item.Local_Body = (row.GetCell(7) != null && row.GetCell(7).ToString() != "" ? row.GetCell(7).ToString() : "")?.Trim() ?? "";
                        data_item.Name_of_Local_Body = (row.GetCell(8) != null && row.GetCell(8).ToString() != "" ? row.GetCell(8).ToString() : "")?.Trim() ?? "";
                        data_item.Zone = (row.GetCell(9) != null && row.GetCell(9).ToString() != "" ? row.GetCell(9).ToString() : "")?.Trim() ?? "";
                        data_item.Organisation_Name = (row.GetCell(10) != null && row.GetCell(10).ToString() != "" ? row.GetCell(10).ToString() : "")?.Trim() ?? "";
                        data_item.Designation = (row.GetCell(11) != null && row.GetCell(11).ToString() != "" ? row.GetCell(11).ToString() : "")?.Trim() ?? "";
                        data_item.Address = (row.GetCell(12) != null && row.GetCell(12).ToString() != "" ? row.GetCell(12).ToString() : "")?.Trim() ?? "";
                        data_item.Block = (row.GetCell(13) != null && row.GetCell(13).ToString() != "" ? row.GetCell(13).ToString() : "")?.Trim() ?? "";
                        data_item.Village_Panchayat = (row.GetCell(14) != null && row.GetCell(14).ToString() != "" ? row.GetCell(14).ToString() : "")?.Trim() ?? "";
                        data_item.Corporation = (row.GetCell(15) != null && row.GetCell(15).ToString() != "" ? row.GetCell(15).ToString() : "")?.Trim() ?? "";
                        data_item.Municipality = (row.GetCell(16) != null && row.GetCell(16).ToString() != "" ? row.GetCell(16).ToString() : "")?.Trim() ?? "";
                        data_item.Town_Panchayat = (row.GetCell(17) != null && row.GetCell(17).ToString() != "" ? row.GetCell(17).ToString() : "")?.Trim() ?? "";
                        data_item.New_Yellow_Card_Number = (row.GetCell(18) != null && row.GetCell(18).ToString() != "" ? row.GetCell(18).ToString() : "")?.Trim() ?? "";
                        data_item.Health_Id = (row.GetCell(19) != null && row.GetCell(19).ToString() != "" ? row.GetCell(19).ToString() : "")?.Trim() ?? "";
                        if (((row.GetCell(20) != null && row.GetCell(20).ToString() != "") ? row.GetCell(20).ToString() : "")?.Trim().ToLower() == "yes")
                        {
                            data_item.Already_a_Member_of_CWWB = true;
                        }
                        else
                        {
                            data_item.Already_a_Member_of_CWWB = false;
                        }

                        _organizationData.Add(data_item);
                    }
                }
                #endregion

                // Max 20
                #region Family Member
                List<FamilyMemberSaveModel> _familyMembersData = new List<FamilyMemberSaveModel>();
                if (_familyMembersData != null)
                {
                    ISheet sheet = workbook.GetSheetAt(2);
                    for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++)
                    {
                        FamilyMemberSaveModel data_item = new FamilyMemberSaveModel();

                        IRow row = sheet.GetRow(i);
                        if (row == null) continue;
                        if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;

                        data_item.Row = i;
                        data_item.UniqueId = (row.GetCell(0) != null && row.GetCell(0).ToString() != "" ? row.GetCell(0).ToString() : "")?.Trim() ?? "";
                        data_item.Id = (row.GetCell(1) != null && row.GetCell(1).ToString() != "" ? row.GetCell(1).ToString() : "")?.Trim() ?? "";
                        data_item.name = (row.GetCell(2) != null && row.GetCell(2).ToString() != "" ? row.GetCell(2).ToString() : "")?.Trim() ?? "";
                        data_item.phone_number = (row.GetCell(3) != null && row.GetCell(3).ToString() != "" ? row.GetCell(3).ToString() : "") ?? "";
                        data_item.relation = (row.GetCell(4) != null && row.GetCell(4).ToString() != "" ? row.GetCell(4).ToString() : "")?.Trim() ?? "";
                        data_item.sex = (row.GetCell(5) != null && row.GetCell(5).ToString() != "" ? row.GetCell(5).ToString() : "")?.Trim() ?? "";
                        data_item.date_of_birth = (row.GetCell(6) != null && row.GetCell(6).ToString() != "" ? row.GetCell(6).ToString() : "")?.Trim() ?? "";
                        data_item.age = (row.GetCell(7) != null && row.GetCell(7).ToString() != "" ? row.GetCell(7).ToString() : "")?.Trim() ?? "";
                        data_item.education = (row.GetCell(8) != null && row.GetCell(8).ToString() != "" ? row.GetCell(8).ToString() : "")?.Trim() ?? "";
                        data_item.Standard = (row.GetCell(9) != null && row.GetCell(9).ToString() != "" ? row.GetCell(9).ToString() : "")?.Trim() ?? "";
                        data_item.School_Status = (row.GetCell(10) != null && row.GetCell(10).ToString() != "" ? row.GetCell(10).ToString() : "")?.Trim() ?? "";
                        data_item.EMIS_No = (row.GetCell(11) != null && row.GetCell(11).ToString() != "" ? row.GetCell(11).ToString() : "")?.Trim() ?? "";
                        data_item.School_Address = (row.GetCell(12) != null && row.GetCell(12).ToString() != "" ? row.GetCell(12).ToString() : "")?.Trim() ?? "";
                        data_item.Course = (row.GetCell(13) != null && row.GetCell(13).ToString() != "" ? row.GetCell(13).ToString() : "")?.Trim() ?? "";
                        data_item.Degree_Name = (row.GetCell(14) != null && row.GetCell(14).ToString() != "" ? row.GetCell(14).ToString() : "")?.Trim() ?? "";
                        data_item.College_Status = (row.GetCell(15) != null && row.GetCell(15).ToString() != "" ? row.GetCell(15).ToString() : "")?.Trim() ?? "";
                        data_item.Year = (row.GetCell(16) != null && row.GetCell(16).ToString() != "" ? row.GetCell(16).ToString() : "")?.Trim() ?? "";
                        data_item.Year_Of_Completion = (row.GetCell(17) != null && row.GetCell(17).ToString() != "" ? row.GetCell(17).ToString() : "")?.Trim() ?? "";
                        data_item.College_Address = (row.GetCell(18) != null && row.GetCell(18).ToString() != "" ? row.GetCell(18).ToString() : "")?.Trim() ?? "";
                        data_item.occupation = (row.GetCell(19) != null && row.GetCell(19).ToString() != "" ? row.GetCell(19).ToString() : "")?.Trim() ?? "";
                        data_item.disability = (row.GetCell(20) != null && row.GetCell(20).ToString() != "" ? row.GetCell(20).ToString() : "")?.Trim() ?? "";

                        _familyMembersData.Add(data_item);
                    }
                }
                #endregion

                // Max 15
                #region Address
                List<ApplicationAddressMaster> _addressData = new List<ApplicationAddressMaster>();
                if (_addressData != null)
                {
                    ISheet sheet = workbook.GetSheetAt(3);
                    for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++)
                    {
                        ApplicationAddressMaster data_item = new ApplicationAddressMaster();

                        IRow row = sheet.GetRow(i);
                        if (row == null) continue;
                        if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;

                        data_item.Row = i;
                        data_item.UniqueId = (row.GetCell(0) != null && row.GetCell(0).ToString() != "" ? row.GetCell(0).ToString() : "")?.Trim() ?? "";
                        data_item.Id = (row.GetCell(1) != null && row.GetCell(1).ToString() != "" ? row.GetCell(1).ToString() : "")?.Trim() ?? "";
                        data_item.AddressType = (row.GetCell(2) != null && row.GetCell(2).ToString() != "" ? row.GetCell(2).ToString() : "")?.Trim() ?? "";
                        data_item.DoorNo = (row.GetCell(3) != null && row.GetCell(3).ToString() != "" ? row.GetCell(3).ToString() : "") ?? "";
                        data_item.StreetName = (row.GetCell(4) != null && row.GetCell(4).ToString() != "" ? row.GetCell(4).ToString() : "")?.Trim() ?? "";
                        data_item.VilllageTownCity = (row.GetCell(5) != null && row.GetCell(5).ToString() != "" ? row.GetCell(5).ToString() : "")?.Trim() ?? "";
                        data_item.LocalBody = (row.GetCell(6) != null && row.GetCell(6).ToString() != "" ? row.GetCell(6).ToString() : "")?.Trim() ?? "";
                        data_item.NameoflocalBody = (row.GetCell(7) != null && row.GetCell(7).ToString() != "" ? row.GetCell(7).ToString() : "")?.Trim() ?? "";
                        data_item.District = (row.GetCell(8) != null && row.GetCell(8).ToString() != "" ? row.GetCell(8).ToString() : "")?.Trim() ?? "";
                        data_item.Taluk = (row.GetCell(9) != null && row.GetCell(9).ToString() != "" ? row.GetCell(9).ToString() : "")?.Trim() ?? "";
                        data_item.Block = (row.GetCell(10) != null && row.GetCell(10).ToString() != "" ? row.GetCell(10).ToString() : "")?.Trim() ?? "";
                        data_item.Corporation = (row.GetCell(11) != null && row.GetCell(11).ToString() != "" ? row.GetCell(11).ToString() : "")?.Trim() ?? "";
                        data_item.Municipality = (row.GetCell(12) != null && row.GetCell(12).ToString() != "" ? row.GetCell(12).ToString() : "")?.Trim() ?? "";
                        data_item.TownPanchayat = (row.GetCell(13) != null && row.GetCell(13).ToString() != "" ? row.GetCell(13).ToString() : "")?.Trim() ?? "";
                        data_item.Area = (row.GetCell(14) != null && row.GetCell(14).ToString() != "" ? row.GetCell(14).ToString() : "")?.Trim() ?? "";
                        data_item.Pincode = (row.GetCell(15) != null && row.GetCell(15).ToString() != "" ? row.GetCell(15).ToString() : "")?.Trim() ?? "";

                        _addressData.Add(data_item);
                    }
                }
                #endregion

                // Max 04
                #region Bank
                List<BankDetailSaveModel> _bankData = new List<BankDetailSaveModel>();
                if (_bankData != null)
                {
                    ISheet sheet = workbook.GetSheetAt(4);
                    for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++)
                    {
                        BankDetailSaveModel data_item = new BankDetailSaveModel();

                        IRow row = sheet.GetRow(i);
                        if (row == null) continue;
                        if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;

                        data_item.Row = i;
                        data_item.UniqueId = (row.GetCell(0) != null && row.GetCell(0).ToString() != "" ? row.GetCell(0).ToString() : "")?.Trim() ?? "";
                        data_item.Id = (row.GetCell(1) != null && row.GetCell(1).ToString() != "" ? row.GetCell(1).ToString() : "")?.Trim() ?? "";
                        data_item.Account_Holder_Name = (row.GetCell(2) != null && row.GetCell(2).ToString() != "" ? row.GetCell(2).ToString() : "")?.Trim() ?? "";
                        data_item.Account_Number = (row.GetCell(3) != null && row.GetCell(3).ToString() != "" ? row.GetCell(3).ToString() : "") ?? "";
                        data_item.IFSC_Code = (row.GetCell(4) != null && row.GetCell(4).ToString() != "" ? row.GetCell(4).ToString() : "")?.Trim() ?? "";

                        _bankData.Add(data_item);
                    }
                }
                #endregion

                // Max 04
                #region Document
                List<MemberDocumentSaveMaster> _memberDocumentData = new List<MemberDocumentSaveMaster>();
                if (_memberDocumentData != null)
                {
                    ISheet sheet = workbook.GetSheetAt(5);
                    for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++)
                    {
                        MemberDocumentSaveMaster data_item = new MemberDocumentSaveMaster();

                        IRow row = sheet.GetRow(i);
                        if (row == null) continue;
                        if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;

                        data_item.Row = i;
                        data_item.UniqueId = (row.GetCell(0) != null && row.GetCell(0).ToString() != "" ? row.GetCell(0).ToString() : "")?.Trim() ?? "";
                        data_item.Id = (row.GetCell(1) != null && row.GetCell(1).ToString() != "" ? row.GetCell(1).ToString() : "")?.Trim() ?? "";
                        data_item.DocumentCategoryId = (row.GetCell(2) != null && row.GetCell(2).ToString() != "" ? row.GetCell(2).ToString() : "")?.Trim() ?? "";
                        data_item.AcceptedDocumentTypeId = (row.GetCell(3) != null && row.GetCell(3).ToString() != "" ? row.GetCell(3).ToString() : "") ?? "";
                        data_item.DocUrl = (row.GetCell(4) != null && row.GetCell(4).ToString() != "" ? row.GetCell(4).ToString() : "")?.Trim() ?? "";

                        _memberDocumentData.Add(data_item);
                    }
                }
                #endregion

                MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions();
                cacheEntryOptions.SlidingExpiration = TimeSpan.FromMinutes(600);
                cacheEntryOptions.Priority = CacheItemPriority.Normal;

                _cache.Remove(_memberImportkey);
                _cache.Set(_memberImportkey, "Running", cacheEntryOptions);

                _backgroundTaskQueue.QueueBackgroundWorkItem(workItem: token =>
                {
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        try
                        {
                            if (_memberData != null && _organizationData != null && _familyMembersData != null && _addressData != null && _bankData != null && _memberDocumentData != null)
                            {
                                List<ConfigurationModel> _configurations = _settingsDAL.Configuration_Get(IsActive: true);
                                List<MemberExistGeneralInfo> _exist_member = _memberDAL.Application_Get_All_Member_Id_By_Member_Code();
                                
                                _memberData.ForEach(member =>
                                {
                                    member.ExistMember = _exist_member.Where(x => x.Member_Id == member.Member_ID || x.Phone_Number == member.Phone_Number).FirstOrDefault();

                                    #region Validation

                                    if (member.IsApprovedRecord)
                                    {
                                        if (IsMemberRecordValid(member, ref _configurations))
                                        {
                                            List<string> errorList = new List<string>();

                                            OrganizationDetailSaveModel? _org = _organizationData.Where(x => x.Id == member.Id).OrderBy(o => Convert.ToInt32(o.Id)).FirstOrDefault();
                                            if (_org == null)
                                            {
                                                errorList.Add("Organization record is required");
                                                member.IsValid = false;
                                            }
                                            else if (IsOrganizationRecordValid(_org, ref _configurations))
                                            {
                                                bool IsPrimaryAddressExist = false;

                                                List<ApplicationAddressMaster> _addressList = _addressData.Where(x => x.Id == member.Id).ToList();
                                                if (_addressList != null && _addressList.Count > 0)
                                                {
                                                    _addressList.ForEach(item =>
                                                    {
                                                        if (IsAddressRecordValid(item, ref _configurations))
                                                        {
                                                            if (item.AddressType.Trim().ToUpper() == "PERMANENT")
                                                            {
                                                                IsPrimaryAddressExist = true;
                                                            }
                                                        }
                                                        else
                                                        {
                                                            errorList.Add("Address: " + item.Error);
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    errorList.Add("Address required");
                                                    member.IsValid = false;
                                                }

                                                if (IsPrimaryAddressExist == false)
                                                {
                                                    errorList.Add("Permanent address required");
                                                    member.IsValid = false;
                                                }

                                                if (_bankData.Where(x => x.Id == member.Id).Count() == 0)
                                                {
                                                    errorList.Add("Bank account details required");
                                                    member.IsValid = false;
                                                }

                                                _memberDocumentData.Where(k => k.Id == member.Id)?.ToList()?.ForEach(x =>
                                                {
                                                    if (IsDocumentRecordValid(x, ref _configurations) == false)
                                                    {
                                                        if (workbook.GetSheetAt(5).GetRow(x.Row).GetCell(5) == null)
                                                        {
                                                            workbook.GetSheetAt(5).GetRow(x.Row).CreateCell(5).SetCellValue(x.Error);
                                                        }
                                                        else
                                                        {
                                                            workbook.GetSheetAt(5).GetRow(x.Row).GetCell(5).SetCellValue(x.Error);
                                                        }

                                                        member.IsValid = false;
                                                    }
                                                    else
                                                    {
                                                        errorList.Add("Document: " + x.Error);
                                                    }
                                                });

                                                _bankData.Where(k => k.Id == member.Id)?.ToList()?.ForEach(x =>
                                                {
                                                    if (IsBankRecordValid(x, ref _configurations) == false)
                                                    {
                                                        if (workbook.GetSheetAt(4).GetRow(x.Row).GetCell(5) == null)
                                                        {
                                                            workbook.GetSheetAt(4).GetRow(x.Row).CreateCell(5).SetCellValue(x.Error);
                                                        }
                                                        else
                                                        {
                                                            workbook.GetSheetAt(4).GetRow(x.Row).GetCell(5).SetCellValue(x.Error);
                                                        }

                                                        member.IsValid = false;
                                                    }
                                                    else
                                                    {
                                                        errorList.Add("Bank: " + x.Error);
                                                    }
                                                });

                                                _familyMembersData.Where(k => k.Id == member.Id)?.ToList()?.ForEach(x =>
                                                {
                                                    if (IsFamilyRecordValid(x, ref _configurations) == false)
                                                    {
                                                        if (workbook.GetSheetAt(2).GetRow(x.Row).GetCell(21) == null)
                                                        {
                                                            workbook.GetSheetAt(2).GetRow(x.Row).CreateCell(21).SetCellValue(x.Error);
                                                        }
                                                        else
                                                        {
                                                            workbook.GetSheetAt(2).GetRow(x.Row).GetCell(21).SetCellValue(x.Error);
                                                        }

                                                        member.IsValid = false;
                                                    }
                                                    else
                                                    {
                                                        errorList.Add("Family: " + x.Error);
                                                    }
                                                });

                                                if (member.ExistMember != null && member.ExistMember.IsApproved && member.IsForceSave == false)
                                                {
                                                    member.ErrorList.Add("Member Exist");
                                                    member.IsValid = false;
                                                }
                                            }
                                            else
                                            {
                                                errorList.Add("Org: " + _org.Error);

                                                if (workbook.GetSheetAt(1).GetRow(member.Row).GetCell(21) == null)
                                                {
                                                    workbook.GetSheetAt(1).GetRow(member.Row).CreateCell(21).SetCellValue(_org.Error);
                                                }
                                                else
                                                {
                                                    workbook.GetSheetAt(1).GetRow(member.Row).GetCell(21).SetCellValue(_org.Error);
                                                }

                                                member.IsValid = false;
                                            }

                                            if (errorList.Count > 0)
                                            {
                                                if (member.ErrorList == null)
                                                {
                                                    member.ErrorList = new List<string>();
                                                }

                                                member.ErrorList.AddRange(errorList);

                                                if (workbook.GetSheetAt(0).GetRow(member.Row).GetCell(18) == null)
                                                {
                                                    workbook.GetSheetAt(0).GetRow(member.Row).CreateCell(18).SetCellValue(string.Join(", ", member.ErrorList));
                                                }
                                                else
                                                {
                                                    workbook.GetSheetAt(0).GetRow(member.Row).GetCell(18).SetCellValue(string.Join(", ", member.ErrorList));
                                                }

                                                member.IsValid = false;
                                            }
                                        }
                                        else
                                        {
                                            if (workbook.GetSheetAt(0).GetRow(member.Row).GetCell(18) == null)
                                            {
                                                workbook.GetSheetAt(0).GetRow(member.Row).CreateCell(18).SetCellValue(member.Error);
                                            }
                                            else
                                            {
                                                workbook.GetSheetAt(0).GetRow(member.Row).GetCell(18).SetCellValue(member.Error);
                                            }

                                            member.IsValid = false;
                                        }
                                    }
                                    else
                                    {
                                        bool IsValid = true;
                                        List<string> errors = new List<string>();

                                        if (string.IsNullOrWhiteSpace(member.Id.Trim()))
                                        {
                                            IsValid = false;
                                            errors.Add("Id required");
                                        }
                                        if (string.IsNullOrWhiteSpace(member.First_Name.Trim()))
                                        {
                                            IsValid = false;
                                            errors.Add("First name required");
                                        }
                                        if (!string.IsNullOrWhiteSpace(member.Aadhaar_Number.Trim()))
                                        {
                                            if (member.Aadhaar_Number.Trim().Length != 12)
                                            {
                                                IsValid = false;
                                                errors.Add("Aadhar shlould be 12 digit");
                                            }
                                        }
                                        else
                                        {
                                            errors.Add("Aadhar required");
                                            IsValid = false;
                                        }
                                        if (!string.IsNullOrWhiteSpace(member.Phone_Number.Trim()))
                                        {
                                            if (member.Phone_Number.Trim().Length != 10)
                                            {
                                                IsValid = false;
                                                errors.Add("Phone shlould be 10 digit");
                                            }
                                        }
                                        else
                                        {
                                            errors.Add("Phone required");
                                            IsValid = false;
                                        }

                                        ApplicationAddressMaster? _address = _addressData.Where(x => x.Id == member.Id && x.AddressType == "PERMANENT").FirstOrDefault();
                                        if (_address != null)
                                        {
                                            if (string.IsNullOrWhiteSpace(_address.UniqueId.Trim()))
                                            {
                                                IsValid = false;
                                                errors.Add("Address: Id required");
                                            }
                                            if (string.IsNullOrWhiteSpace(_address.Id.Trim()))
                                            {
                                                IsValid = false;
                                                errors.Add("Address: Member sheet Id required");
                                            }

                                            errors.Add(ConfigValidation(_address.District, "Address District", ref _configurations, ref IsValid));
                                        }
                                        else
                                        {
                                            errors.Add("Permanent address required");
                                            IsValid = false;
                                        }

                                        if (member.ExistMember != null && member.ExistMember.IsApproved && member.IsForceSave == false)
                                        {
                                            errors.Add("Member Exist");
                                            IsValid = false;
                                        }

                                        errors = errors.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
                                        member.Error = string.Join(", ", errors);
                                        member.ErrorList = errors;
                                        member.IsValid = IsValid;


                                        if (IsValid == false)
                                        {
                                            if (workbook.GetSheetAt(0).GetRow(member.Row).GetCell(18) == null)
                                            {
                                                workbook.GetSheetAt(0).GetRow(member.Row).CreateCell(18).SetCellValue(string.Join(',', errors));
                                            }
                                            else
                                            {
                                                workbook.GetSheetAt(0).GetRow(member.Row).GetCell(18).SetCellValue(string.Join(',', errors));
                                            }
                                        }
                                    }

                                    #endregion Validation

                                });

                                _configurations.Clear();
                                _exist_member.Clear();

                                List<ConfigurationBranchAddressModel> bank_details = _settingsDAL.Config_Branch_Address_Get("");
                                int count = 0;
                                int validCount = _memberData.Where(member1 => member1.IsValid && member1.ExistMember == null).Count();

                                _memberData.Where(member1 => member1.IsValid && member1.ExistMember == null).OrderBy(o => o.Id).ToList().ForEach(async member =>
                                {
                                    count++;

                                    OrganizationDetailSaveModel orgData = _organizationData.Where(x => x.Id == member.Id).OrderBy(o => Convert.ToInt32(o.Id)).First();
                                    List<ApplicationAddressMaster> _addressList = _addressData.Where(x => x.Id == member.Id).ToList();
                                    List<FamilyMemberSaveModel> _familyMembers = _familyMembersData.Where(x => x.Id == member.Id).ToList();
                                    List<BankDetailSaveModel> _bank = _bankData.Where(x => x.Id == member.Id).ToList();
                                    List<MemberDocumentSaveMaster> _Document = _memberDocumentData.Where(x => x.Id == member.Id).ToList();



                                    // Database insert 
                                    if (true)
                                    {
                                        string res = await ProcessMemberAsync(_memberDAL, member, orgData, _familyMembers, _addressList, _bank, _Document, audit);
                                        if (string.IsNullOrEmpty(res))
                                        {
                                            if (workbook.GetSheetAt(0).GetRow(member.Row).GetCell(18) == null)
                                            {
                                                workbook.GetSheetAt(0).GetRow(member.Row).CreateCell(18).SetCellValue("SUCCESS");
                                            }
                                            else
                                            {
                                                workbook.GetSheetAt(0).GetRow(member.Row).GetCell(18).SetCellValue("SUCCESS");
                                            }
                                        }
                                    }

                                    // Generate query
                                    if (false)
                                    {
                                        if (orgData != null && _addressList.Count > 0)
                                        {
                                            member.Id = Guid.NewGuid().ToString();
                                            string memberQuery = GetMemberInsertQuery(member, audit);

                                            if (workbook.GetSheetAt(0).GetRow(member.Row).GetCell(20) == null)
                                            {
                                                workbook.GetSheetAt(0).GetRow(member.Row).CreateCell(20).SetCellValue(memberQuery);
                                            }
                                            else
                                            {
                                                workbook.GetSheetAt(0).GetRow(member.Row).GetCell(20).SetCellValue(memberQuery);
                                            }

                                            if (!string.IsNullOrWhiteSpace(member.RoleIdForApproval) && member.IsApprovedRecord)
                                            {
                                                MemberDataApprovalMaster approval_request = new MemberDataApprovalMaster();
                                                approval_request.Approval_For = member.RoleIdForApproval;
                                                approval_request.Member_Id = member.Id;
                                                approval_request.IsCompleted = false;
                                                approval_request.IsActive = true;
                                                approval_request.Id = Guid.NewGuid().ToString();
                                                approval_request.Changed_Detail_Record = MemberInformationKey.MEMBER_WHOLE_DATA;
                                                approval_request.Changed_Date = DateOnly.FromDateTime(DateTimeFunctions.GetIST());
                                                approval_request.Changed_Time = TimeOnly.FromDateTime(DateTimeFunctions.GetIST());
                                                approval_request.Status = MemberDetailApprovalStatus.WAITING_FOR_APPROVAL;

                                                string approvalRequestQuery = GetMemberApprovalRequestQuery(approval_request, audit);

                                                if (workbook.GetSheetAt(0).GetRow(member.Row).GetCell(21) == null)
                                                {
                                                    workbook.GetSheetAt(0).GetRow(member.Row).CreateCell(21).SetCellValue(approvalRequestQuery);
                                                }
                                                else
                                                {
                                                    workbook.GetSheetAt(0).GetRow(member.Row).GetCell(21).SetCellValue(approvalRequestQuery);
                                                }
                                            }

                                            orgData.Member_Id = member.Id;
                                            string orgQuery = GetOrganizationInsertQuery(orgData, audit);

                                            if (workbook.GetSheetAt(1).GetRow(orgData.Row).GetCell(23) == null)
                                            {
                                                workbook.GetSheetAt(1).GetRow(orgData.Row).CreateCell(23).SetCellValue(orgQuery);
                                            }
                                            else
                                            {
                                                workbook.GetSheetAt(1).GetRow(orgData.Row).GetCell(23).SetCellValue(orgQuery);
                                            }

                                            _addressList.ForEach(x =>
                                            {
                                                x.MemberId = member.Id;

                                                string addressQuery = GetAddressQuery(x, audit);

                                                if (workbook.GetSheetAt(3).GetRow(x.Row).GetCell(18) == null)
                                                {
                                                    workbook.GetSheetAt(3).GetRow(x.Row).CreateCell(18).SetCellValue(addressQuery);
                                                }
                                                else
                                                {
                                                    workbook.GetSheetAt(3).GetRow(x.Row).GetCell(18).SetCellValue(addressQuery);
                                                }
                                            });

                                            _familyMembers.ForEach(x =>
                                            {
                                                x.Member_Id = member.Id;

                                                string familyQuery = GetFamilyMemberQuery(x, audit);

                                                if (workbook.GetSheetAt(2).GetRow(x.Row).GetCell(23) == null)
                                                {
                                                    workbook.GetSheetAt(2).GetRow(x.Row).CreateCell(23).SetCellValue(familyQuery);
                                                }
                                                else
                                                {
                                                    workbook.GetSheetAt(2).GetRow(x.Row).GetCell(23).SetCellValue(familyQuery);
                                                }
                                            });

                                            _bank.ForEach(x =>
                                            {
                                                x.Member_Id = member.Id;

                                                ConfigurationBranchAddressModel? bankadd = bank_details.Where(b => b.IFSCCode == x.IFSC_Code).FirstOrDefault();
                                                if (bankadd != null)
                                                {
                                                    x.Bank_Name = bankadd.BankName;
                                                    x.Branch = bankadd.BranchName;
                                                    x.Bank_Id = bankadd.BankId;
                                                    x.Branch_Id = bankadd.BranchId;
                                                }

                                                x.Account_Holder_Name = (member.First_Name + " " + member.Last_Name).Trim();

                                                string bankQuery = GetBankDetailQuery(x, audit);

                                                if (workbook.GetSheetAt(4).GetRow(x.Row).GetCell(7) == null)
                                                {
                                                    workbook.GetSheetAt(4).GetRow(x.Row).CreateCell(7).SetCellValue(bankQuery);
                                                }
                                                else
                                                {
                                                    workbook.GetSheetAt(4).GetRow(x.Row).GetCell(7).SetCellValue(bankQuery);
                                                }
                                            });

                                            _Document.ForEach(x =>
                                            {
                                                x.Member_Id = member.Id;

                                                string documentQuery = GetMemberDocumentQuery(x, audit);

                                                if (workbook.GetSheetAt(5).GetRow(x.Row).GetCell(7) == null)
                                                {
                                                    workbook.GetSheetAt(5).GetRow(x.Row).CreateCell(7).SetCellValue(documentQuery);
                                                }
                                                else
                                                {
                                                    workbook.GetSheetAt(5).GetRow(x.Row).GetCell(7).SetCellValue(documentQuery);
                                                }
                                            });
                                        }
                                    }

                                });

                                if (count == _memberData.Count)
                                {

                                }

                                string fullPath = Path.Combine(path, "MemberBulkLoadErrorSheet.xlsx");

                                if (File.Exists(fullPath))
                                {
                                    File.Delete(fullPath);
                                }
                                using (var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
                                {
                                    workbook.Write(fs);
                                }
                            }

                            _cache.Set(_memberImportkey, "Completed", cacheEntryOptions);
                        }
                        catch (Exception ex)
                        {
                            _cache.Set(_memberImportkey, "Error", cacheEntryOptions);
                            throw;
                        }
                    }

                    return Task.CompletedTask;
                });
            }
        }

        #region Query functions

        public string GetMemberApprovalRequestQuery(MemberDataApprovalMaster model, AuditColumnsModel audit)
        {
            string Query = $@"Insert Into Member_Data_Approval_Master
				(Id,Member_Id,Changed_Detail_Record,Changed_Date,Changed_Time,Status,ApprovedBy,ApprovedOn,
                Approval_For, IsCompleted, IsActive, CreatedBy, CreatedByUserName, CreatedDate, Modifiedby, ModifiedByUserName, ModifiedDate)
				Values
				(UUID(),'{model.Member_Id}','{model.Changed_Detail_Record}','{model.Changed_Date.ToString("yyyy-MM-dd")}','{model.Changed_Date.ToString("HH:mm:ss")}','{model.Status}',null,null,
                '{model.Approval_For}', 0, 1, 
                '{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd HH:mm:ss")}', 
                '{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd HH:mm:ss")}');";

            return Query;
        }

        public string GetMemberInsertQuery(MemberDetailsSaveModel model, AuditColumnsModel audit)
        {
            string Query = $@"INSERT INTO member_master (Id, First_Name, Last_Name, Father_Name, Date_Of_Birth, Gender, Community,
			                    Marital_Status, Aadhaar_Number, Phone_Number, Education, IsActive,CreatedBy, CreatedByUserName, CreatedDate,
			                    Modifiedby, ModifiedByUserName, ModifiedDate,Member_Id, member_json,Ration_Card_Number,Email,Religion,Caste, 
                                IsPermanentAddressSameAsTemporaryAddress, IsTemp, IsSubmitted, IsNewMember, ProfileUrl
		                    )VALUES (
			                    '{model.Id}', '{model.First_Name}', '{model.Last_Name}', '{model.Father_Name}', '{model.Date_Of_Birth}', '{model.Gender}', '{model.Community}',
			                    '{model.Marital_Status}', '{model.Aadhaar_Number}', '{model.Phone_Number}', '{model.Education}', 1,
			                    '{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd HH:mm:ss")}',
			                    '{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd HH:mm:ss")}',
			                    '{model.Member_ID}', null, '{model.Ration_Card_Number}', '{model.Email}','{model.Religion}','{model.Caste}',
                                0, 0, 1, 1, '{model.Profile_Picture_url}'
		                    );";

            return Query;
        }
        public string GetOrganizationInsertQuery(OrganizationDetailSaveModel model, AuditColumnsModel audit)
        {
            string Query = $@"INSERT INTO member_organization (Id, Member_Id, Type_of_Work, Core_Sanitary_Worker_Type, Organization_Type,
            District_Id, Nature_of_Job, Local_Body, 
            Name_of_Local_Body, Zone, Organisation_Name, Designation, Address, Block,
			Village_Panchayat, Corporation, Municipality, Town_Panchayat, New_Yellow_Card_Number, Health_Id, Already_a_Member_of_CWWB,
			IsActive, ModifiedBy, ModifiedByUserName, ModifiedDate, CreatedBy, CreatedByUserName, CreatedDate, IsTemp
			) VALUES (UUID(), '{model.Member_Id}', '{model.Type_of_Work}', '{model.Core_Sanitary_Worker_Type}', '{model.Organisation_Name}', 
            '{model.District_Id}', '{model.Nature_of_Job}', '{model.Local_Body}',
			'{model.Name_of_Local_Body}', '{model.Zone}', '{model.Organisation_Name}', '{model.Designation}', '{model.Address}', '{model.Block}', 
            '{model.Village_Panchayat}', '{model.Corporation}', '{model.Municipality}', '{model.Town_Panchayat}', '{model.New_Yellow_Card_Number}', '{model.Health_Id}', {(model.Already_a_Member_of_CWWB ? 1 : 0)}, 
            1, '{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd")}',
			'{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd")}', 0);";

            return Query;
        }
        public string GetFamilyMemberQuery(FamilyMemberSaveModel model, AuditColumnsModel audit)
        {
            string Query = $@"INSERT INTO member_family_member (Id, Member_Id, f_id, name, phone_number,
			relation, sex, age, education, Standard, School_Status, EMIS_No, School_Address, Course,
			Degree_Name, College_Status, Year, Year_Of_Completion, College_Address, occupation, disability, AadharNumber,
            date_of_birth,
			IsActive, ModifiedBy, ModifiedByUserName, ModifiedDate, CreatedBy, CreatedByUserName, CreatedDate,IsTemp
			) VALUES (UUID(),'{model.Member_Id}',
			'{model.f_id}', '{model.name}', '{model.phone_number}',
			'{model.relation}', '{model.sex}', '{model.age}', '{model.education}', '{model.Standard}', '{model.School_Status}', '{model.EMIS_No}', '{model.School_Address}', '{model.Course}',
			'{model.Degree_Name}', '{model.College_Status}', '{model.Year}', '{model.Year_Of_Completion}', '{model.College_Address}', '{model.occupation}', '{model.disability}', '{model.AadharNumber}',
            '{model.date_of_birth}',
            1, '{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd")}',
			'{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd")}', 0);";

            return Query;
        }
        public string GetAddressQuery(ApplicationAddressMaster model, AuditColumnsModel audit)
        {
            string Query = $@"INSERT INTO member_address_master(Id, MemberId, AddressType, DoorNo, StreetName, VilllageTownCity,LocalBody,NameoflocalBody,District,
			Taluk,Block,Corporation,Municipality,TownPanchayat,Pincode,IsActive,Area,
			CreatedBy,CreatedByUserName,CreatedDate,IsTemp)
			VALUES(UUID(), '{model.MemberId}', '{model.AddressType}', '{model.DoorNo}', '{model.StreetName}', 
			'{model.VilllageTownCity}','{model.LocalBody}','{model.NameoflocalBody}','{model.District}',
			'{model.Taluk}','{model.Block}','{model.Corporation}','{model.Municipality}','{model.TownPanchayat}','{model.Pincode}',1,'{model.Area}',
            '{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd")}',0);";

            return Query;
        }
        public string GetBankDetailQuery(BankDetailSaveModel model, AuditColumnsModel audit)
        {
            string Query = $@"INSERT INTO member_bank_detail(Id,Member_Id,Account_Holder_Name,Account_Number,IFSC_Code,Bank_Name,Bank_Id,Branch,Branch_Id,
			IsActive,ModifiedBy,ModifiedByUserName,ModifiedDate,CreatedBy,CreatedByUserName,CreatedDate,IsTemp)
			VALUES
			(UUID(),'{model.Member_Id}','{model.Account_Holder_Name}','{model.Account_Number}',
            '{model.IFSC_Code}','{model.Bank_Name}','{model.Bank_Id}','{model.Branch}','{model.Branch_Id}',1,
			'{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd")}',
			'{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd")}',0);";

            return Query;
        }
        public string GetMemberDocumentQuery(MemberDocumentSaveMaster model, AuditColumnsModel audit)
        {
            string Query = $@" INSERT INTO member_documents_master (Id, Member_Id, DocumentCategoryId, AcceptedDocumentTypeId, OriginalFileName, SavedFileName, FileUrl,
			IsActive, IsTemp, ModifiedBy, ModifiedByUserName, ModifiedDate, CreatedBy, CreatedByUserName, CreatedDate
			) VALUES (UUID(), '{model.Member_Id}', '{model.DocumentCategoryId}', '{model.AcceptedDocumentTypeId}', NULL, NULL, '{model.DocUrl}', 1, 0, 
            '{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd")}',
            '{audit.SavedBy}', '{audit.SavedByUserName}', '{audit.SavedDate.ToString("yyyy-MM-dd")}'
			);";

            return Query;
        }

        #endregion Query functions


        private async Task<string> ProcessMemberAsync(MemberDAL _dal, MemberDetailsSaveModel member, OrganizationDetailSaveModel orgData, List<FamilyMemberSaveModel> _familyMembers,
            List<ApplicationAddressMaster> _addressList, List<BankDetailSaveModel> _bank, List<MemberDocumentSaveMaster> _Document, AuditColumnsModel audit)
        {
            string memberUnique = member.Id;
            bool IsSubmitted = true;

            if (member.ExistMember != null)
            {
                member.Id = member.ExistMember.Id;
            }
            else
            {
                member.Id = Guid.NewGuid().ToString();
            }

            if (member.IsApprovedRecord == false)
            {
                IsSubmitted = false;
            }

            member.IsActive = true;
            member.IsTemp = false;


            member.Id = _memberDAL.Application_Detail_Member_SaveUpdate(member, audit, IsSubmitted, false);

            if (!string.IsNullOrWhiteSpace(member.Member_ID) && member.IsApprovedRecord)
            {
                if (int.TryParse(StringFunctions.GetLastCodeSegment(member.Member_ID), out int number))
                {
                    _memberDAL.UpdateMemberCodeRunningNumber(member.Id, number);
                }
            }

            if (!string.IsNullOrWhiteSpace(member.Profile_Picture_url))
            {
                string Profile_Picture_saved_name = await UploadFileToFTPAsync(member.Profile_Picture_url);

                if (!string.IsNullOrWhiteSpace(Profile_Picture_saved_name))
                {
                    FileMasterModel fileMasterModel = new FileMasterModel();
                    if (string.IsNullOrWhiteSpace(fileMasterModel.Id))
                    {
                        fileMasterModel.Id = Guid.NewGuid().ToString();
                    }
                    fileMasterModel.TypeId = member.Id;
                    fileMasterModel.Type = FileUploadTypeCode.MemberProfile;
                    fileMasterModel.TypeName = FileUploadTypeCode.MemberProfile;
                    fileMasterModel.FileType = Path.GetExtension(Profile_Picture_saved_name);
                    fileMasterModel.OriginalFileName = Path.GetFileName(WebUtility.UrlDecode(new Uri(member.Profile_Picture_url).LocalPath));
                    fileMasterModel.SavedFileName = Profile_Picture_saved_name;
                    fileMasterModel.IsActive = true;
                    fileMasterModel.SavedBy = audit.SavedBy;
                    fileMasterModel.SavedByUserName = audit.SavedByUserName;
                    fileMasterModel.SavedDate = DateTime.Now;

                    string res = _generalDAL.FileMaster_SaveUpdate(fileMasterModel);
                }
            }

            // Organization
            orgData.Member_Id = member.Id;
            orgData.IsActive = true;
            orgData.IsTemp = false;
            orgData.Id = Guid.NewGuid().ToString();
            _memberDAL.Application_Detail_Organization_SaveUpdate(orgData, audit);

            // Address
            _addressList.ForEach(address =>
            {
                address.MemberId = member.Id;
                address.IsActive = true;
                address.IsTemp = false;
                address.Id = Guid.NewGuid().ToString();
                _memberDAL.Member_Address_Master_SaveUpdate(address, audit);
            });

            //Family
            if (_familyMembers != null && _familyMembers.Count > 0)
            {
                //_memberDAL.Family_Member_Delete_By_MemberId(membertId);
                _familyMembers.ForEach(familyMember =>
                {
                    familyMember.Member_Id = member.Id;
                    familyMember.Id = Guid.NewGuid().ToString();
                    familyMember.IsActive = true;
                    familyMember.IsTemp = false;
                    string fmId = _memberDAL.Application_Detail_Family_SaveUpdate(familyMember, audit);
                });
            }

            // Bank
            if (_bank != null && _bank.Count > 0)
            {
                _bank.ForEach(bank =>
                {
                    ConfigurationBranchAddressModel? bank_detail = _settingsDAL.Config_Branch_Address_Get(IFSCCode: bank.IFSC_Code).FirstOrDefault();
                    if (bank_detail != null)
                    {
                        bank.Bank_Name = bank_detail.BankName;
                        bank.Branch = bank_detail.BranchName;
                        bank.Bank_Id = bank_detail.BankId;
                        bank.Branch_Id = bank_detail.BranchId;
                    }
                    bank.IsActive = true;
                    bank.IsTemp = false;
                    bank.Member_Id = member.Id;
                    bank.Id = Guid.NewGuid().ToString();
                    bank.Account_Holder_Name = (member.First_Name + " " + member.Last_Name).Trim();
                    string bankId = _memberDAL.Application_Member_Bank_SaveUpdate(bank, audit);
                });
            }

            // Document
            if (_Document != null && _Document.Count > 0)
            {
                _Document.ForEach(async doc =>
                {
                    string savedFileName = await UploadFileToFTPAsync(doc.DocUrl);
                    if (!string.IsNullOrWhiteSpace(savedFileName))
                    {
                        doc.SavedFileName = savedFileName;
                        doc.OriginalFileName = Path.GetFileName(WebUtility.UrlDecode(new Uri(doc.DocUrl).LocalPath));
                        doc.Member_Id = member.Id;
                        doc.Id = Guid.NewGuid().ToString();
                        string docId = _memberDAL.Member_Document_SaveUpdate(doc, audit);
                    }
                });
            }

            if (member.IsApprovedRecord)
            {
                _memberDAL.Update_Member_As_Approved(member.Id);
            }

            if (member.IsApprovedRecord && !string.IsNullOrWhiteSpace(member.RoleIdForApproval))
            {
                MemberDataApprovalMaster approval_request = new MemberDataApprovalMaster();
                approval_request.Approval_For = member.RoleIdForApproval;
                approval_request.Member_Id = member.Id;
                approval_request.IsCompleted = false;
                approval_request.IsActive = true;
                approval_request.Id = Guid.NewGuid().ToString();
                approval_request.Changed_Detail_Record = MemberInformationKey.MEMBER_WHOLE_DATA;
                approval_request.Changed_Date = DateOnly.FromDateTime(DateTimeFunctions.GetIST());
                approval_request.Changed_Time = TimeOnly.FromDateTime(DateTimeFunctions.GetIST());
                approval_request.Status = MemberDetailApprovalStatus.WAITING_FOR_APPROVAL;

                _memberDAL.Member_Detail_Approval_Master_SaveUpdate(approval_request, audit);
            }

            return "SUCCESS";
        }
        private async Task<string> UploadFileToFTPAsync(string fileUrl)
        {
            try
            {
                if (StringFunctions.IsValidUrl(fileUrl))
                {
                    string fileName = Path.GetFileName(WebUtility.UrlDecode(new Uri(fileUrl).LocalPath));
                    string fileString = await StringFunctions.GetBase64FromUrlAsync(fileUrl);
                    string savedFileName = Guid.NewGuid().ToString() + Path.GetExtension(fileName);

                    if (!string.IsNullOrWhiteSpace(fileString))
                    {
                        FTPModel ftpModel = new FTPModel
                        {
                            FileFromBase64 = fileString,
                            FileName = savedFileName
                        };

                        if (_ftpHelper.UploadFileFromBase64(ftpModel))
                        {
                            return savedFileName;
                        }
                    }
                }

                return "";
            }
            catch
            {
                return "";
            }
        }
        private bool IsMemberRecordValid(MemberDetailsSaveModel model, ref List<ConfigurationModel> configurations)
        {
            bool IsValid = true;
            List<string> errors = new List<string>();

            if (string.IsNullOrWhiteSpace(model.Id.Trim()))
            {
                IsValid = false;
                errors.Add("Id required");
            }
            if (string.IsNullOrWhiteSpace(model.Member_ID.Trim()))
            {
                IsValid = false;
                errors.Add("Member code required");
            }
            if (string.IsNullOrWhiteSpace(model.First_Name.Trim()))
            {
                IsValid = false;
                errors.Add("First name required");
            }
            if (string.IsNullOrWhiteSpace(model.Last_Name.Trim()))
            {
                IsValid = false;
                errors.Add("Last name required");
            }
            if (string.IsNullOrWhiteSpace(model.Father_Name.Trim()))
            {
                IsValid = false;
                errors.Add("Father name required");
            }
            if (string.IsNullOrWhiteSpace(model.Date_Of_Birth.Trim()))
            {
                IsValid = false;
                errors.Add("Date of birth required");
            }
            else
            {
                if (StringFunctions.IsValidDOB(model.Date_Of_Birth) == false)
                {
                    IsValid = false;
                    errors.Add("Date of birth is not valid");
                }
            }

            errors.Add(ConfigValidation(model.Gender, "Gender", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.Religion, "Religion", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.Community, "Community", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.Caste, "Caste", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.Marital_Status, "Marital_Status", ref configurations, ref IsValid));

            if (!string.IsNullOrWhiteSpace(model.Aadhaar_Number.Trim()))
            {
                if (model.Aadhaar_Number.Trim().Length != 12)
                {
                    IsValid = false;
                    errors.Add("Aadhar shlould be 12 digit");
                }
            }
            else
            {
                errors.Add("Aadhar required");
                IsValid = false;
            }
            if (!string.IsNullOrWhiteSpace(model.Phone_Number.Trim()))
            {
                if (model.Phone_Number.Trim().Length != 10)
                {
                    IsValid = false;
                    errors.Add("Phone shlould be 10 digit");
                }
            }
            else
            {
                errors.Add("Phone required");
                IsValid = false;
            }

            errors = errors.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
            model.Error = string.Join(", ", errors);
            model.ErrorList = errors;
            model.IsValid = IsValid;
            return IsValid;
        }
        private bool IsOrganizationRecordValid(OrganizationDetailSaveModel model, ref List<ConfigurationModel> configurations)
        {
            bool IsValid = true;
            List<string> errors = new List<string>();

            if (string.IsNullOrWhiteSpace(model.UniqueId.Trim()))
            {
                IsValid = false;
                errors.Add("Id required");
            }
            if (string.IsNullOrWhiteSpace(model.Id.Trim()))
            {
                IsValid = false;
                errors.Add("Member sheet Id required");
            }

            if (!string.IsNullOrWhiteSpace(model.Local_Body.Trim()))
            {
                if (!(model.Local_Body.Trim() == "RURAL" || model.Local_Body.Trim() == "URBAN"))
                {
                    IsValid = false;
                    errors.Add("Local_Body is invalid");
                }
            }
            else
            {
                IsValid = false;
                errors.Add("Local_Body required");
            }

            if (!string.IsNullOrWhiteSpace(model.Name_of_Local_Body.Trim()))
            {
                if (!(model.Name_of_Local_Body.Trim() == "CORPORATION" || model.Name_of_Local_Body.Trim() == "MUNICIPALITY" || model.Name_of_Local_Body.Trim() == "TOWNPANCHAYAT" || model.Name_of_Local_Body.Trim() == "CMWS" || model.Name_of_Local_Body.Trim() == "GCC"))
                {
                    IsValid = false;
                    errors.Add("Name_of_Local_Body is invalid");
                }
            }
            else
            {
                IsValid = false;
                errors.Add("Name_of_Local_Body required");
            }

            errors.Add(ConfigValidation(model.Type_of_Work, "Type_of_Work", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.Core_Sanitary_Worker_Type, "Core_Sanitary_Worker_Type", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.Organization_Type, "Organization_Type", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.District_Id, "District", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.Nature_of_Job, "Nature_of_Job", ref configurations, ref IsValid));
            //errors.Add(ConfigValidation(model.Local_Body, "Local_Body", ref configurations, ref IsValid));
            //errors.Add(ConfigValidation(model.Name_of_Local_Body, "Name_of_Local_Body", ref configurations, ref IsValid));

            errors.Add(ConfigValidation(model.Zone, "Zone", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.Block, "Block", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.Village_Panchayat, "Village_Panchayat", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.Corporation, "Corporation", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.Municipality, "Municipality", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.Town_Panchayat, "Town_Panchayat", ref configurations, ref IsValid, false));

            errors = errors.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
            model.Error = string.Join(", ", errors);
            model.ErrorList = errors;
            model.IsValid = IsValid;
            return IsValid;
        }
        private bool IsFamilyRecordValid(FamilyMemberSaveModel model, ref List<ConfigurationModel> configurations)
        {
            bool IsValid = true;
            List<string> errors = new List<string>();

            if (string.IsNullOrWhiteSpace(model.UniqueId.Trim()))
            {
                IsValid = false;
                errors.Add("Id required");
            }
            if (string.IsNullOrWhiteSpace(model.Id.Trim()))
            {
                IsValid = false;
                errors.Add("Member sheet Id required");
            }
            if (string.IsNullOrWhiteSpace(model.name.Trim()))
            {
                IsValid = false;
                errors.Add("Name required");
            }
            if (string.IsNullOrWhiteSpace(model.phone_number.Trim()))
            {
                IsValid = false;
                errors.Add("phone_number required");
            }
            if (!string.IsNullOrWhiteSpace(model.age.Trim()))
            {
                if (int.TryParse(model.age.Trim(), out int value) == false)
                {
                    IsValid = false;
                    errors.Add("Age not valid");
                }
            }
            else
            {
                IsValid = false;
                errors.Add("Age required");
            }

            if (!string.IsNullOrWhiteSpace(model.date_of_birth.Trim()))
            {
                if (StringFunctions.IsValidDOB(model.date_of_birth) == false)
                {
                    IsValid = false;
                    errors.Add("Date of birth is not valid");
                }
            }

            errors.Add(ConfigValidation(model.relation, "Relation", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.sex, "Gender", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.education, "education", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.occupation, "occupation", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.disability, "disability", ref configurations, ref IsValid));

            errors = errors.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
            model.Error = string.Join(", ", errors);
            model.ErrorList = errors;
            model.IsValid = IsValid;
            return IsValid;
        }
        private bool IsAddressRecordValid(ApplicationAddressMaster model, ref List<ConfigurationModel> configurations)
        {
            bool IsValid = true;
            List<string> errors = new List<string>();

            if (string.IsNullOrWhiteSpace(model.UniqueId.Trim()))
            {
                IsValid = false;
                errors.Add("Id required");
            }
            if (string.IsNullOrWhiteSpace(model.Id.Trim()))
            {
                IsValid = false;
                errors.Add("Member sheet Id required");
            }
            if (!string.IsNullOrWhiteSpace(model.AddressType.Trim()))
            {
                if (!(model.AddressType.Trim() == "WORK" || model.AddressType.Trim() == "PERMANENT" || model.AddressType.Trim() == "TEMPORARY"))
                {
                    IsValid = false;
                    errors.Add("AddressType not valid");
                }
            }
            else
            {
                IsValid = false;
                errors.Add("AddressType required");
            }

            if (string.IsNullOrWhiteSpace(model.DoorNo.Trim()))
            {
                IsValid = false;
                errors.Add("DoorNo required");
            }
            if (string.IsNullOrWhiteSpace(model.StreetName.Trim()))
            {
                IsValid = false;
                errors.Add("StreetName required");
            }
            if (string.IsNullOrWhiteSpace(model.VilllageTownCity.Trim()))
            {
                IsValid = false;
                errors.Add("VilllageTownCity required");
            }

            if (!string.IsNullOrWhiteSpace(model.LocalBody.Trim()))
            {
                if (!(model.LocalBody.Trim() == "RURAL" || model.LocalBody.Trim() == "URBAN"))
                {
                    IsValid = false;
                    errors.Add("LocalBody is invalid");
                }
            }
            else
            {
                IsValid = false;
                errors.Add("LocalBody required");
            }

            if (!string.IsNullOrWhiteSpace(model.NameoflocalBody.Trim()))
            {
                if (!(model.NameoflocalBody.Trim() == "CORPORATION" || model.NameoflocalBody.Trim() == "MUNICIPALITY" || model.NameoflocalBody.Trim() == "TOWNPANCHAYAT" || model.NameoflocalBody.Trim() == "CMWS" || model.NameoflocalBody.Trim() == "GCC"))
                {
                    IsValid = false;
                    errors.Add("NameoflocalBody is invalid");
                }
            }
            else
            {
                IsValid = false;
                errors.Add("NameoflocalBody required");
            }

            //errors.Add(ConfigValidation(model.LocalBody, "LocalBody", ref configurations, ref IsValid, false));
            //errors.Add(ConfigValidation(model.NameoflocalBody, "NameoflocalBody", ref configurations, ref IsValid, false));

            errors.Add(ConfigValidation(model.District, "District", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.Taluk, "Taluk", ref configurations, ref IsValid));

            errors.Add(ConfigValidation(model.Block, "Block", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.Corporation, "Corporation", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.Municipality, "Municipality", ref configurations, ref IsValid, false));
            errors.Add(ConfigValidation(model.TownPanchayat, "TownPanchayat", ref configurations, ref IsValid, false));

            if (!string.IsNullOrWhiteSpace(model.Pincode.Trim()))
            {
                if (model.Pincode.Trim().Length != 6)
                {
                    IsValid = false;
                    errors.Add("Pincode shlould be 6 digit");
                }
            }
            else
            {
                errors.Add("Pincode required");
                IsValid = false;
            }

            errors = errors.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
            model.Error = string.Join(", ", errors);
            model.ErrorList = errors;
            model.IsValid = IsValid;
            return IsValid;
        }
        private bool IsBankRecordValid(BankDetailSaveModel model, ref List<ConfigurationModel> configurations)
        {
            bool IsValid = true;
            List<string> errors = new List<string>();

            if (string.IsNullOrWhiteSpace(model.UniqueId.Trim()))
            {
                IsValid = false;
                errors.Add("Id required");
            }
            if (string.IsNullOrWhiteSpace(model.Id.Trim()))
            {
                IsValid = false;
                errors.Add("Member sheet Id required");
            }
            if (string.IsNullOrWhiteSpace(model.Account_Holder_Name.Trim()))
            {
                IsValid = false;
                errors.Add("Account_Holder_Name required");
            }
            if (string.IsNullOrWhiteSpace(model.Account_Number.Trim()))
            {
                IsValid = false;
                errors.Add("Account_Number required");
            }

            if (!string.IsNullOrWhiteSpace(model.IFSC_Code))
            {
                if (_settingsDAL.Config_Branch_Address_Get(IFSCCode: model.IFSC_Code).Count == 0)
                {
                    IsValid = false;
                    errors.Add("IFSC not valid");
                }
            }
            else
            {
                IsValid = false;
                errors.Add("IFSC required");
            }

            errors = errors.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
            model.Error = string.Join(", ", errors);
            model.ErrorList = errors;
            model.IsValid = IsValid;
            return IsValid;
        }
        private bool IsDocumentRecordValid(MemberDocumentSaveMaster model, ref List<ConfigurationModel> configurations)
        {
            bool IsValid = true;
            List<string> errors = new List<string>();

            if (string.IsNullOrWhiteSpace(model.UniqueId.Trim()))
            {
                IsValid = false;
                errors.Add("Id required");
            }
            if (string.IsNullOrWhiteSpace(model.Id.Trim()))
            {
                IsValid = false;
                errors.Add("Member sheet Id required");
            }
            if (string.IsNullOrWhiteSpace(model.DocUrl.Trim()))
            {
                IsValid = false;
                errors.Add("Docuemnt required");
            }

            errors.Add(ConfigValidation(model.AcceptedDocumentTypeId, "Accepted Documentm", ref configurations, ref IsValid));
            errors.Add(ConfigValidation(model.DocumentCategoryId, "Document Category", ref configurations, ref IsValid));

            errors = errors.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
            model.Error = string.Join(", ", errors);
            model.ErrorList = errors;
            model.IsValid = IsValid;
            return IsValid;
        }
        private string ConfigValidation(string IdorCode, string FieldName, ref List<ConfigurationModel> configurations, ref bool IsValid, bool IsRequired = true, string ParentIdOrCode = "")
        {
            if (!string.IsNullOrWhiteSpace(IdorCode.Trim()))
            {
                if (!configurations.Exists(x => x.Id == IdorCode.Trim() || x.Code == IdorCode.Trim()))
                {
                    IsValid = false;
                    return FieldName + " is not valid";
                }
            }
            else if (IsRequired)
            {
                IsValid = false;
                return FieldName + " is required";
            }

            return "";
        }
        #endregion Member Import

        #region PartialChangeRequest
        public void PartialChangeRequest_Cancel(AuditColumnsModel audit, string Member_Id, string Changed_Detail_Record)
        {
            _memberDAL.PartialChangeRequest_Cancel(audit, Member_Id, Changed_Detail_Record);
        }
        #endregion PartialChangeRequest

        #region Member Id Card
        public MemberIdCardInfoModel Get_Member_Id_Card(string MemberId)
        {
            return _memberDAL.Get_Member_Id_Card(MemberId);
        }
        #endregion Member Id Card

        #region Family Member Import
        public ImportResultModel FamilyMemberImport(IFormFile file, AuditColumnsModel audit)
        {
            var tempList = new List<FamilyMemberImportModel>();
            string batchId = Guid.NewGuid().ToString();


            using (var stream = file.OpenReadStream())
            using (var workbook = new XLWorkbook(stream))
            {
                var ws = workbook.Worksheet(1);
                var rows = ws.RangeUsed().RowsUsed().ToList();

                foreach (var row in rows.Skip(1))
                {
                    tempList.Add(new FamilyMemberImportModel
                    {
                        BatchId = batchId,
                        MemberAadhar = row.Cell(1).GetString().Trim(),
                        ApprovedMemberId = row.Cell(2).GetString().Trim(),
                        FamilyMember_Aadhar = row.Cell(3).GetString().Trim(),
                        FamilyMemberName = row.Cell(4).GetString().Trim(),
                        FamilyMemberRelation = row.Cell(5).GetString().Trim(),
                        FamilyMemberGender = row.Cell(6).GetString().Trim(),
                        FamilyMemberAge = row.Cell(7).GetString().Trim(),
                        FamilyMemberEducation = row.Cell(8).GetString().Trim(),
                        FamilyMemberCourse = row.Cell(9).GetString().Trim(),
                        Standard_Or_Degreename = row.Cell(10).GetString().Trim(),
                        EmisOrUmisNo = row.Cell(11).GetString().Trim(),
                        SchoolOrCollegeDistrict = row.Cell(12).GetString().Trim(),
                        SchoolOrCollegeName = row.Cell(13).GetString().Trim(),
                        SchoolOrCollegeAddress = row.Cell(14).GetString().Trim(),
                        CurrentStatus = row.Cell(15).GetString().Trim(),
                        YearOfCompletion = row.Cell(16).GetString().Trim(),
                        Disability = row.Cell(17).GetString().Trim(),
                        CreatedBy = audit.SavedBy,
                        CreatedByUserName = audit.SavedByUserName,
                        CreatedDate = DateTime.Now
                    });
                }
            }

            _memberDAL.InsertFamilymemberTempBulk(tempList);

            var result = _memberDAL.ProcessFamilyMemberBulkImport(batchId);
            result.BatchId = batchId;

            GenerateErrorExcel(batchId);

            //  _memberDAL.DeleteTempByBatch(batchId);

            return result;
        }

        private void GenerateErrorExcel(string batchId)
        {
            var errors = _memberDAL.GetImportErrors(batchId);

            if (!errors.Any())
                return;

            //string folderPath = Path.Combine(Directory.GetCurrentDirectory(),
            //                                 "wwwroot", "ImportErrors");

            string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "ImportErrors");

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            string filePath = Path.Combine(folderPath, $"{batchId}_Errors.xlsx");

            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("Errors");

            // Header Row (Exact Excel Format)
            ws.Cell(1, 1).Value = "memberaadhar";
            ws.Cell(1, 2).Value = "approvedmemberid";
            ws.Cell(1, 3).Value = "familymember_aadhar";
            ws.Cell(1, 4).Value = "familymembername";
            ws.Cell(1, 5).Value = "familymemberrelation";
            ws.Cell(1, 6).Value = "familymembergender";
            ws.Cell(1, 7).Value = "familymemberage";
            ws.Cell(1, 8).Value = "familymembereducation";
            ws.Cell(1, 9).Value = "familymembercourse";
            ws.Cell(1, 10).Value = "standard_or_degreename";
            ws.Cell(1, 11).Value = "emisno/umisno";
            ws.Cell(1, 12).Value = "school / college district";
            ws.Cell(1, 13).Value = "school / college name";
            ws.Cell(1, 14).Value = "school / college address";
            ws.Cell(1, 15).Value = "currentstatus";
            ws.Cell(1, 16).Value = "yearofcompletion";
            ws.Cell(1, 17).Value = "disability";
            ws.Cell(1, 18).Value = "Error Message";

            // Bold header
            ws.Range(1, 1, 1, 20).Style.Font.Bold = true;

            int row = 2;

            foreach (var item in errors)
            {
                ws.Cell(row, 1).Value = item.MemberAadhar;
                ws.Cell(row, 2).Value = item.ApprovedMemberId;
                ws.Cell(row, 3).Value = item.FamilyMember_Aadhar;
                ws.Cell(row, 4).Value = item.FamilyMemberName;
                ws.Cell(row, 5).Value = item.FamilyMemberRelation;
                ws.Cell(row, 6).Value = item.FamilyMemberGender;
                ws.Cell(row, 7).Value = item.FamilyMemberAge;
                ws.Cell(row, 8).Value = item.FamilyMemberEducation;
                ws.Cell(row, 9).Value = item.FamilyMemberCourse;
                ws.Cell(row, 10).Value = item.Standard_Or_Degreename;
                ws.Cell(row, 11).Value = item.EmisOrUmisNo;
                ws.Cell(row, 12).Value = item.SchoolOrCollegeDistrict;
                ws.Cell(row, 13).Value = item.SchoolOrCollegeName;
                ws.Cell(row, 14).Value = item.SchoolOrCollegeAddress;
                ws.Cell(row, 15).Value = item.CurrentStatus;
                ws.Cell(row, 16).Value = item.YearOfCompletion;
                ws.Cell(row, 17).Value = item.Disability;
                ws.Cell(row, 18).Value = item.ErrorMessage;

                row++;
            }

            // Auto fit columns
            ws.Columns().AdjustToContents();

            workbook.SaveAs(filePath);
        }

        #endregion Family Member Import

    }
}
