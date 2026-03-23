using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.DomainModel
{
    public class ApplicationStatusHistoryModel
    {
        public string Id {  get; set; } = string.Empty;
        public string ApplicationId {  get; set; } = string.Empty;
        public string FromStatusId {  get; set; } = string.Empty;
        public string ToStatusId {  get; set; } = string.Empty;
        public string FromStatus {  get; set; } = string.Empty;
        public string ToStatus {  get; set; } = string.Empty;
        public string CreatedBy {  get; set; } = string.Empty;
        public string CreatedByUserName {  get; set; } = string.Empty;
        public DateTime CreatedDate {  get; set; }
    }
}
