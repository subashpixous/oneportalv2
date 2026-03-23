using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationApprovalFileModel : AuditColumnsModel
    {
        public string Ida { get; set; } = string.Empty;
        public string ApprovalCommentId { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;
        public string DocCategoryId { get; set; } = string.Empty;
        public string DocCategory { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsRequired { get; set; }
    }

    public class ApplicationApprovalFileSaveModel
    {
        public string Ida { get; set; } = string.Empty;
        public string ApprovalCommentId { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string DocCategoryId { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public IFormFile File { get; set; } = null!;
    }
}
