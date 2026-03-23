using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace BAL.Helper
{
    public static class HelperFunctions
    {
        public static byte[] ExportToExcel<T>(List<T> data, string sheetName = "Sheet1")
        {
            if (data == null || data.Count == 0)
                throw new ArgumentException("Data list is empty.");

            IWorkbook workbook = new XSSFWorkbook();
            ISheet sheet = workbook.CreateSheet(sheetName);

            var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            // Create Header Row
            IRow headerRow = sheet.CreateRow(0);
            for (int i = 0; i < properties.Length; i++)
            {
                headerRow.CreateCell(i).SetCellValue(properties[i].Name);
            }

            // Create Data Rows
            for (int rowIndex = 0; rowIndex < data.Count; rowIndex++)
            {
                IRow row = sheet.CreateRow(rowIndex + 1);
                var item = data[rowIndex];

                for (int colIndex = 0; colIndex < properties.Length; colIndex++)
                {
                    var value = properties[colIndex].GetValue(item);
                    row.CreateCell(colIndex).SetCellValue(value?.ToString() ?? "");
                }
            }

            // Autosize columns
            for (int i = 0; i < properties.Length; i++)
            {
                sheet.AutoSizeColumn(i);
            }

            using (var stream = new MemoryStream())
            {
                workbook.Write(stream);
                return stream.ToArray();
            }
        }
    }
}
