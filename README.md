# Stilnovo - Reinvent your space: Where design with history finds its new home.

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
- **Gráfico 3**: Análisis de Visitas vs. Interés (Bar Chart): Gráfico de barras comparativo que mide el tráfico recibido frente a las interacciones reales (compras) por cada tipo de producto.
  
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
📹 **[Enlace al vídeo en YouTube](https://youtu.be/uGIF1hk7TAM)**
> Vídeo mostrando las principales funcionalidades de la aplicación web.

### **Documentación de la API REST**

#### **Especificación OpenAPI**
📄 **[Especificación OpenAPI (YAML)](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/api-docs/api-docs.yaml)**

#### **Documentación HTML**
📑 **[Documentación API REST (HTML)](https://raw.githack.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/main/api-docs/api-docs.html)**

> La documentación de la API REST se encuentra en la carpeta `/api-docs` del repositorio. Se ha generado automáticamente con SpringDoc a partir de las anotaciones en el código Java.

### **Diagrama de Clases y Templates Actualizado**

Diagrama actualizado incluyendo los @RestController y su relación con los @Service compartidos:

![Diagrama de Clases Actualizado](Readme-Images/Practice2/Stilnovo-Diagrama-Clases-2.jpg)

Este diagrama detalla la arquitectura lógica de **Stilnovo**, estructurada en un modelo de capas que garantiza la separación de responsabilidades y la escalabilidad del sistema.
> 
> **Organización de Componentes:**
> * **Vistas (Morado):** Capa de presentación que gestiona la interfaz de usuario, integrando tanto páginas completas como fragmentos HTML dinámicos para una experiencia fluida.
> * **Controladores (Verde):** Encargados de interceptar las peticiones del cliente, coordinar el flujo de navegación y delegar la ejecución de reglas de negocio.
> * **Controladores REST (Verde Oscuro):** Puntos de entrada de la API. Interceptan las peticiones HTTP (GET, POST, PUT, DELETE), orquestan las operaciones y devuelven respuestas estructuradas exclusivamente en formato JSON.
> * **DTOs / Objetos de Transferencia (Azul Oscuro):** Estructuras de datos ligeras (Data Transfer Objects) diseñadas para transportar información entre el cliente y el servidor. Aíslan y protegen las entidades del modelo, exponiendo solo los datos necesarios y optimizando el rendimiento.
> * **Servicios (Rojo):** Núcleo de la aplicación donde se procesa la lógica de negocio. Centraliza funciones complejas como el cálculo de inventarios, el enfriamiento de notificaciones y la integración con servicios de infraestructura (Email y PDF).
> * **Repositorios (Azul):** Capa de persistencia que utiliza Spring Data JPA para abstraer y gestionar el acceso a los datos de forma eficiente.
> * **Entidades/Modelos (Gris):** Representación de los objetos de dominio, definiendo las reglas de integridad y las relaciones de composición esenciales para el negocio (User, Product, Transaction, etc.).

> **Recomendación:** Para una mejor visualización y claridad de los detalles, se recomienda descargar la imagen y abrirla en el ordenador personal. El diagrama cuenta con suficiente resolución para una experiencia óptima al hacer zoom sobre áreas específicas de interés.

---

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

| Problema | Causa | Solución |
|----------|-------|----------|
| `ERROR: MYSQL_ROOT_PASSWORD is required` | `.env` no encontrado | Asegúrate de que `.env` esté en el directorio raíz |
| `Permission denied... docker.sock` | Permisos de usuario (Linux) | `sudo usermod -aG docker $USER` y reinicia sesión |
| `address already in use` | Puerto 8443 ocupado | Cambia `SERVER_PORT` en `.env` a otro puerto (ej: 8444) |
| `MySQL connection refused` | BD no lista | Espera 15-30 segundos, los contenedores tardan en iniciar |
| `ERROR: can't find docker-compose.yml` | Estás en el directorio equivocado | Asegúrate de estar en la raíz del proyecto |

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

| Tarea | Comando | Ubicación |
|-------|---------|-----------|
| **0. Navegar** | `cd docker` | Raíz del proyecto |
| **1. Crear imagen** | `.\create_image.ps1 -ImageName "stilnovo-app:latest"` | `docker/` |
| **2. Publicar imagen** | `.\publish_image.ps1 -DockerHubUsername "tu-usuario"` | `docker/` |
| **3. Publicar docker-compose** | `.\publish_docker-compose.ps1 -DockerHubUsername "tu-usuario"` | `docker/` |
| **4. Ejecutar localmente** | `docker compose --env-file ..\.env up` | `docker/` |
| **5. Detener** | `Ctrl+C` o `docker compose down` | Terminal activa |

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

| Error | Causa | Solución |
|-------|-------|----------|
| `Permission denied` | Script no ejecutable (Linux/Mac) | `chmod +x docker/*.sh` |
| `cannot find command` | Script no encontrado | Asegúrate de estar en la raíz del proyecto |
| `docker: not found` | Docker no instalado | Instala Docker desde https://docker.com |
| `not authorized: incorrect username` | No estás logueado en DockerHub | Ejecuta `docker login` primero |
| `image not found` | `create_image` no se ejecutó antes | Ejecuta `create_image` antes de `publish_image` |
| `ExecutionPolicy` (PowerShell) | PowerShell bloquea scripts | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |

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

| Problema | Causa | Solución |
|----------|-------|----------|
| "Connection refused" en servidor | Contenedores no están corriendo | Verifica: `docker ps` y `docker logs stilnovo-app` |
| "Image not found" en paso 2.3 | La imagen no se subió a DockerHub | Vuelve a FASE 1, paso 1.3 |
| App ve datos viejos | No hiciste `docker compose down -v` | Borra todo man y vuelve a empezar: `sudo docker compose down -v` |
| "Permission denied" en ssh | Clave privada con permisos incorrectos | `chmod 600 ssh-keys/appWeb05.key` |
| BD corrupta o errores raros | El paso `docker compose pull` no funcionó | Fuerza actualización: `docker rmi $(docker images -q)` y repite paso 2.3 |
| "Cannot connect to Docker daemon" | Docker no corre en la VM | SSH a la VM y: `sudo systemctl restart docker` |

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

### **URL de la Aplicación Desplegada**

🌐 **URL de acceso remota (URJC)**: `https://appweb05.dawgis.etsii.urjc.es:8443`

#### **Credenciales de Usuarios de Ejemplo**

| Rol | Usuario | Contraseña |
|:---|:---|:---|
| Administrador | admin | admin123 |
| Usuario Registrado | user1 | user123 |
| Usuario Registrado | user2 | user123 |

### **Participación de Miembros en la Práctica 2**

#### **Alumno 1 - Victor Hugo Oliveira Petroceli**

Mi contribución principal se ha centrado en la transición de la lógica de negocio a una arquitectura de API REST basada en entidades y la robustez del sistema. He formado parte de la reestructuración de los controladores siguiendo el principio de "Agrupación por Entidad", consolidando la lógica de Transactions, Products y Users. He implementado el sistema de gestión de perfil de usuario (incluyendo carga de imágenes multipart y dashboards de estadísticas) y la lógica de transacciones/valoraciones. Además, configuré la seguridad, la especificación OpenAPI 3.0 y he diseñado un manejador de errores global (ApiErrorController) capaz de distinguir entre peticiones API (JSON) y Web (HTML) para evitar conflictos de rutas.

| Nº | Commits | Files |
|:--:|:-------:|:-----:|
|1| [feat: complete UserWebRestController with full product CRUD and profile management](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/a0a3f06540e924d537c6eff5b40dd7fec9f4bf49) | [UserWebRestController](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/restControllers/UserWebRestController.java) |
|2| [feat & refactor: implement entity-based REST API and consolidate controller layer](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/8f096222e021ddfedbaaca7f62555b4363dca53b) | [ProductRestController](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/restControllers/ProductRestController.java) |
|3| [docs: implement OpenAPI specification, configure CORS security and project cleanup](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/d210145246dc74473854b13175eac14f6c9a6273) | [api-docs](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/tree/main/api-docs) |
|4| [refactor: clean controllers, fix multipart handling, and validate API endpoints](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/b48f6cac888d36adec13a1475c7c953c4facbd76) | [UserWebRestController](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/restControllers/UserWebRestController.java) |
|5| [fix: implement custom error handler and resolve route mapping conflict](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/f864e4105c934738a7baaadde171239ea6e1a913) | [ApiErrorController](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/restControllers/ApiErrorController.java) |

---

#### **Alumno 2 - Alonso Gutiérrez Sánchez**

Mi contribución ha sido crear los DTOs y mappers de las entidades, implementar y corregir algunos endpoints de la aplicación, aportando también a la creación de el archivo api.postman_collection.json, y la creación de la documentación mediante OpenAPI

| Nº  | Commits | Files |
|:------------: |:------------:| :------------:|
|1| [DTOs documented](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/2b3c413) | [UserDTO.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/dto/UserDTO.java) |
|2| [Class notification done](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/b4d20d6) | [NotificationRestController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/NotificationRestController.java) |
|3| [Added some endpoints to AdminRestController, Class AdminRestController DONE](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/6c8b660) | [AdminRestController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/AdminRestController.java) |
|4| [Class transaction completed and postman file corrected](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/206c639) | [TransactionRestController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/TransactionRestController.java) |
|5| [DTOs and Mappers](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/1a2a1d6) | [UserMapper.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/mapper/UserMapper.java) |

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

#### **Alumno 4 - Gabriele Antonio Ricucci**

Mi contribución se ha centrado en la implementación de endpoints REST para el dashboard de usuarios, 
estadísticas de transacciones y gestión de productos. He trabajado en la creación de servicios para 
el manejo de favoritos (add/remove productos), endpoints de perfil de usuario y la integración con 
la colección de Postman. Además, he colaborado en la validación y mejora de los endpoints existentes 
para asegurar que sigan correctamente las convenciones REST.

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [feat: add REST endpoints for user dashboard and statistics](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/956d09121ba4f3cd508eced3823307ac9d18507f)  | [UserWebRestController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/restControllers/UserWebRestController.java)   |
|2| [feat: add DELETE endpoint for user profile photo](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/faab91cb583ad04e751327b55745b892b529e7dd)  | [api.postman_collection.json](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/api.postman_collection.json)   |
|3| [feat: add GET endpoint to retrieve transaction details by ID](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/2af83e47f68eb92bf3990a029b542a7c5ec4fa75)  | [AdminRestController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/2af83e47f68eb92bf3990a029b542a7c5ec4fa75/backend/src/main/java/es/stilnovo/library/controller/restControllers/AdminRestController.java)   |
|4| [feat: implement add product to favorites functionality](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/be248dc29bea30d80b0799c4a7f66137d0db2e52)  | [UserInteractionRepository.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/be248dc29bea30d80b0799c4a7f66137d0db2e52/backend/src/main/java/es/stilnovo/library/repository/UserInteractionRepository.java)   |
|5| [feat: add functionality to remove product from favorites](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/2e5b84281e8d9ee94bb64a676aa7fb011ee7f1ea)  | [UserService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/be248dc29bea30d80b0799c4a7f66137d0db2e52/backend/src/main/java/es/stilnovo/library/service/UserService.java)   |

---

#### **Alumno 5 - Ariel Rodriguez Lozano**

Mi contribución se ha centrado en la mejora y consolidación de la capa REST de la aplicación. He completado endpoints clave en el área de administración, especialmente en la gestión de usuarios, asegurando que sigan correctamente las convenciones REST. Además, he implementado un manejador global de errores para unificar las respuestas de la API en formato JSON y he añadido el endpoint de actualización de valoraciones, integrándolo con la lógica de negocio existente y garantizando la validación de permisos y el recálculo de ratings.

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [implemented full product managment endpoints of admin (GET, POST, PUT)](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/5c43db888f297e17dd1ec8e69ca94a02e526ec4b)  | [GlobalExceptionHandler.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/restControllers/GlobalExceptionHandler.java)   |
|2| [feat(rest): add global JSON error handling and proper HTTP status codes](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/aebbbc851433d3645f2a4e390d607f61e674f17b)  | [AdminRestController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/restControllers/AdminRestController.java)   |
|3| [add user detail and update endpoints (GET/PUT)](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/896cc46197f0f78e803bf930de523c216b5ab12d)  | [ValorationRestController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/restControllers/ValorationRestController.java)   |
|4| [feat(rest): add update valoration endpoint](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/688ca28feec1726d1bea4787b24220687017e34a)  | [UserWebRestController.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/controller/restControllers/UserWebRestController.java)   |
|5| [fix(rest): clean duplicate endpoints and fix profile photo update](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/db08a71b1038f3a1795c79f47a1e4e46507a1a1e)  | [WebSecurityConfig.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/security/WebSecurityConfig.java)   |

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
   git clone https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5.git
   cd practica-daw-2025-26-grupo-5
   ```
3. **Ejecución del Backend (para la base de datos)**
   

   El backend debe estar activo para que Hibernate cree las tablas y cargue los datos iniciales.
    Abre el proyecto en tu IDE.

   Localiza la clase Application.java en backend/src/main/java/....

   Ejecuta la aplicación (Run).

    El servidor arrancará en:
    ```bash
      https://localhost:8443/new/
    ```
4. **Navegar a la carpeta del proyecto React**
    
   Muevete a:
   
   ```bash
   cd frontend
   ```
   Instala las dependencias
   
   ```bash
   npm install
   ```

5. **Ejecuta el Frontend**

    Inicia el servidor de desarrollo de Vite:
   
    ```bash
     npm run dev
     ```
   El terminal mostrará que la aplicación está lista en (navega a esa URL):
   
   ```bash
    http://localhost:5173/new/
   ```
   
> ℹ **Nota**  
> Para más detalles sobre la configuración avanzada del entorno de desarrollo, consulta el archivo  
> [`advanced-react-spa-setup.md`](./advanced-react-spa-setup.md).

### Diagrama de Arquitectura y Componentes de la SPA

A continuación se presenta el diagrama estructural de nuestra Single Page Application (SPA), detallando la jerarquía de componentes React, el enrutamiento, los servicios y su intercomunicación:

![Diagrama de Arquitectura React](Readme-Images/Practice3/SPA-diagram.jpg)

#### Arquitectura SPA (React Frontend)
El diagrama ilustra el diseño modular y el flujo de datos de nuestra aplicación:

* **Entrada y Enrutamiento:** `main.tsx` y `root.tsx` actúan como núcleo principal, distribuyendo la navegación hacia las distintas vistas mediante *Outlets*.
* **Capa de Seguridad:** El área gris (`protected-layout.tsx`) encapsula las rutas privadas (`user`, `admin`, ...), aislándolas de forma segura de las rutas públicas (`login`, `signup`).
* **Módulos y UI:** Cada sección principal cuenta con sus propias sub-rutas anidadas y consume componentes de interfaz reutilizables (como *Headers*, *Footers* y *Sidebars*).
* **Estado y Backend:** *Zustand* (`useUserStore.ts`) gestiona la sesión del usuario de forma global, mientras que la capa de *Services* centraliza la lógica HTTP, utilizando `api.ts` para conectar fluidamente con el backend REST de Spring Boot.

### **Integración con Gemini AI**

Como valor añadido a la plataforma Stilnovo, hemos integrado **Gemini AI** para asistir a los usuarios tanto en la redacción de descripciones de productos como en la resolución de dudas. Esta funcionalidad permite generar textos profesionales y atractivos automáticamente, tanto al crear un nuevo artículo como al editar uno existente.

Además, hemos ampliado la experiencia de soporte incorporando asistencia inteligente en el **footer** y en el **Help Center**, donde los usuarios registrados pueden recibir ayuda contextual mediante IA de forma rápida y eficiente.

#### **Configuración del Asistente**

Por motivos de seguridad, esta funcionalidad está **deshabilitada por defecto** (no bloquea el normal funcionamiento de la aplicación), ya que requiere una clave de API privada. Sigue estos pasos para activarla:

1.  **Obtener una API Key:**
    * Accede a [Google AI Studio](https://aistudio.google.com/app/api-keys).
    * Inicia sesión con la cuenta de Google que desees.
    * Puedes copiar una clave existente o generar una nueva haciendo clic en **"Create API key"**.

2.  **Configurar el entorno del Backend:**
    * Dirígete a la carpeta `/backend` de tu proyecto.
    * Crea un nuevo archivo llamado exactamente: `ai-application-key.properties` a la altura de `application.properties`.
    * Dentro de ese archivo, añade la siguiente línea sustituyendo el valor por tu clave:
      ```properties
      google.ai.api.key=TU_API_KEY_AQUÍ
      ```

3.  **Finalización:**
    * Reinicia la aplicación de Spring Boot. 
    * El sistema detectará la clave automáticamente y habilitará el botón **"Improve with AI"** en los formularios de producto y las secciones de ayuda con ia serán funcionales.

> **Nota:** La aplicación cuenta con "degradación progresiva" (*graceful degradation*). Si decides no configurar la IA, Stilnovo arrancará con normalidad y el resto de funciones de gestión de productos seguirán operativas sin errores.

### **Participación de Miembros en la Práctica 3**

#### **Alumno 1 - Victor Hugo Oliveira Petroceli**

Me he encargado del desarrollo e integración de varias funcionalidades clave del proyecto, incluyendo la gestión de usuarios, el sistema de valoraciones, la integración de inteligencia artificial en diferentes flujos (creación, edición de productos y ayudas al usuario mediante simulación de un ChatBot), así como mejoras generales en la interfaz y experiencia de usuario.

También he trabajado en la configuración de la nueva ruta `/new/` para la integración de la SPA, en la mejora estética de distintas partes de la aplicación, y en la revisión exhaustiva del código para asegurar consistencia, calidad y correcto funcionamiento del sistema.

Además, he participado en la implementación y refinamiento de funcionalidades relacionadas con productos, dashboards de usuario y componentes reutilizables de la interfaz, contribuyendo a una arquitectura más limpia y mantenible.

| Nº | Commits | Files |
|:--:|:--------|:------|
| 1 | [feat: implement product creation and Gemini AI integration](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/9ab5e616c1d26b035e74da6db30e9eca84521981) | [AIService.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/service/AI/AIService.java) |
| 2 | [feat: integrate SPA into /new subpath and configure resource routing](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/7960b196620640375f88524893b6ac9a40468395) | [SpaRoutingConfig.java](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/backend/src/main/java/es/stilnovo/library/SpaRoutingConfig.java) |
| 3 | [feat(valorations): implement review management system](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/01b0befca9b4fb0e5de4813039798a1afd516040) | [valorations-service.ts](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/frontend/app/services/valorations-service.ts) |
| 4 | [feat(products): refine CRUD flow and integrate AI in editing](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/8150ed69f042afa7476e1c51f13a20ddc0636482) | [ProductForm.tsx](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/frontend/app/components/ProductForm.tsx) |
| 5 | [feat: implement common sidebar and user dashboard UI](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/daa3e3830bbbf4e3d7a050c8478678eaa69f3f69) | [Sidebar.tsx](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/frontend/app/components/Sidebar.tsx) |

---

#### **Alumno 2 - Alonso Gutiérrez Sánchez**

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

Me he encargado del desarrollo integral del panel de administración del proyecto, implementando los sistemas completos de gestión de usuarios, transacciones, inventario de productos y moderación de valoraciones. Además, he desarrollado el sistema de reportes, programando la generación y exportación de los tres documentos PDF clave para la plataforma.

Por otro lado, he liderado gran parte del diseño y desarrollo de la interfaz gráfica del frontend. Mi enfoque principal ha sido la mejora estética y funcional de las vistas, creando una aplicación web moderna, accesible y centrada en la usabilidad del usuario final, garantizando una navegación fluida, intuitiva y coherente en toda la plataforma.

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [fix: Refactor project structure to match professor's Practice 3 implementation - React Router v7 SPA with Spring Boot](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/cb17625dd579a8752054ab723abada8bd3641c9e)  | [admin-inventory.tsx](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/frontend/app/routes/admin/admin-inventory.tsx)   |
|2| [style: unify UI architecture with react-bootstrap and enhance global aesthetic](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/a57c939e8337b969f5896822e7209268c68b052c)  | [admin-transactions.tsx](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/frontend/app/routes/admin/admin-transactions.tsx)   |
|3| [Add initial frontend setup with Vite and Initialize React SPA with TypeScript, Zustand, React Router, and Bootstrap.](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/3c29e24d994ea818dafb0653d7a374e32f873566)  | [admin-dashboard.tsx](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/frontend/app/routes/admin/admin-dashboard.tsx)   |
|4| [feat(frontend): migrate all SPA routes to react-bootstrap with visual improvements](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/ffe1b70d7656df6364b82eb5f78489261d34255d)  | [user-settings.tsx](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/frontend/app/routes/user/user-settings.tsx)   |
|5| [feat: Add admin inventory management, transactions, valorations, and login functionality (NOT FINISHED)](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/commit/e12c235d4b3c0fcb7d0df62d88dbf70946791b54)  | [admin-users.tsx](https://github.com/CodeURJC-DAW-2025-26/practica-daw-2025-26-grupo-5/blob/main/frontend/app/routes/admin/admin-users.tsx)   |

---

#### **Alumno 4 - Gabriele Antonio Ricucci**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |

---

#### **Alumno 5 - Ariel Rodriguez Lozano**

[Descripción de las tareas y responsabilidades principales del alumno en el proyecto]

| Nº    | Commits      | Files      |
|:------------: |:------------:| :------------:|
|1| [Descripción commit 1](URL_commit_1)  | [Archivo1](URL_archivo_1)   |
|2| [Descripción commit 2](URL_commit_2)  | [Archivo2](URL_archivo_2)   |
|3| [Descripción commit 3](URL_commit_3)  | [Archivo3](URL_archivo_3)   |
|4| [Descripción commit 4](URL_commit_4)  | [Archivo4](URL_archivo_4)   |
|5| [Descripción commit 5](URL_commit_5)  | [Archivo5](URL_archivo_5)   |



