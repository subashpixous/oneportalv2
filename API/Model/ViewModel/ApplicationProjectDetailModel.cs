using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationProjectDetailModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;

        public string ActivityLane { get; set; } = string.Empty;
        public string VentureCategory { get; set; } = string.Empty;
        public decimal ProjectOutlayCost { get; set; }
        public decimal LandCost { get; set; }
        public decimal BuildingCost { get; set; }
        public decimal EquipmentCost { get; set; }
        public decimal WorkingCost { get; set; }
        public decimal PreopertaiveExpense { get; set; }
        public decimal OtherExpense { get; set; }
        public decimal TotalCost { get; set; }

        public decimal SubsidyCost { get; set; }
        public decimal BeneficiaryCost { get; set; }
        public decimal LoanCost { get; set; }
        public decimal SubsidyPercentage_Config { get; set; }
        public decimal SubsidyCost_Config { get; set; }

        public string AccountNumber { get; set; } = string.Empty;
        public string IFSC { get; set; } = string.Empty;
        public string Bank { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        public string ActivityLaneOther { get; set; } = string.Empty;

        public ApplicationAddressMaster? ProjectAddress {  get; set; }
    }
}
