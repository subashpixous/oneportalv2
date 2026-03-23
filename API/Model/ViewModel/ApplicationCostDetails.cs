using Model.DomainModel.MemberModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationSaveSchemeCostDetails
    {
        public List<ApplicationCostDetails> ApplicationCostDetails { get; set; } = new();
        public ApplicationBankDetailSaveModel BankDetailSaveModel { get; set; } = new();
        public SchemeAdditionalInformation schemeAdditionalInformation { get; set; } = new();
        //created by surya
        public string ActionType { get; set; } // "save" or "submit"
    }
    public class ApplicationCostDetails
    {
        public bool IsSelected { get; set; }
        public string ApplicationId { get; set; } = string.Empty;
        public string GroupId { get; set; } = string.Empty;
        public string SubCategoryId { get; set; } = string.Empty;
        public string SubCategory { get; set; } = string.Empty;
        public string CommunityId { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public string Occurrence { get; set; } = string.Empty;
        public string Recurrence { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class SchemeAdditionalInformation
    {
        public string ApplicationId { get; set; } = string.Empty;
        public string PlaceOfAccident { get; set; } = string.Empty;
        public string RelationshipToTheAccident { get; set; } = string.Empty;
        public string MedicalInsurancePlanRegistrationNumber { get; set; } = string.Empty;
    }

}
