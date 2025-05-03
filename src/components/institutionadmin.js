import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { fireStore, auth } from "../config/firebase";
import {
  Button,
  Card,
  Spin,
  Tag,
  Checkbox,
  message
} from "antd";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import "../assets/css/pdflist.css";

const PdfList = () => {
  const [user, setUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const institutionDoc = await getDoc(doc(fireStore, "users", firebaseUser.uid));
        if (institutionDoc.exists()) {
          setInstitution(institutionDoc.data());
        } else {
          message.error("Institution details not found.");
        }
      } else {
        setUser(null);
        setInstitution(null);
        message.warning("You must be logged in to view PDFs.");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const snapshot = await getDocs(collection(fireStore, "institutionpdfs"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
        setPdfs(data);
        setFilteredPdfs(data);
      } catch (err) {
        console.error("Error fetching PDFs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, []);

  const handleCheckboxChange = (checked, file) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, file]);
    } else {
      setSelectedFiles(prev => prev.filter(f => f.url !== file.url));
    }
  };

  const handleSelectAll = () => {
    const allFiles = filteredPdfs.flatMap(pdf =>
      pdf.fileUrls.map(file => ({
        ...file,
        subject: pdf.subject
      }))
    );
    setSelectedFiles(allFiles);
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
  };

  const addHeaderToPdf = async (pdfUrl, institution, fileName) => {
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const logoUrl = institution.logoUrl;
    const logoImageBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
    const logoImage = logoUrl.toLowerCase().endsWith(".png")
      ? await pdfDoc.embedPng(logoImageBytes)
      : await pdfDoc.embedJpg(logoImageBytes);

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

      const nameSize = 30;
      const nameWidth = font.widthOfTextAtSize(institution.institutionName || "", nameSize);
      page.drawText(institution.institutionName || "", {
        x: (width - nameWidth) / 2,
        y: height - 40,
        size: nameSize,
        font,
        color: rgb(0, 0, 0)
      });

      const addressSize = 18;
      const addressWidth = font.widthOfTextAtSize(institution.address || "", addressSize);
      page.drawText(institution.address || "", {
        x: (width - addressWidth) / 2,
        y: height - 60,
        size: addressSize,
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

  const handleDownloadSelected = async () => {
    if (!selectedFiles.length) return message.info("No PDFs selected.");
    setDownloading(true);
    try {
      for (const file of selectedFiles) {
        await addHeaderToPdf(file.url, institution, file.fileName);
      }
      message.success("All selected PDFs downloaded.");
    } catch (err) {
      console.error(err);
      message.error("Error downloading PDFs.");
    } finally {
      setDownloading(false);
    }
  };

  if (!user || !institution) {
    return (
      <div style={{ padding: 24 }}>
        <Spin size="large" tip="Loading user and institution..." />
      </div>
    );
  }

  // Group by class and subject
  const grouped = filteredPdfs.reduce((acc, pdf) => {
    const cls = pdf.class;
    const subj = pdf.subject;
    if (!acc[cls]) acc[cls] = {};
    if (!acc[cls][subj]) acc[cls][subj] = [];

    pdf.fileUrls.forEach(file => {
      acc[cls][subj].push({
        ...file,
        subject: subj
      });
    });

    return acc;
  }, {});

  return (
    <div className="pdf-list-container">
      <h1 className="title">PDF Library</h1>

      <div style={{ marginTop: 20 }}>
        <Button onClick={handleSelectAll} style={{ marginRight: 8 }}>Select All</Button>
        <Button onClick={handleClearAll} style={{ marginRight: 8 }}>Clear All</Button>
        <Button type="primary" loading={downloading} onClick={handleDownloadSelected}>
          Download Selected
        </Button>
      </div>

      {loading ? (
        <Spin size="large" tip="Loading PDFs..." />
      ) : (
        <div className="pdf-list mt-2">
          {Object.entries(grouped).map(([cls, subjects]) => (
            <div key={cls} style={{ marginBottom: 32 }}>
              <h2 style={{ borderBottom: "2px solid #0000", paddingBottom: 8 }}>{cls}</h2>

              {Object.entries(subjects).map(([subj, files]) => (
                <div key={subj} style={{ marginBottom: 24, paddingLeft: 16 }}>
                  <Card
                    className="pdf-card"
                    title={subj}
                    style={{ marginBottom: 16 }}
                  >
                    {files.map((file, index) => {
                      const isChecked = selectedFiles.some(f => f.url === file.url);
                      return (
                        <div
                          key={index}
                          style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onChange={(e) =>
                              handleCheckboxChange(e.target.checked, file)
                            }
                          />
                          <span style={{ flex: 1, marginLeft: 8 }}>
                            {index + 1}. <strong>{file.fileName}</strong>{" "}
                            {file.isPaid && <Tag color="red">Paid</Tag>}
                          </span>
                          <Button type="link" onClick={() => window.open(file.url, "_blank")}>
                            View
                          </Button>
                        </div>
                      );
                    })}
                  </Card>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PdfList;
