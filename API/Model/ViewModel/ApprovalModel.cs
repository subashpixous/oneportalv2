using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApprovalModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusIdFrom { get; set; } = string.Empty;
        public string StatusIdTo { get; set; } = string.Empty;
        public string ApprovalComment { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Verifiedby { get; set; } = string.Empty;

        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;

        public DateTime? AssertVerificationDate { get; set; }
        public string? AssertVerificationVenue { get; set; } = string.Empty;
        public bool? AssertVerificationDeclaration { get; set; }

        public IFormFile? File { get; set; }
    }

    public class BulkApprovalModel
    {
        public List<string>? ApplicationIds { get; set; }
        public string SchemeId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusIdFrom { get; set; } = string.Empty;
        public string StatusIdTo { get; set; } = string.Empty;
        public string ApprovalComment { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;

        public IFormFile? File { get; set; }
    }

    public class ApprovalViewModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ApprovalComment { get; set; } = string.Empty;
        public string StatusIdFrom { get; set; } = string.Empty;
        public string StatusFrom { get; set; } = string.Empty;
        public string StatusIdTo { get; set; } = string.Empty;
        public string StatusTo { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;
        public bool IsBulkApproval { get; set; }
        public string Verifiedby { get; set; } = string.Empty;

        public DateTime AssertVerificationDate { get; set; }
        public string AssertVerificationVenue { get; set; } = string.Empty;
        public bool AssertVerificationDeclaration { get; set; }

        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedByUserName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }
}
