using DAL;
using Model.DomainModel;
using Model.DomainModel.MemberModels;
using Model.ViewModel;

namespace BAL.Interface
{
    public interface ISchemeBAL
    {
        #region Scheme
        public string Application_Master_Save(bool IsSubmit, ApplicationMasterSaveModel model, AuditColumnsModel audit);
        public IEnumerable<(string SchemeId, string SchemeSubCategoryId, string SchemeSubCategory, decimal Amount)> GetSelectedSubCategoryAndAmount(string ApplicationId);
        public ApplicationCostDetails Application_Get_Cost_Details(SelectedSchemeSubCategoryGetPayload model, string SubCategoryId);
        public void Application_Save_Cost_Details(List<ApplicationCostDetails> model, AuditColumnsModel audit, string Actiontype);

        public bool Application_IsSingleCategorySelect(string SchemeId);


        public string Application_Qualification_SaveUpdate(ApplicantQualificationMasterModel model, AuditColumnsModel audit);
        public bool ApplicationSendMail(string ApplicationId, List<string> RolesToSendMail, string mailCode);
        public bool ApplicationSendSMS(string ApplicationId, List<string> RolesToSendSMS);
        public List<ApplicationDetailViewModel> Application_Detail_Get(string Id = "", string ApplicationId = "");
        public List<ApplicantQualificationMasterModel> Application_Qualification_Get(string Id = "", string ApplicationId = "");
        public List<ApplicationStatusHistoryModel> Application_Status_History_Get(string Id = "", string ApplicationId = "");
        public List<ApplicationDocumentFormModel> Application_Document_Get(string Id = "", string ApplicationId = "");
        public List<ApplicationDocumentMasterModel> Application_Document_GetById(string Id = "", string ApplicationId = "");
        public List<ApplicationDocumentFormModel> Application_Document_Get_From_Member_Doc_Table(string MemberId, string SchemeId, string ApplicationId);
        public string Application_Document_SaveUpdate(ApplicationDocumentMasterModel model, AuditColumnsModel audit);
        public string Application_Document_Delete(string Id, AuditColumnsModel audit);
        public int Application_Document_Verification_SaveUpdate(ApplicationDocumentVerificationMasterModel model, AuditColumnsModel audit);
        public List<ApplicationMainGridModel> Application_MainGrid_Get_List(List<ApplicationPrivilegeMaster> Privillage, ApplicationFilterModel filter, UserPrivillageInfoModel UserDetails, out int TotalCount);
        public ApplicationRecordCountModel ApplicationStatusCountList(List<ApplicationPrivilegeMaster> Privillage, ApplicationCountFilterValueModel filter, UserPrivillageInfoModel UserDetails);
        public DashboardApplicationCountModel DashboardApplicationCount(List<ApplicationPrivilegeMaster> Privillage, DashboardFilterValueModel filter, UserPrivillageInfoModel UserDetails);
        public DashboardResponseCountModel DashboardCount(List<ApplicationPrivilegeMaster> Privillage, DashboardFilterValueModel filter, UserPrivillageInfoModel UserDetails);

        public string Application_approval_comments_Save(ApprovalModel model, AuditColumnsModel audit, bool IsBulkApproval = false);
        public string Application_bulk_approval_comments_Save(BulkApprovalModel model, AuditColumnsModel audit);
        public List<ApprovalViewModel> Application_approval_comments_Get(string Id = "", string ApplicationId = "");
        public List<ApproveStatusItemModel> ApplicationApprovalStatusList(string ApplicationId);
        public List<ApproveStatusItemModel> ApplicationBulkApprovalStatusList(string StatusId, string SchemeId);
        public string Application_Scheme_Additional_Information_Update(SchemeAdditionalInformation model);
        public SchemeAdditionalInformation Application_Scheme_Additional_Information_Get(string ApplicationId);
        #endregion Scheme

        #region Callletter
        public List<SelectListItem> Callletter_Application_SelectList_Get(string District = "", string SchemeId = "", string StatusId = "");
        public List<CallletterApplicationModel> Callletter_Application_Get(string Id = "", string CallletterId = "", string ApplicationId = "", bool IsActive = true);
        public string Callletter_Application_SaveUpdate(CallletterMasterSaveModel model, AuditColumnsModel audit);
        public List<CallletterGridModel> Callletter_Grid_Get(CallletterFilterModel model, out int TotalCount);
        public CallletterMasterSaveModel Callletter_Application_Master_Get(string Id);
        public string Callletter_Application_Master_Delete(string Id, bool IsActive, AuditColumnsModel audit);
        public List<CallletterStatusModel> GetCallletterStatus(string schemeId);
        public string Callletter_Update_Callletter_Status(string callLetterId, string status);
        public bool CallLetter_SendMessage(string id, string baseUrl, string status, AuditColumnsModel audit, string ApplicationId = "");
        public List<string> Callletter_Get_Configured_StatusId(string schemeId);
        public List<string> DocRequired_Get_StatusId(string schemeId);
        #endregion Callletter

        // UC
        public List<ApplicationUtilizationCirtificateModel> Application_Utilisation_Certificate_Get(string Id = "", string ApplicationId = "");
        public string Application_Utilisation_Certificate_SaveUpdate(ApplicationUtilizationCirtificateSaveModel model, AuditColumnsModel audit);
        // Form 3
        public List<ApplicationForm3Model> Application_Form_3_Get(string Id = "", string ApplicationId = "");
        public string Application_Form_3_SaveUpdate(ApplicationForm3SaveModel model, AuditColumnsModel audit);

        // Type of Training
        public List<ApplicationTypeOfTrainingModel> TypeOfTraining_Get(string ApplicationId);
        public string TypeOfTraining_SaveUpdate(ApplicationTypeOfTrainingModel model);

        #region Application Approval File
        public string Application_Approval_File_Save(ApplicationApprovalFileModel model, AuditColumnsModel audit);
        public List<ApplicationApprovalFileModel> Application_Approval_File_Get(string ApplicationId = "", string StatusId = "", string ApprovalCommentId = "");
        public List<ApplicationApprovalFileModel> Application_Approval_Doc_Category_Get(string ApplicationId, string SchemeId, string StatusId, string ApprovalCommentId);
        public ApplicationApprovalFileModel Application_Approval_Doc_Category_GetSavedFileNames(string Id);
        #endregion Application Approval File

        bool MoveApplicationsToTrash(List<string> applicationIds, string userId);
        bool RestoreApplicationsFromTrash(List<string> applicationIds, string userId);
    }
}
