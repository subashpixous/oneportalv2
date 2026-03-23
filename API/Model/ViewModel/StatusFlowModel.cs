using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class StatusFlowModel
    {
        public int Order {  get; set; }
        public int Number {  get; set; }
        public string Status {  get; set; } = string.Empty;
        public string StatusCode {  get; set; } = string.Empty;
        public bool IsPassed { get; set; }
    }
}
