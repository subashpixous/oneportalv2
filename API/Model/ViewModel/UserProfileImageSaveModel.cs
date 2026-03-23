using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class UserProfileImageSaveModel
    {
        public string UserId { get; set; } = string.Empty;
        public string PofileImageId { get; set; } = string.Empty;
        public string PofileThumbnileImageId { get; set; } = string.Empty;
        public string SavedBy { get; set; } = string.Empty;
        public string SavedByUserName { get; set; } = string.Empty;
        public DateTime SavedDate { get; set; }
    }
}
