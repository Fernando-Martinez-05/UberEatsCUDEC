
// LEER PLATILLOS

db.collection("platillos").onSnapshot((datos)=>{


  datos.docChanges().forEach((registro)=>{
  
  
  if(registro.type==="added"){
  
  
  mostrarPlatillo(
  registro.doc.data(),
  registro.doc.id
  );
  
  
  }
  
  
  });
  
  
  });
  
  
  
  
  
  // AGREGAR PLATILLO
  
  
  const formularioAgregar=document.getElementById("formAgregar");
  
  
  if(formularioAgregar){
  
  
  formularioAgregar.addEventListener("submit",(e)=>{
  
  
  e.preventDefault();
  
  
  
  const platilloNuevo={
  
  
  nombre:
  formularioAgregar.title.value.trim(),
  
  
  ingredientes:
  formularioAgregar.ingredients.value.trim(),
  
  
  precio:
  Number(formularioAgregar.price.value)
  
  
  
  };
  
  
  
  if(
  !platilloNuevo.nombre ||
  !platilloNuevo.ingredientes ||
  !platilloNuevo.precio
  ){
  
  
  M.toast({
  
  html:"Completa todos los campos"
  
  });
  
  
  return;
  
  
  }
  
  
  
  
  db.collection("platillos")
  
  .add(platilloNuevo)
  
  
  .then(()=>{
  
  
  formularioAgregar.reset();
  
  
  M.toast({
  
  html:"Platillo agregado"
  
  });
  
  
  })
  
  
  .catch((error)=>{
  
  
  console.log(error);
  
  
  M.toast({
  
  html:"Error al guardar"
  
  });
  
  
  });
  
  
  
  });
  
  
  }