import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { Download, Search, Table, RotateCcw, AlertCircle } from "lucide-react";
import "../../styles/viewers.css";

export default function ExcelViewer({ content, fileName }) {
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function parseWorkbook() {
      if (!content) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let wb;
        if (typeof content === "string" && content.startsWith("data:")) {
          const base64Data = content.replace(/^data:.*?;base64,/, "");
          wb = XLSX.read(base64Data, { type: "base64" });
        } else if (typeof content === "string") {
          // Plain CSV or text
          wb = XLSX.read(content, { type: "string" });
        } else {
          wb = XLSX.read(content, { type: "array" });
        }

        if (!isCancelled && wb && wb.SheetNames && wb.SheetNames.length > 0) {
          setWorkbook(wb);
          setSheetNames(wb.SheetNames);
          setActiveSheet(wb.SheetNames[0]);
          setLoading(false);
        }
      } catch (err) {
        console.error("Excel parse error:", err);
        if (!isCancelled) {
          setError(err.message || "Failed to parse spreadsheet");
          setLoading(false);
        }
      }
    }

    parseWorkbook();

    return () => {
      isCancelled = true;
    };
  }, [content]);

  // Convert active worksheet to 2D array of rows
  const sheetData = useMemo(() => {
    if (!workbook || !activeSheet || !workbook.Sheets[activeSheet]) return [];
    try {
      const sheet = workbook.Sheets[activeSheet];
      return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    } catch {
      return [];
    }
  }, [workbook, activeSheet]);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return sheetData;
    const q = searchQuery.toLowerCase();
    return sheetData.filter((row, idx) => {
      if (idx === 0) return true; // keep header
      return row.some((cell) => String(cell).toLowerCase().includes(q));
    });
  }, [sheetData, searchQuery]);

  const maxCols = useMemo(() => {
    return sheetData.reduce((max, row) => Math.max(max, row?.length || 0), 0);
  }, [sheetData]);

  const handleDownload = () => {
    if (!content) return;
    const a = document.createElement("a");
    a.href = content.startsWith("data:")
      ? content
      : `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${btoa(content)}`;
    a.download = fileName || "spreadsheet.xlsx";
    a.click();
  };

  // Helper: column index to letters (0 -> A, 1 -> B, 26 -> AA)
  const getColLetter = (index) => {
    let letter = "";
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  return (
    <div className="custom-viewer-container excel-viewer-wrap">
      {/* Excel Toolbar */}
      <div className="custom-viewer-toolbar excel-toolbar">
        <div className="viewer-toolbar-left">
          <div className="excel-logo-badge">X</div>
          <span className="viewer-toolbar-title">{fileName}</span>
          <span className="viewer-badge excel-badge">Excel Spreadsheet</span>
          {sheetData.length > 0 && (
            <span className="viewer-badge-dim">
              {sheetData.length} rows × {maxCols} cols
            </span>
          )}
        </div>

        <div className="viewer-toolbar-right">
          <div className="excel-search-box">
            <Search size={13} className="excel-search-icon" />
            <input
              type="text"
              placeholder="Search cells..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="excel-search-input"
            />
          </div>

          <button className="viewer-tool-btn" onClick={handleDownload} title="Download Spreadsheet">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="excel-grid-area">
        {loading && (
          <div className="viewer-loading-box">
            <RotateCcw size={22} className="spin-icon" />
            <span>Loading Spreadsheet...</span>
          </div>
        )}

        {error && (
          <div className="viewer-error-box">
            <AlertCircle size={24} color="#EF4444" />
            <h4>Could not load spreadsheet</h4>
            <p>{error}</p>
            <button className="viewer-tool-btn btn-fallback-dl" onClick={handleDownload}>
              <Download size={14} />
              <span>Download File to View in Excel</span>
            </button>
          </div>
        )}

        {!loading && !error && filteredRows.length === 0 && (
          <div className="viewer-loading-box">
            <span>No data in this sheet</span>
          </div>
        )}

        {!loading && !error && filteredRows.length > 0 && (
          <div className="excel-table-scroll-wrapper">
            <table className="excel-sheet-table">
              <thead>
                <tr>
                  <th className="excel-corner-cell">#</th>
                  {Array.from({ length: maxCols }).map((_, cIdx) => (
                    <th key={cIdx} className="excel-col-header">
                      {getColLetter(cIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="excel-row-num">{rIdx + 1}</td>
                    {Array.from({ length: maxCols }).map((_, cIdx) => (
                      <td key={cIdx} className="excel-cell">
                        {row[cIdx] !== undefined && row[cIdx] !== null
                          ? String(row[cIdx])
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sheet Tabs Bar at Bottom (like real Excel) */}
      {sheetNames.length > 0 && (
        <div className="excel-sheets-bar">
          <div className="excel-sheet-tabs-list">
            {sheetNames.map((name) => (
              <button
                key={name}
                className={`excel-sheet-tab ${activeSheet === name ? "active" : ""}`}
                onClick={() => {
                  setActiveSheet(name);
                  setSearchQuery("");
                }}
              >
                <Table size={12} />
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

