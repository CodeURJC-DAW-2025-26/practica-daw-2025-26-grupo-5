# Stilnovo.es

## 👥 Miembros del Equipo
| Nombre y Apellidos | Correo URJC | Usuario GitHub |
|:--- |:--- |:--- |
| Gabriele Antonio Ricucci | ga.ricucci.2025@alumnos.urjc.es | @gabrieleri |
| Victor Hugo Oliveira Petroceli | vh.deoliveira.2023@alumnos.urjc.es | @CodVictor |
| Raúl Tejada Merinero | r.tejada.2023@alumnos.urjc.es | @raultejada24 |
| Ariel Rodríguez Lozano | a.rodriguezl.2023@alumnos.urjc.es | @Ariel1725 |
| Alonso Gutierrez Sánchez | a.gutierrez.2023@alumnos.urjc.es | @alonsoo-cmd |

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
Indicar qué entidades tendrán asociada una imagen:

- **Usuario**: Una imagen de avatar personalizada.
- **Producto**: Una imagen descriptiva por cada artículo anunciado.

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

![Diagrama de Navegación](Readme-Images/Preparation2/Stilnovo-Diagrama-Navegacion.png)

**Descripción del flujo de navegación:**  
Mapa visual que organiza la navegación por colores (Azul: Todos los Usuarios, Amarillo: Usuario Registrado, Verde: Administrador) y utiliza las miniaturas de las capturas de la siguiente sección como nodos del sistema.

### **Capturas de Pantalla y Descripción de Páginas**

#### **1. Página Principal / Home**
![Página Principal](Readme-Images/Preparation2/main-photo.png)

**Descripción:**
Punto de entrada principal que presenta la propuesta de valor y permite la navegación hacia el catálogo y los formularios de acceso.

#### **2. Catálogo Público (Featured Treasures) / Home**
![Página Principal](Readme-Images/Preparation2/main-photo-2.png)

**Descripción:**
Visualización de la entidad Producto con datos de ejemplo representativos, permitiendo al usuario anónimo consultar el stock disponible.

#### **3. Detalle de Producto**
![Detalle de Producto](Readme-Images/Preparation2/user-moreInfo-product-1.png)

**Descripción:**
Vista completa de la entidad con especificaciones técnicas, precio y acceso a la tecnología de contacto por email.

#### **4. Detalle Técnico y Motor de Recomendaciones**
![Detalle Técnico y Motor de Recomendaciones](Readme-Images/Preparation2/user-moreInfo-pro-2.png)

**Descripción:**
Parte inferior de la ficha de producto que muestra las especificaciones y la descripción del vendedor. Destaca la sección "You may also like", que es la representación visual del Algoritmo Avanzado: el sistema consulta la base de datos para sugerir dinámicamente artículos de categorías afines o complementarias al producto actual.

#### **5. Interfaz de Autenticación**
![Interfaz de Autentificacion](Readme-Images/Preparation2/user-login.png)

**Descripción:**
Formulario de acceso gestionado por roles para discriminar entre el panel de usuario y el panel de administración.

#### **6. Registro de Usuarios**
![Interfaz de Autentificacion](Readme-Images/Preparation2/user-signup.png)

**Descripción:**
Interfaz que permite la creación de nuevas cuentas en la base de datos para interactuar con el marketplace.

#### **Área Privada (Usuario Registrado)**

#### **7. Panel de Actividad (Analytics Overview)**
![Panel de Actividad](Readme-Images/Preparation2/user-dashboard.png)

**Descripción:**
Vista personalizada que utiliza gráficos para monitorizar los ingresos y las ventas del usuario.

#### **8. Gestión de Inventario Propio**
![Inventario Propio](Readme-Images/Preparation2/user-myproducts.png)

**Descripción:**
Listado de la entidad Producto donde el dueño puede visualizar sus anuncios y acceder a las opciones de borrado o edición.

#### **9. Formulario de Publicación**
![Formulario de Publicación](Readme-Images/Preparation2/user-create-product.png)

**Descripción:**
Interfaz para la creación de nuevos elementos en la base de datos, incluyendo la subida de imágenes.

#### **10. Formulario de Edición**
![Formulario de Edición](Readme-Images/Preparation2/user-edit.png)

**Descripción:**
Interfaz para la edición de elementos en la base de datos, incluyendo la cambio de imágenes.

#### **11. Productos Favoritos**
![Productos Favoritos](Readme-Images/Preparation2/user-favs.png)

**Descripción:**
Listado de la entidad Producto donde el dueño podrá visualizar productos agregados como "Favoritos".

#### **12. Historial de Transacciones**
![Historial de Transacciones](Readme-Images/Preparation2/user-sales-orders.png)

**Descripción:**
Registro de compras y ventas que integra la Tecnología Complementaria de generación de facturas en PDF.


#### **13. Análisis de Datos G1 y G2**
![Análisis de Datos G1 y G2](Readme-Images/Preparation2/user-statistics.png)

**Descripción:**
Implementación de gráficos de líneas y tarta para visualizar la evolución de ingresos y ventas por categoría.

#### **14. Gráfico de Interés G3**
![Gráfico de Interés G3](Readme-Images/Preparation2/user-statistics-2.png)

**Descripción:**
Gráfico de barras avanzado que compara visitas frente a interacciones reales por categoría de producto.

#### **15. Perfil y Verificación**
![Perfil y Verificación](Readme-Images/Preparation2/user-setting-1.png)

**Descripción:**
Gestión de datos personales y visualización de la Digital Seller Card para transacciones seguras.

#### **Administrador**
#### **16. Monitor Global de la Plataforma**
![Monitor Global de la Plataforma](Readme-Images/Preparation2/admin-dashboars.png)

**Descripción:**
Dashboard exclusivo con KPIs de sistema, usuarios reportados y volumen total de anuncios.

#### **17. Gestión de Usuarios**
![Gestión de Usuarios](Readme-Images/Preparation2/admin-user-managme.png)

**Descripción:**
Herramienta de moderación que permite al administrador realizar acciones de baneo o purga de datos sobre cualquier perfil.

#### **18. Inventario Global**
![Inventario Global](Readme-Images/Preparation2/admin-global-invento.png)

**Descripción:**
Registro maestro de todos los productos del marketplace, con permisos para editar o eliminar cualquier anuncio fraudulento.

#### **19. Auditoría Financiera**
![Auditoría Financiera](Readme-Images/Preparation2/admin-transactions.png)

**Descripción:**
Vista de la entidad Transacción a nivel global para gestionar disputas y reembolsos.

---

## 🛠 **Práctica 1: Web con HTML generado en servidor y AJAX**

### **Vídeo de Demostración**
📹 **[Enlace al vídeo en YouTube](https://youtu.be/zg4VRbsN4g4)**
> Vídeo mostrando las principales funcionalidades de la aplicación web.

### **Navegación y Capturas de Pantalla**

#### **Diagrama de Navegación**
Diagrama actualizado que muestra cómo se navega entre las diferentes páginas de la aplicación:

![Diagrama de Navegación](Readme-Images/Practice1/Stilnovo-Diagrama-Navegacion-2.png)

**Descripción del flujo de navegación:**  
Mapa visual que organiza la navegación por colores (Azul: Todos los Usuarios, Amarillo: Usuario Registrado, Verde: Administrador) y utiliza las miniaturas de las capturas de la siguiente sección como nodos del sistema.

#### **Capturas de Pantalla Actualizadas**

#### **Área Privada (Usuario Registrado)**

#### **1. Panel de Actividad (Dashboard)**
![Panel de Actividad](Readme-Images/Practice1/DashboardP1.png)

**Descripción:**
Vista personalizada del usuario que muestra estadísticas financieras en tiempo real, incluyendo balance actual, ingresos totales, y resumen de ventas. Permite al usuario monitorizar su rendimiento comercial en la plataforma.

#### **2. Gestión de Inventario Propio (My Products)**
![Inventario Propio](Readme-Images/Practice1/MyProductsP1.png)

**Descripción:**
Listado completo de productos publicados por el usuario, con opciones de edición, eliminación y gestión del estado de cada artículo. Visualización de la entidad Producto donde el dueño tiene control total sobre sus anuncios.

#### **3. Formulario de Publicación de Producto (New Product)**
![Formulario de Publicación](Readme-Images/Practice1/NewProductP1.png)

**Descripción:**
Interfaz para la creación de nuevos artículos en el marketplace, incluyendo nombre, categoría, precio, ubicación, descripción detallada y subida de imágenes. Validación de campos obligatorios antes del envío.

#### **4. Formulario de Edición de Producto (Edit Product)**
![Formulario de Edición](Readme-Images/Practice1/EditProductP1.png)

**Descripción:**
Interfaz de modificación de productos existentes con todos los campos editables, incluyendo la posibilidad de cambiar las imágenes asociadas. Mantiene la integridad de los datos del producto.

#### **5. Historial de Ventas y Pedidos (Sales & Orders)**
![Historial de Transacciones](Readme-Images/Practice1/SalesOrdersP1.png)

**Descripción:**
Registro completo de compras y ventas realizadas por el usuario. Incluye detalles de transacciones, fechas, importes y estado de cada operación. Integra la Tecnología Complementaria de generación de facturas en PDF descargables.

#### **6. Análisis de Ventas por Categoría y Evolución de Ingresos (Statistics)**
![Análisis de Datos G1 y G2](Readme-Images/Practice1/StatisticsP1.png)

**Descripción:**
Implementación de gráficos avanzados (Gráfico 1: Donut Chart de distribución por categoría y Gráfico 2: Line Chart de evolución temporal) para visualizar el rendimiento comercial del usuario a través de datos históricos.

#### **7. Gráfico de Interés y Visitas (Statistics - Bar Chart)**
![Gráfico de Interés G3](Readme-Images/Practice1/Statistics2P1.png)

**Descripción:**
Gráfico de barras comparativo (Gráfico 3) que mide el tráfico recibido versus las interacciones reales (favoritos/compras) por cada categoría de producto, permitiendo identificar patrones de comportamiento del usuario.

#### **8. Configuración de Perfil de Usuario (Edit Profile)**
![Perfil y Verificación](Readme-Images/Practice1/EditProfileP1.png)

**Descripción:**
Gestión completa de datos personales del usuario, incluyendo nombre de usuario, correo electrónico, avatar, biografía, información de tarjeta de crédito y visualización de la Digital Seller Card con código QR para verificación de identidad.

#### **9. Mis Valoraciones Enviadas y Pendientes (My Valorations)**
![Mis Valoraciones](Readme-Images/Practice1/MyValorationsP1.png)

**Descripción:**
Vista de todas las valoraciones enviadas por el usuario como comprador. Muestra la puntuación en estrellas, comentarios de compradore y producto valorado además de las valoraciones en estado pendiente de valorar, permitiendo gestionar la reputación en la plataforma.

#### **10. Valoración en Sales & Orders (Sales & Orders Valoration)**
![Valoración](Readme-Images/Practice1/valoration-in-sales.png)

**Descripción:**
Interfaz que muestra una valoración pendiente en Sales & Orders.

#### **11. Editar Valoración (Edit Valoration)**
![Editar Valoración](Readme-Images/Practice1/EditValorationP1.png)

**Descripción:**
Interfaz para modificar una valoración previamente emitida, permitiendo actualizar la puntuación en estrellas y el comentario asociado a una transacción completada. Mantiene la trazabilidad de las reviews.

#### **12. Área de ayuda al usuario (Help Center)**
![Ayuda Usuario](Readme-Images/Practice1/HelpCenter.png)

**Descripción:**
Interfaz de preguntas frecuentes y acceso a información de contacto a Stilnovo.

#### **13. Perfil del Vendedor (Seller Profile)**
![Perfil Vendedor](Readme-Images/Practice1/seller-profile.png)

**Descripción:**
Interfaz de donde se muestra la información de un vendedor, esta información es; valoración media, número de valoraciones recibidas, nombre, su descripción y sus productos.

#### **14. Valoraciones del Vendedor (Seller Valorations)**
![Valoración Vendedor](Readme-Images/Practice1/seller-valorations.png)

**Descripción:**
Interfaz de donde se muestra las valoraciones recibidas de un vendedor; se muestra una lista de las valoraciones a ese vendedor por parte de otros usuarios que compraron un producto de este vendedor. Esto ayuda a los usuarios a saber que reputaciñon tiene dicho vendedor. 

#### **Área de Administración**

#### **15. Monitor Global de la Plataforma (Admin Dashboard)**
![Monitor Global de la Plataforma](Readme-Images/Practice1/AdminDashboardP1.png)

**Descripción:**
Dashboard exclusivo del administrador con KPIs de sistema: total de usuarios registrados, productos activos, transacciones realizadas, ingresos globales y alertas de moderación. Vista centralizada para la supervisión de la plataforma.

#### **16. Gestión Global de Usuarios (Admin User Management)**
![Gestión de Usuarios](Readme-Images/Practice1/AdminUserManagP1.png)

**Descripción:**
Herramienta de moderación que permite al administrador visualizar todos los usuarios registrados, sus datos de contacto, estado de la cuenta y realizar acciones administrativas como baneos, desbaneos o eliminación de perfiles.

#### **17. Inventario Global de Productos (Admin Global Inventory)**
![Inventario Global](Readme-Images/Practice1/AdminGlobalInvetP1.png)

**Descripción:**
Registro maestro de todos los productos publicados en el marketplace, con información detallada del vendedor, categoría, precio y estado. Permite al administrador editar o eliminar cualquier anuncio que infrinja las normas de la plataforma.

#### **18. Auditoría Financiera Global (Admin Global Transactions)**
![Auditoría Financiera](Readme-Images/Practice1/AdminGlobalTransP1.png)

**Descripción:**
Vista completa de todas las transacciones realizadas en la plataforma, incluyendo comprador, vendedor, producto, fecha, importe y estado. Herramienta para auditoría financiera, gestión de disputas y análisis de volumen de negocio.

#### **19. Gestión Global de Valoraciones (Admin Global Valorations)**
![Gestión de Valoraciones](Readme-Images/Practice1/AdminGlobalValorationsP1.png)

**Descripción:**
Panel administrativo para supervisar todas las valoraciones realizadas en la plataforma. Permite identificar reviews fraudulentas, gestionar reportes y mantener la integridad del sistema de reputación de vendedores.

#### **20. Baneo de un Usuario (User Ban)**
![Usuario baneado](Readme-Images/Practice1/UserBanned.png)

**Descripción:**
Cuando el administrador bloquee a un usuario en **Stilnovo**, si este intenta iniciar sesión, el sistema le mostrará una página informativa indicando que su cuenta ha sido suspendida de la plataforma.


#### **21. Footer**
![Editar Valoración](Readme-Images/Practice1/new-footer.png)

**Descripción:**
Interfaz de donde se muestra el nuevo diseño del pie de página de Stilnovo, este incluye modales informativos, enlaces a redes sociales y la posibilidad de crear una cuenta nueva.

#### **22. Usuario Baneado (Banned User)**
![Modal Footer](Readme-Images/Practice1/modal-footer.png)

**Descripción:**
Aqui se muestra un ejemplo de modal del footer.

### **Instrucciones de Ejecución**

#### **Requisitos Previos**
- **Java**: versión 21 o superior
- **Maven**: versión 3.8 o superior
- **MySQL**: versión 8.0 o superior
- **Git**: para clonar el repositorio

#### **Pasos para ejecutar la aplicación**

1. **Clonar el repositorio**  
   Crea una carpeta para el proyecto, accede a ella y clona el repositorio:

   ```bash
   git clone https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5.git
   cd practica-daw-2025-26/practica-daw-2025-26-grupo-5
   ```

2. **Acceder al directorio del backend**  
   Entra en la carpeta que contiene la lógica del servidor:

   ```bash
   cd backend
   ```

3. **Levantar la base de datos**  
   Asegúrate de tener abierto Docker Desktop (o cualquier otro motor de Docker) y ejecuta el script para inicializar la base de datos:

   ```bash
   ./start_db.sh
   ```

   **Nota:** Espera unos segundos tras ejecutar el script para asegurar que la base de datos se ha creado y configurado correctamente antes del siguiente paso.

4. **Ejecutar la aplicación**  
   Localiza el archivo principal del proyecto en tu IDE (IntelliJ, VS Code, etc.):

   `src/main/java/es/stilnovo/library/Application.java`

5. **Acceso a la web**  
   Una vez que la aplicación esté en marcha, abre tu navegador y accede a:

   ```bash
   https://localhost:8443
   ```

Solo un recordatorio: como la aplicación usa HTTPS en el puerto 8443, la primera vez que entres el navegador te dará un aviso de "Conexión no privada" (por el certificado auto-firmado de desarrollo). Solo tienes que darle a **"Configuración avanzada"** y **"Acceder a localhost (sitio no seguro)"** para entrar.
#### **Credenciales de prueba**
- **Usuario Admin**: usuario: `admin`, contraseña: `admin`
- **Usuario Registrado**: usuario: `user`, contraseña: `user`

### **Diagrama de Entidades de Base de Datos**

Diagrama mostrando las entidades, sus campos y relaciones:

![Diagrama Entidad-Relación](Readme-Images/Practice1/ERsql.png)

> **Descripción del Diagrama:**
> 
> El diagrama EER generado desde MySQL Workbench muestra las tablas principales y las auxiliares creadas por Hibernate:
> 
> - **Tablas principales:** `user_table`, `product_table`, `transaction_table`, `image_table`, `inquiry_table`, `user_interactions`, `valoration_table`.
> - **Tablas auxiliares:** `user_table_favorite_products` (favoritos, relación N:M) y `user_table_roles` (roles por usuario).
> 
> **Relaciones clave (según el diagrama):**
> - `user_table` **1:N** `product_table` (seller_user_id)
> - `product_table` **1:1** `image_table` (image_id)
> - `transaction_table` **N:1** `user_table` (buyer_user_id y seller_user_id)
> - `transaction_table` **1:1** `product_table` (product_id)
> - `inquiry_table` **N:1** `user_table` (buyer_user_id) y **N:1** `product_table` (product_id)
> - `user_interactions` **N:1** `user_table` y **N:1** `product_table`
> - `valoration_table` **N:1** `user_table` (buyer_user_id y seller_user_id) y **N:1** `transaction_table`

### **Diagrama de Clases y Templates**

Diagrama de clases de la aplicación con diferenciación por colores o secciones:

![Diagrama de Clases](Readme-Images/Practice1/Diagrama-Clases-Silnovo.jpg)

> Este diagrama detalla la arquitectura lógica de **Stilnovo**, estructurada en un modelo de capas que garantiza la separación de responsabilidades y la escalabilidad del sistema.
> 
> **Organización de Componentes:**
> * **Vistas (Morado):** Capa de presentación que gestiona la interfaz de usuario, integrando tanto páginas completas como fragmentos HTML dinámicos para una experiencia fluida.
> * **Controladores (Verde):** Encargados de interceptar las peticiones del cliente, coordinar el flujo de navegación y delegar la ejecución de reglas de negocio.
> * **Servicios (Rojo):** Núcleo de la aplicación donde se procesa la lógica de negocio. Centraliza funciones complejas como el cálculo de inventarios, el enfriamiento de notificaciones y la integración con servicios de infraestructura (Email y PDF).
> * **Repositorios (Azul):** Capa de persistencia que utiliza Spring Data JPA para abstraer y gestionar el acceso a los datos de forma eficiente.
> * **Entidades/Modelos (Gris):** Representación de los objetos de dominio, definiendo las reglas de integridad y las relaciones de composición esenciales para el negocio (User, Product, Transaction, etc.).
> 
> **Principios de Diseño:**
> El diagrama refleja un flujo de dependencias unidireccional (Controlador -> Servicio -> Repositorio), minimizando el acoplamiento y permitiendo que la lógica de negocio sea independiente de la tecnología de persistencia o de la interfaz de usuario.

### **Participación de Miembros en la Práctica 1**

#### **Alumno 1 - Victor Hugo Oliveira Petroceli**

Responsable del desarrollo de la arquitectura backend y de la lógica de negocio en las áreas de valoraciones, transacciones, productos y usuario. He implementado el flujo completo de transacciones P2P, el sistema de valoraciones, la seguridad mediante Spring Security y el ciclo de vida integral de los productos . Además, he gestionado la integración de imágenes y la optimización de la persistencia de datos y relaciones complejas entre entidades en la base de datos.

| Nº | Commits | Files |
|:------------: |:------------:| :------------:|
|1| [feat: implement full p2p transaction flow, user ratings, and profile settings](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/0e7534c90c98f684d3dfa4065fc83d454309ab15) | [UserWebController](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/UserWebController.java) |
|2| [refactor: major security overhaul, service-layer migration, and UI fixes](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/4a93d87216e616314c06cf6c1e8f7e82644c6972) | [UserService](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/UserService.java) |
|3| [Product editing and adding implemented with search and categories](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/cec4e04d380abd3adf90684a2d8390aec0b11a61) | [ProductService](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/ProductService.java) |
|4| [Signup working](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/967380ebc229fc60ffbfb0b15d48551f6842120f) | [ValorationService](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/ValorationService.java) |
|5| [feat(admin): implement global transactions page and secure deletion logic](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/adf056929cc3494bd094cb1659b6812c7e9b7933) | [TransactionService](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/TransactionService.java) |

---

#### **Alumno 2 - Alonso Gutiérrez Sánchez**

Responsable de el botón de load-more gestionado mediante un archivo JavaScript AJAX y de la creación de los gráficos de distribución de ventas por categoría (Donut Chart), el de evolución de ingresos mensuales (Line Chart) y el de análisis de visitas contra interés (Bar Chart).

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Button load more correct](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/commit/d06f29e149b58e125f89c6f7ec527f8d2e32126d)  | [MainController.java](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/MainController.java)   |
|2| [Fix delete product problem](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/commit/f80eab54e8342f1bd154f466f2733b6326826a30)  | [ProductService.java](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/ProductService.java)   |
|3| [Donut chart at dashboard](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/commit/302d00518055e584018041ed5d4b7dc69a783a46)  | [dashboard-charts.js](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/resources/static/javascript/dashboard-charts.js)   |
|4| [Graph about monthly revenue and add graphs at statistics-page](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/commit/31c1f423cf1de189b015544a040efa106342d060)  | [UserWebController.java](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/UserWebController.java)   |
|5| [Interaction graph](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/commit/849c80d0ac753eb46fa4fa4e3bec9846199250c7)  | [user-page.html](https://github.com/alonsoo-cmd/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/resources/templates/user-page.html)   |

---

#### **Alumno 3 - Raúl Tejada Merinero**

Responsable de implementar la generación automática de 3 tipos de documentos PDF (factura de compra, recibo de transacción e invoice del vendedor), integrando la librería iText para crear reportes profesionales. Además, he desarrollado un sistema completo de notificaciones por email con 4 templates dinámicos (confirmación de compra, mensaje de comprador, notificación de venta al vendedor, y confirmación de mensaje enviado), utilizando JavaMailSender y SMTP. He optimizado la comunicación usuario-plataforma mediante plantillas de email HTML personalizadas y he asegurado la correcta persistencia y envío de datos críticos en el flujo de transacciones.

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Emails + PDF (done)](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/5f3356464863ce14510d26b7efcc098f5d8d865b) | [MainController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/MainController.java) |
|2| [Pdf Download done](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/c22f5e6afb6de1453584c667cf57f9a5070f071b)  | [UserWebController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/UserWebController.java)   |
|3| [fix secure URLs from pdfs](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/953dd321c9ae1a4928028e6783aa541a5930bc54)  | [UserService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/UserService.java) |
|4| [Fix inquiry emails](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/6ee1d8db98149cba096ff2b8dd7b30bd74d99a8c)  | [AdminController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/AdminController.java)  |
|5| [New Bought Email Update](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/b2c72482cc49939da5b4f9af6dfe4caec7c03348)  | [ProductService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/ProductService.java)   |

---

#### **Alumno 4 - Gabriele Antonio Ricucci**

Responsable del diseño e implementación del motor de recomendaciones (Algoritmo Avanzado), definiendo el modelo de seguimiento de interacciones de usuario y la lógica de negocio subyacente. He desarrollado la lógica de búsqueda de productos, el filtrado dinámico en la vista principal para evitar duplicidades entre recomendaciones y catálogo. Además, he gestionado la integración de estas características complejas en los controladores principales y las vistas.

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Add UserInteraction model and repository method for product recommendations](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/d24f00d25cf986163ff9b4b087c5cbada3f69fac)  | [UserInteraction.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/model/UserInteraction.java)   |
|2| [implement recommendation algorithm and refactor product service](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/16f5a3bc622f8461a9c46a63694642e76f4e491b)  | [ProductService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/ProductService.java)   |
|3| [fix: enhance product search logic and integrate recommendations](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/327ddacac49cd04fc093eba75c74d7518cda39ff)  | [ProductRepository.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/repository/ProductRepository.java)   |
|4| [feat: enhance product listing by filtering out recommended products from main search results](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/38358b1ca156b1b9ec5915ae57c3a56aec1eec99)  | [MainController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/MainController.java)   |
|5| [refactor MainController and User model; add favorite products functionality](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/b7baac40766dee2f394bb960be349e1205f91e54)  | [User.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/model/User.java)   |

---

#### **Alumno 5 - Ariel Rodriguez Lozano**

Responsable de la implementación completa del sistema de administración de la plataforma. He desarrollado todas las funcionalidades especiales del panel de administracion, incluyendo el Dashboard con métricas del sistema, la gestión global de usuarios con control total de ban/unban, eliminar permanentemente a usuario y edición, el inventario global con permisos de edición y borrado total, la supervisión de transacciones y el control de valoraciones. Además, he refactorizado la seguridad de las rutas administrativas mediante Spring Security para garantizar un aislamiento por roles, implementado la restricción de acceso para usuarios baneados en el flujo de login, la pagina de login incorrecto por credenciales erroneas y mejorado diversos detalles de diseño y coherencia visual en todas las vistas del panel de administración. 

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Admin user managment: ban/unban, delete, banned page](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/eb431d7147a4053e67c5a069d70324f2831b18f5)  | [AdminController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/AdminController.java)   |
|2| [Merge main + admin ban/delete preserved](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/52fd6b8046b6cf9b292fb98dd532ec1d833d92fa)  | [AdminService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/AdminService.java)   |
|3| [admin edits user working](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/d2c20491c78687d860385143cd2f35b536e4ab4f)  | [admin-panel-page.html](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/resources/templates/admin-panel-page.html)   |
|4| [Admin editing products from global inventory](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/7a36e48ab3c78e118b9db9a9465a7acdcca10f46)  | [admin-global-invent-page.html](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/resources/templates/admin-global-invent-page.html)   |
|5| [align admin routes and remove public user ID access](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/06d43aff7b95904a4a4f9ccf3efbda7fcfe2ee85)  | [WebSecurityConfig.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/security/WebSecurityConfig.java)   |

---

## 🛠 **Práctica 2: Incorporación de una API REST a la aplicación web, despliegue con Docker y despliegue remoto**

Nota: Para probar los endpoints POST/PUT que requieren imágenes en Postman, por favor adjunte un archivo local en la pestaña Body.

### **Vídeo de Demostración**
📹 **[Enlace al vídeo en YouTube](https://www.youtube.com/watch?v=x91MPoITQ3I)**
> Vídeo mostrando las principales funcionalidades de la aplicación web.

### **Documentación de la API REST**

#### **Especificación OpenAPI**
📄 **[Especificación OpenAPI (YAML)](/api-docs/api-docs.yaml)**

#### **Documentación HTML**
📑 **[Documentación API REST (HTML)](https://raw.githack.com/[usuario]/[repositorio]/main/api-docs/api-docs.html)**

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

🌐 **URL de acceso remota (URJC)**: `https://appweb05.dawgis.etsii.urjc.es:8443`

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

#### **Alumno 3 - Raúl Tejada Merinero**

He extraído gran parte de la lógica de negocio de los controladores hacia los servicios, mejorando significativamente la mantenibilidad y testabilidad del código base. Implementé los controllers REST de PDF, Image, Notification y Transaction, además de diseñar y desarrollar los DTOs que aseguran una comunicación correcta entre frontend y backend. He sido responsable de la creación y configuración completa de la infraestructura Docker: Dockerfile con multi-stage build, docker-compose.yml parametrizado para multi-entorno, y scripts de publicación en DockerHub. Agregué documentación comprehensiva con JavaDoc en 40+ archivos (controladores, servicios, DTOs, configuración Docker), asegurando coherencia en inglés. Responsable de la grabación del vídeo de la entrega de Práctica 2.

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [feat: implement REST endpoints, refactor services, add Docker config, mobile dashboards and validations](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/683a6a0b174c203ec5e1937c562e079530cc413d)  | [NotificationService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/NotificationService.java)   |
|2| [feat: internationalize codebase with English docs and fix docker parametrization](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/53db67b80c5e91283329f71f39252fab772a465f)  | [UserWebController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/UserWebController.java)   |
|3| [chore: format numbers the same way in backend and templates](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/60dc3215315075456ab7d9c28f9a07ad25cb8e7d)  | [AdminService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/AdminService.java)   |
|4| [Revert changes that was an error](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/5c4d0a20fe5f8afa31229f7579531665444a44b3)  | [ProductService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/ProductService.java)   |
|5| [Create /docker folder but need to be revised](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/a5d4b03c3588c9919628f71729407a4b8a448f3b)  | [TransactionService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/TransactionService.java)   |

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



