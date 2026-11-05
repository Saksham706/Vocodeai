# Use official Node 20 image (multi‑arch safe)
FROM node:20-bookworm

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install additional runtimes & tools (including ImageMagick)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    openjdk-17-jdk \
    gcc \
    g++ \
    git \
    curl \
    maven \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Add cls command & configure dynamic prompt and aliases
RUN printf '#!/bin/sh\nclear\n' > /usr/local/bin/cls && chmod +x /usr/local/bin/cls
RUN printf "export HOME=/workspace\nexport TERM=xterm-256color\ncd /workspace 2>/dev/null || true\nalias cls='clear'\nalias ll='ls -la --color=auto'\nalias ls='ls --color=auto'\nprompt_func() {\n  local p=\"\${PWD}\"\n  PS1=\"\\[\\e[32m\\]\${TERM_USER:-user}@vocodeai\\[\\e[0m\\]:\\[\\e[34;1m\\]\${p}\\[\\e[0m\\]\\$ \"\n}\nPROMPT_COMMAND=prompt_func\n" > /etc/vocode_bashrc && \
    echo ". /etc/vocode_bashrc" >> /etc/bash.bashrc && \
    echo ". /etc/vocode_bashrc" >> /root/.bashrc

# Global Git configuration: Ignore compiled binaries, bytecode and system junk across all repos
RUN printf "*.class\n*.out\n*.o\n*.obj\n*.exe\n*.pyc\n*.pyo\n*.pyd\n*.so\n*.dll\n*.dylib\n*.pdb\n*.idb\n*.ilk\n*.map\na.out\na.exe\n.DS_Store\nthumbs.db\n.workspace.json\nnode_modules/\ndist/\nbuild/\n__pycache__/\n.venv/\n.pytest_cache/\n" > /etc/gitignore_global && \
    git config --system core.excludesfile /etc/gitignore_global && \
    mkdir -p /etc/git-templates/info && \
    cp /etc/gitignore_global /etc/git-templates/info/exclude && \
    git config --system init.templateDir /etc/git-templates

# Verify installations (optional but useful)
RUN node -v && npm -v && java -version && mvn -v && python3 --version && convert -version

# Start bash shell
CMD ["bash"]
