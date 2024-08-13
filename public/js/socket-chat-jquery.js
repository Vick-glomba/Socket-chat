
var params = new URLSearchParams(window.location.search);

var nombre = params.get("nombre")
var sala = params.get("sala")


//referencias de jQuery

var divUsuarios = $('#divUsuarios');
var formEnviar = $('#formEnviar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatbox');
var para = $('#para');
var btnBorrar = $('#btnBorrar');
var nombreSala = $('#nombreSala');
var buscar = $('#buscar');
var target;

//funciones para renderizar usuarios



function renderizarUsuarios(personas) {
    //console.log(personas);
    var html = '';
    html += '<li>';
    html += ' <a href="javascript:void(0)" class="active"> Chat de <span> '+ sala +'</span></a>';
    html += '</li>';
    
    for (let i = 0; i < personas.length; i++) {
        
        html += '<li>';
        html += ' <a data-id="' + personas[i].id + '" data-nombre="' + personas[i].nombre + '" href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span>'+ personas[i].nombre +'<small class="text-success">online</small></span></a>';
        html += '</li>';
        
    }
    
     var htmlSala='<h3 class="box-title">Sala de chat <small>'+ sala +'</small></h3>';

    nombreSala.html(htmlSala);
    divUsuarios.html(html);


}


 function renderizarMensajes(mensaje, yo, privado){

    var html = "";
    var fecha= new Date(mensaje.fecha);
    var hora= fecha.getHours() + ":" + fecha.getMinutes();

    var adminClass= "info";
    if(mensaje.nombre === "Administrador"){
        adminClass= "warning";
    }
    if(privado){
        adminClass= "success";
    }


    if(!yo){
        html += '<li class="animated fadeIn">';
        if (mensaje.nombre !== "Administrador"){
            html += '    <div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" /></div>';
            html += '    <div class="chat-content">';
            html += '        <h5>'+ mensaje.nombre +'</h5>';   
        }
        html += '    <div class="chat-content">';
        if (privado){
            html += '        <div class="box bg-light-'+adminClass+'">' + 'Privado: ' +mensaje.mensaje +'</div>';
        }else {
            html += '        <div class="box bg-light-'+adminClass+'">' +mensaje.mensaje +'</div>';
        }
        html += '    </div>';
        html += '    <div class="chat-time">'+ hora +'</div>';
        html += '</li>';
       
        } else {
            html += '<li class="reverse">'
            html += '   <div class="chat-content">'
            html += '       <h5>'+ mensaje.nombre +'</h5>'
            if(privado){
            html += '       <div class="box bg-light-success">' + 'Privado: ' +mensaje.mensaje +'</div>'
            } else {
            html += '       <div class="box bg-light-inverse">' +mensaje.mensaje +'</div>'
            }
            html += '   </div>'
            html += '   <div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" /></div>'
            html += '   <div class="chat-time">'+ hora +'</div>'
            html += '</li>'

        }



    divChatbox.append(html);

 }

 function scrollBottom() {

    // selectors
    var newMessage = divChatbox.children('li:last-child');

    // heights
    var clientHeight = divChatbox.prop('clientHeight');
    var scrollTop = divChatbox.prop('scrollTop');
    var scrollHeight = divChatbox.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        divChatbox.scrollTop(scrollHeight);
    }
}

//listeners



//filtrar users segun lo tipeado en busqueda
buscar.on("input", (e)=>{
    let data = {
        filtro: e.target.value,
        sala: sala
    }
    socket.emit('busqueda', data);
})

divUsuarios.on('click', 'a', function(){
    var id = $(this).data("id");
    var nombre=  $(this).data("nombre");
    var user = {
        id,
        nombre
    }
    if (id){
        target = user;
        para.val(user.nombre);
    }
})

btnBorrar.on("click", ()=>{
    para.val("");
    target = "";
})

formEnviar.on('submit', function(e){
    e.preventDefault();
    if(txtMensaje.val().trim().length === 0){
        return
    };

    if (target) {
        
        socket.emit('mensajePrivado', {
            nombre: nombre,
            mensaje: txtMensaje.val(),
            para: target.id
        }, function(mensaje) {
          txtMensaje.val("").focus();
          renderizarMensajes(mensaje, true, true);
          scrollBottom();
        });
            } else {
                //    Enviar información
                socket.emit('crearMensaje', {
                    nombre: nombre,
                    mensaje: txtMensaje.val()
                }, function(mensaje) {
                txtMensaje.val("").focus();
                renderizarMensajes(mensaje, true, false);
                scrollBottom();
                });

            }
     


})