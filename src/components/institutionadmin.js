import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { fireStore, auth } from "../config/firebase";
import { Button, Card, Select, Spin, Tag, message } from "antd";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import "../assets/css/pdflist.css";

const { Option } = Select;

const PdfList = () => {
  const [user, setUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);

  const [downloading, setDownloading] = useState(null); // Track loading per file

  // Load auth and institution info
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

  // Fetch PDFs
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const snapshot = await getDocs(collection(fireStore, "institutionpdfs"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
        setPdfs(data);
        setFilteredPdfs(data);
        setClassOptions([...new Set(data.map(item => item.class))]);
      } catch (err) {
        console.error("Error fetching PDFs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, []);

  const handleClassChange = (value) => {
    setSelectedClass(value);
    setSelectedSubject(null);
    setSelectedTopic(null);

    const filtered = pdfs.filter(pdf => pdf.class === value);
    setFilteredPdfs(filtered);
    setSubjectOptions([...new Set(filtered.map(pdf => pdf.subject))]);
  };

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedTopic(null);

    const filtered = pdfs.filter(pdf => pdf.class === selectedClass && pdf.subject === value);
    setFilteredPdfs(filtered);
    setTopicOptions([...new Set(filtered.map(pdf => pdf.topic))]);
  };

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    const filtered = pdfs.filter(
      pdf =>
        pdf.class === selectedClass &&
        pdf.subject === selectedSubject &&
        pdf.topic === value
    );
    setFilteredPdfs(filtered);
  };

  // Add header and download directly with watermark logo
  const addHeaderToPdf = async (pdfUrl, institution, fileName, index) => {
    try {
      setDownloading(index); // Start loader

      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Load logo as watermark
      const logoUrl = institution.logoUrl; // Assuming the institution logo URL is provided
      const logoImageBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
      
      // Detect image type: PNG or JPEG
      let logoImage;
      const isPng = logoUrl.toLowerCase().endsWith(".png");
      if (isPng) {
        logoImage = await pdfDoc.embedPng(logoImageBytes);
      } else {
        logoImage = await pdfDoc.embedJpg(logoImageBytes); // Embed JPEG if not PNG
      }

      // Get the size of the logo
      const logoWidth = 200; // Scale logo width to fit
      const logoHeight = logoImage.height / logoImage.width * logoWidth;

      for (const page of pages) {
        const { width, height } = page.getSize();

        // Add logo as watermark (semi-transparent)
        page.drawImage(logoImage, {
          x: (width - logoWidth) / 2, // Center the logo horizontally
          y: height / 2 - logoHeight / 2, // Center the logo vertically
          width: logoWidth,
          height: logoHeight,
          opacity: 0.1, // Semi-transparent watermark logo
        });

        // Institution name - center
        const nameSize = 30;
        const nameWidth = font.widthOfTextAtSize(institution.institutionName || "", nameSize);
        page.drawText(institution.institutionName || "", {
          x: (width - nameWidth) / 2,
          y: height - 40,
          size: nameSize,
          font,
          color: rgb(0, 0, 0),
        });

        // Address - center
        const addressSize = 18;
        const addressWidth = font.widthOfTextAtSize(institution.address || "", addressSize);
        page.drawText(institution.address || "", {
          x: (width - addressWidth) / 2,
          y: height - 60,
          size: addressSize,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `${institution.institutionName || "institution"}-${fileName}`;
      downloadLink.click();

    } catch (error) {
      console.error("Failed to modify PDF:", error);
      message.error("Failed to process PDF.");
    } finally {
      setDownloading(null);
    }
  };

  if (!user)
    return (
      <div style={{ padding: 24 }}>
        <Spin size="large" tip="Checking authentication..." />
      </div>
    );

  return (
    <div className="pdf-list-container">
      <h1 className="title">PDF Library</h1>

      <div className="filters">
        <Select
          placeholder="Select Class"
          onChange={handleClassChange}
          value={selectedClass}
          style={{ width: 200, marginRight: 16 }}
        >
          {classOptions.map(cls => (
            <Option key={cls} value={cls}>{cls}</Option>
          ))}
        </Select>

        <Select
          placeholder="Select Subject"
          onChange={handleSubjectChange}
          value={selectedSubject}
          disabled={!selectedClass}
          style={{ width: 200, marginRight: 16 }}
        >
          {subjectOptions.map(subject => (
            <Option key={subject} value={subject}>{subject}</Option>
          ))}
        </Select>

        <Select
          placeholder="Select Topic"
          onChange={handleTopicChange}
          value={selectedTopic}
          disabled={!selectedSubject}
          style={{ width: 200 }}
        >
          {topicOptions.map(topic => (
            <Option key={topic} value={topic}>{topic}</Option>
          ))}
        </Select>
      </div>

      {loading || !institution ? (
        <Spin size="large" tip="Loading PDFs..." />
      ) : (
        <div className="pdf-list">
          {filteredPdfs.map(pdf => (
            <Card key={pdf.id} className="pdf-card" bordered>
              <h3>{pdf.topic}</h3>
              <p><strong>Subject:</strong> {pdf.subject}</p>
              <p><strong>Description:</strong> {pdf.description}</p>
              <p><strong>Uploaded:</strong> {new Date(pdf.timestamp?.seconds * 1000).toLocaleString()}</p>

              {pdf.fileUrls?.map((file, index) => (
                <div key={index} className="pdf-actions" style={{ marginBottom: 10 }}>
                  <p>📄 <strong>{file.fileName}</strong> {file.isPaid && <Tag color="red">Paid</Tag>}</p>
                  <Button type="link" onClick={() => window.open(file.url, "_blank")}>View</Button>

                  <Button
                    type="primary"
                    loading={downloading === index}
                    onClick={() =>
                      addHeaderToPdf(file.url, institution, file.fileName, index)
                    }
                  >
                    Download with Header
                  </Button>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PdfList;
