/*
* Copyleft 2017 Jesús Cuerda - All Wrongs Reserved (https://launchpad.net/agendie)
*
* This file is part of AgenDie.
*
* AgenDie is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published
* by the Free Software Foundation, either version 3 of the License,
* or (at your option) any later version.
*
* AgenDie is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See
* the GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public
* License along with AgenDie. If not, see <http://www.gnu.org/licenses/>.
*
* Authored by: Jesús Cuerda <webierta@gmail.com>
*/

uses
	Sqlite
	Gee
	Gtk

class DialogoHelp: Gtk.ApplicationWindow

	init

		this.set_modal(true)
		this.set_transient_for(ventana)
		this.window_position = WindowPosition.CENTER
		this.border_width = 8
		this.set_default_size (600, 500)

		var header = new Gtk.HeaderBar()
		header.show_close_button = true
		header.set_title ("INFO")
		header.set_hexpand (true)
		this.set_titlebar(header)

		var boton = new Button.from_icon_name("gtk-home", IconSize.BUTTON)
		boton.set_tooltip_text ("Volver")
		header.pack_start(boton)
		boton.clicked.connect(salir_ayuda)

		var box_help = new Gtk.Box (Gtk.Orientation.VERTICAL, 0)
		box_help.set_hexpand(true)
		box_help.set_vexpand(true)
		this.add(box_help)

		var scrolled_help = new Gtk.ScrolledWindow (null, null)
		box_help.pack_start (scrolled_help, true, true, 0)

		var texto_ayuda = new Gtk.TextView()
		texto_ayuda.set_wrap_mode (Gtk.WrapMode.WORD)
		texto_ayuda.set_editable(false)
		texto_ayuda.set_hexpand(true)
		var info_text = ("AGENDA DE CONTACTOS AgenDie\n\n\n"
			+ "ÍNDICE\n"
			+ "¿QUÉ ES AgenDie?\n"
			+ "CREAR Y EDITAR CONTACTOS.\n"
			+ "BUSCAR CONTACTOS. DUPLICADOS.\n"
			+ "OTRAS FUNCIONES: GUARDAR, IMPORTAR, EXPORTAR.\n"
			+ "DESARROLLO.\n\n\n"
			+ "¿QUÉ ES AgenDie?\n\n"
			+ "AgenDie es un directorio para organizar contactos. Como tal, dispone de las "
			+ "funciones básicas de cualquier libreta de direcciones: añadir, eliminar, editar "
			+ "y buscar contactos.\n\n"
			+ "AgenDie permite crear múltiples agendas para distintos fines o usuarios. Al inicio "
			+ "de la aplicación se puede seleccionar la agenda por defecto (y crearla si no "
			+ "existe) o abrir una agenda previamente guardada.\n\n"
			+ "Todos los cambios realizados quedan automáticamente guardados en la agenda abierta.\n\n"
			+ "También es posible importar y exportar contactos desde/a archivos vCard.\n\n"
			+ "CREAR Y EDITAR CONTACTOS\n\n"
			+ "Cada contacto queda definido por una serie de campos: nombre, apellidos, teléfonos, "
			+ "emails, web, dirección, notas y avatar.\n\n"
			+ "La aplicación utiliza el campo del nombre como índice en las pestañas. Esto significa que "
			+ "al crear un contacto (y también al editarlo), el único campo requerido es el de nombre.\n\n"
			+ "Los campos que no son utilizados no se muestran en la ventana principal de la aplicación.\n\n"
			+ "Los campos no tienen patrones de salida definidos; esto quiere decir que si, por ejemplo, "
			+ "prefieres ver los números de teléfono según el patrón 654 784 524, la mejor manera de hacerlo "
			+ "es escribir el número directamente así.\n\n"
			+ "BUSCAR CONTACTOS\n\n"
			+ "Es posible buscar contactos por nombre o apellidos o por grupo.\n\n"
			+ "La función de búsqueda actúa como un filtro seleccionando y mostrando solo aquellos contactos "
			+ "coincidentes.\n\n"
			+ "La búsqueda no discrimina mayúsculas y minúsculas aunque sí tiene en cuenta los acentos. "
			+ "El proceso considera las coincidencias de una parte (buscando a 'Ana' se encuentra "
			+ "a 'Anastasia').\n\n"
			+ "Después de realizar una búsqueda, recuerda que puedes volver a la agenda general pulsando sobre "
			+ "el botón que limpia el filtro de resultados.\n\n"
			+ "DUPLICADOS\n"
			+ "Esta función muestra y permite eliminar los contactos repetidos (exactamente iguales).\n\n"
			+ "OTRAS FUNCIONES\n\n"
			+ "GUARDAR\n"
			+ "La aplicación crea por defecto una base de datos para almacenar los contactos, pero a partir "
			+ "de ésta es posible crear otras nuevas, lo que permite utilizar agendas independientes por un "
			+ "mismo usuario o por distintos usuarios.\n\n"
			+ "Después de clonar una agenda es posible vaciar la agenda original eliminando todos sus "
			+ "contactos en bloque.\n\n"
			+ "IMPORTAR\n"
			+ "Es posible importar contactos desde un archivo vCard versión >= 3. Los datos "
			+ "importados son limitados.\n\n"
			+ "Esta función se encuentra todavía en fase experimental, por lo "
			+ "que los resultados pueden no ser completamente satisfactorios.\n\n"
			+ "La versión actual importa un número limitado de datos de cada "
			+ "contacto (el resto son ignorados):\n"
			+ "\t- Nombre y dos apellidos hasta 5 palabras máximo.\n"
			+ "\t- Máximo de 3 números de teléfono.\n"
			+ "\t- Máximo de 2 emails.\n"
			+ "\t- 1 página web.\n"
			+ "\t- 1 dirección (sin límite de palabras).\n"
			+ "\t- Notas (sin límite).\n"
			+ "\t- 1 imagen.\n"
			+ "\t- Categoría.\n\n"
			+ "Dependiendo del volumen de la agenda a importar (máximo 1.000 contactos), el proceso puede "
			+ "demorarse un poco. Espera hasta que aparezca el aviso de que el proceso ha finalizado.\n\n"
			+ "Por favor, ayuda a mejorar esta función comunicando al desarrollador "
			+ "las incidencias que has encontrado al utilizarla.\n\n"
			+ "EXPORTAR\n"
			+ "Es posible exportar los contactos a un archivo vCard versión 4, lo que permite trasladar "
			+ "los datos a otro gestor de contactos.\n\n"
			+ "También resulta de utilidad para recuperar los contactos cuando AgenDie se actualiza y "
			+ "las agendas generadas con versiones anteriores no son compatibles con la nueva versión.\n\n"
			+ "Es recomendable utilizar esta función como copia de seguridad.\n\n"
			+ "DESARROLLO\n\n"
			+ "Agendie está todavía en fase de desarrollo, lo que implica, al menos, dos cosas:\n"
			+ "\t1. Es posible que aparezcan errores (lo raro sería lo contrario).\n"
			+ "\t2. Está en continúo proceso de mejora e incorporación de nuevas funciones.\n\n"
			+ "Si quieres colaborar para mejorar esta aplicación, puedes comunicar los errores que encuentres o "
			+ "las propuestas y sugerencias que consideres oportunas.\n\n"
			+ "Muchas gracias por utilizar AgenDie,\n"
			+ "Jesús Cuerda - webierta@gmail.com")
		texto_ayuda.buffer.text = info_text
		texto_ayuda.set_left_margin(10)
		texto_ayuda.set_right_margin(10)
		texto_ayuda.set_top_margin(20)

		start: Gtk.TextIter
		end: Gtk.TextIter
		var buffer = texto_ayuda.get_buffer()
		var titulo = buffer.create_tag("titulo",
			"weight", Pango.Weight.BOLD,
			"size", 24000,
			"justification", Gtk.Justification.CENTER)
		var sub = buffer.create_tag("sub", "underline", true)
		var size = 	buffer.create_tag("size", "size", 14000)

		buffer.get_iter_at_line (out start, 2)
		buffer.get_iter_at_line (out end, 4)
		buffer.apply_tag_by_name ("sub", start, end)

		buffer.get_iter_at_line (out start, 9)
		buffer.get_iter_at_line (out end, 85)
		buffer.apply_tag_by_name ("size", start, end)

		buffer.get_iter_at_offset (out start, 0)
		buffer.get_iter_at_offset (out end, 28)
		buffer.apply_tag_by_name ("titulo", start, end)

		scrolled_help.add (texto_ayuda)

		this.show_all()
		this.set_keep_above(true)

	def salir_ayuda()
		this.destroy()
