using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class AppColumnDetailsOredr
    {
        public int OrderId { get; set; }
        public string ColumnName { get; set; }
        public string Sortingstring { get; set; }
    }
    public static class ApplicationMainGridOrdering
    {
        public static List<AppColumnDetailsOredr> appColumns = new List<AppColumnDetailsOredr> {
            new AppColumnDetailsOredr { OrderId =1,ColumnName = "Id", Sortingstring=" order by smd.ApplicationNumber <sortorder>,smd.TemporaryNumber <sortorder> " } ,
            new AppColumnDetailsOredr { OrderId =2,ColumnName = "SchemeName", Sortingstring=" order by cscm.SchemeName <sortorder> " } ,
            new AppColumnDetailsOredr { OrderId =3,ColumnName = "Status", Sortingstring=" order by csm.StatusName <sortorder> " } ,
            new AppColumnDetailsOredr { OrderId =4,ColumnName = "District", Sortingstring=" order by dcc.Value <sortorder> " } ,
            new AppColumnDetailsOredr { OrderId =5,ColumnName = "Date", Sortingstring=" order by smd.CreatedDate <sortorder> " } ,
            new AppColumnDetailsOredr { OrderId =6,ColumnName = "Name", Sortingstring=" order by sgd.FirstName  <sortorder>,sgd.LastName <sortorder> " } ,
            new AppColumnDetailsOredr { OrderId =7,ColumnName = "IsBulkApprovedByName", Sortingstring=" order by udd.FirstName  <sortorder>,udd.LastName <sortorder> " } ,
            new AppColumnDetailsOredr { OrderId =8,ColumnName = "IsBulkApprovedDateString", Sortingstring=" order by smd.IsBulkApprovedDate <sortorder> " } ,
            new AppColumnDetailsOredr { OrderId =9,ColumnName = "ApprovalType", Sortingstring=" order by smd.IsBulkApproval <sortorder> " } ,
            new AppColumnDetailsOredr { OrderId =10,ColumnName = "SubmittedDateString", Sortingstring=" order by smd.SubmittedDate <sortorder> " } ,
        };
    }
}
