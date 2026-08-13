let contenido = "";


document.addEventListener("DOMContentLoaded",()=>{


// ===== MENU MATERIALIZE =====


const sideMenu=document.querySelector("#side-menu");
const sideForm=document.querySelector("#side-form");


const menu=M.Sidenav.init(sideMenu,{
edge:"right"
});


const form=M.Sidenav.init(sideForm,{
edge:"left"
});



// Cerrar menú al abrir formulario

document.querySelectorAll("[data-target='side-form']")
.forEach(btn=>{

btn.addEventListener("click",()=>{

menu.close();

});

});



// Cerrar formulario al abrir menú

document.querySelectorAll("[data-target='side-menu']")
.forEach(btn=>{

btn.addEventListener("click",()=>{

form.close();

});

});



});





// ===== MOSTRAR PLATILLO =====


function mostrarPlatillo(platillo,id){


const lista=document.querySelector(".recipes");


lista.innerHTML+=`

<div class="col s12 m6" id="${id}">

<div class="card">


<div class="card-content">


<span class="card-title recipe-title">

${platillo.nombre}

</span>



<p class="recipe-ingredients">

Ingredientes:
${platillo.ingredientes}

</p>



<p class="recipe-price">

Precio:
$${platillo.precio}

</p>


</div>



<div class="card-action">


<button 
class="btn red"
onclick="eliminarPlatillo('${id}')">


<i class="material-icons left">
delete
</i>


Eliminar


</button>


</div>



</div>

</div>

`;

}





// ===== ACTUALIZAR PLATILLO =====


function actualizarPlatillo(platillo,id){


const tarjeta=document.getElementById(id);


if(tarjeta){


tarjeta.querySelector(".recipe-title").innerHTML=
platillo.nombre;


tarjeta.querySelector(".recipe-ingredients").innerHTML=
"Ingredientes: "+platillo.ingredientes;


tarjeta.querySelector(".recipe-price").innerHTML=
"Precio: $"+platillo.precio;


}


}





// ===== ELIMINAR PLATILLO =====


function eliminarPlatillo(id){


if(confirm("¿Eliminar este platillo?")){


db.collection("platillos")
.doc(id)
.delete()

.then(()=>{


const tarjeta=document.getElementById(id);


if(tarjeta){

tarjeta.remove();

}


M.toast({

html:"Platillo eliminado"

});


})


.catch(error=>{


console.log(error);


M.toast({

html:"Error al eliminar"

});


});


}


}






// ===== CAMARA =====



let streaming=false;

let width=320;

let height=0;



const video=document.getElementById("video");

const canvas=document.getElementById("canvas");

const foto=document.getElementById("foto");


const btnfoto=document.getElementById("btnfoto");

const btntomarfoto=document.getElementById("btntomarfoto");





// Abrir cámara


if(btnfoto){


btnfoto.addEventListener("click",()=>{


navigator.mediaDevices
.getUserMedia({

video:{

facingMode:{

ideal:"environment"

}

},

audio:false


})


.then(stream=>{


video.srcObject=stream;

video.play();


})


.catch(error=>{


console.log(error);


});


});


}





// Preparar tamaño


if(video){


video.addEventListener("canplay",()=>{


if(!streaming){


height=
video.videoHeight /
(video.videoWidth / width);



video.setAttribute("width",width);

video.setAttribute("height",height);



canvas.setAttribute("width",width);

canvas.setAttribute("height",height);



streaming=true;


}


});


}






// Tomar foto


if(btntomarfoto){


btntomarfoto.addEventListener("click",()=>{


const contexto=
canvas.getContext("2d");



if(width && height){


canvas.width=width;

canvas.height=height;



contexto.drawImage(

video,

0,

0,

width,

height

);



const imagen=
canvas.toDataURL("image/png");



foto.src=imagen;


}


});


}