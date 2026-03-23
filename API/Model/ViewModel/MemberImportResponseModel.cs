using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class MemberImportResponseModel
    {
        public string SerialNumber {  get; set; } = string.Empty;
        public string MemberId {  get; set; } = string.Empty;
        public string MemberName {  get; set; } = string.Empty;
        public List<MemberImportResponseErrorModel>? Errors { get; set; }
    }
    public class MemberImportResponseErrorModel
    {
        public string Section { get; set; } = string.Empty;
        public string Property { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
    }
}
