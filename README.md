## # Bienvenido!

Este es un repositorio para evaluar candidatos para el equipo de desarrollo de Grupo Petsa.

Este repositorio tiene el back-end de una agenda o calendario, hecho en Ruby on Rails, con una base de datos sencilla en SQLite.

La idea es que desarrolles una Web-App que sirva como el front-end y la interfaz de usuario de la aplicación en cuestión.

### Requerimientos para correr

Te recomendamos *mucho* que utilices alguna distribución de Linux para arrancar, pero eres libre de utilizar lo que gustes.

### Cómo arrancar el servidor

Para correr esta aplicación de la forma tradicional, debes tener instalado previamente
  - Ruby, versión 3.3.12 (te recomendamos utilizar [rvm](https://rvm.io) o [rbenv](https://devhints.io/rbenv))
  - NodeJS
  - Yarn
  - Git

Posteriormente, podrás iniciar el arranque haciendo lo siguiente:

- Clona el repositorio en tu computadora
- Utiliza `bundle` para instalar las gemas requeridas
- Configura la base de datos y webpacker por medio del comando `rails`
- Arranca el servidor con `rails server`

Si así lo deseas, puedes utilizar Docker y Docker Compose en lugar de lo anterior para arrancar la aplicación. Los archivos de configuración estan completos, cuestión de que los revises para que puedas utilizarlos para correr la aplicación.

### Las funciones que se ocupan arreglar

El back-end está listo para trabajar con las siguientes tablas en su base de datos

- Appointment: Citas
  - Indica las citas a guardar en la agenda
  - Permite guardar titulo (`string`), notas (`text`), fecha de inicio (`datetime`), fecha de fin (`datetime`), y tipo de cita (`foreign key` a tabla `appointment_types`).
- `AppointmentType`: Tipo de cita
  - Para permitir una agrupación entre citas
  - Columnas: `name: :string`.

Con este back-end sencillo, te solicitamos que completes (en la medida de lo posible) los siguientes puntos:

- Hacer una aplicación Web que permita interactuar con el API / back-end hecho en Rails. Puede hacerse en cualquier tipo de framework, lenguaje o esquema, siempre y cuando sea un framework de Web Development y que la aplicación sea responsiva para su uso en computadoras, tablets o móviles.
- Como página principal, mostrar una lista de las citas por ocurrir (de hoy en adelante), en orden cronológico.
- Un índice para todos los tipos de cita disponibles
- Una interfaz de captura que permita crear, editar o eliminar tipos de cita.
- Una interfaz de captura que permita crear, editar o eliminar citas, capturando los datos y el tipo de cita de cada una.
- Una vista tipo "Calendario del mes", que permita mostrar un mes en particular, indicando los días que tienen eventos guardados
- Agregar validaciones al back-end, para forzar a que:
  - todos los tipos de cita tengan un nombre.
  - todas las citas tengan un título y un tipo de cita definido.
- Un buscador, que permita encontrar citas por medio del contenido de su nombre o las notas
- Permitir guardar un color predeterminado para cada tipo de cita, y en las vistas de citas (tanto en lista como en calendario), mostrar dentro del UX el color capturado por el usuario
- Agregar un campo en `appointments` para permitir guardar ubicación, como `string`.
- Permitir agregar personas de interes en cada `appointment`, para enlistar qué personas están involucradas por cita

### Comentarios

- Lo ideal es que resuelvas *todos* los puntos, pero tampoco es una obligación. Aunque no hayas terminado todos los puntos, igual enviannos tu respuesta para evaluar tu progreso.
- Cuando hayas terminado, crea un repositorio en el sitio de tu preferencia (GitHub, GitLab, BitBucket, etc) y haznos llegar la liga de acceso para su revisión. Ten en cuenta que evaluaremos la forma y tipos de commits que hagas para el desarrollo de la aplicación.
- No esperamos que sepas todo de memoria tampoco, eres libre de guiarte de la forma que tu consideres para poder completar el ejercicio.

### Siguientes pasos

- En caso de que tus resultados sean los esperados, procederemos a una segunda entrevista en nuestras oficinas corporativas.
- Dicha entrevista será **presencial**, y la usaremos para conocerte y evaluar frente a frente las decisiones que hayas tomado al diseñar la interfaz de usuario.
- Como parte de la entrevista, te pediremos agregar o modificar algunos puntos de tu desarrollo, emulando cómo los usuarios te darán retroalimentación de tus proyectos.
- Si tienes alguna otra duda no dudes en comunicarte con nosotros.
