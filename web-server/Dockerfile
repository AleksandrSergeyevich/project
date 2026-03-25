FROM nginx:alpine

# Папка куда worker смонтирует распакованный архив
RUN mkdir -p /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
