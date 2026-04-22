### **Instrucciones de Ejecución con Docker**

#### **Requisitos previos:**

- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 2.0 o superior)
- Git instalado

#### **Paso 1: Clonar el repositorio**

```bash
git clone https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5.git
cd practica-daw-2025-26-grupo-5
```

#### **Paso 2: Crear el archivo `.env` en el directorio raíz**

Docker Compose necesita variables de entorno para funcionar. Crea un archivo `.env`:

```bash
# En Windows (PowerShell)
New-Item -Path ".env" -ItemType File

# En macOS/Linux (Terminal/Bash)
touch .env
```

**Contenido mínimo del `.env` (para desarrollo local):**

```properties
# DockerHub usuario para descargar la imagen
DOCKER_HUB_USERNAME=tu-usuario-dockerhub

# Base de datos
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=stilnovo

# Servidor
SERVER_PORT=8443
SERVER_SSL_KEY_STORE_PASSWORD=password
SERVER_SSL_KEY_PASSWORD=secret

# JPA/Hibernante (update para desarrollo, validate para producción)
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# URL pública de la aplicación
APP_PUBLIC_BASE_URL=https://localhost:8443
```

**ℹ️ NOTA:**

- **Desarrollo**: `update` sincroniza el esquema automáticamente
- **Producción**: Cambia a `validate` y utiliza migraciones manuales con Flyway/Liquibase

#### **Paso 3: Ejecutar docker-compose**

**(Ejecutar desde la carpeta `/docker`)**

```bash
# Primera ejecución (crea esquema de BD)
docker compose --env-file ../.env -e SPRING_JPA_HIBERNATE_DDL_AUTO=create up

# Ejecuciones posteriores (modo seguro, sin modificar BD)
docker compose --env-file ../.env up
```

**Salida esperada:**

```
stilnovo-db    | MySQL Server is now ready for connections
stilnovo-app   | Started StilnovoApplication
```

#### **Paso 4: Acceder a la aplicación**

Una vez que Docker Compose está ejecutándose:

**Aplicación web:**

- URL: `https://localhost:8443`
- Nota: El navegador mostrará una advertencia de certificado no confiable (es normal en desarrollo). Haz clic en "Continuar" o "Proceder".

**Documentación interactiva de la API:**

- Swagger UI: `https://localhost:8443/swagger-ui.html`
- Prueba todos los endpoints directamente desde el navegador

**Especificación en formato OpenAPI:**

- YAML: `https://localhost:8443/v3/api-docs`
- JSON: `https://localhost:8443/v3/api-docs.json`

#### **Paso 5: Detener la aplicación**

**(Ejecutar desde la carpeta `/docker`)**

```bash
# Detiene los contenedores (los datos persisten en la BD)
docker compose down

# Ver estado de los contenedores
docker compose ps
```

#### **Solución de problemas comunes:**

| Problema                                 | Causa                             | Solución                                                  |
| ---------------------------------------- | --------------------------------- | --------------------------------------------------------- |
| `ERROR: MYSQL_ROOT_PASSWORD is required` | `.env` no encontrado              | Asegúrate de que `.env` esté en el directorio raíz        |
| `Permission denied... docker.sock`       | Permisos de usuario (Linux)       | `sudo usermod -aG docker $USER` y reinicia sesión         |
| `address already in use`                 | Puerto 8443 ocupado               | Cambia `SERVER_PORT` en `.env` a otro puerto (ej: 8444)   |
| `MySQL connection refused`               | BD no lista                       | Espera 15-30 segundos, los contenedores tardan en iniciar |
| `ERROR: can't find docker-compose.yml`   | Estás en el directorio equivocado | Asegúrate de estar en la raíz del proyecto                |

### **Scripts Helper para Construcción y Publicación de la Imagen Docker**

Se proporcionan scripts automatizados en PowerShell (Windows) y Bash (Unix/Linux/macOS) para simplificar el proceso de construcción y publicación de la imagen Docker. **Estos scripts incluyen validaciones, mensajes de estado detallados y manejo de errores automático.**

#### **¿Cuándo usar los scripts?**

- **Desarrollo local**: Usa `create_image` para construir la imagen sin publicar
- **Testing/QA**: Usa `publish_image` para compartir versiones específicas
- **Despliegue automático**: Usa `publish_docker-compose` para desplegar en producción

#### **Requisitos previos:**

- Docker instalado en el sistema (versión 20.10 o superior)
- Cuenta en DockerHub (gratuita en https://hub.docker.com)
- **Ejecutar `docker login`** antes de usar los scripts de publicación:
  ```bash
  docker login
  # Ingresa tu usuario de DockerHub y token de acceso
  ```

#### **Script 1: `create_image.ps1` / `create_image.sh` — Construir imagen localmente**

✅ **Uso:** Construye la imagen Docker sin publicar. Ideal para probar cambios localmente.

**(Ejecutar desde la carpeta `/docker`)**

**Windows (PowerShell):**

```powershell
.\create_image.ps1 -ImageName "stilnovo-app:latest"
```

**macOS/Linux (Bash):**

```bash
./create_image.sh stilnovo-app:latest
```

**Qué hace el script:**

1. ✓ Valida que Docker esté instalado
2. ✓ Compila el código Java (Maven, multi-stage build)
3. ✓ Crea la imagen con el nombre que especificaste
4. ✓ Muestra mensajes de estado en la consola
5. ✓ Valida que la imagen se creó correctamente

**Verificar que la imagen se creó:**

```bash
docker images | grep stilnovo-app
```

Debería mostrar algo como:

```
REPOSITORY                TAG       IMAGE ID       CREATED
stilnovo-app              v1.0      a1b2c3d4e5f6   2 minutes ago
```

---

#### **Script 2: `publish_image.ps1` / `publish_image.sh` — Publicar imagen en DockerHub**

✅ **Uso:** Publica la imagen construida hacia DockerHub para compartirla con otros o usarla en producción.

**(Ejecutar desde la carpeta `/docker`)**

**Requiere:**

- Haber ejecutado `create_image` primero
- Haber ejecutado `docker login` previamente
- Cuenta en DockerHub

**Windows (PowerShell):**

```powershell
.\publish_image.ps1 -DockerHubUsername "tu-usuario-dockerhub" `
                    -ImageName "stilnovo-app" `
                    -Version "v1.0"
```

**macOS/Linux (Bash):**

```bash
./publish_image.sh tu-usuario-dockerhub stilnovo-app:latest v1.0
```

**Qué hace el script:**

1. ✓ Valida que estés logueado en DockerHub
2. ✓ Etiqueta la imagen con `usuario/nombre:versión`
3. ✓ Publica la imagen a DockerHub
4. ✓ Genera un resumen con la URL pública de la imagen
5. ✓ Proporciona comandos para descargar la imagen después

**Tu imagen estará disponible en:**

```
https://hub.docker.com/r/tu-usuario-dockerhub/stilnovo-app
```

---

#### **Script 3: `publish_docker-compose.ps1` / `publish_docker-compose.sh` — Despliegue automático completo**

✅ **Uso:** Construye la imagen, la publica y proporciona instrucciones para desplegar el stack completo (BD + aplicación).

**(Ejecutar desde la carpeta `/docker`)**

**Este es el script más completo y recomendado para despliegue en producción.**

**Windows (PowerShell):**

```powershell
.\publish_docker-compose.ps1 -DockerHubUsername "tu-usuario-dockerhub"
```

**macOS/Linux (Bash):**

```bash
./publish_docker-compose.sh tu-usuario-dockerhub
```

**Qué hace el script (6 pasos automáticos):**

1. ✓ Valida disponibilidad de Docker
2. ✓ Construye la imagen Docker (compilación Java incluida)
3. ✓ Etiqueta con versión semántica (v1.0, v1.1, etc.)
4. ✓ Publica en DockerHub
5. ✓ Crea un archivo `docker-compose-prod.yml` versionado
6. ✓ Muestra instrucciones para desplegar en cualquier servidor

---

#### **Flujo de trabajo completo: Construcción, Publicación y Ejecución**

Este es el flujo **real** que debes seguir para crear la imagen, publicarla en DockerHub y ejecutarla:

##### **Paso A: Configuración inicial (una sola vez)**

**1. Crear el archivo `.env` en la raíz del proyecto:**

```powershell
# Windows (desde la raíz del proyecto)
@"
DOCKER_HUB_USERNAME=tu-usuario-dockerhub
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=stilnovo
SERVER_PORT=8443
SERVER_SSL_KEY_STORE_PASSWORD=password
SERVER_SSL_KEY_PASSWORD=secret
SPRING_JPA_HIBERNATE_DDL_AUTO=create
SPRING_MAIL_USERNAME=stilnovo.noreply@gmail.com
SPRING_MAIL_PASSWORD=<your_generated_app_password>
APP_PUBLIC_BASE_URL=https://localhost:8443
"@ | Out-File .env
```

**⚠️ IMPORTANTE:** Reemplaza `tu-usuario-dockerhub` con tu usuario real de DockerHub.

**2. Ahora estés en la raíz del proyecto y haz login en DockerHub:**

```powershell
docker login
# Ingresa tu usuario de DockerHub y token de acceso
```

##### **Paso B: Construir la imagen (primera vez y cuando cambies código)**

```powershell
# Navega a la carpeta docker primero
cd docker

# Luego ejecuta:
.\create_image.ps1 -ImageName "stilnovo-app:latest"
```

**Resultado:** Tendrás una imagen Docker llamada `stilnovo-app:latest` lista en tu máquina local.

##### **Paso C: Publicar la imagen en DockerHub**

```powershell
# Desde la carpeta docker (si viniste del paso B, ya estás aquí)
cd docker  # Solo necesario si saliste de la carpeta

.\publish_image.ps1 -DockerHubUsername "tu-usuario-dockerhub"
```

**Resultado:** La imagen se sube a `https://hub.docker.com/r/tu-usuario-dockerhub/stilnovo-app`

##### **Paso D: Publicar el docker-compose.yml**

```powershell
# Desde la carpeta docker (si viniste del paso C, ya estás aquí)
cd docker  # Solo necesario si saliste de la carpeta

.\publish_docker-compose.ps1 -DockerHubUsername "tu-usuario-dockerhub"
```

**Resultado:** El `docker-compose.yml` está disponible en DockerHub como OCI Artifact.

##### **Paso E: Ejecutar la aplicación completa localmente**

```powershell
# Desde la raíz del proyecto
cd docker
docker compose --env-file ..\.env up
```

O alternativamente desde la raíz:

```powershell
docker compose -f docker/docker-compose.yml --env-file .env up
```

**Resultado esperado:**

- ✅ MySQL se inicia en el puerto 3306
- ✅ Spring Boot se inicia en el puerto 8443
- ✅ Accede a `https://localhost:8443`

**Verifica que todo funciona correctamente** viendo estos logs en la terminal:

```
stilnovo-db    | MySQL Server is now ready for connections
stilnovo-app   | Started StilnovoApplication in X.XXX seconds (JVM running for X.XXX)
stilnovo-app   | Application ready to serve requests
```

---

#### **Paso E: Acceder a la aplicación (después de que inicie)**

Abre tu navegador y accede a:

```
https://localhost:8443
```

⚠️ **Advertencia:** Es HTTPS con certificado autofirmado, así que verás una advertencia de seguridad. **Ignórala** y continúa (haz clic en "Avanzado" → "Continuar").

**Credenciales para probar:** Están en el readme un poco más arriba (user1, user2 y admin).

#### **Verificación de componentes**

Mientras `docker compose up` está corriendo, puedes verificar en otra terminal:

```powershell
# Ver contenedores activos
docker ps

# Ver logs de MySQL
docker logs stilnovo-db

# Ver logs de la app
docker logs stilnovo-app

# Verificar conectividad a BD (desde otra terminal)
docker exec stilnovo-app mysql -h db -u root -ppassword stilnovo -e "SELECT COUNT(*) FROM UserTable;"
```

**Deberías ver:** Tabla `UserTable` con 3 usuarios (admin, user1, user2)

---

#### **Detener la aplicación**

Cuando termines de probar, detén los contenedores:

```powershell
# En la terminal donde está corriendo docker compose:
Ctrl + C

# O desde otra terminal:
docker compose down
```

---

#### **Resumen de comandos (versión rápida)**

| Tarea                          | Comando                                                        | Ubicación         |
| ------------------------------ | -------------------------------------------------------------- | ----------------- |
| **0. Navegar**                 | `cd docker`                                                    | Raíz del proyecto |
| **1. Crear imagen**            | `.\create_image.ps1 -ImageName "stilnovo-app:latest"`          | `docker/`         |
| **2. Publicar imagen**         | `.\publish_image.ps1 -DockerHubUsername "tu-usuario"`          | `docker/`         |
| **3. Publicar docker-compose** | `.\publish_docker-compose.ps1 -DockerHubUsername "tu-usuario"` | `docker/`         |
| **4. Ejecutar localmente**     | `docker compose --env-file ..\.env up`                         | `docker/`         |
| **5. Detener**                 | `Ctrl+C` o `docker compose down`                               | Terminal activa   |

---

#### **Explicación de lo que sucede en cada paso:**

1. **create_image.ps1**: Compila el código Java con Maven **dentro de un contenedor**, genera la imagen Docker multi-stage (sin necesidad de JDK en tu máquina)
2. **publish_image.ps1**: Etiqueta la imagen y la sube a tu DockerHub personal
3. **publish_docker-compose.ps1**: Publica el archivo `docker-compose.yml` como OCI Artifact para que pueda descargarse fácilmente
4. **docker compose up**: Descarga ambas imágenes (MySQL + aplicación) desde DockerHub y las ejecuta con variables del `.env`

---

#### **Ejemplo práctico paso a paso:**

```powershell
# 1. Clonar repositorio
cd Desktop
git clone https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5.git
cd practica-daw-2025-26-grupo-5

# 2. Crear .env (con tu usuario de DockerHub)
# ... copia el contenido del .env anterior con tu usuario ...

# 3. Navegar a la carpeta docker
cd docker

# 4. Construir imagen (compila Java automáticamente)
.\create_image.ps1 -ImageName "stilnovo-app:latest"

# 5. Publicar en DockerHub (requiere haber hecho docker login)
.\publish_image.ps1 -DockerHubUsername "tu-usuario"

# 6. Publicar docker-compose (publicar la configuración)
.\publish_docker-compose.ps1 -DockerHubUsername "tu-usuario"

# 7. Ejecutar localmente para verificar que funciona
docker compose --env-file ..\.env up

# 8. En otra terminal, accede a:
# https://localhost:8443
```

#### **Solución de problemas de los scripts:**

| Error                                | Causa                              | Solución                                                               |
| ------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------- |
| `Permission denied`                  | Script no ejecutable (Linux/Mac)   | `chmod +x docker/*.sh`                                                 |
| `cannot find command`                | Script no encontrado               | Asegúrate de estar en la raíz del proyecto                             |
| `docker: not found`                  | Docker no instalado                | Instala Docker desde https://docker.com                                |
| `not authorized: incorrect username` | No estás logueado en DockerHub     | Ejecuta `docker login` primero                                         |
| `image not found`                    | `create_image` no se ejecutó antes | Ejecuta `create_image` antes de `publish_image`                        |
| `ExecutionPolicy` (PowerShell)       | PowerShell bloquea scripts         | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |

### **Guía de Redepliegue Completo en Producción**

Esta guía cubre el proceso **real** de despliegue en dos fases: construir/subir cambios desde desarrollo, y luego descargar/ejecutar en el servidor.

#### **⚠️ Requisitos previos para redepliegue:**

- Cambios guardados y commiteados en git (`git commit`)
- Terminal de VS Code abierta en el directorio raíz del proyecto
- Conectado a la red de la universidad (o VPN activa) para la fase 2
- Acceso SSH a `appweb05.dawgis.etsii.urjc.es` con clave privada

---

## **FASE 1: Empaquetar y Subir Cambios (Desarrollo en VS Code)**

Esta fase se ejecuta en tu VS Code local o en el escritorio remoto de MyApps. Construimos la imagen y la subimos a DockerHub.

#### **Paso 1.1: Preparar la terminal**

Asegúrate de estar logueado en Docker y en la carpeta de scripts:

```powershell
# Verificar que estás logueado en Docker
docker login

# Navegar al directorio de scripts
cd docker

# Verificar que estás en el lugar correcto
ls   # Deberías ver: create_image.ps1, publish_image.ps1, etc.
```

#### **Paso 1.2: Reconstruir la imagen con los cambios nuevos**

Este comando lee tu código actualizado y genera una imagen Docker en tu ordenador:

```powershell
.\create_image.ps1 -ImageName stilnovo-app:latest
```

**Qué hace:**

- ✓ Compila el código Java (Maven)
- ✓ Crea la imagen Docker con todos tus cambios
- ✓ Valida que se creó correctamente

**Salida esperada:**

```
Successfully tagged stilnovo-app:latest
Image created successfully!
```

#### **Paso 1.3: Subir la imagen a DockerHub**

Enviamos la imagen recién creada a internet para que el servidor pueda descargarla:

```powershell
.\publish_image.ps1 -DockerHubUsername tu-usuario-dockerhub
```

**Qué hace:**

- ✓ Etiqueta la imagen con tu usuario de DockerHub
- ✓ Sube la imagen a `https://hub.docker.com/r/tu-usuario-dockerhub/stilnovo-app`
- ✓ La imagen está lista para que el servidor la descargue

**Salida esperada:**

```
Pushing image to Docker Hub...
Successfully pushed tu-usuario-dockerhub/stilnovo-app:latest
```

#### **Paso 1.4: (Opcional) Actualizar el Docker Compose**

Solo necesario si has cambiado el archivo `docker-compose.yml`:

```powershell
.\publish_docker-compose.ps1 -DockerHubUsername tu-usuario-dockerhub
```

---

## **FASE 2: Descargar y Desplegar en el Servidor (AppWeb05)**

⚠️ **IMPORTANTE:** Esta fase **DEBE** hacerse desde la red de la universidad (MyApps, VPN, etc.) debido al firewall. No funcionará desde internet directo.

#### **Paso 2.1: Conectarse a la máquina virtual**

Abre una terminal SSH y conecta con la VM:

```bash
ssh -i ssh-keys/appWeb05.key vmuser@appWeb05.dawgis.etsii.urjc.es
```

**Verificación:** Deberías ver el prompt:

```
vmuser@appweb05:~$
```

#### **Paso 2.2: Limpiar la versión antigua (CRÍTICO)**

Detenemos la app vieja y borramos los contenedores + volúmenes para evitar conflictos con datos antiguos:

```bash
sudo docker compose down -v
```

**Qué hace:**

- ✓ Detiene los contenedores (app + BD)
- ✓ Elimina los volúmenes de datos (esto borra la BD vieja)
- ✓ Prepara el servidor para una instalación limpia

**Salida esperada:**

```
Removing network appweb05_default
Removing volume appweb05_mysql_data
```

#### **Paso 2.3: Descargar la imagen nueva de DockerHub (¡PASO CRÍTICO!)**

⚠️ **Este paso es obligatorio.** Sin él, el servidor usará la imagen vieja que tiene en caché:

```bash
sudo docker compose pull
```

**Qué hace:**

- ✓ Va a DockerHub y descarga la imagen nueva que subiste en Fase 1
- ✓ Descarta la versión vieja en caché del servidor

**Salida esperada:**

```
Pulling db ... done
Pulling app ... done
Pulling stilnovo-app ... done
```

**Si ves `Status: Downloaded newer image for ...` entonces funcionó correctamente.**

---

#### **Paso 2.4: Primera ejecución - Crear la base de datos**

Levantamos la aplicación en modo **inicialización**, que recrea el esquema de BD desde cero:

```bash
sudo docker compose -e DDL_AUTO=create up
```

**Qué hace (`DDL_AUTO=create`):**

- ✓ Crea la BD de MySQL desde cero (elimina esquema anterior si existe)
- ✓ Spring Boot genera todas las tablas automáticamente desde las entidades
- ✓ Ejecuta `DataBaseInitializer` para cargar los datos de ejemplo
- ✓ El servicio `DataBaseInitializer` mantiene un check: solo carga datos si `userRepository.count() == 0`

**Espera a ver estos mensajes en los logs:**

```
stilnovo-db    | MySQL Server is now ready for connections
stilnovo-app   | Started StilnovoApplication
```

**⚠️ IMPORTANTE:** No cierres la terminal aún. Espera a que se estabilice (espera ~30 segundos).

---

#### **Paso 2.5: Cambiar a modo normal (SEGUNDO ARRANQUE Y POSTERIORES)**

Para que la BD **NO se borre** en los siguientes arranques, detén la ejecución y reinicia en modo **seguro untuk producción**:

**1. Detén los contenedores:**

```
Presiona: Ctrl + C
```

Espera a que salga completamente:

```
vmuser@appweb05:~$
```

**2. Reinicia en modo normal** (sin tocar esquema de BD):

```bash
sudo docker compose up
```

**Qué hace ahora (`DDL_AUTO=none` - valor por defecto):**

- ✓ Arranca los contenedores (BD + app)
- ✓ **NO modifica el esquema de BD** (contraseña: los datos **persisten**, nada se borra)
- ✓ Hibernate solo ejecuta consultas SELECT (lectura segura)
- ✓ Modo **seguro para producción** - cero riesgo de pérdida de datos

**Deberías ver:**

```
stilnovo-db    | ready for connections
stilnovo-app   | Started StilnovoApplication
```

**Nota sobre DDL_AUTO:**

- `create`: Solo useuse en **PRIMER ARRANQUE** (crea todo de cero)
- `none`: Usado en **POSTERIORES ARRANQUES** (respeta datos existentes) ← **Recomendado para producción**

---

#### **Resumen de la FASE 2 (comandos rápidos):**

```bash
# Paso 2.1: Conectar
ssh -i ssh-keys/appWeb05.key vmuser@appWeb05.dawgis.etsii.urjc.es

# Paso 2.2: Limpiar
sudo docker compose down -v

# Paso 2.3: Descargar imagen nueva
sudo docker compose pull

# Paso 2.4: Primera ejecución (crear BD con create)
sudo docker compose -e DDL_AUTO=create up

# [Espera a que se estabilice, luego: Ctrl+C]

# Paso 2.5: Segunda ejecución (modo normal con none)
sudo docker compose up
```

---

#### **Verificar que todo funciona:**

Una vez que la app esté corriendo (paso 2.5), accede desde otro navegador:

```
https://appweb05.dawgis.etsii.urjc.es:8443
```

Si ves la aplicación, ¡está funcionando! 🎉

---

#### **Modo Detached (Ejecutar en Background)**

Si quieres que la aplicación siga corriendo aunque cierres SSH, usa el modo `-d`:

```bash
# En la segunda ejecución (paso 2.5), en lugar de:
sudo docker compose up

# Haz:
sudo docker compose up -d
```

Luego puedes cerrar la terminal SSH sin parar la app:

```bash
# Ver que está corriendo
docker ps

# Ver logs incluso después de cerrar SSH
docker logs -f stilnovo-app

# Presiona Ctrl+C para salir de los logs (la app sigue corriendo)
```

---

#### **Si necesitas actualizar después de redepliegue:**

Para un nuevo redepliegue con cambios:

```bash
# En desarrollo (FASE 1): repite pasos 1.2 → 1.3
# En servidor (FASE 2): solo repite pasos 2.3 → 2.4 → 2.5
# (No necesitas hacer docker down -v segunda vez, solo pull)
```

---

#### **Solución de problemas del redepliegue:**

| Problema                          | Causa                                     | Solución                                                                 |
| --------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| "Connection refused" en servidor  | Contenedores no están corriendo           | Verifica: `docker ps` y `docker logs stilnovo-app`                       |
| "Image not found" en paso 2.3     | La imagen no se subió a DockerHub         | Vuelve a FASE 1, paso 1.3                                                |
| App ve datos viejos               | No hiciste `docker compose down -v`       | Borra todo man y vuelve a empezar: `sudo docker compose down -v`         |
| "Permission denied" en ssh        | Clave privada con permisos incorrectos    | `chmod 600 ssh-keys/appWeb05.key`                                        |
| BD corrupta o errores raros       | El paso `docker compose pull` no funcionó | Fuerza actualización: `docker rmi $(docker images -q)` y repite paso 2.3 |
| "Cannot connect to Docker daemon" | Docker no corre en la VM                  | SSH a la VM y: `sudo systemctl restart docker`                           |

---

### **📋 Cheat Sheet - Comandos Rápidos de Redespliegue**

**Este es el flujo completo resumido. Cópialo y úsalo:**

#### **FASE 1: Desde tu máquina (VS Code)**

```powershell
# Login en Docker
docker login

# Navegar a scripts
cd docker

# Construir imagen
.\create_image.ps1 -ImageName stilnovo-app:latest

# Publicar a DockerHub
.\publish_image.ps1 -DockerHubUsername tu-usuario-dockerhub
```

#### **FASE 2: Desde el servidor (SSH a AppWeb05)**

```bash
# Conectar a servidor
ssh -i ssh-keys/appWeb05.key vmuser@appWeb05.dawgis.etsii.urjc.es

# Limpiar versión vieja
sudo docker compose down -v

# Descargar imagen nueva (CRÍTICO)
sudo docker compose pull

# Crear BD desde cero
sudo SPRING_APPLICATION_JSON='{"spring.jpa.hibernate.ddl-auto":"create"}' docker compose up

# [Ctrl+C cuando se estabilice]

# Ejecutar en modo normal
sudo docker compose up

# [O en background: sudo docker compose up -d]
```

8. **Para detener la aplicación**:

   ```bash
   docker-compose down
   ```

#### **4. Solución de Problemas Comunes**

| Problema                              | Solución                                                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **`Permission denied` (Scripts)**     | En Linux/Mac: `chmod +x docker/*.sh`<br>En Windows: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`                   |
| **`MYSQL_ROOT_PASSWORD is required`** | Asegúrate de que el archivo `.env` está en la raíz, no dentro de `/docker`.                                                 |
| **La App muestra datos viejos**       | No borraste la caché en el servidor. Ejecuta `sudo docker compose down -v` y asegúrate de hacer `sudo docker compose pull`. |
| **`Image not found` al hacer pull**   | Olvidaste ejecutar el script `publish_image` o tu repositorio en DockerHub es privado.                                      |
| **`address already in use`**          | El puerto 8443 ya está ocupado. Cambia `SERVER_PORT` en el `.env`.                                                          |
