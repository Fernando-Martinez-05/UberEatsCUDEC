
document.addEventListener('DOMContentLoaded', function() {
// nav menu
const menus = document.querySelectorAll('.side-menu');
M.Sidenav.init(menus, {edge: 'right'});
// add recipe form
const forms = document.querySelectorAll('.side-form');
M.Sidenav.init(forms, {edge: 'left'});
});


let contenidoLista = '';

db.collection("platillos").onSnapshot((datos) => {
    
    datos.docChanges().forEach((registro) => {
        
        if (registro.type === "added") {
            agregarAlista(registro.doc.data(), registro.doc.id);
        }
        
    }); 
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems)
});

function agregarAlista(platillo, id) {
    contenidoLista += `<option value='${id}'>${platillo.nombre}</option>`;
    
    document.querySelector('#platillo').innerHTML = contenidoLista;
}

M.AutoInit();