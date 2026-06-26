let contenido = '';

document.addEventListener('DOMContentLoaded', function() {
const menus = document.querySelectorAll('.side-menu');
M.Sidenav.init(menus, {edge: 'right'});
const forms = document.querySelectorAll('.side-form');
M.Sidenav.init(forms, {edge: 'left'});
});


function mostrarPlatillo(Platillo, id){
contenido += `
<div class = "card-panel recipe white row"
id="${id}"> 
<div class = "recipe-details">
<div class = "recipe-title">
${Platillo.nombre}
</div>

<div class = "recipe-ingredients">
${Platillo.ingredientes}
</div>

<div class = "recipe-price">
${Platillo.Precio}
</div>


</div>
<div class = "recipe-delete">
<i class = "material-icons"  data-id="${id}">delete_outline</i>

</div>`;
document.querySelector('.recipes').innerHTML = contenido;

}

function actualizarPlatillo(platillo, id){
let tarjeta = document.getElementById(`${id}`);
tarjeta.querySelector(".recipe-title").innerHTML = platillo.nombre;
    tarjeta.querySelector(".recipe-ingredients").innerHTML = platillo.ingredientes;
tarjeta.querySelector(".recipe-price").innerHTML = platillo.Precio;

}   