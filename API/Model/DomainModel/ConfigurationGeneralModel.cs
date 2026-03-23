using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ConfigurationGeneralModel : AuditColumnsModel
    {
        public string Id {  get; set; } = string.Empty;
        public string ConfigName {  get; set; } = string.Empty;
        public string ConfigDesc {  get; set; } = string.Empty;
        public string ConfigKey {  get; set; } = string.Empty;
        public string ConfigValue {  get; set; } = string.Empty;
    }

    public class RuralDistrictsSaveModel
    {
        public List<string> DistrictIds { get; set; } = null!;
    }
    public class UrbanDistrictsSaveModel
    {
        public List<string> DistrictIds { get; set; } = null!;
    }
    public class MemberDocumentSaveModel
    {
        public List<string> DocumentCategoryIds { get; set; } = null!;
    }
}
