using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utils
{
    public static class DateTimeFunctions
    {
        public static DateTime GetIST()
        {
            TimeZoneInfo indiaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, indiaTimeZone);
        }
        public static DateTime ConvertUTCToIST(DateTimeOffset Date)
        {
            TimeZoneInfo indiaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(Date.DateTime, indiaTimeZone);
        }
        public static DateTime ConvertToServerTimeZone(DateTime inputDateTime)
        {
            // Ensure the input is in UTC (important for consistent conversion)
            DateTime utcDateTime = inputDateTime.Kind == DateTimeKind.Utc
                ? inputDateTime
                : inputDateTime.ToUniversalTime();

            // Convert to server's local time zone
            DateTime serverTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, TimeZoneInfo.Local);
            return serverTime;
        }
        public static List<TimeOnly> GetTimeSlots(TimeOnly fromTime, TimeOnly toTime, int intervalInHours)
        {
            if (intervalInHours <= 0)
                throw new ArgumentException("Interval must be greater than 0.");

            var interval = TimeSpan.FromHours(intervalInHours);
            var timeList = new List<TimeOnly>();
            var currentTime = fromTime;

            while (currentTime <= toTime)
            {
                timeList.Add(currentTime);
                currentTime = currentTime.Add(interval);
            }

            return timeList;
        }
    }
}
