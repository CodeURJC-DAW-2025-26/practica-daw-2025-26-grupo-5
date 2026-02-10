# Stilnovo.es

## 👥 Miembros del Equipo
| Nombre y Apellidos | Correo URJC | Usuario GitHub |
|:--- |:--- |:--- |
| Gabriele Antonio Ricucci | ga.ricucci.2025@alumnos.urjc.es | @gabrieleri |
| Victor Hugo Oliveira Petroceli | vh.deoliveira.2023@alumnos.urjc.es | @CodVictor |
| Raúl Tejada Merinero | r.tejada.2023@alumnos.urjc.es | @raultejada24 |
| Ariel Rodríguez Lozano | a.rodriguezl.2023@alumnos.urjc.es | @Ariel1725 |
| Alonso Gutierrez Sánchez | a.gutierrez.2023@alumnos.urjc.es | @Alon345 |

---

## 🎭 **Preparación 1: Definición del Proyecto**

### **Descripción del Tema**
Stilnovo es una plataforma de compra/venta de objetos usados enfocada en dar un "nuevo estilo" a artículos de segunda mano. La aplicación permite a los usuarios publicar anuncios, gestionar transacciones seguras y fomentar la economía circular a través de un mercado digital estético y funcional.

### **Entidades**
Indicar las entidades principales que gestionará la aplicación y las relaciones entre ellas:

1. **Usuario**: Almacena información personal, roles, avatar y Balance Económico actual.
2. **Producto**: Artículos para la venta con descripción, precio, categoría y fotos.
3. **Transacción**: Registra el proceso de compra vinculando a un comprador, un vendedor y un producto.
4. **Valoración**: Sistema de feedback con comentario y puntuación tras una transacción.

**Relaciones entre entidades:**
- Usuario - Producto: Un usuario puede publicar múltiples productos (propietario). Relación 1:N.
- Transacción - Usuario/Producto: Una transacción vincula obligatoriamente a un comprador, un vendedor y un único artículo vendido.
- Valoración - Transacción: Cada valoración está asociada a una transacción completada. Relación 1:1.
- Producto - Categoría: Los productos se agrupan por categorías para facilitar la búsqueda.

### **Permisos de los Usuarios**
Describir los permisos de cada tipo de usuario e indicar de qué entidades es dueño:

* **Usuario Anónimo**: 
  - Permisos: Navegar por la web, consultar el catálogo de productos y utilizar el buscador. Solo consulta información pública.
  - No es dueño de ninguna entidad

* **Usuario Registrado**: 
  - Permisos: Publicar artículos con fotos, realizar compras, acceder a su historial detallado de sus compras y ventas, gestionar su perfil con avatar, gestionar su inventario, editar/borrar artículos subidos, visualización de analíticas (puntuación del vendedor, ingresos, distribución por categorias, etc) y generación de PDFs (facturas y datos analíticos), Digital Seller Card con código QR (para la verificación de identidad en encuentros físicos) entre otros.
  - Es dueño de: Sus propios productos publicados, su perfil de usuario y las valoraciones que emita.

* **Administrador**: 
  - Permisos: Control total sobre la información. Puede moderar contenido, eliminar productos que infrinjan normas o banear usuarios.
  - Es dueño de: Gestiona todas las entidades de la plataforma.

### **Imágenes**
Indicar qué entidades tendrán asociadas una o varias imágenes:

- **Usuario**: Una imagen de avatar personalizada.
- **Producto**: Múltiples fotos descriptivas por cada artículo anunciado.

### **Gráficos**
Para ofrecer una experiencia de gestión basada en datos, la aplicación integra visualizaciones dinámicas que permiten al usuario y al administrador monitorizar el rendimiento comercial en tiempo real.

- **Gráfico 1**: Distribución de Ventas por Categoría (Donut Chart): Ubicado en el Dashboard de usuario, este gráfico representa proporcionalmente el éxito de ventas en las categorías de Home, Tech, Art y Cars.
- **Gráfico 2**: Evolución de Ingresos Mensuales (Line Chart): Visualización temporal que muestra la tendencia de ingresos del usuario a lo largo del año (user-statistics.jpg), facilitando la identificación de picos de demanda.
- **Gráfico 3**: Análisis de Visitas vs. Interés (Bar Chart): Gráfico de barras comparativo que mide el tráfico recibido frente a las interacciones reales (favoritos/compra) por cada tipo de producto.
  
### **Tecnología Complementaria**
Se han seleccionado tecnologías que extienden las capacidades básicas de la web para simular un entorno de producción real.

- **Generación de PDFs**: Implementación de una librería para la creación automática de facturas y recibos de compra, descargables directamente desde el panel de órdenes, así como la generación de PDFs con las analíticas del usuario y de etiquetas de envío tras una transacción.
- **Envío de Correos (Mail Service)**: Integración de un servicio de mensajería para gestionar la comunicación inicial entre interesados. Al pulsar "Send Message", el sistema dispara un correo automático al vendedor con los detalles de la consulta del comprador.

### **Algoritmo o Consulta Avanzada**
El sistema no se limita a mostrar datos, sino que procesa la actividad del usuario para personalizar su experiencia de navegación.

- **Algoritmo/Consulta**: Sistema de Recomendaciones personalizado.
- **Descripción**: Muestra en la página de inicio "Productos que te pueden interesar" basándose en las categorías que el usuario ha comprado o visitado previamente.

---

## 🛠 **Preparación 2: Maquetación de páginas con HTML y CSS**

### **Vídeo de Demostración**
📹 **[Enlace al vídeo en YouTube](https://youtu.be/lXqGTZpMamk?si=9I0j98zrY1fShL06)**
> Vídeo mostrando las principales funcionalidades de la aplicación web.

### **Diagrama de Navegación**
Diagrama que muestra cómo se navega entre las diferentes páginas de la aplicación:

![Diagrama de Navegación](Readme-Images/README-FOTOS/Stilnovo-Diagrama-Navegacion.png)

**Descripción del flujo de navegación:**  
Mapa visual que organiza la navegación por colores (Azul: Todos los Usuarios, Amarillo: Usuario Registrado, Verde: Administrador) y utiliza las miniaturas de las capturas de la siguiente sección como nodos del sistema.

### **Capturas de Pantalla y Descripción de Páginas**

#### **1. Página Principal / Home**
![Página Principal](Readme-Images/README-FOTOS/main-photo.png)

**Descripción:**
Punto de entrada principal que presenta la propuesta de valor y permite la navegación hacia el catálogo y los formularios de acceso.

#### **2. Catálogo Público (Featured Treasures) / Home**
![Página Principal](Readme-Images/README-FOTOS/main-photo-2.png)

**Descripción:**
Visualización de la entidad Producto con datos de ejemplo representativos, permitiendo al usuario anónimo consultar el stock disponible.

#### **3. Detalle de Producto**
![Detalle de Producto](Readme-Images/README-FOTOS/user-moreInfo-product-1.png)

**Descripción:**
Vista completa de la entidad con especificaciones técnicas, precio y acceso a la tecnología de contacto por email.

#### **4. Detalle Técnico y Motor de Recomendaciones**
![Detalle Técnico y Motor de Recomendaciones](Readme-Images/README-FOTOS/user-moreInfo-pro-2.png)

**Descripción:**
Parte inferior de la ficha de producto que muestra las especificaciones y la descripción del vendedor. Destaca la sección "You may also like", que es la representación visual del Algoritmo Avanzado: el sistema consulta la base de datos para sugerir dinámicamente artículos de categorías afines o complementarias al producto actual.

#### **5. Interfaz de Autenticación**
![Interfaz de Autentificacion](Readme-Images/README-FOTOS/user-login.png)

**Descripción:**
Formulario de acceso gestionado por roles para discriminar entre el panel de usuario y el panel de administración.

#### **6. Registro de Usuarios**
![Interfaz de Autentificacion](Readme-Images/README-FOTOS/user-signup.png)

**Descripción:**
Interfaz que permite la creación de nuevas cuentas en la base de datos para interactuar con el marketplace.

#### **Área Privada (Usuario Registrado)**

#### **7. Panel de Actividad (Analytics Overview)**
![Panel de Actividad](Readme-Images/README-FOTOS/user-dashboard.png)

**Descripción:**
Vista personalizada que utiliza gráficos para monitorizar los ingresos y las ventas del usuario.

#### **8. Gestión de Inventario Propio**
![Inventario Propio](Readme-Images/README-FOTOS/user-myproducts.png)

**Descripción:**
Listado de la entidad Producto donde el dueño puede visualizar sus anuncios y acceder a las opciones de borrado o edición.

#### **9. Formulario de Publicación**
![Formulario de Publicación](Readme-Images/README-FOTOS/user-create-product.png)

**Descripción:**
Interfaz para la creación de nuevos elementos en la base de datos, incluyendo la subida de imágenes.

#### **10. Formulario de Edición**
![Formulario de Edición](Readme-Images/README-FOTOS/user-edit.png)

**Descripción:**
Interfaz para la edición de elementos en la base de datos, incluyendo la cambio de imágenes.

#### **11. Productos Favoritos**
![Productos Favoritos](Readme-Images/README-FOTOS/user-favs.png)

**Descripción:**
Listado de la entidad Producto donde el dueño podrá visualizar productos agregados como "Favoritos".

#### **12. Historial de Transacciones**
![Historial de Transacciones](Readme-Images/README-FOTOS/user-sales-orders.png)

**Descripción:**
Registro de compras y ventas que integra la Tecnología Complementaria de generación de facturas en PDF.


#### **13. Análisis de Datos G1 y G2**
![Análisis de Datos G1 y G2](Readme-Images/README-FOTOS/user-statistics.png)

**Descripción:**
Implementación de gráficos de líneas y tarta para visualizar la evolución de ingresos y ventas por categoría.

#### **14. Gráfico de Interés G3**
![Gráfico de Interés G3](Readme-Images/README-FOTOS/user-statistics-2.png)

**Descripción:**
Gráfico de barras avanzado que compara visitas frente a interacciones reales por categoría de producto.

#### **15. Perfil y Verificación**
![Perfil y Verificación](Readme-Images/README-FOTOS/user-setting-1.png)

**Descripción:**
Gestión de datos personales y visualización de la Digital Seller Card para transacciones seguras.

#### **Administrador**
#### **16. Monitor Global de la Plataforma**
![Monitor Global de la Plataforma](Readme-Images/README-FOTOS/admin-dashboars.png)

**Descripción:**
Dashboard exclusivo con KPIs de sistema, usuarios reportados y volumen total de anuncios.

#### **17. Gestión de Usuarios**
![Gestión de Usuarios](Readme-Images/README-FOTOS/admin-user-managme.png)

**Descripción:**
Herramienta de moderación que permite al administrador realizar acciones de baneo o purga de datos sobre cualquier perfil.

#### **18. Inventario Global**
![Inventario Global](Readme-Images/README-FOTOS/admin-global-invento.png)

**Descripción:**
Registro maestro de todos los productos del marketplace, con permisos para editar o eliminar cualquier anuncio fraudulento.

#### **19. Auditoría Financiera**
![Auditoría Financiera](Readme-Images/README-FOTOS/admin-transactions.png)

**Descripción:**
Vista de la entidad Transacción a nivel global para gestionar disputas y reembolsos.

---

## 🛠 **Práctica 1: Web con HTML generado en servidor y AJAX**

### **Vídeo de Demostración**
📹 **[Enlace al vídeo en YouTube](https://www.youtube.com/watch?v=x91MPoITQ3I)**
> Vídeo mostrando las principales funcionalidades de la aplicación web.

### **Navegación y Capturas de Pantalla**

#### **Diagrama de Navegación**

Solo si ha cambiado.

#### **Capturas de Pantalla Actualizadas**

Solo si han cambiado.

### **Instrucciones de Ejecución**

#### **Requisitos Previos**
- **Java**: versión 21 o superior
- **Maven**: versión 3.8 o superior
- **MySQL**: versión 8.0 o superior
- **Git**: para clonar el repositorio

#### **Pasos para ejecutar la aplicación**

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/[usuario]/[nombre-repositorio].git
   cd [nombre-repositorio]
   ```

2. **AQUÍ INDICAR LO SIGUIENTES PASOS**

#### **Credenciales de prueba**
- **Usuario Admin**: usuario: `admin`, contraseña: `admin`
- **Usuario Registrado**: usuario: `user`, contraseña: `user`

### **Diagrama de Entidades de Base de Datos**

Diagrama mostrando las entidades, sus campos y relaciones:

![Diagrama Entidad-Relación](images/database-diagram.png)

> [Descripción opcional: Ej: "El diagrama muestra las 4 entidades principales: Usuario, Producto, Pedido y Categoría, con sus respectivos atributos y relaciones 1:N y N:M."]

### **Diagrama de Clases y Templates**

Diagrama de clases de la aplicación con diferenciación por colores o secciones:

![Diagrama de Clases](images/classes-diagram.png)

> [Descripción opcional del diagrama y relaciones principales]

### **Participación de Miembros en la Práctica 1**

#### **Alumno 1 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 2 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 3 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 4 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

## 🛠 **Práctica 2: Incorporación de una API REST a la aplicación web, despliegue con Docker y despliegue remoto**

### **Vídeo de Demostración**
📹 **[Enlace al vídeo en YouTube](https://www.youtube.com/watch?v=x91MPoITQ3I)**
> Vídeo mostrando las principales funcionalidades de la aplicación web.

### **Documentación de la API REST**

#### **Especificación OpenAPI**
📄 **[Especificación OpenAPI (YAML)](/api-docs/api-docs.yaml)**

#### **Documentación HTML**
📖 **[Documentación API REST (HTML)](https://raw.githack.com/[usuario]/[repositorio]/main/api-docs/api-docs.html)**

> La documentación de la API REST se encuentra en la carpeta `/api-docs` del repositorio. Se ha generado automáticamente con SpringDoc a partir de las anotaciones en el código Java.

### **Diagrama de Clases y Templates Actualizado**

Diagrama actualizado incluyendo los @RestController y su relación con los @Service compartidos:

![Diagrama de Clases Actualizado](images/complete-classes-diagram.png)

### **Instrucciones de Ejecución con Docker**

#### **Requisitos previos:**
- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 2.0 o superior)

#### **Pasos para ejecutar con docker-compose:**

1. **Clonar el repositorio** (si no lo has hecho ya):
   ```bash
   git clone https://github.com/[usuario]/[repositorio].git
   cd [repositorio]
   ```

2. **AQUÍ LOS SIGUIENTES PASOS**:

### **Construcción de la Imagen Docker**

#### **Requisitos:**
- Docker instalado en el sistema

#### **Pasos para construir y publicar la imagen:**

1. **Navegar al directorio de Docker**:
   ```bash
   cd docker
   ```

2. **AQUÍ LOS SIGUIENTES PASOS**

### **Despliegue en Máquina Virtual**

#### **Requisitos:**
- Acceso a la máquina virtual (SSH)
- Clave privada para autenticación
- Conexión a la red correspondiente o VPN configurada

#### **Pasos para desplegar:**

1. **Conectar a la máquina virtual**:
   ```bash
   ssh -i [ruta/a/clave.key] [usuario]@[IP-o-dominio-VM]
   ```
   
   Ejemplo:
   ```bash
   ssh -i ssh-keys/app.key vmuser@10.100.139.XXX
   ```

2. **AQUÍ LOS SIGUIENTES PASOS**:

### **URL de la Aplicación Desplegada**

🌐 **URL de acceso**: `https://[nombre-app].etsii.urjc.es:8443`

#### **Credenciales de Usuarios de Ejemplo**

| Rol | Usuario | Contraseña |
|:---|:---|:---|
| Administrador | admin | admin123 |
| Usuario Registrado | user1 | user123 |
| Usuario Registrado | user2 | user123 |

### **Participación de Miembros en la Práctica 2**

#### **Alumno 1 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 2 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 3 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 4 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

## 🛠 **Práctica 3: Implementación de la web con arquitectura SPA**

### **Vídeo de Demostración**
📹 **[Enlace al vídeo en YouTube](URL_del_video)**
> Vídeo mostrando las principales funcionalidades de la aplicación web.

### **Preparación del Entorno de Desarrollo**

#### **Requisitos Previos**
- **Node.js**: versión 18.x o superior
- **npm**: versión 9.x o superior (se instala con Node.js)
- **Git**: para clonar el repositorio

#### **Pasos para configurar el entorno de desarrollo**

1. **Instalar Node.js y npm**
   
   Descarga e instala Node.js desde [https://nodejs.org/](https://nodejs.org/)
   
   Verifica la instalación:
   ```bash
   node --version
   npm --version
   ```

2. **Clonar el repositorio** (si no lo has hecho ya)
   ```bash
   git clone https://github.com/[usuario]/[nombre-repositorio].git
   cd [nombre-repositorio]
   ```

3. **Navegar a la carpeta del proyecto React**
   ```bash
   cd frontend
   ```

4. **AQUÍ LOS SIGUIENTES PASOS**

### **Diagrama de Clases y Templates de la SPA**

Diagrama mostrando los componentes React, hooks personalizados, servicios y sus relaciones:

![Diagrama de Componentes React](images/spa-classes-diagram.png)

### **Participación de Miembros en la Práctica 3**

#### **Alumno 1 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 2 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 3 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 4 - [Nombre Completo]**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

