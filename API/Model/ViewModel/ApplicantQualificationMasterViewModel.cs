using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicantQualificationMasterViewModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string EducationalQualificationId { get; set; } = string.Empty;
        public string CourseDetails { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string YearOfPassing { get; set; } = string.Empty;
        public string EducationalQualification { get; set; } = string.Empty;
    }
}
