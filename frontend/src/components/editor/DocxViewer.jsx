import React, { useState, useEffect } from "react";
import mammoth from "mammoth";
import { FileText, Download, Printer, RotateCcw, AlertCircle } from "lucide-react";
import "../../styles/viewers.css";

export default function DocxViewer({ content, fileName }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function parseDocx() {
      if (!content) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let arrayBuffer;
        if (typeof content === "string" && content.startsWith("data:")) {
          const base64Data = content.replace(/^data:.*?;base64,/, "");
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          arrayBuffer = bytes.buffer;
        } else if (content instanceof ArrayBuffer) {
          arrayBuffer = content;
        } else {
          // Fallback: convert string to buffer
          const encoder = new TextEncoder();
          arrayBuffer = encoder.encode(content).buffer;
        }

        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (!isCancelled) {
          const cleanHtml = result.value || "<p>Document is empty</p>";
          setHtml(cleanHtml);

          // Approximate word count
          const textOnly = cleanHtml.replace(/<[^>]*>/g, " ");
          const words = textOnly.trim().split(/\s+/).filter(Boolean).length;
          setWordCount(words);
          setLoading(false);
        }
      } catch (err) {
        console.error("DOCX parse error:", err);
        if (!isCancelled) {
          setError(err.message || "Failed to render Word document");
          setLoading(false);
        }
      }
    }

    parseDocx();

    return () => {
      isCancelled = true;
    };
  }, [content]);

  const handleDownload = () => {
    if (!content) return;
    const a = document.createElement("a");
    a.href = content.startsWith("data:")
      ? content
      : `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${btoa(content)}`;
    a.download = fileName || "document.docx";
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="custom-viewer-container docx-viewer-wrap">
      {/* Office Word Toolbar */}
      <div className="custom-viewer-toolbar docx-toolbar">
        <div className="viewer-toolbar-left">
          <div className="word-logo-badge">W</div>
          <span className="viewer-toolbar-title">{fileName}</span>
          <span className="viewer-badge word-badge">Word Document</span>
          {wordCount > 0 && (
            <span className="viewer-badge-dim">{wordCount} words</span>
          )}
        </div>

        <div className="viewer-toolbar-right">
          <button className="viewer-tool-btn" onClick={handlePrint} title="Print Document">
            <Printer size={14} />
          </button>
          <button className="viewer-tool-btn" onClick={handleDownload} title="Download Word Document">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Main Document Reading Stage (Formatted Paper Layout) */}
      <div className="docx-stage-area">
        {loading && (
          <div className="viewer-loading-box">
            <RotateCcw size={22} className="spin-icon" />
            <span>Reading Word Document...</span>
          </div>
        )}

        {error && (
          <div className="viewer-error-box">
            <AlertCircle size={24} color="#EF4444" />
            <h4>Could not preview Word Document</h4>
            <p>{error}</p>
            <button className="viewer-tool-btn btn-fallback-dl" onClick={handleDownload}>
              <Download size={14} />
              <span>Download File to View Locally</span>
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="docx-paper-page">
            <div
              className="docx-content-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

