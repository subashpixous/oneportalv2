using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationPersonalDetailModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;

        public bool IsCorrespondenceSameAsResident { get; set; }
        public string AadharNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool ResidinginSameArea { get; set; }
        public bool IsTrainingUndergone { get; set; }
        public string? InstitutionName { get; set; }
        public DateTime? TrainingDurationFrom { get; set; }
        public DateTime? TrainingDurationTo { get; set; }
        public bool IsEmployed { get; set; }
        public string EmploymentDetails { get; set; } = string.Empty;
        public bool IsRegistered { get; set; }
        public string RegistrationNo { get; set; } = string.Empty;
        public DateTime? RegistrationDate { get; set; }
        public bool HasPreviousExp { get; set; }
        public string PreviousExperience { get; set; } = string.Empty;
        public string? TypeOfTraining { get; set; }
        public string EmployeementType { get; set; } = string.Empty;

        public bool IsReEmployed { get; set; }
        public bool IsNativeTamilNadu { get; set; }
        public string EmployementOthers { get; set; } = string.Empty;

        public ApplicationAddressMaster? ResidentialAddress {  get; set; }
        public ApplicationAddressMaster? CorrespondenceAddress {  get; set; }
        public List<ApplicantQualificationMasterViewModel>? EducationalQualification {  get; set; }
        public List<ApplicationTypeOfTrainingModel>? TypeOfTrainingList {  get; set; }
    }
}
