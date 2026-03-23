namespace Model.ViewModel.Report
{
    public class DemographicAndBenificiaryInsightsModel
    {
        public int Self { get; set; }
        public List<DependentModel>? Dependent {  get; set; }
        public List<ServedInModel>? SchemeServedIn {  get; set; }
        public List<MaritalStatusModel>? MaritalStatus {  get; set; }
        public List<AgeAndGenderModel>? AgeAndGender {  get; set; }
    }

    public class DependentModel
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class ServedInModel
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class MaritalStatusModel
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class AgeAndGenderModel
    {
        public string Age { get; set; } = string.Empty;
        public int MaleCount { get; set; }
        public int FemaleCount { get; set; }
    }
}
