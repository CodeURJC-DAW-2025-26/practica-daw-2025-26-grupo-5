# STEP 1: Build the application (Build container)
# We use an image that ALREADY HAS Maven installed
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /project

# We copy the configuration file and the source code
COPY backend/pom.xml /project/
COPY backend/src /project/src

# We run the build inside the container
# This is where the 'mvn package' that was failing for you outside is executed
RUN mvn clean package -DskipTests

# STEP 2: Create the final runtime image
FROM eclipse-temurin:21-jre
WORKDIR /usr/src/app/

# We copy the .jar file generated in the previous step
COPY --from=builder /project/target/*.jar /usr/src/app/app.jar

EXPOSE 8443
# Command to start the application
CMD [ "java", "-jar", "app.jar" ]