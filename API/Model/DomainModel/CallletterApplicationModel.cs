using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class CallletterApplicationModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string StatusId { get; set; } = string.Empty;
        public string CallletterId { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string ApplicationNumber { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Scheme { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public bool IsSent { get; set; }
        public bool IsSelected { get; set; }
        public bool IsPresent { get; set; }
        public bool IsActive { get; set; }
        public bool CanSent { get; set; }

        public DateTime MeetingDate { get; set; }
        public DateTime MeetingTimeFrom { get; set; }
        public DateTime MeetingTimeTo { get; set; }
        public string Comments { get; set; } = string.Empty;
        public string CallletterName { get; set; } = string.Empty;
        public string CallletterSubject { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
    }
}
