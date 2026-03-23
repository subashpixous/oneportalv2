using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class SchemeSubCategoryConfigurationModel
    {
        public string GroupId { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string SubCategoryId { get; set; } = string.Empty;
        public string SubCategory { get; set; } = string.Empty;
        public string CommunityId { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string Occurrence { get; set; } = string.Empty;
        public string Recurrence { get; set; } = string.Empty;
        public decimal Amount { get; set; }

        public List<SelectListItem>? OccurrenceList { get; set; }
        public List<SelectListItem>? RecurrenceList { get; set; }
    }

    public class SchemeSubCategoryConfigurationSaveContainerModel 
    {
        public string GroupId { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public List<SchemeSubCategoryConfigurationSaveModel> CongurationList { get; set; } = null!;
    //public DateOnly FromDate { get; set; }
       public DateTime FromDate { get; set; }
       public string FromDateString { get; set; } = string.Empty;
        public DateTime ToDate { get; set; }
        public string ToDateString { get; set; } = string.Empty;

    }

    public class SchemeSubCategoryConfigurationFormContainerModel
    {
        public string GroupId { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public List<SchemeSubCategoryConfigurationModel> CongurationList { get; set; } = null!;
        public DateOnly FromDate { get; set; }
        public string FromDateString { get; set; } = string.Empty;
        public DateOnly ToDate { get; set; }
        public string ToDateString { get; set; } = string.Empty;

    }

    public class SchemeSubCategoryConfigurationDateWiseModel : AuditColumnsModel
    {
        public string GroupId { get; set; } = string.Empty;
        public DateOnly FromDate { get; set; }
        public string FromDateString { get; set; } = string.Empty;
        public DateOnly ToDate { get; set; }
        public string ToDateString { get; set; } = string.Empty;

    }

    public class SchemeSubCategoryConfigurationSaveModel
    {
        public string GroupId { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
        public string SubCategoryId { get; set; } = string.Empty;
        public string SubCategory { get; set; } = string.Empty;
        public string CommunityId { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string Occurrence { get; set; } = string.Empty;
        public string Recurrence { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
