using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationGridViewModel : AuditColumnsModel
    {
        public string ApplicationId { get; set; } = string.Empty;
        public string DetailId { get; set; } = string.Empty;
        public string MemberId { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string TemporaryNumber { get; set; } = string.Empty;
        public string ApplicationNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusCode { get; set; } = string.Empty;
        public string Scheme { get; set; } = string.Empty;

        public string ThumbnailSavedFileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;

        public string BulkApprovedby { get; set; } = string.Empty;
        public string BulkApprovedByUserName { get; set; } = string.Empty;
        public DateTime BulkApprovedDate { get; set; }
        public DateTime SubmittedDate { get; set; }

        public bool CanEdit { get; set; }
        public bool IsExpired { get; set; }
    }
}
