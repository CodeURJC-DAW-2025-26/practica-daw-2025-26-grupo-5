# ============================================================
# Stilnovo Application Docker Image - Multi-stage Build
# ============================================================
# This Dockerfile uses a multi-stage build strategy:
# - Stage 1 (Frontend Builder): Compiles the React SPA using Node.js
# - Stage 2 (Backend Builder): Compiles the Maven project inside a container
# - Stage 3 (Runtime): Creates a minimal image with only the compiled JAR
#
# Key Features & Benefits:
# - NO Maven/JDK/Node dependency on host machine. The build process runs entirely 
#   inside Docker containers. The host machine only needs Docker installed.
#   This ensures complete environment isolation and reproducibility.
# - Uses official MySQL image from DockerHub (mysql:8.4), ensuring security patches 
#   and reliability from official maintainers.
# - Smaller final image size (only JRE runtime needed, ~400MB vs 1.5GB).
# - Minimal attack surface: Final image contains only runtime dependencies.
# ============================================================

# STEP 1: Build the React Frontend (Multi-stage: Node Builder)
# Uses the official Node.js image to build the React application
FROM node:22-alpine AS frontend-builder
WORKDIR /frontend-app
# Copy package.json and install dependencies
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the React code and build it
COPY frontend/ ./
RUN npm run build

# STEP 2: Build the application (Multi-stage: Builder)
# Uses Maven 3.9 with JDK 21 - all dependencies run INSIDE the container
# The builder stage runs the complete Maven build lifecycle within the container
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /project
COPY backend/pom.xml /project/
COPY backend/src /project/src
# Copy the compiled frontend (/build/client) to SpringBoot's static resources (new folder)
COPY --from=frontend-builder /frontend-app/build/client /project/src/main/resources/static/new/
RUN mvn clean package -DskipTests 

# STEP 3: Runtime image (JRE only)
# Minimal image containing only the Java Runtime Environment
# Docker discards the builder stages after compilation
# Result: Lean production image with only what's needed to run the JAR
FROM eclipse-temurin:21-jre
WORKDIR /usr/src/app/
# Copy only the compiled JAR from the builder stage
# This ensures the final image contains ONLY the runtime (no Maven or Source code)
COPY --from=builder /project/target/*.jar /usr/src/app/app.jar
EXPOSE 8443
# Application starts immediately without any schema modification by default
# DDL_AUTO is controlled via environment variable in docker-compose.yml
CMD [ "java", "-jar", "app.jar" ]