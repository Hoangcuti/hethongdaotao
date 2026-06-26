using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace KhoaHoc.Helpers
{
    public static class DocxExtractor
    {
        public static string ExtractText(byte[] fileBytes)
        {
            var sb = new StringBuilder();
            try
            {
                using (var ms = new MemoryStream(fileBytes))
                {
                    using (var archive = new ZipArchive(ms))
                    {
                        var entry = archive.GetEntry("word/document.xml");
                        if (entry == null) return string.Empty;

                        using (var entryStream = entry.Open())
                        {
                            var doc = XDocument.Load(entryStream);
                            XNamespace w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
                            
                            var body = doc.Root?.Element(w + "body");
                            if (body != null)
                            {
                                foreach (var element in body.Elements())
                                {
                                    if (element.Name == w + "p")
                                    {
                                        var text = string.Concat(element.Descendants(w + "t").Select(t => t.Value));
                                        if (!string.IsNullOrWhiteSpace(text))
                                        {
                                            sb.AppendLine(text.Trim());
                                        }
                                    }
                                    else if (element.Name == w + "tbl")
                                    {
                                        foreach (var row in element.Elements(w + "tr"))
                                        {
                                            var cellTexts = new List<string>();
                                            foreach (var cell in row.Elements(w + "tc"))
                                            {
                                                var cellText = string.Concat(cell.Descendants(w + "t").Select(t => t.Value)).Trim();
                                                if (!string.IsNullOrWhiteSpace(cellText))
                                                {
                                                    cellTexts.Add(cellText);
                                                }
                                            }
                                            if (cellTexts.Count > 0)
                                            {
                                                sb.AppendLine(string.Join(" | ", cellTexts));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting Word document: {ex.Message}");
            }
            return sb.ToString();
        }
    }
}
