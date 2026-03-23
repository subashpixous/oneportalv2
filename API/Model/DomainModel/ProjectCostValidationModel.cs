namespace Model.DomainModel
{
    public class ProjectCostValidationModel
    {
    }
    public class Field
    {
        public string Name { get; set; } = string.Empty;
        public double Value { get; set; }
    }

    public class Condition
    {
        public decimal Basevalue { get; set; }
        public decimal CheckValue { get; set; }
        public string Operator { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Threshold { get; set; }
    }


}
