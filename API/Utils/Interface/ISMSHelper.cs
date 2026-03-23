using Model.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utils.Interface
{
    public interface ISMSHelper
    {
        public bool SentSMS(List<string> mobileNumbers, string templateCode, IDictionary<string, string> messageReplaces, out string message_out, int dcs = 0);
        public string GenerateOtp();
        public bool ValidateOtp(string OTP);
    }
}
