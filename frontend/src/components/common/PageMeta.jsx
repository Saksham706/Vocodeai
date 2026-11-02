import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_META = {
  "/": {
    title: "VocodeAI — Ultra-Fast AI Cloud IDE & Voice-Driven Development Platform",
    description:
      "VocodeAI is an ultra-fast, AI-native cloud development environment featuring instant Docker container sandboxing, voice coding, multi-tab terminal, Git integration, and AI pair programming.",
  },
  "/docs": {
    title: "Documentation & Developer Guide — VocodeAI",
    description:
      "Explore comprehensive VocodeAI architecture guides, Docker sandbox lifecycle, Git integration, and AI voice assistance capabilities.",
  },
  "/dashboard": {
    title: "Workspaces Dashboard — VocodeAI",
    description: "Manage, create, and launch your cloud container workspaces on VocodeAI.",
  },
  "/login": {
    title: "Sign In — VocodeAI",
    description: "Log in to your VocodeAI account and access your cloud coding workspaces.",
  },
  "/signup": {
    title: "Get Started Free — VocodeAI",
    description: "Create your VocodeAI account and start building with AI in isolated cloud environments.",
  },
  "/forgot": {
    title: "Reset Password — VocodeAI",
    description: "Recover access to your VocodeAI account securely.",
  },
};

export default function PageMeta() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let meta = ROUTE_META[path];

    if (!meta && path.startsWith("/workspace/")) {
      meta = {
        title: "Workspace — VocodeAI Cloud IDE",
        description: "Editing, compiling, and running code in a secure container sandbox.",
      };
    }

    if (meta) {
      document.title = meta.title;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", meta.description);
      }

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", meta.title);
      }

      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute("content", meta.title);
      }
    }
  }, [location.pathname]);

  return null;
}

