FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_BASE_URL=http://localhost:5000/api
ARG VITE_SOCKET_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN cat <<'EOF' > /etc/nginx/conf.d/default.conf
server {
	listen 80;
	server_name _;
	root /usr/share/nginx/html;
	index index.html;
	location / {
		try_files $uri $uri/ /index.html;
	}
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
