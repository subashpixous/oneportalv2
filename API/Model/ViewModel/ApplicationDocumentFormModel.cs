using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationDocumentFormModel
    {
        public string DocumentGroupName {  get; set; } = string.Empty;
        public int SortOrder {  get; set; }
        public List<ApplicationDocumentModel>? Documents { get; set; }
    }

    public class ApplicationDocumentModel
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string DocumentGroupName { get; set; } = string.Empty;
        public string DocumentConfigId { get; set; } = string.Empty;
        public string DocumentCategoryId { get; set; } = string.Empty;
        public string AcceptedDocumentTypeId { get; set; } = string.Empty;
        public string AcceptedDocumentType { get; set; } = string.Empty;
        public string DocumentCategory { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string SavedFileName { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; }
        public bool IsVerified { get; set; }
        public List<SelectListItem>? AcceptedDocumentList { get; set; }
    }



}
