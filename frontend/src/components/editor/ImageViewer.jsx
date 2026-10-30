import React, { useState, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Download, Image as ImageIcon } from "lucide-react";
import "../../styles/viewers.css";

export default function ImageViewer({ src, fileName }) {
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState(null);
  const imgRef = useRef(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const handleResetZoom = () => setZoom(1);
  const handleFit = () => setZoom(1);

  const handleImageLoad = (e) => {
    setDimensions({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    });
  };

  const handleDownload = () => {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = fileName || "image";
    a.click();
  };

  return (
    <div className="custom-viewer-container image-viewer-wrap">
      {/* Viewer Header / Toolbar */}
      <div className="custom-viewer-toolbar">
        <div className="viewer-toolbar-left">
          <ImageIcon size={15} color="#38BDF8" />
          <span className="viewer-toolbar-title">{fileName}</span>
          {dimensions && (
            <span className="viewer-badge">
              {dimensions.width} × {dimensions.height} px
            </span>
          )}
        </div>

        <div className="viewer-toolbar-right">
          <button className="viewer-tool-btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={14} />
          </button>
          <span className="viewer-zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="viewer-tool-btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={14} />
          </button>
          <button className="viewer-tool-btn" onClick={handleResetZoom} title="Original Size (100%)">
            <RotateCcw size={13} />
          </button>
          <button className="viewer-tool-btn" onClick={handleFit} title="Fit to Screen">
            <Maximize2 size={13} />
          </button>
          <div className="viewer-divider" />
          <button className="viewer-tool-btn" onClick={handleDownload} title="Download Image">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Main Image Stage with Checkered Backdrop */}
      <div className="image-stage-area">
        <div className="image-checkerboard-canvas">
          <img
            ref={imgRef}
            src={src}
            alt={fileName}
            className="viewer-rendered-img"
            style={{ transform: `scale(${zoom})` }}
            onLoad={handleImageLoad}
          />
        </div>
      </div>
    </div>
  );
}

