using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class CallletterStatusModel
    {
        public string StatusId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsNextStatus { get; set; }
        public int StatusOrder { get; set; }
        public string PreviousStatusId { get; set; } = string.Empty;
    }
}
