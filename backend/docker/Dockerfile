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
RUN printf "alias cls='clear'\nalias ll='ls -la'\nPROMPT_COMMAND='PS1=\"\\[\\e[32m\\]\${TERM_USER:-user}@vocodeai\\[\\e[0m\\]:\\[\\e[34;1m\\]\${PWD/#\\/workspace/~\\/workspace}\\[\\e[0m\\]\\$ \"'\n" > /etc/vocode_bashrc && \
    echo ". /etc/vocode_bashrc" >> /etc/bash.bashrc && \
    echo ". /etc/vocode_bashrc" >> /root/.bashrc

# Verify installations (optional but useful)
RUN node -v && npm -v && java -version && mvn -v && python3 --version && convert -version

# Start bash shell
CMD ["bash"]
