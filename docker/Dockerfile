# ============================================================
# Stilnovo Application Docker Image - Multi-stage Build
# ============================================================
# This Dockerfile uses a multi-stage build strategy:
# - Stage 1 (Builder): Compiles the Maven project inside a container
# - Stage 2 (Runtime): Creates a minimal image with only the compiled JAR
#
# Benefits:
# - No need for Maven/JDK installed on the host system
# - Smaller final image size (only JRE runtime needed)
# - Self-contained build reproducibility across environments
# ============================================================

# STEP 1: Build the application (Build container)
# We use an image that ALREADY HAS Maven installed
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /project

# Copy project files and build JAR inside container
# This avoids cluttering the build command with local paths
COPY backend/pom.xml /project/
COPY backend/src /project/src

# Execute Maven build (clean package) inside container
# Skips unit tests for faster builds; use maven-failsafe for integration tests
RUN mvn clean package -DskipTests

# STEP 2: Create the final runtime image
# Uses lightweight JRE-only image (no Maven, no compiler tools)
FROM eclipse-temurin:21-jre
WORKDIR /usr/src/app/

# We copy the .jar file generated in the previous step
COPY --from=builder /project/target/*.jar /usr/src/app/app.jar

# Expose HTTPS port for the Spring Boot application
EXPOSE 8443
# Command to start the application
# Start application with minimal heap settings (production adjusts via java options)
CMD [ "java", "-jar", "app.jar" ]