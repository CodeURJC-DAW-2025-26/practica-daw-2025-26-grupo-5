# ============================================================
# Stilnovo Application Docker Image - Multi-stage Build
# ============================================================
# This Dockerfile uses a multi-stage build strategy:
# - Stage 1 (Builder): Compiles the Maven project inside a container
# - Stage 2 (Runtime): Creates a minimal image with only the compiled JAR
#
# Key Features (Questions 27-29):
# Q27: NO Maven/JDK dependency on host machine
#      The build process runs entirely inside Docker containers
#      Host machine only needs Docker installed - no JDK, Maven, or build tools required
#      This ensures complete environment isolation and reproducibility
#
# Q29: Uses official MySQL image from DockerHub (mysql:8.4)
#      Ensures security patches and reliability from official maintainers
#
# Benefits:
# - No need for Maven/JDK installed on the host system (Q27)
# - Smaller final image size (only JRE runtime needed, ~400MB vs 1.5GB)
# - Build reproducibility: Same build environment across all machines
# - Security: Official base images with regular security updates
# - Minimal attack surface: Final image contains only runtime dependencies
# ============================================================

# STEP 1: Build the application (Multi-stage: Builder)
# Uses Maven 3.9 with JDK 21 - all dependencies run INSIDE the container
# Q27: The host machine does NOT need Maven or JDK installed
# The builder stage runs the complete Maven build lifecycle within the container
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /project
COPY backend/pom.xml /project/
COPY backend/src /project/src
# Compile and package the application inside the container
RUN mvn clean package -DskipTests 

# STEP 2: Runtime image (JRE only)
# Minimal image containing only the Java Runtime Environment
# Docker discards the builder stage after compilation
# Result: Lean production image with only what's needed to run the JAR
# Q28: Health check capability for docker-compose (handled at compose level)
FROM eclipse-temurin:21-jre
WORKDIR /usr/src/app/
# Copy only the compiled JAR from the builder stage
# This ensures the final image contains ONLY the runtime (no Maven or Source code)
COPY --from=builder /project/target/*.jar /usr/src/app/app.jar
EXPOSE 8443
# Application starts immediately without any schema modification by default
# See docker-compose.yml DDL_AUTO configuration for schema management (Q30)
# Q30: DDL_AUTO is controlled via environment variable in docker-compose.yml
CMD [ "java", "-jar", "app.jar" ]