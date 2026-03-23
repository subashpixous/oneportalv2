using Model.DomainModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.ViewModel
{
    public class ApplicationDropdownViewModel
    {
        public List<SelectListItem>? Services { get; set; }
        public List<SelectListItem>? Sexes { get; set; }
        public List<SelectListItem>? Communities { get; set; }
        public List<SelectListItem>? Religions { get; set; }
        public List<SelectListItem>? Maritalstatuses { get; set; }
        public List<SelectListItem>? Ventures { get; set; }
        public List<SelectListItem>? Areas { get; set; }

        public List<SelectListItem>? NameOfLocalbody { get; set; }
        public List<SelectListItem>? Districts { get; set; }
        public List<SelectListItem>? Blocks { get; set; }
        public List<SelectListItem>? Taluks { get; set; }
        public List<SelectListItem>? Corporations { get; set; }
        public List<SelectListItem>? Municipalities { get; set; }
        public List<SelectListItem>? Townpanchayat { get; set; }
        public List<SelectListItem>? Villagepanchayat { get; set; }
    }
}
