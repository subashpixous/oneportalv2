using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class MemberDocumentMaster : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string DocumentCategory { get; set; } = string.Empty;
        public string AcceptedDocumentType { get; set; } = string.Empty;
        public string DocumentCategoryId { get; set; } = string.Empty;
        public string AcceptedDocumentTypeId { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<SelectListItem>? AcceptedDocumentTypeSelectList { get; set; }
        public List<SelectListItem>? DocumentCategorySelectList { get; set; }

        public bool IsApprovalPending { get; set; }
        public bool IsAbleToCancelRequest { get; set; }
    }

    public class MemberDocumentSaveMaster
    {
        public string UniqueId { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public string Member_Id { get; set; } = string.Empty;
        public string DocumentCategoryId { get; set; } = string.Empty;
        public string AcceptedDocumentTypeId { get; set; } = string.Empty;
        public string? OriginalFileName { get; set; } = string.Empty;
        public string? SavedFileName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsTemp { get; set; }
        public IFormFile? File { get; set; }

        public bool IsValid { get; set; }
        public bool IsProcessed { get; set; }
        public int Row { get; set; }
        public string DocUrl { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
        public List<string> ErrorList { get; set; } = new List<string>();
    }
}
