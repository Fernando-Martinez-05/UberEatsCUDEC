# DITS

## 1. Título del proyecto

**DITS**  
**Tipo de aplicación:** Progressive Web App (PWA)

DITS es una aplicación web progresiva orientada a la gestión y realización de pedidos de platillos. Permite registrar platillos, consultar su información, realizar pedidos y almacenar la información utilizando Firebase Firestore.

**Materia:** [Nombre de la materia]  
**Carrera:** [Nombre de la carrera]  
**Alumno:** [Nombre del alumno]  
**Grupo:** [Grupo]  
**Institución:** [Nombre de la institución]

---

# 2. Descripción del proyecto

DITS es una aplicación desarrollada como una Progressive Web App (PWA) para facilitar la administración de platillos y la realización de pedidos.

La aplicación permite al usuario consultar los platillos disponibles, seleccionar un platillo, proporcionar sus datos y ubicación para realizar un pedido.

Además, cuenta con una sección para registrar nuevos platillos, incluyendo su nombre, ingredientes, precio y fotografía.

La información de los platillos y pedidos se almacena en **Firebase Firestore**, permitiendo que los datos se actualicen de manera dinámica.

El proyecto está dirigido principalmente a usuarios que desean consultar y realizar pedidos de comida, así como a administradores que necesitan gestionar los platillos disponibles.

---

# 3. Objetivos

## Objetivo general

Desarrollar una Progressive Web App que permita administrar platillos y realizar pedidos de manera sencilla, utilizando tecnologías web modernas y una base de datos en la nube.

## Objetivos específicos

- Crear una interfaz web sencilla e intuitiva.
- Permitir registrar nuevos platillos.
- Permitir agregar nombre, ingredientes, precio y fotografía a cada platillo.
- Mostrar dinámicamente los platillos disponibles.
- Permitir seleccionar un platillo para realizar un pedido.
- Registrar los datos del cliente.
- Obtener la ubicación del usuario mediante GPS.
- Convertir las coordenadas obtenidas en una dirección.
- Registrar los pedidos en Firebase Firestore.
- Mostrar los pedidos realizados en la página principal.
- Permitir eliminar platillos registrados.
- Permitir eliminar pedidos.
- Implementar funcionalidades de cámara para obtener fotografías de los platillos.
- Implementar la aplicación como una PWA.

---

# 4. Características principales

La aplicación cuenta con las siguientes funcionalidades:

### Gestión de platillos

- Registro de nuevos platillos.
- Nombre del platillo.
- Ingredientes.
- Precio.
- Fotografía.
- Consulta de platillos almacenados en Firebase.
- Eliminación de platillos.
- Actualización automática de la información mediante Firestore.

### Realización de pedidos

- Selección de un platillo disponible.
- Visualización de ingredientes.
- Visualización del precio.
- Registro del nombre del cliente.
- Registro de dirección.
- Obtención de ubicación mediante GPS.
- Visualización de coordenadas.
- Visualización de ubicación en un mapa.
- Conversión automática de coordenadas a dirección.
- Registro del pedido en Firebase Firestore.

### Cámara

- Acceso a la cámara del dispositivo.
- Captura de fotografías.
- Selección de imágenes desde el dispositivo.
- Vista previa de la fotografía.
- Limpieza de la fotografía seleccionada.

### Página principal

- Visualización de los pedidos realizados.
- Información del platillo.
- Precio.
- Ingredientes.
- Nombre del cliente.
- Dirección de entrega.
- Eliminación de pedidos.

### PWA

- Aplicación instalable.
- Manifest de la aplicación.
- Service Worker.
- Iconos para diferentes tamaños de pantalla.
- Diseño adaptable a dispositivos móviles y computadoras.

### Mapa

- Visualización de mapas mediante OpenStreetMap.
- Uso de Leaflet.
- Marcador de ubicación.
- Obtención de ubicación actual.
- Actualización de la posición del marcador.

---

# 5. Tecnologías utilizadas

## HTML5

Se utiliza para crear la estructura de las diferentes páginas de la aplicación.

## CSS3

Se utiliza para diseñar la interfaz y adaptar la aplicación a diferentes tamaños de pantalla.

## JavaScript

Se utiliza para implementar la lógica de la aplicación, manipular elementos del DOM, gestionar eventos y conectar la interfaz con Firebase.

## Materialize CSS

Framework utilizado para facilitar el diseño de la interfaz, botones, formularios, menús laterales, iconos y componentes visuales.

## Firebase

Servicio utilizado para almacenar y sincronizar los datos de la aplicación.

### Firebase Firestore

Se utiliza como base de datos NoSQL para almacenar:

- Platillos.
- Pedidos.

## Leaflet

Librería utilizada para mostrar mapas interactivos y administrar marcadores de ubicación.

## OpenStreetMap

Proveedor de los mapas utilizados dentro de la aplicación.

## Nominatim

Servicio utilizado para convertir coordenadas GPS en direcciones mediante geocodificación inversa.

## Service Worker

Se utiliza para implementar características de Progressive Web App y permitir que la aplicación pueda funcionar como una aplicación instalable.

---

# 6. Estructura del proyecto

La estructura principal del proyecto es la siguiente:

```text
DITS/
│
├── index.html
├── manifest.json
├── sw.js
├── README.md
│
├── css/
│   ├── materialize.min.css
│   └── styles.css
│
├── js/
│   ├── firebase.js
│   ├── index.js
│   ├── db.js
│   └── materialize.min.js
│
├── pages/
│   ├── pedidos.html
│   ├── registrar.html
│   ├── about.html
│   └── contact.html
│
├── img/
│   └── [imágenes utilizadas por la aplicación]
│
└── iconos/
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-48x48.png
    ├── icon-64x64.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-180x180.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
