using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class MemberImportDocumentSaveUpdateModel
    {
        public string Id { get; set; } = string.Empty;
        public string UniqueId { get; set; } = string.Empty;
        public string DocumentCategoryId { get; set; } = string.Empty;
        public string AcceptedDocumentmId { get; set; } = string.Empty;
        public string Docuemnt { get; set; } = string.Empty;

        public bool IsValid { get; set; }
        public bool IsProcessed { get; set; }
        public int Row { get; set; }
        public string Error { get; set; } = string.Empty;
    }
}
