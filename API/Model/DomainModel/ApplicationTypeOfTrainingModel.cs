using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationTypeOfTrainingModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string TypeOfTraining { get; set; } = string.Empty;
        public string NameOfTheInstitution { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public bool IsActive { get; set; }
    }
}
