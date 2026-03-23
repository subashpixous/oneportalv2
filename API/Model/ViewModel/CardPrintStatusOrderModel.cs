using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class CardPrintStatusOrderModel
    {
        public string Id { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }

    public class CardPrintStatusModel
    {
        public string Id { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }
}
