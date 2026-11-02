import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Replace,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  FoldVertical,
  X,
  FileCode2,
  CaseSensitive,
  WholeWord,
  Regex,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import * as fileApi from "../../services/fileApi";
import "../../styles/sidebar.css";
import "../../styles/globalsearch.css";

export default function GlobalSearch({ workspaceId: propWsId, onClose }) {
  const {
    workspaceId: ctxWsId,
    currentProject,
    currentWorkspace,
    openFile,
    fileContents,
  } = useWorkspace();
  const { accessToken } = useAuth();

  const wsId =
    propWsId ||
    ctxWsId ||
    currentProject ||
    currentWorkspace?._id ||
    currentWorkspace?.id;

  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);

  // Search Flags
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);
  const [isRegex, setIsRegex] = useState(false);

  // Include / Exclude Filters
  const [showFilters, setShowFilters] = useState(false);
  const [includePattern, setIncludePattern] = useState("");
  const [excludePattern, setExcludePattern] = useState("");

  const [results, setResults] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState(new Set());

  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const performSearch = useCallback(
    async (q = query) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setTotalMatches(0);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        let backendResults = [];
        let totalCount = 0;

        if (accessToken && wsId) {
          const data = await fileApi.searchFiles(accessToken, wsId, {
            query: trimmed,
            isCaseSensitive,
            isWholeWord,
            isRegex,
            includePattern,
            excludePattern,
          });
          backendResults = data.results || [];
          totalCount = data.totalMatches || 0;
        }

        // Also check client-side in-memory fileContents cache
        // to catch unsaved or active edits immediately
        if (fileContents && typeof fileContents === "object") {
          let pattern = trimmed;
          if (!isRegex) pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          if (isWholeWord) pattern = `\\b${pattern}\\b`;
          const flags = isCaseSensitive ? "g" : "gi";

          try {
            const rx = new RegExp(pattern, flags);
            for (const [fPath, content] of Object.entries(fileContents)) {
              if (typeof content !== "string") continue;
              if (includePattern && !fPath.toLowerCase().includes(includePattern.toLowerCase())) continue;
              if (excludePattern && fPath.toLowerCase().includes(excludePattern.toLowerCase())) continue;

              const lines = content.split("\n");
              const clientMatches = [];
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                rx.lastIndex = 0;
                let m;
                while ((m = rx.exec(line)) !== null) {
                  clientMatches.push({
                    lineNumber: i + 1,
                    lineText: line,
                    matchIndex: m.index,
                    matchLength: m[0].length,
                  });
                  if (!rx.global) break;
                }
              }

              if (clientMatches.length > 0) {
                const existingIdx = backendResults.findIndex((r) => r.path === fPath);
                if (existingIdx >= 0) {
                  totalCount = totalCount - backendResults[existingIdx].matches.length + clientMatches.length;
                  backendResults[existingIdx].matches = clientMatches;
                } else {
                  backendResults.push({
                    path: fPath,
                    fileName: fPath.split("/").pop(),
                    matches: clientMatches,
                  });
                  totalCount += clientMatches.length;
                }
              }
            }
          } catch {}
        }

        setResults(backendResults);
        setTotalMatches(totalCount);
      } catch (err) {
        console.warn("Global search error:", err);
        setResults([]);
        setTotalMatches(0);
      } finally {
        setIsSearching(false);
      }
    },
    [wsId, accessToken, query, isCaseSensitive, isWholeWord, isRegex, includePattern, excludePattern, fileContents]
  );

  // Debounced auto-search as user types
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!query.trim()) {
      setResults([]);
      setTotalMatches(0);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, performSearch]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      performSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setTotalMatches(0);
    searchInputRef.current?.focus();
  };

  const handleToggleCollapse = (filePath) => {
    setCollapsedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) next.delete(filePath);
      else next.add(filePath);
      return next;
    });
  };

  const handleCollapseAll = () => {
    if (collapsedFiles.size === results.length) {
      setCollapsedFiles(new Set());
    } else {
      setCollapsedFiles(new Set(results.map((r) => r.path)));
    }
  };

  const handleReplaceAll = async () => {
    if (!query.trim() || !wsId || !accessToken) return;
    try {
      await fileApi.replaceInFiles(accessToken, wsId, {
        query,
        replaceText,
        isCaseSensitive,
        isWholeWord,
        isRegex,
      });
      performSearch(query);
    } catch (err) {
      console.error("Replace all error:", err);
    }
  };

  const handleReplaceSingleFile = async (e, filePath) => {
    e.stopPropagation();
    if (!query.trim() || !wsId || !accessToken) return;
    try {
      await fileApi.replaceInFiles(accessToken, wsId, {
        query,
        replaceText,
        filePath,
        isCaseSensitive,
        isWholeWord,
        isRegex,
      });
      performSearch(query);
    } catch (err) {
      console.error("Replace file error:", err);
    }
  };

  const handleMatchClick = (filePath, lineNumber) => {
    openFile(filePath, lineNumber);
  };

  return (
    <aside className="ide-sidebar global-search-sidebar" aria-label="Search Workspace">
      {/* 1. Header */}
      <div className="sidebar-explorer-header">
        <span className="explorer-header-title">SEARCH</span>
        <div className="search-header-actions">
          <button
            type="button"
            className="explorer-header-btn"
            onClick={() => performSearch(query)}
            title="Refresh Search"
            aria-label="Refresh Search"
          >
            <RefreshCw size={13} className={isSearching ? "spin" : ""} />
          </button>
          <button
            type="button"
            className="explorer-header-btn"
            onClick={handleCollapseAll}
            title={collapsedFiles.size === results.length ? "Expand All" : "Collapse All"}
            aria-label="Collapse All"
          >
            <FoldVertical size={13} />
          </button>
          <button
            type="button"
            className="explorer-header-btn"
            onClick={handleClear}
            title="Clear Search"
            aria-label="Clear Search"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* 2. Inputs Container */}
      <div className="search-inputs-container">
        {/* Search Input Row */}
        <div className="search-input-box-wrap">
          <button
            type="button"
            className="search-replace-toggle-btn"
            onClick={() => setIsReplaceOpen((prev) => !prev)}
            title="Toggle Replace"
            aria-label="Toggle Replace"
          >
            {isReplaceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          <div className="search-field-inner">
            <input
              ref={searchInputRef}
              type="text"
              className="search-text-input"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                className="search-clear-input-btn"
                onClick={handleClear}
                title="Clear"
              >
                <X size={12} />
              </button>
            )}

            {/* Toggle Badges (Match Case, Whole Word, Regex) */}
            <div className="search-regex-toggles">
              <button
                type="button"
                className={`search-toggle-btn ${isCaseSensitive ? "active" : ""}`}
                onClick={() => setIsCaseSensitive((prev) => !prev)}
                title="Match Case (Alt+C)"
              >
                <CaseSensitive size={13} />
              </button>
              <button
                type="button"
                className={`search-toggle-btn ${isWholeWord ? "active" : ""}`}
                onClick={() => setIsWholeWord((prev) => !prev)}
                title="Match Whole Word (Alt+W)"
              >
                <WholeWord size={13} />
              </button>
              <button
                type="button"
                className={`search-toggle-btn ${isRegex ? "active" : ""}`}
                onClick={() => setIsRegex((prev) => !prev)}
                title="Use Regular Expression (Alt+R)"
              >
                <Regex size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Replace Input Row (Collapsible) */}
        {isReplaceOpen && (
          <div className="search-replace-row">
            <div className="search-replace-spacer" />
            <div className="search-field-inner">
              <input
                type="text"
                className="search-text-input"
                placeholder="Replace"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                spellCheck={false}
              />
              <button
                type="button"
                className="search-replace-all-btn"
                onClick={handleReplaceAll}
                title="Replace All (Ctrl+Alt+Enter)"
                disabled={!query.trim() || totalMatches === 0}
              >
                <Replace size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Toggle Details (files to include/exclude) */}
        <div className="search-details-toggle">
          <button
            type="button"
            className="search-details-toggle-btn"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <span>{showFilters ? "▾ files to include / exclude" : "▸ files to include / exclude"}</span>
          </button>
        </div>

        {showFilters && (
          <div className="search-filters-pane">
            <div className="search-filter-row">
              <span className="search-filter-label">files to include</span>
              <input
                type="text"
                className="search-filter-input"
                placeholder="e.g. *.js, src/**"
                value={includePattern}
                onChange={(e) => setIncludePattern(e.target.value)}
              />
            </div>
            <div className="search-filter-row">
              <span className="search-filter-label">files to exclude</span>
              <input
                type="text"
                className="search-filter-input"
                placeholder="e.g. node_modules/**"
                value={excludePattern}
                onChange={(e) => setExcludePattern(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Results Section */}
      <div className="search-results-container">
        {isSearching && (
          <div className="search-status-bar">
            <span>Searching workspace files...</span>
          </div>
        )}

        {!isSearching && query.trim() && (
          <div className="search-status-bar">
            <span>
              {totalMatches > 0
                ? `${totalMatches} result${totalMatches > 1 ? "s" : ""} in ${results.length} file${
                    results.length > 1 ? "s" : ""
                  }`
                : "No results found"}
            </span>
          </div>
        )}

        {results.map((file) => {
          const isCollapsed = collapsedFiles.has(file.path);
          return (
            <div key={file.path} className="search-file-group">
              <div
                className="search-file-header"
                onClick={() => handleToggleCollapse(file.path)}
                title={file.path}
              >
                <span className="search-file-chevron">
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                </span>
                <FileCode2 size={13} className="search-file-icon" />
                <span className="search-file-name">{file.fileName}</span>
                <span className="search-file-path">{file.path}</span>
                <span className="search-match-count-badge">{file.matches.length}</span>

                {isReplaceOpen && (
                  <button
                    type="button"
                    className="search-file-replace-btn"
                    onClick={(e) => handleReplaceSingleFile(e, file.path)}
                    title={`Replace in ${file.fileName}`}
                  >
                    <Replace size={11} />
                  </button>
                )}
              </div>

              {!isCollapsed && (
                <div className="search-file-matches">
                  {file.matches.map((m, idx) => (
                    <div
                      key={`${file.path}-${m.lineNumber}-${idx}`}
                      className="search-match-item"
                      onClick={() => handleMatchClick(file.path, m.lineNumber)}
                      title={`Line ${m.lineNumber}: ${m.lineText}`}
                    >
                      <span className="search-match-lineno">{m.lineNumber}</span>
                      <span className="search-match-text">
                        {m.lineText.slice(0, m.matchIndex)}
                        <span className="search-highlight">
                          {m.lineText.slice(m.matchIndex, m.matchIndex + m.matchLength)}
                        </span>
                        {m.lineText.slice(m.matchIndex + m.matchLength)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {!isSearching && !query.trim() && (
          <div className="search-placeholder-view">
            <p>Type keywords to search across all workspace files in real-time.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
