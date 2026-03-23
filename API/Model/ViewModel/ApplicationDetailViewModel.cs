using Model.CustomeAttributes;
using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationDetailViewModel : AuditColumnsModel
    {
        public string ApplicantId { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public string MemberId { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string ApplicantAadharNumber { get; set; } = string.Empty;
        public bool IsSubmitted { get; set; }
        public string SchemeId { get; set; } = string.Empty;
        public string Scheme { get; set; } = string.Empty;
        public string SchemeGroupName { get; set; }
        public string StatusId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        // Updated By Sivasankar on 21-01-2026 for Mem Scheme View changes
        public string BeneficiaryName { get; set; } = string.Empty;
        public string Relationship { get; set; } = string.Empty;
        public string MemberName { get; set; } = string.Empty;
        public bool ShowBankFields { get; set; }
        public bool ShowAdditionalFields { get; set; }

        public string TemporaryPrefix { get; set; } = string.Empty;
        public string TemporarySuffix { get; set; } = string.Empty;
        public string TemporaryRunningNumber { get; set; } = string.Empty;
        public string TemporaryNumber { get; set; } = string.Empty;

        public string Prefix { get; set; } = string.Empty;
        public string Suffix { get; set; } = string.Empty;
        public string ApplicationRunningNumber { get; set; } = string.Empty;
        public string ApplicationNumber { get; set; } = string.Empty;

        public string ThumbnailSavedFileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;

        public string BulkApprovedby { get; set; } = string.Empty;
        public string BulkApprovedByUserName { get; set; } = string.Empty;
        public DateTime BulkApprovedDate { get; set; }
        public DateTime SubmittedDate { get; set; }

        public List<ApprovalViewModel>? ApprovalComments { get; set; }
        public List<ApplicationDocumentFormModel>? ApplicationDocument { get; set; }
        public List<StatusFlowModel>? StatusFlow { get; set; }
        public List<ApplicationUtilizationCirtificateModel>? UcDocument { get; set; }
        public List<ApplicationForm3Model>? Form3 { get; set; }
        public ApplicationUCForm3PrivilegeModel? Privileges { get; set; }
        public ApplicationBankModel? ApplicationBank { get; set; }
        public SchemeAdditionalInformation? schemeAdditionalInformation { get; set; }
    }

    public class ApplicationUCForm3PrivilegeModel
    {
        public bool UcView { get; set; }
        public bool UcUpload { get; set; }
        public bool Form3View { get; set; }
        public bool Form3Upload { get; set; }
    }
}
