using Microsoft.AspNetCore.Http;

namespace Model.DomainModel
{
    public class ApplicationDocumentMasterModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string DocumentGroupName { get; set; } = string.Empty;
        public string DocumentConfigId { get; set; } = string.Empty;
        public string DocumentCategoryId { get; set; } = string.Empty;
        public string AcceptedDocumentTypeId { get; set; } = string.Empty;
        public string AcceptedDocumentType { get; set; } = string.Empty;
        public string DocumentCategory { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsRequired { get; set; }
        public bool IsVerified { get; set; }
        public int SortOrder { get; set; }
    }

    public class ApplicationDocumentMasterSaveModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string DocumentConfigId { get; set; } = string.Empty;
        public string AcceptedDocumentTypeId { get; set; } = string.Empty;
        public IFormFile? File { get; set; }
    }

    public class ApplicationDocumentVerificationMasterModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string ApplicantId { get; set; } = string.Empty;
        public string DocumentCategoryId { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
    }
}
