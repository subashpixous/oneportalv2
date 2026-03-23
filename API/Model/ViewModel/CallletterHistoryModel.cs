using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class CallletterHistoryModel : AuditColumnsModel
    {
        public string CallletterId {  get; set; } = string.Empty;
        public string ApplicationId {  get; set; } = string.Empty;
        public string RecordType {  get; set; } = string.Empty;
        public string CommunicatedAddress {  get; set; } = string.Empty;
        public string Subject {  get; set; } = string.Empty;
        public string Body {  get; set; } = string.Empty;
    }
}
