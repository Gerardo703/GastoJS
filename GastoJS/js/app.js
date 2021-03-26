// Variables 
const formulario = document.querySelector('#agregar-gasto');
const listadoGastos = document.querySelector('#gastos');


// Eventos

eventsListeners();
function eventsListeners(){
    document.addEventListener( 'DOMContentLoaded', preguntarPresupuesto );

    formulario.addEventListener( 'submit', agregarGasto )
}

// Clases
class Presupuesto{
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    };

    //Agregar el nuevo gasto
    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto]; // Hago una copia de arreglo original y agrego el nuevo gasto

        this.calcularRestante();
    };

    // Calcular Restante
    calcularRestante(){
        const gastado = this.gastos.reduce( ( total, gasto ) => total + gasto.cantidad, 0) // (Acumulado, Objeto Actual) Reduce junta todos los resultados en uno solo
        this.restante = this.presupuesto - gastado;
    };

    //Eliminar gasto
    eliminarGasto(id){
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);
        this.calcularRestante();

        console.log(this.gastos);
    }

};

class UI{

    insertarPresupuesto(cantidad){
        //Extraigo los valores
        const { presupuesto, restante} = cantidad

        // Agregar el HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    };

    crearAlerta(mensaje, tipo){
        // Creo el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Agregamos el mensaje
        divMensaje.textContent = mensaje;

        // Insertarlo en el HTML
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        // Borrar la Alerta luego de 2s
        setTimeout(() => {
            divMensaje.remove();
        }, 2000);
    };

    // Mostrar Gastos
    mostrarGastos(gastos){

        this.limpiarHTML();

         // Iterar sobre gastos
        gastos.forEach( gasto => {

            const { cantidad, nombre, id } = gasto;

            // Creamos el elemento LI donde se mostraran los gastos
            const gastoNuevo = document.createElement('li');
            gastoNuevo.className = 'list-group-item d-flex justify-content-between align-items-center';
            gastoNuevo.dataset.id = id;

            // Agrego al HTML del gasto
            gastoNuevo.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad}</span>`

            // Boton Borrar Gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.innerHTML = `Borrar &times;`;

            // Evento click
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }

            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto', 'badge');

            gastoNuevo.appendChild(btnBorrar);

            // Agrego al HTML
            listadoGastos.appendChild(gastoNuevo);
        });
    };

    //Comprobar el presupuesto
    comprobarPresupuesto(presupuestoObj){
        const { presupuesto, restante } = presupuestoObj;

        const restanteDiv = document.querySelector('.restante');

        // Comprobamos el restante 
        if(( presupuesto / 4) > restante){
            restanteDiv.classList.remove('alert-succes', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if( ( presupuesto / 2) > restante ){
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        // Comprobar si el presupuesto se acabó
        if( restante <= 0){
            ui.crearAlerta('El presupuesto se acabó', 'error');
            formulario.querySelector('button[type=submit]').disabled = true; // Deshabilito botón
        }
        
    };

    limpiarHTML(){
        while(listadoGastos.firstChild){
            listadoGastos.removeChild(listadoGastos.firstChild);
        }
    };

    // Actualizar Restante
    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    };

}

// Instancio las clases de manera Global
const ui = new UI();
let presupuesto;


// Funciones

function preguntarPresupuesto(){
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');

    // Validar el dato ingresado
    if( presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload() // Recargamos la pagina
    };

    // Presupuesto Valido
    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresupuesto(presupuesto);
}

function agregarGasto(e){
    e.preventDefault();

    // Leer datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    // Validar los campos
    if(nombre === '' || cantidad === ''){
        ui.crearAlerta('Todos los campos son Obligatorios', 'error');
        return;

    } else if ( cantidad <= 0 || isNaN(cantidad)){
        ui.crearAlerta('Cantidad no valida', 'error');
        return;
    };

    // Creo un objeto de Gasto
    const gasto = { nombre, cantidad, id: Date.now() } //  unimos los datos del objeto

    // Añadimos el nuevo gasto
    presupuesto.nuevoGasto(gasto);

    // Alerta agregado correctamente
    ui.crearAlerta('Gasto agregado correctamente');

    // Imprimir Gastos
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    // Llamo al metodo para cambiar el color del div
    ui.comprobarPresupuesto(presupuesto);

    // Reininciar le formulario
    formulario.reset();
    
};

// Eliminar Gasto
function eliminarGasto(id){
        
    //Eliminar del objeto el elemento
    presupuesto.eliminarGasto(id);

    //Eliminar del HTML
    const { gastos, restante } = presupuesto; // Para acceder la propiedad
    ui.mostrarGastos(gastos); // Toma el arreglo de gastos
    ui.actualizarRestante(restante); // Toma el restante
    ui.comprobarPresupuesto(presupuesto); // Toma el objeto 
}