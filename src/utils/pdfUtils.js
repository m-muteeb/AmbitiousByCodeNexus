// utils/pdfUtils.js
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const addHeaderToPdf = async (pdfUrl, institution, fileName) => {
  const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const logoUrl = institution.logoUrl;
  const logoBlob = await fetch(logoUrl).then(res => res.blob());
  const mimeType = logoBlob.type.toLowerCase();

  let logoImage;

  if (["image/png", "image/jpeg"].includes(mimeType)) {
    const buffer = await logoBlob.arrayBuffer();
    logoImage = mimeType === "image/png"
      ? await pdfDoc.embedPng(buffer)
      : await pdfDoc.embedJpg(buffer);
  } else {
    const imageBitmap = await createImageBitmap(logoBlob);
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0);
    const pngDataUrl = canvas.toDataURL("image/png");
    const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
    logoImage = await pdfDoc.embedPng(pngBytes);
  }

  const logoWidth = 200;
  const logoHeight = logoImage.height / logoImage.width * logoWidth;

  for (const page of pages) {
    const { width, height } = page.getSize();

    page.drawImage(logoImage, {
      x: (width - logoWidth) / 2,
      y: height / 2 - logoHeight / 2,
      width: logoWidth,
      height: logoHeight,
      opacity: 0.1
    });

    const nameText = institution.institutionName || "";
    const addressText = institution.address || "";

    const nameWidth = font.widthOfTextAtSize(nameText, 25);
    const addressWidth = font.widthOfTextAtSize(addressText, 15);

    page.drawText(nameText, {
      x: (width - nameWidth) / 2,
      y: height - 40,
      size: 25,
      font,
      color: rgb(0, 0, 0)
    });

    page.drawText(addressText, {
      x: (width - addressWidth) / 2,
      y: height - 58,
      size: 15,
      font,
      color: rgb(0.4, 0.4, 0.4)
    });
  }

  const modifiedPdfBytes = await pdfDoc.save();
  const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${institution.institutionName || "institution"}-${fileName}`;
  downloadLink.click();
};
