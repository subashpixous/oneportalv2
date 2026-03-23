using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Model.ViewModel;
using Newtonsoft.Json;
using OtpNet;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utils.Interface;

namespace Utils
{
    public class SMSHelperOnextel : ISMSHelper
    {
        private SMSConfigurationOnextel _confg;
        private readonly IConfiguration _configuration;
        public SMSHelperOnextel(IOptions<SMSConfigurationOnextel> confg, IConfiguration configuration)
        {
            _confg = confg.Value;
            _configuration = configuration;
        }
        public bool SentSMS(List<string> mobileNumbers, string templateCode, IDictionary<string, string> messageReplaces, out string message_out, int dcs = 0)
        {
            message_out = "";

            if (mobileNumbers.Count > 0 && !string.IsNullOrEmpty(templateCode) && messageReplaces.Count > 0)
            {
                SMSTemplatenOnextelModel? _template = _confg.Templates?.Find(x => x.Code == templateCode);

                if (_template != null)
                {
                    string Message = _template.Template;
                    foreach (KeyValuePair<string, string> replace in messageReplaces)
                    {
                        Message = Message.Replace(replace.Key, replace.Value);
                    }

                    message_out = Message;

                    HttpClient _httpClient = new HttpClient();

                    OnextelSMSPayloadModel payloadModel = new OnextelSMSPayloadModel();
                    payloadModel.key = _template.Key;
                    payloadModel.listsms = new List<OnextelMobileItem>();
                    mobileNumbers.ForEach(x => {

                        payloadModel.listsms.Add(new OnextelMobileItem()
                        {
                            body = Message,
                            from = _confg.From,
                            to = x,
                            entityid = _confg.EntityId,
                            templateid = _template.TemplateId,
                            dcs = dcs
                        });
                    });

                    string json = JsonConvert.SerializeObject(payloadModel);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    HttpResponseMessage message = _httpClient.PostAsync(_confg.PostUrl, content).Result;

                    if (message.StatusCode == System.Net.HttpStatusCode.Forbidden || message.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    {
                        return false;
                    }
                    else if (message.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        return true;
                    }
                }
            }

            return false;
        }
        public string GenerateOtp()
        {
            try
            {
                string base32Secret = _configuration.GetSection("LoginTOTPSecretKey").Value.ToString();

                // Parse the secret key
                var secretBytes = Base32Encoding.ToBytes(base32Secret);

                // Create a TOTP generator
                var totp = new Totp(secretBytes, totpSize: 6, mode: OtpHashMode.Sha256);

                // Generate a TOTP code
                string totpCode = totp.ComputeTotp(); // By default, it uses the current time

                return totpCode;
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return string.Empty;
            }
        }
        public bool ValidateOtp(string OTP)
        {
            try
            {
                string base32Secret = _configuration.GetSection("LoginTOTPSecretKey").Value.ToString();

                // Parse the secret key
                var secretBytes = Base32Encoding.ToBytes(base32Secret);

                // Create a TOTP generator
                var totp = new Totp(secretBytes, totpSize: 6, mode: OtpHashMode.Sha256);

                // Validate the user-entered OTP
                bool isOTPValid = totp.VerifyTotp(OTP, out long timeStepMatched);

                return isOTPValid;
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return false;
            }
        }
    }
}
