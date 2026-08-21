<div align="center">

# 🍽️ DITS

## Sistema de gestión de platillos y pedidos

**Progressive Web App (PWA)**

Aplicación web progresiva para registrar platillos, gestionar pedidos, consultar información de productos y obtener la ubicación del cliente.

<br>

![DITS](https://img.shields.io/badge/DITS-PWA-4DC7E4?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![PWA](https://img.shields.io/badge/Progressive-Web%20App-purple?style=for-the-badge)

<br>

**Proyecto académico**

**Martínez Merlín Luis Fernando**  
**Sistemas Computacionales**  
**Programación Avanzada**  
**ISC181**  
**Universidad Multicultural CUDEC**

**2026**

</div>

---

# 📋 Índice

- [📖 Descripción del proyecto](#-descripción-del-proyecto)
- [🎯 Objetivos](#-objetivos)
- [✨ Características principales](#-características-principales)
- [🛠️ Tecnologías utilizadas](#️-tecnologías-utilizadas)
- [📂 Estructura del proyecto](#-estructura-del-proyecto)
- [🔄 Funcionamiento general](#-funcionamiento-general)
- [🗄️ Base de datos](#️-base-de-datos)
- [📱 Progressive Web App](#-progressive-web-app)
- [📍 Sistema de ubicación](#-sistema-de-ubicación)
- [📷 Sistema de cámara](#-sistema-de-cámara)
- [📸 Evidencias](#-evidencias)
- [🚀 Instalación](#-instalación)
- [▶️ Ejecución](#️-ejecución)
- [📚 Uso de la aplicación](#-uso-de-la-aplicación)
- [🔐 Seguridad](#-seguridad)
- [👨‍💻 Autor](#-autor)
- [📄 Licencia](#-licencia)

---

# 📖 Descripción del proyecto

**DITS** es una aplicación web progresiva (**Progressive Web App**) desarrollada para facilitar la administración de platillos y la realización de pedidos.

La aplicación permite registrar diferentes platillos proporcionando información como:

- 🍽️ Nombre del platillo.
- 🧂 Ingredientes.
- 💰 Precio.
- 📷 Fotografía.

Los usuarios pueden consultar los platillos disponibles y seleccionar uno para realizar un pedido.

Durante el proceso de pedido, el usuario puede introducir sus datos y utilizar la ubicación de su dispositivo para obtener automáticamente sus coordenadas y una dirección aproximada.

La información de los platillos y pedidos se almacena en **Firebase Cloud Firestore**, permitiendo que los cambios se reflejen dinámicamente en la aplicación.

El proyecto fue desarrollado con fines académicos para demostrar el uso de tecnologías web, bases de datos en la nube, geolocalización, cámara y aplicaciones web progresivas.

---

# 🎯 Objetivos

## 🎯 Objetivo general

Desarrollar una **Progressive Web App** que permita administrar platillos y gestionar pedidos de manera sencilla, utilizando tecnologías web modernas, una base de datos en la nube y servicios de geolocalización.

---

## 📌 Objetivos específicos

- Crear una interfaz web intuitiva y adaptable.
- Implementar el registro de platillos.
- Permitir almacenar nombre, ingredientes, precio y fotografía.
- Mostrar dinámicamente los platillos disponibles.
- Permitir eliminar platillos.
- Implementar un sistema para realizar pedidos.
- Registrar el nombre del cliente.
- Registrar la dirección de entrega.
- Obtener la ubicación del usuario mediante GPS.
- Mostrar la ubicación del usuario mediante un mapa.
- Convertir coordenadas GPS en una dirección.
- Almacenar los pedidos en Firebase Firestore.
- Mostrar los pedidos realizados en la página principal.
- Permitir eliminar pedidos.
- Implementar acceso a la cámara del dispositivo.
- Permitir seleccionar fotografías desde el dispositivo.
- Implementar una Progressive Web App.
- Utilizar un Service Worker para las funcionalidades PWA.

---

# ✨ Características principales

## 🍽️ Administración de platillos

La aplicación permite administrar los platillos disponibles.

### Funciones:

- ➕ Agregar platillos.
- 📝 Registrar nombre.
- 🧂 Registrar ingredientes.
- 💰 Registrar precio.
- 📷 Agregar fotografía.
- 👁️ Visualizar platillos.
- 🗑️ Eliminar platillos.
- 🔄 Actualización automática mediante Firebase.

---

## 🛒 Sistema de pedidos

El usuario puede realizar un pedido seleccionando uno de los platillos disponibles.

### Proceso:

```text
Seleccionar platillo
        ↓
Consultar ingredientes
        ↓
Consultar precio
        ↓
Ingresar nombre
        ↓
Obtener ubicación
        ↓
Obtener dirección
        ↓
Confirmar pedido
        ↓
Guardar en Firebase
        ↓
Mostrar pedido en Inicio
