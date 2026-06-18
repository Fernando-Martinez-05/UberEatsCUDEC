let contenidoLista =''

function agregarALista(platillo, id){
contenidoLista = `<option value = ''>
${platillo.nombre}
</option>`;
document.getElementById('listaPlatillos').innerHTML = 
contenidoLista;
}