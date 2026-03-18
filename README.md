# Netflix Clone - DevSecOps Project

A production-grade DevSecOps implementation of a Netflix clone with automated CI/CD pipelines, security scanning, containerization, and cloud deployment.

[![Main Pipeline](https://github.com/dikshitbonu-bit/netflix-devsecops/actions/workflows/main.yml/badge.svg)](https://github.com/dikshitbonu-bit/netflix-devsecops/actions/workflows/main.yml)

## Project Overview

This project demonstrates enterprise-level DevSecOps practices including:
- Automated security scanning (SAST, dependency checks, secret detection, container scanning)
- Multi-stage Docker builds with image optimization
- GitHub Actions CI/CD pipelines
- Infrastructure as Code with Docker Compose
- Automated deployment to AWS EC2
- Health monitoring and smoke testing
- Nginx reverse proxy architecture

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Port 80 (HTTP)
                         │
                         ▼
              ┌──────────────────────┐
              │   Nginx (Frontend)   │
              │  - Serves React app  │
              │  - Reverse proxy     │
              └──────────┬───────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
         / (React)              /api/* (Proxy)
            │                         │
            ▼                         ▼
    ┌──────────────┐        ┌──────────────────┐
    │   React App  │        │  Node.js Backend │
    │  (Static)    │        │  - Express API   │
    └──────────────┘        │  - JWT Auth      │
                            │  - TMDB API      │
                            └────────┬─────────┘
                                     │
                              Internal Network
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   MongoDB       │
                            │  - User data    │
                            │  - Watchlists   │
                            └─────────────────┘
```

## Tech Stack

### Application
- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB 7
- **Reverse Proxy:** Nginx (Alpine)
- **Authentication:** JWT, bcrypt

### DevOps Tools
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Cloud:** AWS EC2
- **Registry:** Docker Hub

### Security Tools
- **GitLeaks:** Secret detection in code
- **Trivy:** Container vulnerability scanning
- **Hadolint:** Dockerfile best practices
- **npm audit:** Dependency vulnerability scanning
- **ESLint:** Code quality and security patterns
- **SonarQube:** Static Application Security Testing (SAST)

## CI/CD Pipeline Architecture

### 1. PR Pipeline (Quality Gate)
```yaml
Trigger: Pull Request to main

Flow:
├── Security Scans (Parallel)
│   ├── GitLeaks (secrets)
│   ├── ESLint (code quality)
│   ├── SonarQube (SAST)
│   ├── npm audit (dependencies)
│   └── Hadolint (Dockerfiles)
│
├── Build & Test (After security passes)
│   ├── Frontend (build + test)
│   └── Backend (test only)
│
└── Status: Pass/Fail - Blocks merge if fails
```

### 2. Main Pipeline (Deployment)
```yaml
Trigger: Push to main

Flow:
├── Security Scans (same as PR)
│
├── Build & Test
│
├── Docker Build & Push
│   ├── Build images (multi-stage)
│   ├── Trivy scan (CRITICAL/HIGH = fail)
│   ├── Tag: latest + sha-xxxxx
│   └── Push to Docker Hub
│
└── Deploy to EC2
    ├── SSH to EC2
    ├── Git pull latest code
    ├── Create .env from secrets
    ├── docker compose up
    ├── Health check
    └── Smoke tests
```

### 3. Scheduled Health Check
```yaml
Trigger: Every 12 hours (cron)

Flow:
├── Pull latest images
├── Test endpoints
├── Verify database connection
└── Alert on failure
```

## Reusable Workflows

**DRY Principle Implementation:**

1. **reusable-security-scan.yml**
   - Used by: PR pipeline, Main pipeline
   - Jobs: GitLeaks, ESLint, SonarQube, npm audit, Hadolint

2. **reusable-build-test.yml**
   - Used by: PR pipeline, Main pipeline
   - Inputs: working_directory, run_build
   - Tests both frontend and backend

3. **reusable-docker-build-push.yml**
   - Used by: Main pipeline
   - Inputs: service_name, dockerfile_path, context_path
   - Outputs: Tagged images in Docker Hub

## Security Implementation

### Secret Management
```
GitHub Secrets (never in code):
├── TMDB_API_KEY          # External API key
├── JWT_SECRET            # Token signing key
├── MONGO_PASSWORD        # Database password
├── DOCKER_USERNAME       # Registry auth
├── DOCKER_TOKEN          # Registry auth
├── EC2_HOST              # Deployment target
├── EC2_USER              # SSH user
└── EC2_SSH_KEY           # Private key
```

### Runtime Security
- Non-root user in containers
- Alpine-based minimal images
- No secrets in environment variables (injected at deploy)
- MongoDB authentication enabled
- Helmet security headers
- CORS configuration
- Password hashing (bcrypt, 10 rounds)
- JWT token expiration

## Docker Implementation

### Multi-Stage Builds

**Frontend:**
```dockerfile
Stage 1: Build (node:22-alpine)
  ├── Install dependencies
  ├── Build React app → /build
  └── Optimize bundle

Stage 2: Runtime (nginx:alpine)
  ├── Copy build artifacts
  ├── Copy nginx.conf
  └── Serve on port 80
```

**Backend:**
```dockerfile
Single Stage (node:22-alpine)
  ├── Create non-root user
  ├── Install production dependencies only
  ├── Copy source code
  └── Run as non-root
```

### Docker Compose
```yaml
Services:
├── frontend (port 80)
│   └── Nginx serves React + proxies API
│
├── backend (internal only)
│   └── Express API + JWT auth
│
└── mongo (internal only)
    └── Persistent volume
```

**No exposed backend port** - All traffic through nginx reverse proxy.

## Deployment Process

### Initial Setup (One-time)
```bash
# On EC2
sudo apt update
sudo apt install docker.io docker-compose git -y
sudo usermod -aG docker ubuntu

# Clone repo
cd /home/ubuntu
git clone https://github.com/dikshitbonu-bit/netflix-devsecops.git
```

### Automated Deployment (Every push to main)
```bash
1. GitHub Actions triggered
2. Runs all security scans
3. Builds & tests code
4. Builds Docker images
5. Scans images with Trivy
6. Pushes to Docker Hub
7. SSHs to EC2
8. Pulls latest images
9. Recreates containers
10. Validates deployment
```

## Environment Variables

### Production (.env - Created by CI/CD)
```bash
PORT=3000
TMDB_API_KEY=<from_github_secrets>
MONGODB_URI=mongodb://admin:<password>@mongo:27017/netflix?authSource=admin
JWT_SECRET=<from_github_secrets>
JWT_EXPIRE=7d
NODE_ENV=production
```

### Docker Compose
```bash
DOCKER_USERNAME=<your_dockerhub_username>
```

## Monitoring & Health Checks

### Application Health
```bash
GET /health
Response: {
  "status": "healthy",
  "database": "connected",
  "uptime": 12345
}
```

### Workflow Health Checks
- Frontend availability (GET /)
- API endpoint validation
- Database connectivity
- Container status verification

## Local Development
```bash
# Clone repository
git clone https://github.com/dikshitbonu-bit/netflix-devsecops.git
cd netflix-devsecops

# Create environment files
cp backend/.env.example backend/.env
# Edit backend/.env with your keys

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Access:
- Frontend: http://localhost
- Backend API: http://localhost/api
- MongoDB: localhost:27017 (internal)

## Project Structure
```
netflix-devsecops/
├── .github/
│   └── workflows/
│       ├── pr-pipeline.yml
│       ├── main-pipeline.yml
│       ├── health-check.yml
│       ├── reusable-security-scan.yml
│       ├── reusable-build-test.yml
│       └── reusable-docker-build-push.yml
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── tests/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## GitHub Actions Secrets Setup

**Required Secrets:**
```bash
Repository Settings → Secrets and Variables → Actions

Add:
1. TMDB_API_KEY          # Get from themoviedb.org
2. JWT_SECRET            # openssl rand -base64 32
3. MONGO_PASSWORD        # Strong random password
4. DOCKER_USERNAME       # Docker Hub username
5. DOCKER_TOKEN          # Docker Hub access token
6. EC2_HOST              # EC2 public IP
7. EC2_USER              # ubuntu
8. EC2_SSH_KEY           # Private SSH key (entire file)
9. SONAR_TOKEN           # SonarCloud token (optional)
10. SONAR_HOST_URL       # https://sonarcloud.io (optional)
```

## AWS EC2 Setup

### Instance Requirements
- **Type:** t2.micro or larger
- **OS:** Ubuntu 22.04 LTS
- **Security Group:**
  - Port 22 (SSH) - Your IP
  - Port 80 (HTTP) - 0.0.0.0/0
  - Port 443 (HTTPS) - 0.0.0.0/0 (future)

### Installation
```bash
# Install Docker
sudo apt update
sudo apt install docker.io docker-compose git -y
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Verify
docker --version
docker compose version
```

## Key DevSecOps Practices Demonstrated

### Shift-Left Security
- Security scans in PR (before merge)
- Automated vulnerability detection
- Secrets never in code
- Code quality gates

### Continuous Integration
- Automated testing on every commit
- Build validation
- Parallel job execution
- Fast feedback loops

### Continuous Deployment
- Automated deployment on main
- Zero-downtime deployment
- Rollback capability
- Health validation

### Infrastructure as Code
- Docker Compose configuration
- Dockerfile best practices
- Declarative pipelines
- Version-controlled infra

### Monitoring & Observability
- Health check endpoints
- Scheduled monitoring
- Deployment validation
- Container health checks

## Performance Optimizations

- **Docker layer caching** (GitHub Actions)
- **npm caching** (Faster installs)
- **Multi-stage builds** (Smaller images)
- **Alpine base images** (Minimal footprint)
- **Nginx compression** (Faster page loads)
- **Resource limits** (Prevents EC2 overload)

## Troubleshooting

### Pipeline Failures

**Security scan fails:**
```bash
# Check scan output in Actions
# Fix issues in code
# Push again
```

**Docker build fails:**
```bash
# Check Dockerfile syntax
# Verify all files exist
# Check build logs
```

**Deployment fails:**
```bash
# SSH to EC2
docker compose logs
docker ps -a
# Check .env file created
# Verify secrets in GitHub
```

### Application Issues

**Container won't start:**
```bash
docker compose logs <service_name>
```

**Database connection failed:**
```bash
# Check MongoDB container running
docker exec -it netflix-mongo mongosh
# Verify credentials in .env
```

**API not responding:**
```bash
# Check backend logs
docker logs netflix-backend
# Verify TMDB_API_KEY valid
```

## Future Enhancements

- Kubernetes deployment (EKS)
- Terraform for infrastructure
- ArgoCD for GitOps
- Prometheus + Grafana monitoring
- ELK stack for logging
- Auto-scaling configuration
- SSL/TLS with Let's Encrypt
- CDN integration (CloudFront)
- Multi-region deployment
- Blue-green deployment strategy

## Learning Outcomes

This project demonstrates:
- Building secure CI/CD pipelines
- Container orchestration
- Cloud deployment automation
- Security scanning integration
- Secret management
- Infrastructure as Code
- Monitoring and observability
- DevOps best practices

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Ensure all tests pass
5. Submit PR (triggers automated checks)

## License

MIT

## Contact

- GitHub: [@dikshitbonu-bit](https://github.com/dikshitbonu-bit)


---

Built as part of #90DaysOfDevOps challenge
