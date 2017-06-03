# AgenDie

![AgenDie Logo](http://genie.webierta.skn1.com/_media/wiki/agendie192.png)

## AgenDie es una agenda de contactos.
AgenDie es un directorio para organizar contactos. Como tal, dispone de las funciones básicas de cualquier libreta de direcciones: añadir, eliminar, editar y buscar contactos. Permite trabajar con múltiples agendas. Soporta importar y exportar contactos desde/a un archivo vCard. Elimina duplicados. Contactos con imagen o avatar.

## AgenDie is an address book.
AgenDie is a directory for organizing contacts. As such, it has the basic functions of any address book: add, delete, edit and search for contacts. It allows working with multiple address books. Supports importing and exporting contacts from/to a vCard file. Removes duplicates. Contacts with image or avatar.

==========

# Desarrollo

AgenDie es una aplicación escrita con **Genie** que utiliza interfaz gráfica Gtk+3.

Se trata de un proyecto en una fase inicial de desarrollo, en el que el autor de la Wiki [Genie Doc](http://genie.webierta.skn1.com/ "Genie Doc"), sobre programación con Genie, pone en práctica algunos de los contenidos allí expuestos, y en particular la interfaz gráfica Gtk, la base de datos SQLite y las listas, entre otros.

El proyecto también está publicado en [Launchpad](https://launchpad.net/agendie "Agendie en Launchpad"), y desde allí se puede obtener el código, seguir los progresos de la aplicación y descargar un paquete deb para instalar.

==========

# Instalación y ejecución

Se puede instalar el archivo deb [Descargas](https://launchpad.net/agendie/+download "Descargas desde Launchpad") o compilar y ejecutar sin instalar.

Si se instala el paquete deb, el icono de lanzamiento aparece en el menú de aplicaciones, en la sección Oficina.

Para compilar el código, desde el directorio de agendie, con:

    valac AgenDie.gs AgendaNotebook.gs Dialogo.gs DialogoHelp.gs --pkg gtk+-3.0 --pkg sqlite3 --pkg gee-0.8 --output agendie

Y se ejecuta con:

    ./agendie

