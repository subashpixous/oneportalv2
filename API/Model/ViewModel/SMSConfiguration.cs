using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class SMSConfiguration
    {
        public string RequestURL { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int route { get; set; }
        public int flashsms { get; set; }
        public int DCS { get; set; }
        public string channel { get; set; } = string.Empty;
        public string senderid { get; set; } = string.Empty;
        public string API_Key { get; set; } = string.Empty;
        public List<SMSTemplateModel>? Templates { get; set; }
        public List<CommonTextReplaceModel>? CommonTextReplaces { get; set; }
        public bool EnableTempOTP { get; set; }
    }

    public class SMSTemplateModel
    {
        public string Code { get; set; } = string.Empty;
        public string Template { get; set; } = string.Empty;
    }

    public class CommonTextReplaceModel
    {
        public string StatusCode { get; set; } = string.Empty;
        public string ReplaceText { get; set; } = string.Empty;
    }

    public class SMSTemplatenOnextelModel
    {
        public string Code { get; set; } = string.Empty;
        public string TemplateId { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string Template { get; set; } = string.Empty;
    }

    public class SMSConfigurationOnextel
    {
        public string PostUrl { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public List<SMSTemplatenOnextelModel>? Templates { get; set; }
    }

    public class OnextelSMSPayloadModel
    {
        public string key { get; set; } = string.Empty;
        public List<OnextelMobileItem> listsms { get; set; } = null!;
    }

    public class OnextelMobileItem
    {
        public string from { get; set; } = string.Empty;
        public string to { get; set; } = string.Empty;
        public string body { get; set; } = string.Empty;
        public string entityid { get; set; } = string.Empty;
        public string templateid { get; set; } = string.Empty;
        public int dcs { get; set; } = 0;
    }

}
