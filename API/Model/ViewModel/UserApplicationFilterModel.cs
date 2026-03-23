using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class UserApplicationFilterModel
    {
        public List<SelectListItem>? SchemeSelectList { get; set; }
        public List<SelectListItem>? DistrictSelectList { get; set; }
        public List<SelectListItem>? StatusSelectList { get; set; }
        public List<SelectListItem>? CardStatusSelectList { get; set; }

        public List<SelectListItem>? LocalBodyIds { get; set; } 
        public List<SelectListItem>? NameOfLocalBodyIds { get; set; } 
        public List<SelectListItem>? BlockIds { get; set; }
        public List<SelectListItem>? CorporationIds { get; set; } 
        public List<SelectListItem>? MunicipalityIds { get; set; } 
        public List<SelectListItem>? TownPanchayatIds { get; set; }
        public List<SelectListItem>? VillagePanchayatIds { get; set; } 
        public List<SelectListItem>? ZoneIds { get; set; }
        public List<SelectListItem>? CollectedByPhoneNo { get; set; }

        public bool IsUrbanRural { get; set; }

    }
}
