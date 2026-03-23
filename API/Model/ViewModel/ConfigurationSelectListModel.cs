using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ConfigSelectListByParentIdListModel
    {
        public string Text { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public List<CustSelectModel> Items { get; set; } = null!;
    }

    public class CustSelectModel
    {
        public string Text { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class ConfigurationSelectListModel
    {
        public string ParentValue { get; set; } = string.Empty;
        public string ParentId { get; set; } = string.Empty;

        public string Value { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
    }
}
