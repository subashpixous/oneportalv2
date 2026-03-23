using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utils
{
    public static class DateFunctions
    {
        public static List<DateTime> GetDateList(DateTime fromDate, DateTime toDate)
        {
            List<DateTime> dateList = new List<DateTime>();

            if (fromDate > toDate)
            {
                throw new ArgumentException("fromDate must be earlier than or equal to toDate.");
            }

            DateTime currentDate = fromDate.Date;
            while (currentDate <= toDate.Date)
            {
                dateList.Add(currentDate);
                currentDate = currentDate.AddDays(1);
            }

            return dateList;
        }

        public static List<DateTime> GetDatesBetween(DateTime startDate, DateTime endDate)
        {
            List<DateTime> dateList = new List<DateTime>();

            if (startDate > endDate)
                return dateList;

            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                dateList.Add(date);
            }

            return dateList;
        }

        public static List<DateTime> GetSpecificDaysBetween(DateTime startDate, DateTime endDate, string[] requiredDays)
        {
            List<DateTime> dateList = new List<DateTime>();

            var dayEnums = requiredDays.Select(d => (DayOfWeek)Enum.Parse(typeof(DayOfWeek), d, ignoreCase: true)).ToHashSet();

            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (dayEnums.Contains(date.DayOfWeek))
                {
                    dateList.Add(date);
                }
            }

            return dateList;
        }

        public static int GetSundaysCountInclusive(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
            {
                (startDate, endDate) = (endDate, startDate);
            }

            int sundayCount = 0;

            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (date.DayOfWeek == DayOfWeek.Sunday)
                {
                    sundayCount++;
                }
            }

            return sundayCount;
        }

    }
}
