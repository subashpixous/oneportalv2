using System.Drawing.Imaging;
using System.Drawing;

namespace API.Helpers
{
    public static class ImageHelper
    {
        public static IFormFile CreateThumbnail(IFormFile originalFile, double percentage)
        {
            if (originalFile == null || originalFile.Length == 0)
            {
                throw new ArgumentException("Invalid file");
            }

            if (percentage <= 0 || percentage > 100)
            {
                throw new ArgumentException("Percentage must be between 0 and 100.");
            }

            // Create a MemoryStream from the original file to prevent stream disposal issues
            MemoryStream inputCopyStream = new MemoryStream();
            originalFile.CopyTo(inputCopyStream);
            inputCopyStream.Position = 0; // Reset position to the start of the stream

            using var originalImage = Image.FromStream(inputCopyStream);

            // Correct image orientation based on EXIF data
            CorrectImageOrientation(originalImage);

            // Calculate new dimensions based on the percentage
            var newWidth = (int)(originalImage.Width * (percentage / 100));
            var newHeight = (int)(originalImage.Height * (percentage / 100));

            // Create the thumbnail
            using var thumbnailImage = new Bitmap(newWidth, newHeight);
            using (var graphics = Graphics.FromImage(thumbnailImage))
            {
                graphics.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
                graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                graphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                graphics.DrawImage(originalImage, 0, 0, newWidth, newHeight);
            }

            // Save the thumbnail to a new MemoryStream
            MemoryStream thumbnailStream = new MemoryStream();
            thumbnailImage.Save(thumbnailStream, ImageFormat.Jpeg); // Save as JPEG or any format you prefer
            thumbnailStream.Position = 0; // Reset position to the start of the stream

            // Create a new IFormFile from the thumbnail stream
            var thumbnailFile = new FormFile(thumbnailStream, 0, thumbnailStream.Length, originalFile.Name, "thumbnail.jpg")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg"
            };

            return thumbnailFile;
        }

        // Helper method to correct the image orientation
        private static void CorrectImageOrientation(Image image)
        {
            const int orientationPropertyId = 0x0112; // Exif ID for orientation
            if (!image.PropertyIdList.Contains(orientationPropertyId)) return;

            var orientation = (int)image.GetPropertyItem(orientationPropertyId).Value[0];
            RotateFlipType rotateFlipType = orientation switch
            {
                2 => RotateFlipType.RotateNoneFlipX,           // Horizontal flip
                3 => RotateFlipType.Rotate180FlipNone,        // Rotate 180
                4 => RotateFlipType.Rotate180FlipX,          // Vertical flip
                5 => RotateFlipType.Rotate90FlipX,           // Rotate 90 and flip horizontally
                6 => RotateFlipType.Rotate90FlipNone,        // Rotate 90
                7 => RotateFlipType.Rotate270FlipX,          // Rotate 270 and flip horizontally
                8 => RotateFlipType.Rotate270FlipNone,       // Rotate 270
                _ => RotateFlipType.RotateNoneFlipNone
            };

            if (rotateFlipType != RotateFlipType.RotateNoneFlipNone)
            {
                image.RotateFlip(rotateFlipType);
            }

            // Remove orientation metadata to prevent future rotation issues
            image.RemovePropertyItem(orientationPropertyId);
        }


    }
}
