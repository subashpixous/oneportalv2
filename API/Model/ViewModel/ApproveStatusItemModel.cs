using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApproveStatusItemModel
    {
        public string SchemeId { get; set; } = string.Empty;
        public string SchemeCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; 
        public string StatusId { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public string StatusCode { get; set; } = string.Empty;
        public string CurrentStatus { get; set; } = string.Empty;
        public string CurrentStatusName { get; set; } = string.Empty;
    }
    public class ApproveStatusViewModel
    {
        public bool ShowAssertVerfication { get; set; }
        public bool IsDocumentRequired { get; set; }
        public bool IsForm3Required { get; set; }
        public bool IsUcRequired { get; set; }
        public bool ShowCheckMeetingTimePopup { get; set; }
        public string DocumentFieldLabel { get; set; } = string.Empty;
        public string CurrentStatus { get; set; } = string.Empty;
        public string CurrentStatusName { get; set; } = string.Empty;
        public List<SelectListItem> Reason { get; set; } = null!;
        public List<ApproveStatusItemModel> StatusList { get; set; } = null!;
    }
}


