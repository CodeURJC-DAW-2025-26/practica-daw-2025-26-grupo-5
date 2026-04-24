# ============================================================
# STAGE 1: Build Frontend (React SPA)
# ============================================================
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies first (better caching)
COPY frontend/package*.json ./
RUN npm install

# Copy source and build for production
COPY frontend/ ./
RUN npm run build

# ============================================================
# STAGE 2: Build Backend (Spring Boot + Compiled Frontend)
# ============================================================
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /app/backend

# Copy pom and source code
COPY backend/pom.xml .
COPY backend/src ./src

# INJECT FRONTEND: Copy compiled React files into Spring Boot static resources
# The SPA will be served from the /new/ subpath
COPY --from=frontend-builder /app/frontend/build/client ./src/main/resources/static/new/

# Compile the final JAR ignoring tests
RUN mvn clean package -DskipTests

# ============================================================
# STAGE 3: Final Runtime Image (Minimal JRE)
# ============================================================
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy only the final JAR from the builder stage
COPY --from=backend-builder /app/backend/target/*.jar app.jar

EXPOSE 8443

# Default startup command
ENTRYPOINT ["java", "-jar", "app.jar"]