import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  Mic,
  Atom,
  Server,
  Zap,
  Cpu,
  Coffee,
  Code2,
  Layout,
  Eye,
  ArrowRight,
  X,
  FileCode,
  Folder,
  Check,
  Loader2,
} from "lucide-react";
import { STARTER_TEMPLATES } from "../../config/templatesData";
import { getStarterTemplates } from "../../services/workspaceApi";
import "../../styles/templates.css";

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "ai", label: "AI & Voice" },
  { id: "frontend", label: "Frontend & Web" },
  { id: "backend", label: "Backend & APIs" },
  { id: "languages", label: "Languages & DSA" },
];

function getTemplateIcon(iconName, color = "#10B981") {
  const props = { size: 24, style: { color } };
  switch (iconName) {
    case "Mic":
      return <Mic {...props} />;
    case "Atom":
      return <Atom {...props} />;
    case "Server":
      return <Server {...props} />;
    case "Zap":
      return <Zap {...props} />;
    case "Cpu":
      return <Cpu {...props} />;
    case "Coffee":
      return <Coffee {...props} />;
    case "Layout":
      return <Layout {...props} />;
    case "Code2":
    default:
      return <Code2 {...props} />;
  }
}

export default function TemplatesView({
  onUseTemplate,
  onBack,
  isCreating = false,
}) {
  const [templates, setTemplates] = useState(STARTER_TEMPLATES);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // File Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [activePreviewPath, setActivePreviewPath] = useState(null);

  // Custom Name / Spin up Modal
  const [launchTemplate, setLaunchTemplate] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");

  useEffect(() => {
    let isMounted = true;
    getStarterTemplates()
      .then((serverTemplates) => {
        if (isMounted && Array.isArray(serverTemplates) && serverTemplates.length > 0) {
          setTemplates(serverTemplates);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchCategory =
      activeCategory === "all" || tpl.category === activeCategory;
    const query = search.trim().toLowerCase();
    if (!query) return matchCategory;

    const matchText =
      tpl.title.toLowerCase().includes(query) ||
      tpl.description.toLowerCase().includes(query) ||
      tpl.tags?.some((t) => t.toLowerCase().includes(query));

    return matchCategory && matchText;
  });

  const handleOpenLaunchModal = (tpl) => {
    setLaunchTemplate(tpl);
    setWorkspaceName(`${tpl.title}`);
  };

  const handleConfirmLaunch = () => {
    if (!launchTemplate) return;
    const finalName = workspaceName.trim() || `${launchTemplate.title} App`;
    onUseTemplate(launchTemplate.id, finalName);
    setLaunchTemplate(null);
  };

  const handleOpenPreview = (tpl) => {
    setPreviewTemplate(tpl);
    const firstFile = tpl.recommendedFile || tpl.files?.[0]?.path;
    setActivePreviewPath(firstFile);
  };

  const activeFileObject = previewTemplate?.files?.find(
    (f) => f.path === activePreviewPath
  );

  return (
    <div className="templates-tab-container">
      {/* Top Banner Header */}
      <div className="templates-header-section">
        <div className="templates-title-group">
          <div className="templates-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>PROJECT STARTERS</span>
          </div>
          <h1 className="templates-main-title">
            Pre-configured <span className="dash-heading-accent">Templates</span>
          </h1>
          <p className="templates-sub-title">
            Spin up production-grade AI voice companions, full-stack APIs, and
            sandboxed environments with zero boilerplate.
          </p>
        </div>

        {/* Search & Actions Bar */}
        <div className="templates-actions-bar">
          <div className="templates-search-wrapper">
            <Search size={16} className="templates-search-icon" />
            <input
              type="text"
              placeholder="Search templates, frameworks, runtimes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="templates-search-input"
            />
            {search && (
              <button
                className="templates-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear Search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="templates-categories-row">
        {CATEGORIES.map((cat) => {
          const count =
            cat.id === "all"
              ? templates.length
              : templates.filter((t) => t.category === cat.id).length;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              className={`category-pill-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="category-count-badge">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="templates-grid">
          {filteredTemplates.map((tpl) => (
            <div key={tpl.id} className="template-card">
              {/* Card Top: Icon & Badge */}
              <div className="template-card-top">
                <div
                  className="template-icon-bubble"
                  style={{
                    backgroundColor: `${tpl.color || "#10B981"}18`,
                    borderColor: `${tpl.color || "#10B981"}44`,
                  }}
                >
                  {getTemplateIcon(tpl.icon, tpl.color)}
                </div>

                <div className="template-badge-group">
                  {tpl.badge && (
                    <span
                      className="template-card-badge"
                      style={{
                        backgroundColor: `${tpl.color || "#10B981"}20`,
                        color: tpl.color || "#10B981",
                        borderColor: `${tpl.color || "#10B981"}40`,
                      }}
                    >
                      {tpl.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="template-card-body">
                <h3 className="template-card-title">{tpl.title}</h3>
                <p className="template-card-desc">{tpl.description}</p>
              </div>

              {/* Tag Badges */}
              <div className="template-card-tags">
                {tpl.tags?.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="template-tag">
                    {tag}
                  </span>
                ))}
                {tpl.tags && tpl.tags.length > 3 && (
                  <span className="template-tag more">
                    +{tpl.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="template-card-actions">
                <button
                  className="btn-template-preview"
                  onClick={() => handleOpenPreview(tpl)}
                  title="Inspect starter files"
                >
                  <Eye size={15} />
                  <span>Files ({tpl.files?.length || 0})</span>
                </button>

                <button
                  className="btn-template-use"
                  disabled={isCreating}
                  onClick={() => handleOpenLaunchModal(tpl)}
                >
                  {isCreating ? (
                    <Loader2 size={16} className="spin-icon" />
                  ) : (
                    <>
                      <span>Use Template</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="templates-empty-state">
          <Sparkles size={36} className="empty-icon" />
          <h3>No templates found</h3>
          <p>
            No project starters matched your search query "<strong>{search}</strong>".
          </p>
          <button
            className="btn-empty-reset"
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* MODAL 1: PREVIEW STARTER FILES */}
      {previewTemplate && (
        <div
          className="template-modal-backdrop"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="template-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-modal-header">
              <div className="preview-title-wrap">
                <div
                  className="preview-icon-mini"
                  style={{
                    backgroundColor: `${previewTemplate.color || "#10B981"}22`,
                    borderColor: `${previewTemplate.color || "#10B981"}44`,
                  }}
                >
                  {getTemplateIcon(previewTemplate.icon, previewTemplate.color)}
                </div>
                <div>
                  <h2>{previewTemplate.title}</h2>
                  <p>{previewTemplate.subtitle || previewTemplate.description}</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setPreviewTemplate(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="preview-modal-body">
              {/* File list sidebar */}
              <div className="preview-file-list">
                <div className="file-list-heading">Starter Files</div>
                {previewTemplate.files?.map((f) => {
                  const isSelected = f.path === activePreviewPath;
                  return (
                    <div
                      key={f.path}
                      className={`preview-file-item ${isSelected ? "selected" : ""}`}
                      onClick={() => setActivePreviewPath(f.path)}
                    >
                      <FileCode size={14} className="file-icon" />
                      <span className="file-path-text">{f.path}</span>
                    </div>
                  );
                })}
              </div>

              {/* File Content Preview */}
              <div className="preview-code-pane">
                <div className="code-pane-toolbar">
                  <span className="current-file-badge">
                    {activePreviewPath || "No file selected"}
                  </span>
                </div>
                <pre className="code-content-box">
                  <code>
                    {activeFileObject?.content ||
                      "// File content not available in preview"}
                  </code>
                </pre>
              </div>
            </div>

            <div className="preview-modal-footer">
              <button
                className="btn-preview-cancel"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </button>
              <button
                className="btn-template-use-primary"
                onClick={() => {
                  const tpl = previewTemplate;
                  setPreviewTemplate(null);
                  handleOpenLaunchModal(tpl);
                }}
              >
                <span>Use This Template</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM / NAME WORKSPACE */}
      {launchTemplate && (
        <div
          className="template-modal-backdrop"
          onClick={() => setLaunchTemplate(null)}
        >
          <div
            className="template-launch-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="launch-modal-header">
              <div
                className="template-icon-bubble mini"
                style={{
                  backgroundColor: `${launchTemplate.color || "#10B981"}22`,
                  borderColor: `${launchTemplate.color || "#10B981"}44`,
                }}
              >
                {getTemplateIcon(launchTemplate.icon, launchTemplate.color)}
              </div>
              <div>
                <h2>Create from Template</h2>
                <p>Spinning up: {launchTemplate.title}</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setLaunchTemplate(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="launch-modal-body">
              <label className="launch-input-label">Workspace Name</label>
              <input
                type="text"
                className="launch-name-input"
                value={workspaceName}
                autoFocus
                placeholder="e.g. My Voice Assistant"
                onChange={(e) => setWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmLaunch();
                  if (e.key === "Escape") setLaunchTemplate(null);
                }}
              />
              <div className="launch-features-included">
                <span className="included-title">What's Included:</span>
                <ul>
                  <li>
                    <Check size={14} className="check-icon" />
                    <span>
                      {launchTemplate.files?.length || "Pre-configured"} starter
                      files and directory scaffolding
                    </span>
                  </li>
                  <li>
                    <Check size={14} className="check-icon" />
                    <span>Isolated Cloud Docker sandbox environment</span>
                  </li>
                  <li>
                    <Check size={14} className="check-icon" />
                    <span>Monaco editor, Cloud Terminal, and Live Preview</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="launch-modal-footer">
              <button
                className="btn-preview-cancel"
                onClick={() => setLaunchTemplate(null)}
              >
                Cancel
              </button>
              <button
                className="btn-launch-confirm"
                disabled={isCreating}
                onClick={handleConfirmLaunch}
              >
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="spin-icon" />
                    <span>Spinning Up...</span>
                  </>
                ) : (
                  <>
                    <span>Spin Up Workspace</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

