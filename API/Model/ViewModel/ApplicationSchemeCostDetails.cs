using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationSchemeCostDetails
    {
        public bool IsSingleCategorySelect { get; set; }
        public List<ApplicationCostDetails>? SchemeSubCategory {  get; set; }
        public List<SelectListItem>? BankSelectList { get; set; }
    }
    public class SelectedSchemeSubCategory
    {
        public string SchemeSubCategoryId { get; set; } = string.Empty;
        public string SchemeSubCategory { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
    public class SelectedSchemeSubCategoryGetPayload
    {
        public string ApplicationId { get; set; } = string.Empty;
        public string SchemeId { get; set; } = string.Empty;
    }
}
