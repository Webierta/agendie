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

ventana: Gtk.ApplicationWindow
win_notebook: Gtk.ApplicationWindow
db: Sqlite.Database
bar_status: Gtk.Statusbar
context_id: uint
entrada_nombre: Gtk.Entry
entrada_apellido: Gtk.Entry
entrada_apellido2: Gtk.Entry
entrada_phone: Gtk.Entry
entrada_phone2: Gtk.Entry
entrada_phone3: Gtk.Entry
entrada_mail: Gtk.Entry
entrada_mail2: Gtk.Entry
entrada_web: Gtk.Entry
entrada_grupo: Gtk.Entry
entrada_dir: Gtk.TextView
entrada_notas: Gtk.TextView
entrada_avatar: Gtk.Label
entrada_photo: Gtk.Image
entrada_buscar: Gtk.SearchEntry
grupo_combo: Gtk.ComboBoxText
notebook: AgendaNotebook

def text_color (color: string)
	var css = """
	.txt_verde {color: green;}
	.txt_azul {color: blue;}
	.txt_rojo {color: red;}
	"""
	var provider = new Gtk.CssProvider()
	try
		provider.load_from_data(css, css.length)
	except e: Error
		stderr.printf ("Hoja de estilo no cargada: %s\n", e.message)

	Gtk.StyleContext.add_provider_for_screen(
		Gdk.Screen.get_default(),
		provider,
		Gtk.STYLE_PROVIDER_PRIORITY_USER)

	bar_status.get_style_context().remove_class("txt_verde")
	bar_status.get_style_context().remove_class("txt_azul")
	bar_status.get_style_context().remove_class("txt_rojo")
	if color == "rojo"
		bar_status.get_style_context().add_class("txt_rojo")
	else if color == "verde"
		bar_status.get_style_context().add_class("txt_verde")
	else
		bar_status.get_style_context().add_class("txt_azul")

init
	Intl.setlocale( LocaleCategory.ALL, "" )

	new MyApplication ("AgenDie.agenda.contactos",
		ApplicationFlags.HANDLES_OPEN).run(args)

class MyApplication: Gtk.Application

	icon: Gdk.Pixbuf
	version: string = "0.1.0"
	bd_abierta: string
	tabla_test: string
	tipo_file: string

	construct (application_id: string, flags: ApplicationFlags)
		if !id_is_valid( application_id )
			error( "application id %s is not valid", application_id )
		this.application_id = application_id
		this.flags = flags

	def backup()

		var win_backup = new Gtk.ApplicationWindow(this)

		var base_datos = File.new_for_path(bd_abierta)

		if (!base_datos.query_exists ())
			bar_status.push (context_id, "Error: no se encuentra la base de datos.")
			text_color("rojo")
		else
			var dialogo_save = new FileChooserDialog ("Guardar copia", win_backup,
				Gtk.FileChooserAction.SAVE,
				"_Cancelar", ResponseType.CANCEL,
				"_Guardar", ResponseType.ACCEPT)
			dialogo_save.set_modal(true)
			chooser: Gtk.FileChooser = dialogo_save
			chooser.set_do_overwrite_confirmation(true)

			var filtro_bd = new Gtk.FileFilter ()
			dialogo_save.set_filter (filtro_bd)
			filtro_bd.add_mime_type ("application/x-sqlite3")

			res: int = dialogo_save.run()

			if (res == Gtk.ResponseType.ACCEPT)
				filename: string = chooser.get_filename()
				var copia = File.new_for_path (filename)
				try
					base_datos.copy (copia, FileCopyFlags.OVERWRITE)
					bar_status.push (context_id, "Base de datos copiada.")
					text_color("verde")
				except e: Error
					msg_error: string = "Error: " + e.message
					var noti = new MessageDialog(win_backup, Gtk.DialogFlags.MODAL,
						Gtk.MessageType.ERROR, Gtk.ButtonsType.CLOSE, msg_error)
					var res_noti = noti.run()
					if res_noti == Gtk.ResponseType.CLOSE
						noti.destroy()
			dialogo_save.destroy()

	def exportar()

		var win_ex = new Gtk.ApplicationWindow(this)

		var dialogo_ex = new FileChooserDialog ("Exportar como vCard", win_ex,
			Gtk.FileChooserAction.SAVE,
			"_Cancelar", ResponseType.CANCEL,
			"_Guardar", ResponseType.ACCEPT)
		dialogo_ex.set_modal(true)
		chooser: Gtk.FileChooser = dialogo_ex
		chooser.set_do_overwrite_confirmation(true)
		var filtro_vcard = new Gtk.FileFilter ()
		dialogo_ex.set_filter (filtro_vcard)
		filtro_vcard.add_mime_type ("text/x-vcard")
		res: int = dialogo_ex.run()

		if (res == Gtk.ResponseType.ACCEPT)
			filename: string = chooser.get_filename()
			fn: bool = false
			var archivo_ex = FileStream.open(filename, "w")
			archivo_ex.rewind()

			query: string = (@"SELECT * FROM Contactos;")
			stmt: Sqlite.Statement
			db.prepare_v2 (query, query.length, out stmt)
			cols: int = stmt.column_count ()
			while (stmt.step () == Sqlite.ROW)
				for i:int = 0 to (cols-1)
					col_name: string = stmt.column_name (i)
					val: string = stmt.column_text(i)
					if val != ""
						case col_name
							when "ID"
								if i == 0
									archivo_ex.printf ("BEGIN:VCARD\nVERSION:4.0\n")
								else if i > 0
									archivo_ex.printf ("END:VCARD\nBEGIN:VCARD\nVERSION:4.0")
							when "nombre"
								archivo_ex.printf ("FN:%s", val)
								fn = false
							when "apellido"
								archivo_ex.printf (" %s", val)
								fn = false
							when "apellido2"
								archivo_ex.printf (" %s\n", val)
								fn = true
							when "phone"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("TEL:%s\n", val)
							when "phone2"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("TEL:%s\n", val)
							when "phone3"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("TEL:%s\n", val)
							when "email"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("EMAIL:%s\n", val)
							when "email2"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("EMAIL:%s\n", val)
							when "web"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("URL:%s\n", val)
							when "grupo"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("CATEGORIES:%s\n", val)
							when "dir"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("ADR:%s\n", val)
							when "notas"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("NOTE:%s\n", val)
							when "avatar"
								if fn == false
									archivo_ex.printf ("\n")
									fn = true
								archivo_ex.printf ("PHOTO:%s\n", val)
				archivo_ex.printf ("END:VCARD\n")

			bar_status.push (context_id, "Contactos exportados a vCard.")
			text_color("verde")
		dialogo_ex.destroy()

	def resp_reset (msg_reset:Gtk.Dialog, response_id:int)
		if response_id == Gtk.ResponseType.OK
			eliminar: string = "DROP TABLE Contactos"
			db.exec (eliminar)
			bar_status.push (context_id,
				"Eliminados todos los contactos. Reinicia  para ejecutar los cambios.")
			text_color("rojo")
			Process.exit (0)
		msg_reset.destroy()

	def reset()
		var win_reset = new Gtk.ApplicationWindow(this)
		txt_reset: string = ("¿Eliminar todos los contactos?\n"
			+ "Si confirma, la aplicación se "
			+ "cerrará para aplicar los cambios.")
		msg_reset: Gtk.MessageDialog = new Gtk.MessageDialog (win_reset,
			Gtk.DialogFlags.MODAL, Gtk.MessageType.WARNING,
			Gtk.ButtonsType.OK_CANCEL, txt_reset)
		msg_reset.border_width = 10
		msg_reset.response.connect(resp_reset)
		msg_reset.show_all ()

	def ayuda()
		new DialogoHelp()

	def acercade()
		var about = new Gtk.ApplicationWindow(this)

		try
			icon = new Gdk.Pixbuf.from_file ("/usr/share/pixmaps/agendie/agendie128.png")
		except e: Error
			msg_error: string = e.message + "\nLa aplicación funcionará con normalidad."
			var noti = new MessageDialog(about, Gtk.DialogFlags.MODAL,
				Gtk.MessageType.WARNING, Gtk.ButtonsType.CLOSE, msg_error)
			var res_noti = noti.run()
			if res_noti == Gtk.ResponseType.CLOSE
				noti.destroy()
		authors: array of string = { "JESUS CUERDA VILLANUEVA", "webierta@gmail.com", "",
			"Agradecimientos:", "A todos los que han colaborado",
			"desinteresadamente aportando propuestas y",
			"su conocimiento, y especialmente a",
			"Al Thomas desde Vala list y Stack Overflow."
			 }
		license: string = ("Copyleft 2017 Jesús Cuerda - All Wrongs Reserved.\n\n"
			+ "AgenDie is free software: you can redistribute it and/or modify\n"
			+ "it under the terms of the GNU General Public License as published\n"
			+ "by the Free Software Foundation, either version 3 of the License,\n"
			+ "or (at your option) any later version.\n\n"
			+ "AgenDie is distributed in the hope that it will be useful, but\n"
			+ "WITHOUT ANY WARRANTY; without even the implied warranty of\n"
			+ "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See\n"
			+ "the GNU General Public License for more details.\n\n"
			+ "You should have received a copy of the GNU General Public\n"
			+ "License along with AgenDie.\n"
			+ "If not, see <http://www.gnu.org/licenses/>.")

		Gtk.show_about_dialog (about,
			"program-name", ("AgenDie"),
			"logo", icon,
			"copyright", ("Copyleft 2017 Jesús Cuerda"),
			"version", version,
			"comments", "Agenda de contactos - Address book",
			"license", license,
			"authors", authors,
			"website", "http://genie.webierta.skn1.com/wiki/ejemplos#agendie",
			"website-label", ("AgenDie"),
			null)

	def salida()
		eliminar_bus: string = "DROP TABLE Buscados"
		db.exec (eliminar_bus)
		Process.exit (0)

	def importar()
		win_notebook = new Gtk.ApplicationWindow(this)
		notebook.importar()

	def duplicados()
		win_notebook = new Gtk.ApplicationWindow(this)
		notebook.duplicados()

	def contacto_nuevo()
		win_notebook = new Gtk.ApplicationWindow(this)
		notebook.contacto_nuevo()

	def buscar_tab()
		win_notebook = new Gtk.ApplicationWindow(this)
		notebook.buscar_tab()

	def refrescar()
		notebook.refrescar()

	def override activate ()
		var ventana = new Gtk.ApplicationWindow (this)
		ventana.window_position = WindowPosition.CENTER
		ventana.set_border_width(10)
		ventana.set_default_size (600, 400)
		ventana.destroy.connect(salida)

		var header = new Gtk.HeaderBar()
		header.show_close_button = true
		header.set_title ("AGENDA DE CONTACTOS")
		header.set_hexpand (true)
		ventana.set_titlebar(header)

		var barra = new Gtk.MenuBar ()
		header.pack_start(barra)

		var caja_op = new Box (Orientation.HORIZONTAL, 0)
		var im_op = new Image.from_icon_name("gtk-justify-fill", IconSize.LARGE_TOOLBAR)
		caja_op.pack_start(im_op, false, false, 0)

		var item_op = new Gtk.MenuItem()
		item_op.set_tooltip_text ("Opciones")
		item_op.add(caja_op)
		barra.add (item_op)

		var filemenu = new Gtk.Menu ()
		item_op.set_submenu (filemenu)

		var caja_sav = new Box (Orientation.HORIZONTAL, 4)
		var im_sav = new Image.from_icon_name("gtk-floppy", IconSize.MENU)
		var eti_sav = new Label ("Guardar como")
		caja_sav.pack_start(im_sav, false, false, 0)
		caja_sav.pack_start(eti_sav, false, false, 0)
		var item_sav = new Gtk.MenuItem()
		item_sav.add(caja_sav)
		filemenu.add(item_sav)
		item_sav.activate.connect(backup)

		var caja_imp = new Box (Orientation.HORIZONTAL, 4)
		var im_imp = new Image.from_icon_name("gtk-go-down", IconSize.MENU)
		var eti_imp = new Label ("Importar vCard")
		caja_imp.pack_start(im_imp, false, false, 0)
		caja_imp.pack_start(eti_imp, false, false, 0)
		var item_imp = new Gtk.MenuItem()
		item_imp.add(caja_imp)
		filemenu.add(item_imp)
		item_imp.activate.connect(importar)

		var caja_ex = new Box (Orientation.HORIZONTAL, 4)
		var im_ex = new Image.from_icon_name("gtk-go-up", IconSize.MENU)
		var eti_ex = new Label ("Exportar vCard")
		caja_ex.pack_start(im_ex, false, false, 0)
		caja_ex.pack_start(eti_ex, false, false, 0)
		var item_ex = new Gtk.MenuItem()
		item_ex.add(caja_ex)
		filemenu.add(item_ex)
		item_ex.activate.connect(exportar)

		var sep1 = new SeparatorMenuItem()
		filemenu.append(sep1)

		var caja_dup = new Box (Orientation.HORIZONTAL, 4)
		var im_dup = new Image.from_icon_name("edit-find-replace", IconSize.MENU)
		var eti_dup = new Label ("Duplicados")
		caja_dup.pack_start(im_dup, false, false, 0)
		caja_dup.pack_start(eti_dup, false, false, 0)
		var item_dup = new Gtk.MenuItem()
		item_dup.add(caja_dup)
		filemenu.add(item_dup)
		item_dup.activate.connect(duplicados)

		var caja_res = new Box (Orientation.HORIZONTAL, 4)
		var im_res = new Image.from_icon_name("gtk-dialog-warning", IconSize.MENU)
		var eti_res = new Label ("Eliminar todos")
		caja_res.pack_start(im_res, false, false, 0)
		caja_res.pack_start(eti_res, false, false, 0)
		var item_res = new Gtk.MenuItem()
		item_res.add(caja_res)
		filemenu.add(item_res)
		item_res.activate.connect(reset)

		var sep2 = new SeparatorMenuItem()
		filemenu.append(sep2)

		var caja_ay = new Box (Orientation.HORIZONTAL, 4)
		var im_ay = new Image.from_icon_name("gtk-help", IconSize.MENU)
		var eti_ay = new Label ("Ayuda")
		caja_ay.pack_start(im_ay, false, false, 0)
		caja_ay.pack_start(eti_ay, false, false, 0)
		var item_ay = new Gtk.MenuItem()
		item_ay.add(caja_ay)
		filemenu.add(item_ay)
		item_ay.activate.connect(ayuda)

		var caja_ab = new Box (Orientation.HORIZONTAL, 4)
		var im_ab = new Image.from_icon_name("gtk-about", IconSize.MENU)
		var eti_ab = new Label ("Acerca de")
		caja_ab.pack_start(im_ab, false, false, 0)
		caja_ab.pack_start(eti_ab, false, false, 0)
		var item_ab = new Gtk.MenuItem()
		item_ab.add(caja_ab)
		filemenu.add(item_ab)
		item_ab.activate.connect(acercade)

		var sep3 = new SeparatorMenuItem()
		filemenu.append(sep3)

		var caja_exit = new Box (Orientation.HORIZONTAL, 4)
		var im_exit = new Image.from_icon_name("gtk-quit", IconSize.MENU)
		var eti_exit = new Label ("Salir")
		caja_exit.pack_start(im_exit, false, false, 0)
		caja_exit.pack_start(eti_exit, false, false, 0)
		var item_exit = new Gtk.MenuItem()
		item_exit.add(caja_exit)
		filemenu.add(item_exit)
		item_exit.activate.connect(salida)

		var boton_nuevo = new Button.from_icon_name("gtk-new", IconSize.LARGE_TOOLBAR)
		boton_nuevo.set_tooltip_text ("Crear nuevo contacto")
		boton_nuevo.clicked.connect(contacto_nuevo)
		header.pack_start(boton_nuevo)

		var boton_limpiar = new Gtk.Button.from_icon_name("gtk-clear", IconSize.LARGE_TOOLBAR)
		boton_limpiar.set_tooltip_text ("Limpiar filtro de búsqueda")
		boton_limpiar.clicked.connect(refrescar)
		header.pack_end(boton_limpiar)

		var boton_buscar = new Gtk.Button.from_icon_name("gtk-find", IconSize.LARGE_TOOLBAR)
		boton_buscar.set_tooltip_text ("Buscar contacto")
		boton_buscar.clicked.connect(buscar_tab)
		header.pack_end(boton_buscar)

		var grid = new Gtk.Grid()
		ventana.add (grid)

		var dialogo_inicio = new Gtk.Dialog.with_buttons ("AgenDie", ventana,
			Gtk.DialogFlags.DESTROY_WITH_PARENT,
			"gtk-home", Gtk.ResponseType.OK,
			"gtk-open", Gtk.ResponseType.APPLY,
			"gtk-quit", Gtk.ResponseType.CLOSE)

		var content_area = dialogo_inicio.get_content_area ()
		content_area.set_spacing (10)
		content_area.set_border_width (10)

		var box_inicio= new Gtk.Box (Gtk.Orientation.VERTICAL, 10)
		content_area.add (box_inicio)

		var image = new Gtk.Image ()
		image.set_from_file ("/usr/share/pixmaps/agendie/agendie128.png")
		box_inicio.pack_start(image)

		var titulo_inicio = new Gtk.Label(
			"<span foreground='blue' size='xx-large'>AgenDie</span>")
		titulo_inicio.set_use_markup (true)
		box_inicio.pack_start(titulo_inicio)

		var label1_inicio = new Gtk.Label("Versión " + version)
		label1_inicio.set_use_markup (true)
		box_inicio.pack_start(label1_inicio)

		var label2_inicio = new Gtk.Label(
			"<small>Free Software - GNU General Public License</small>")
		label2_inicio.set_use_markup (true)
		box_inicio.pack_start(label2_inicio)

		var label3_inicio = new Gtk.Label("<small>Copyleft - All Wrongs Reserved</small>")
		label3_inicio.set_use_markup (true)
		box_inicio.pack_start(label3_inicio)

		var label4_inicio = new Gtk.Label("2017 - Jesús Cuerda")
		box_inicio.pack_start(label4_inicio)

		var label5_inicio = new Gtk.Label(
			"<a href='http://genie.webierta.skn1.com/wiki/ejemplos#agendie'>Genie Doc</a>")
		label5_inicio.set_use_markup (true)
		label5_inicio.set_margin_bottom (20)
		box_inicio.pack_start(label5_inicio)

		dialogo_inicio.show_all()
		welcome: bool = true

		notebook = new AgendaNotebook ()

		var caja_status = new Box (Orientation.HORIZONTAL, 4)

		do
			inicio: int = dialogo_inicio.run()

			if inicio == Gtk.ResponseType.OK
				var home_dir = Environment.get_home_dir ()
				var home = home_dir.to_string()
				path_db: string = home + "/.AgenDie"
				DirUtils.create (path_db, 0700)
				file_db: string = path_db + "/agenda.db3"
				bd_abierta = file_db

				grid.attach (notebook, 0, 0, 1, 1)
				notebook.abrir_bd(file_db)

				grid.attach (caja_status, 0, 1, 1, 1)

				bar_status = new Gtk.Statusbar ()
				caja_status.pack_start (bar_status, false, false, 0)

				context_id: uint = bar_status.get_context_id ("")
				num_tab: int = notebook.get_n_pages()
				num_tab_txt: string = num_tab.to_string()
				if num_tab == 0
					bar_status.push (context_id,
						"Una agenda vacía no sirve para nada.")
					text_color("rojo")
				else if num_tab == 1
					bar_status.push (context_id, num_tab_txt + " contacto")
					text_color("azul")
				else
					bar_status.push (context_id, num_tab_txt + " contactos")
					text_color("azul")
				grid.show_all ()
				welcome = false

			else if inicio == Gtk.ResponseType.APPLY
				var dialogo_open = new FileChooserDialog ("Recupera una agenda guardada",
					dialogo_inicio, Gtk.FileChooserAction.OPEN,
					"_Cancelar",Gtk.ResponseType.CANCEL,
					"_Abrir", Gtk.ResponseType.ACCEPT)
				dialogo_open.select_multiple = false
				dialogo_open.set_modal(true)

				var filtro_sqlite = new Gtk.FileFilter ()
				dialogo_open.set_filter (filtro_sqlite)
				filtro_sqlite.add_mime_type ("application/x-sqlite3")

				res: int = dialogo_open.run()
				if res == Gtk.ResponseType.ACCEPT
					var bd_open = dialogo_open.get_filename ()
					var bd_test = File.new_for_path (bd_open)
					try
						var file_info = bd_test.query_info (
							"standard::content-type", FileQueryInfoFlags.NONE)
						tipo_file = file_info.get_content_type ()
					except e: Error
						msg_error: string = "Error: " + e.message
						var noti = new MessageDialog(dialogo_inicio, Gtk.DialogFlags.MODAL,
							Gtk.MessageType.ERROR, Gtk.ButtonsType.CLOSE, msg_error)
						var res_noti = noti.run()
						if res_noti == Gtk.ResponseType.CLOSE
							noti.destroy()

					if tipo_file != "application/x-sqlite3"
						var noti_file = new MessageDialog(dialogo_open,
							Gtk.DialogFlags.MODAL, Gtk.MessageType.ERROR,
							Gtk.ButtonsType.CLOSE, "¡Tipo de archivo no reconocido!")
						var resp_file = noti_file.run()
						if resp_file == Gtk.ResponseType.CLOSE
							noti_file.destroy()
						welcome = true

					else
						db_test: Sqlite.Database
						Sqlite.Database.open (bd_open, out db_test)
						query_tabla: string = "SELECT name FROM sqlite_master WHERE type = 'table'"
						stmt_tabla: Sqlite.Statement
						db_test.prepare_v2 (query_tabla, query_tabla.length, out stmt_tabla)
						while (stmt_tabla.step () == Sqlite.ROW)
							tabla_test = stmt_tabla.column_text(0)
						if tabla_test != "Contactos"
							var noti_file = new MessageDialog(dialogo_open,
								Gtk.DialogFlags.MODAL, Gtk.MessageType.ERROR,
								Gtk.ButtonsType.CLOSE, "¡Tabla 'Contactos' no encontrada!")
							var resp_file = noti_file.run()
							if resp_file == Gtk.ResponseType.CLOSE
								noti_file.destroy()
							welcome = true

						else
							query_col:string = "SELECT * FROM Contactos"
							stmt_col: Sqlite.Statement
							db_test.prepare_v2 (query_col, query_col.length, out stmt_col)
							cols_col: int = stmt_col.column_count ()
							var lista_col = new list of string
							while (stmt_col.step () == Sqlite.ROW)
								for i:int = 0 to (cols_col-1)
									col_name: string = stmt_col.column_name (i)
									lista_col.add(col_name)

							if lista_col.size < 1 or (lista_col.get(0) != "ID" or
								lista_col.get(1) != "nombre" or lista_col.get(2) != "apellido" or
								lista_col.get(3) != "apellido2" or lista_col.get(4) != "phone" or
								lista_col.get(5) != "phone2" or lista_col.get(6) != "phone3" or
								lista_col.get(7) != "email" or lista_col.get(8) != "email2" or
								lista_col.get(9) != "web" or lista_col.get(10) != "grupo" or
								lista_col.get(11) != "dir" or lista_col.get(12) != "notas" or
								lista_col.get(13) != "avatar")
								var noti_file = new MessageDialog (dialogo_open,
									Gtk.DialogFlags.MODAL, Gtk.MessageType.ERROR,
									Gtk.ButtonsType.CLOSE, "¡Archivo con tabla incompatible o vacía!")
								var resp_file = noti_file.run()
								if resp_file == Gtk.ResponseType.CLOSE
									noti_file.destroy()
								welcome = true

							else
								query_nom: string = (@"SELECT nombre FROM Contactos
									WHERE nombre IS NULL OR nombre = '';")
								stmt_nom: Sqlite.Statement
								db_test.prepare_v2 (query_nom, query_nom.length, out stmt_nom)
								cols_nom: int = stmt_nom.column_count ()
								var lista_nom = new list of string
								nom_null: int = 0
								while (stmt_nom.step () == Sqlite.ROW)
									for i:int = 0 to (cols_nom-1)
										val_nom: string = stmt_nom.column_text(i)
										lista_nom.add(val_nom)
										nom_null++

								if nom_null != 0
									var noti_file = new MessageDialog (dialogo_open,
										Gtk.DialogFlags.MODAL, Gtk.MessageType.ERROR,
										Gtk.ButtonsType.CLOSE, "¡Archivo con tabla incompleta!")
									var resp_file = noti_file.run()
									if resp_file == Gtk.ResponseType.CLOSE
										noti_file.destroy()
									welcome = true

								else
									bd_abierta = bd_open

									grid.attach (notebook, 0, 0, 1, 1)
									notebook.abrir_bd(bd_open)

									dialogo_open.destroy()

									grid.attach (caja_status, 0, 1, 1, 1)

									bar_status = new Gtk.Statusbar ()
									caja_status.pack_start (bar_status, false, false, 0)

									context_id: uint = bar_status.get_context_id ("")
									num_tab: int = notebook.get_n_pages()
									num_tab_txt: string = num_tab.to_string()
									if num_tab == 0
										bar_status.push (context_id,
											"Todos los contactos han sido eliminados. Reinicia para empezar.")
										text_color("rojo")
									else if num_tab == 1
										bar_status.push (context_id, num_tab_txt + " contacto")
										text_color("azul")
									else
										bar_status.push (context_id, num_tab_txt + " contactos")
										text_color("azul")

									grid.show_all ()
									welcome = false
				else
					welcome = true
				dialogo_open.destroy()

			else if inicio == Gtk.ResponseType.CLOSE
				dialogo_inicio.destroy()
				welcome = false
				Process.exit (0)

			else if inicio == Gtk.ResponseType.DELETE_EVENT
				dialogo_inicio.destroy()
				welcome = false
				Process.exit (0)

		while welcome == true

		dialogo_inicio.destroy()
		ventana.show_all()
