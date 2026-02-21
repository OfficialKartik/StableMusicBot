FROM node:22

RUN apt update && apt install -y ffmpeg yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "src/index.js"]
