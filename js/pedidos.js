document.addEventListener('DOMContentLoaded', function() {
  // nav menu
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, {edge: 'right'});
  // add recipe form

});

let contenidoLista = '';

db.collection("platillos").onSnapshot((datos) => {
    datos.docChanges().forEach((registro)=> {
        if (registro.type === "added") {
            agregarALista(registro.doc.data(), registro.doc.id);
        }
    });
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);

});

function agregarALista(platillo, id){
    contenidoLista += `<option value='${id}'>
    ${platillo.nombre}
    </option>`;
    document.getElementById("listaPlatillos").innerHTML = contenidoLista;
    
}
M.AutoInit();
document.getElementById("btnUbicacion").addEventListener("click|",function(){
    if(navigator.geolocation){
        navigatior.geolocation.getCurrentPosition(exito,error);
    }
});

function exito(posicion) {
    let  latitud = posicion.coords-latitude;
    let longitud = posicion.coords.longitude;
    fetonch = `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${latitud}&lon=${longitud}&format=json`
    
}

const formularioAgregar = document. querySelector("form");
formularioAgregar. addEventListener("submit", (e) => {
   e.preventDefault();
const platilloNuevo = {
    nombre: formularioAgregar.title.value,
    ingredientes: formularioAgregar.ingredients.value,
    precio: formularioAgregar.price.value
}

db.collection("platillos").add(platilloNuevo)
.catch((error) => {
    console.log(error);
    alert("Error al agregar platillo");
 }
 );
 formularioAgregar.title.value = "";
 formularioAgregar.ingredients.value = "";
 formularioAgregar.price.value = "";
 alert("Platillo agregado");
});