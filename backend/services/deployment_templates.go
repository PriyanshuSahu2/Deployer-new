package services

const NodeDockerfileTemplate = `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN %s
ENV PORT=%d
EXPOSE %d
CMD %s
`

const BunDockerfileTemplate = `
FROM oven/bun:alpine
WORKDIR /app
COPY package*.json bun.lockb* ./
RUN bun install
COPY . .
RUN %s
ENV PORT=%d
EXPOSE %d
CMD %s
`

const SystemdServiceTemplate = `[Unit]
Description=%[1]s service Docker container
Requires=docker.service
After=docker.service

[Service]
Restart=always
RestartSec=10
ExecStartPre=-/usr/bin/docker stop %[2]s
ExecStartPre=-/usr/bin/docker rm %[2]s
ExecStart=/usr/bin/docker run --name %[2]s --rm -p %[3]d:%[3]d %[2]s
ExecStop=/usr/bin/docker stop %[2]s

SyslogIdentifier=%[1]s

[Install]
WantedBy=multi-user.target
`

const DockerInstallScript = `
		if ! command -v docker &> /dev/null; then
			curl -fsSL https://get.docker.com -o get-docker.sh
			sudo sh get-docker.sh
			sudo usermod -aG docker $USER
		fi
		sudo docker --version
		`

const NginxStaticTemplate = `
		server {
			listen 80;
			server_name %s;

			root %s;
			index index.html index.htm;

			location / {
				try_files $uri $uri/ /index.html;
			}
		}
	`

const NginxProxyTemplate = `
		server {
			listen 80;
			server_name %s;

			location / {
				proxy_pass http://localhost:%s;

				proxy_http_version 1.1;
				proxy_set_header Upgrade $http_upgrade;
				proxy_set_header Connection "upgrade";
				proxy_set_header Host $host;
				proxy_cache_bypass $http_upgrade;
			}
		}
	`

const NginxSSLStaticTemplate = `
		server {
			listen 80;
			server_name %s;
			return 301 https://$host$request_uri;
		}

		server {
			listen 443 ssl;
			server_name %s;

			ssl_certificate %s;
			ssl_certificate_key %s;

			root %s;
			index index.html index.htm;

			location / {
				try_files $uri $uri/ /index.html;
			}
		}
	`

const NginxSSLProxyTemplate = `
		server {
			listen 80;
			server_name %s;
			return 301 https://$host$request_uri;
		}

		server {
			listen 443 ssl;
			server_name %s;

			ssl_certificate %s;
			ssl_certificate_key %s;

			location / {
				proxy_pass http://localhost:%s;

				proxy_http_version 1.1;
				proxy_set_header Upgrade $http_upgrade;
				proxy_set_header Connection "upgrade";
				proxy_set_header Host $host;
				proxy_cache_bypass $http_upgrade;
			}
		}
	`
