using Model.Constants;
using Model.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.MailTemplateHelper
{
    public static class MailTemplate
    {
        public static EmailTemplateModel? GetEmailTemplate(string Code)
        {
            if (Code == EmailTemplateCode.UserCreate)
            {
                EmailTemplateModel model = new EmailTemplateModel();

                model.Subject = "Your account has been created/saved in One Portal";

                model.Body += "Dear {RECIPIENTFIRSTNAME} {RECIPIENTLASTNAME}, <br/>";
                model.Body += "Your account has been created/saved successfully, Please use the below for login. <br/>";
                model.Body += "User Name: {USERNAME}. <br/>";
                model.Body += "Password: {PASSWORD}. <br/>";

                return model;
            }
            else if (Code == EmailTemplateCode.UserCreate1)
            {
                EmailTemplateModel model = new EmailTemplateModel();

                model.Subject = "Your account has been created/saved in One Portal";

                model.Body += "Dear {RECIPIENTFIRSTNAME} {RECIPIENTLASTNAME}, <br/>";
                model.Body += "Your account has been created/saved successfully, Please use the below for login. <br/>";
                model.Body += "User Name: {USERNAME}. <br/>";
                model.Body += "Password: {PASSWORD}. <br/>";

                return model;
            }

            return null;
        }
    }
}
