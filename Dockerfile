FROM archlinux:base as builder
RUN pacman -Sy nodejs-lts-hydrogen npm openssl --noconfirm
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "start:prod"]