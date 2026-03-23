using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ImportResultModel
    {
        public string BatchId { get; set; }
        public int TotalRecords { get; set; }
       // public int SuccessRecords { get; set; }
        public int CreatedRecords { get; set; }
        public int UpdatedRecords { get; set; }
        public int FailedRecords { get; set; }
    }
}
