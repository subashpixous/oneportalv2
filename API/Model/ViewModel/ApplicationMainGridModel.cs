using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationMainGridModel
    {
        public string ApplicationId {  get; set; } = string.Empty;
        public string ApplicationNumber {  get; set; } = string.Empty;
        public string Scheme {  get; set; } = string.Empty;
        public string Status {  get; set; } = string.Empty;
        public DateTime? Date {  get; set; }
        public string FirstName {  get; set; } = string.Empty;
        public string LastName {  get; set; } = string.Empty;
        public string DistrictId {  get; set; } = string.Empty;
        public string DistrictName {  get; set; } = string.Empty;
        public string SchemeId {  get; set; } = string.Empty;
        public string SchemeCode {  get; set; } = string.Empty;
        public bool IsExpired {  get; set; }
        public string StatusCode {  get; set; } = string.Empty;
        public string BulkApprovedBy {  get; set; } = string.Empty;
        public DateTime? BulkApprovedDate {  get; set; }
        public bool IsBulkApproval {  get; set; }
        public string BulkApprovedByUserName {  get; set; } = string.Empty;
        public DateTime? SubmittedDate {  get; set; }
        public string LastAction { get; set; } = string.Empty;
        public string Observation { get; set; } = string.Empty;

        public bool CanUpdate { get; set; }
        public bool CanView { get; set; }
        public bool CanDelete { get; set; }
        public bool CanApprove { get; set; }

        public string CollectedByName { get; set; } = string.Empty;
        public string CollectedByPhoneNumber { get; set; } = string.Empty;
        public string CollectedOn { get; set; } = string.Empty;

        public string BeneficiaryName { get; set; }
    }
}
