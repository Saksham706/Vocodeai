import React, { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import "../../styles/viewers.css";

export default function PdfViewer({ content, fileName }) {
  const pdfUrl = useMemo(() => {
    if (!content) return "";
    if (typeof content === "string" && content.startsWith("data:application/pdf")) {
      return content;
    }
    if (typeof content === "string" && content.startsWith("data:")) {
      return content;
    }
    return `data:application/pdf;base64,${content}`;
  }, [content]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = fileName || "document.pdf";
    a.click();
  };

  return (
    <div className="custom-viewer-container pdf-viewer-wrap">
      {/* PDF Toolbar */}
      <div className="custom-viewer-toolbar pdf-toolbar">
        <div className="viewer-toolbar-left">
          <div className="pdf-logo-badge">PDF</div>
          <span className="viewer-toolbar-title">{fileName}</span>
          <span className="viewer-badge pdf-badge">PDF Document</span>
        </div>

        <div className="viewer-toolbar-right">
          <button className="viewer-tool-btn" onClick={handleDownload} title="Download PDF">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* PDF Stage */}
      <div className="pdf-stage-area">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={fileName}
            className="pdf-embedded-frame"
          />
        ) : (
          <div className="viewer-loading-box">
            <span>No PDF content loaded</span>
          </div>
        )}
      </div>
    </div>
  );
}

