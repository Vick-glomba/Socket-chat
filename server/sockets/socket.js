//lado SERVIDOR

const { io } = require('../server');
const {Usuarios} = require('../classes/usuarios')
const {crearMensaje} = require('../utilidades/utilidades')

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
       if (!data.nombre || !data.sala){
        return callback({
            error: true,
            msg: 'El nombre y sala son necesarios'
        })
       }
       


       client.join(data.sala);
       
       usuarios.agregarPersona(client.id, data.nombre, data.sala, data.img);

       client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
       client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador',`${data.nombre} se unio.`))
       callback(usuarios.getPersonasPorSala(data.sala));


    })

    client.on('busqueda', (data) =>{
        let personasEnSala = usuarios.getPersonasPorSala(data.sala)
        let personasFiltradas= personasEnSala.filter( persona => {
            let contiene= persona.nombre.includes(data.filtro);
          if(contiene){
            return persona;
          }  
        })

        client.emit('listaPersona', personasFiltradas )
    } );

    client.on('crearMensaje', (data, callback) =>{

        let persona= usuarios.getPersona(client.id);

        let mensaje= crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)
                
        callback(mensaje);

    } )
    
    client.on('mensajePrivado', (data, callback) => {

        let persona = usuarios.getPersona(client.id);
        
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje))
        let mensaje= crearMensaje(persona.nombre, data.mensaje);
        
        callback(mensaje)
    })

    

    client.on('disconnect', () => {
        let personaBorrada= usuarios.borrarPersona(client.id)
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador',`${personaBorrada.nombre} salio.`))
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
    })
    
});
