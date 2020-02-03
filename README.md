# AgenDie

![AgenDie Logo](https://1.bp.blogspot.com/-aA4k2R5oiT8/XjWgMyH4LdI/AAAAAAAABvI/JmjThVPtugAkNqICHe996vWmw3oCFh7IACLcBGAsYHQ/s1600/agendie192.png)

## AgenDie es una agenda de contactos.
AgenDie es un directorio para organizar contactos. Como tal, dispone de las funciones básicas de cualquier libreta de direcciones: añadir, eliminar, editar y buscar contactos. Permite trabajar con múltiples agendas. Soporta importar y exportar contactos desde/a un archivo vCard. Elimina duplicados. Contactos con imagen o avatar.

## AgenDie is an address book.
AgenDie is a directory for organizing contacts. As such, it has the basic functions of any address book: add, delete, edit and search for contacts. It allows working with multiple address books. Supports importing and exporting contacts from/to a vCard file. Removes duplicates. Contacts with image or avatar.

# Desarrollo y dependencias

AgenDie es una aplicación escrita con **Genie** que utiliza interfaz gráfica Gtk+3.

Se trata de un proyecto en una fase inicial de desarrollo, en el que el autor de [Genie Doc](https://geniedoc.blogspot.com/ "Genie Doc"), una Wiki sobre programación con Genie, pone en práctica algunos de los contenidos allí expuestos, y en particular la interfaz gráfica Gtk, la base de datos SQLite y las listas, entre otros.

El proyecto también está publicado en [Launchpad](https://launchpad.net/agendie "Agendie en Launchpad"), y desde allí se puede obtener el código, seguir los progresos de la aplicación y descargar un paquete deb para instalar.

Las dependencias requeridas son:

- libgee-0.8-2 (>=0.18.0-2)
- libgtk-3-0 (>=3.20)
- libsqlite3-0 (>=3.14)

# Instalación y ejecución

Se puede instalar un archivo deb o bien ejecutar sin instalar.

Para la instalación, descarga la última versión del paquete deb disponible en [descargas](https://launchpad.net/agendie/+download "Descargas desde Launchpad") y abre el archivo con un instalador de paquetes (por ejemplo, GDebi).

Si se instala el paquete deb, el icono de lanzamiento aparece en el menú de aplicaciones, en la sección Oficina.

Para ejecutar sin instalar:

1. Compila el código, desde el directorio de agendie, con:

    valac AgenDie.gs AgendaNotebook.gs Dialogo.gs DialogoHelp.gs --pkg gtk+-3.0 --pkg sqlite3 --pkg gee-0.8 --output agendie
    
2. Después hay que copiar el directorio de imágenes *agendie* en /usr/share/pixmaps

3. Y se ejecuta con:

    ./agendie

