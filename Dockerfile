FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates ffmpeg python3 yt-dlp \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

ARG SITE_URL=https://mateusrech255-sketch.github.io
ARG SITE_BASE_PATH=/site-da-fp-agency
ARG PUBLIC_VIDEO_API_URL=http://localhost:3001
ENV SITE_URL=${SITE_URL}
ENV SITE_BASE_PATH=${SITE_BASE_PATH}
ENV PUBLIC_VIDEO_API_URL=${PUBLIC_VIDEO_API_URL}

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["npm", "run", "start"]
