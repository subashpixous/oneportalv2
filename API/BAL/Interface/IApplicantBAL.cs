using Model.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BAL.Interface
{
    public interface IApplicantBAL
    {
        public List<ApplicationGridViewModel> Application_GetList(string Id = "", string ApplicationId = "", string Mobile = "", string Email = "", string MemberId = "");
        public int CheckMemberExist(string PhoneNumber);
    }
}
