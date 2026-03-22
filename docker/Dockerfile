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

# STEP 1: Build the application (Multi-stage: Builder) 
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /project
COPY backend/pom.xml /project/
COPY backend/src /project/src
RUN mvn clean package -DskipTests 

# STEP 2: Runtime image (JRE only) 
FROM eclipse-temurin:21-jre
WORKDIR /usr/src/app/
COPY --from=builder /project/target/*.jar /usr/src/app/app.jar
EXPOSE 8443
CMD [ "java", "-jar", "app.jar" ] 