using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class CallletterMasterModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string CallletterName { get; set; } = string.Empty;
        public string CallletterSubject { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public DateTime MeetingTimeFrom { get; set; }
        public DateTime MeetingTimeTo { get; set; }
        public string Comments { get; set; } = string.Empty;
        public string MeetingStatusId { get; set; } = string.Empty;
        public string Prefix { get; set; } = string.Empty;
        public string Suffix { get; set; } = string.Empty;
        public string RunningNumber { get; set; } = string.Empty;
        public string CallLetterNumber { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
    public class CallletterMasterSaveModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string SchemeName { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string DistrictName { get; set; } = string.Empty;
        public string CallletterName { get; set; } = string.Empty;
        public string CallletterSubject { get; set; } = string.Empty;
        public string ApplicationIdsStr { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public DateTime MeetingTimeFrom { get; set; }
        public DateTime MeetingTimeTo { get; set; }
        public string Comments { get; set; } = string.Empty;
        public string MeetingStatusId { get; set; } = string.Empty;
        public string MeetingStatusName { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
        public bool IsActive { get; set; }


        public List<string> ApplicationIds { get; set; } = null!;
        public List<CallletterApplicationModel>? Application { get; set; }
    }

    public class CallletterGridModel : AuditColumnsModel
    {
        public string Id { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string DistrictId { get; set; } = string.Empty;
        public string CallletterName { get; set; } = string.Empty;
        public string CallletterSubject { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public DateTime MeetingTimeFrom { get; set; }
        public DateTime MeetingTimeTo { get; set; }
        public string Comments { get; set; } = string.Empty;
        public string MeetingStatusId { get; set; } = string.Empty;
        public string CallLetterNumber { get; set; } = string.Empty;
        public string Scheme { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string CallLetterStatus { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsMessageSentToAll { get; set; }
        public bool IsExpired { get; set; }


        public bool CanDelete { get; set; }
        public bool CanSent { get; set; }
        public bool CanCancel { get; set; }
    }

}
