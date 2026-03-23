using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel.Report
{
    public class ApplicationDocumentReportModel
    {
        public string ApplicationNumber {  get; set; } = string.Empty;
        public string Scheme {  get; set; } = string.Empty;
        public string Status {  get; set; } = string.Empty;
        public DateTime SubmittedDate {  get; set; }
        public string DocumentType {  get; set; } = string.Empty;
        public string DocumentCategory {  get; set; } = string.Empty;
        public string AcceptedDocument {  get; set; } = string.Empty;
        public string DocumentMandatory {  get; set; } = string.Empty;
        public string OriginalFileName {  get; set; } = string.Empty;
        public string SavedFileName {  get; set; } = string.Empty;
    }
}
