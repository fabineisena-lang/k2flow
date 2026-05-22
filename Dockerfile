FROM nginx:alpine
COPY k2company-site.html /usr/share/nginx/html/index.html
COPY k2flow-app.html /usr/share/nginx/html/app.html
COPY k2flow-master.html /usr/share/nginx/html/master.html
RUN echo 'server { listen 80; root /usr/share/nginx/html; location /app { try_files /app.html =404; } location /master { try_files /master.html =404; } location / { try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
