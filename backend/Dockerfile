# PASO 1: Compilar la aplicación (Contenedor de construcción)
# Usamos una imagen que YA TIENE maven instalado [cite: 192, 260]
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /project

# Copiamos el archivo de configuración y el código fuente [cite: 196, 197]
COPY pom.xml /project/
COPY src /project/src

# Ejecutamos la compilación dentro del contenedor [cite: 199, 267]
# Aquí es donde se hace el 'mvn package' que te fallaba fuera
RUN mvn clean package -DskipTests

# PASO 2: Crear la imagen final de ejecución [cite: 200, 268]
FROM eclipse-temurin:21-jre
WORKDIR /usr/src/app/

# Copiamos el archivo .jar generado en el paso anterior [cite: 204, 273]
COPY --from=builder /project/target/*.jar /usr/src/app/app.jar

EXPOSE 8080
# Comando para arrancar la aplicación [cite: 208, 277]
CMD [ "java", "-jar", "app.jar" ]