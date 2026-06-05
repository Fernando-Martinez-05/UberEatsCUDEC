let contenido = '';

document.addEventListener('DOMContentLoaded', function() {
// nav menu
const menus = document.querySelectorAll('.side-menu');
M.Sidenav.init(menus, {edge: 'right'});
// add recipe form
const forms = document.querySelectorAll('.side-form');
M.Sidenav.init(forms, {edge: 'left'});
});

btnAgregarPlatillo.addEventListener('click', function(){
alert('Platillo agregado')
});

function mostrarPlatillo(Platillo, id){
contenido += `
<div class = "card-panel recipe white row"
 data-id="${id}"> 
<div class = "recipe-details">
<div class = "recipe-title">
${Platillo.nombre}
</div>

<div class = "recipe-ingredients">
${Platillo.ingredientes}
</div>

<div class = "recipe-Precio">
${Platillo.Precio}
</div>


</div>
<div class = "recipe-delete">
<i class = "material-icons"  data-id="${id}">delete_outline</i>

</div>`;
document.querySelector('.recipes').innerHTML = contenido;

}