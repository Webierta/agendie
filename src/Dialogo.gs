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

class Dialogo: Gtk.ApplicationWindow

	id: string
	tipo_avatar: string
	avatar_info: FileInfo
	dialogo_avatar: FileChooserDialog
	preview_area: Gtk.Image
	chooser_png: Gtk.FileChooser

	def prevista(chooser_png: Gtk.FileChooser)
		var uri = chooser_png.get_preview_uri ()
		if (uri != null) and (uri.has_prefix ("file://") == true)
			uri = (uri.replace("%C3%A1", "á").replace("%C3%81", "Á")
				.replace("%C3%A9", "é").replace("%C3%89", "É")
				.replace("%C3%AD", "í").replace("%C3%8D", "Í")
				.replace("%C3%B3", "ó").replace("%C3%93", "Ó")
				.replace("%C3%BA", "ú").replace("%C3%9A", "Ú")
				.replace("%C3%B1", "ñ").replace("%C3%91", "Ñ"))
			uri = uri.substring(7)
			try
				var pixbuf = new Gdk.Pixbuf.from_file_at_scale (uri, 150, 150, true)
				preview_area.set_from_pixbuf (pixbuf)
				preview_area.show ()
			except e: Error
				preview_area.hide ()
		else
			preview_area.hide ()

	def buscar_imagen()
		var dialogo_avatar=  new FileChooserDialog ("Selecciona una imagen PNG/JPG",
			win_notebook, Gtk.FileChooserAction.OPEN,
			"_Cancelar", Gtk.ResponseType.CANCEL,
			"_Abrir", Gtk.ResponseType.ACCEPT)
		dialogo_avatar.select_multiple = false
		dialogo_avatar.set_modal(true)

		var filtro_png = new Gtk.FileFilter ()
		dialogo_avatar.set_filter (filtro_png)
		filtro_png.add_mime_type ("image/png")
		filtro_png.add_mime_type ("image/jpeg")
		filtro_png.add_mime_type ("image/pjpeg")

		var chooser_png = dialogo_avatar
		chooser_png.set_border_width (24)
		var box_previe = new Gtk.Box(Gtk.Orientation.VERTICAL, 0)
		preview_area = new Gtk.Image ()
		box_previe.pack_start (preview_area, false, false, 0)
		preview_area.set_margin_end(10)
		chooser_png.set_preview_widget (box_previe)

		chooser_png.update_preview.connect (prevista)

		res_av:int = dialogo_avatar.run()

		if (res_av == Gtk.ResponseType.ACCEPT)
			var archivo_avatar = dialogo_avatar.get_filename ()
			var avatar_test = File.new_for_path (archivo_avatar)

			try
				avatar_info: FileInfo = avatar_test.query_info (
					"standard::content-type", FileQueryInfoFlags.NONE)
				tipo_avatar = avatar_info.get_content_type ()
			except e: Error
				var noti_av = new MessageDialog (dialogo_avatar,
					Gtk.DialogFlags.MODAL, Gtk.MessageType.ERROR,
					Gtk.ButtonsType.CLOSE, "Error al cargar archivo de imagen.")
				var resp_av = noti_av.run()
				if resp_av == Gtk.ResponseType.CLOSE
					noti_av.destroy()

			if (tipo_avatar == "image/png" or
				tipo_avatar == "image/jpeg" or
				tipo_avatar == "image/pjpeg")
				entrada_avatar.set_label(archivo_avatar)
				if archivo_avatar != ""
					var file_test = File.new_for_path (archivo_avatar)
					if (file_test.query_exists () == true)
						try
							var pix_avatar = new Gdk.Pixbuf.from_file (archivo_avatar)
							pix_avatar = pix_avatar.scale_simple (128, 128, Gdk.InterpType.BILINEAR)
							entrada_photo.set_from_pixbuf(pix_avatar)
						except e: Error
							var noti = new MessageDialog (win_notebook, Gtk.DialogFlags.MODAL,
								Gtk.MessageType.WARNING, Gtk.ButtonsType.CLOSE,
								"No se ha podido cargar la imagen.")
							var res_noti = noti.run()
							if res_noti == Gtk.ResponseType.CLOSE
								noti.destroy()
					else
						try
							data:array of uint8 = Base64.decode(archivo_avatar)
							var stream = new MemoryInputStream.from_data(data)
							var pixbuf = new Gdk.Pixbuf.from_stream(stream)
							pixbuf = pixbuf.scale_simple (128, 128, Gdk.InterpType.BILINEAR)
							entrada_photo.set_from_pixbuf(pixbuf)
						except e: Error
							var noti = new MessageDialog (win_notebook, Gtk.DialogFlags.MODAL,
								Gtk.MessageType.WARNING, Gtk.ButtonsType.CLOSE,
								"No se ha podido cargar la imagen.")
							var res_noti = noti.run()
							if res_noti == Gtk.ResponseType.CLOSE
								noti.destroy()

			else
				var noti_av = new MessageDialog(
					dialogo_avatar,
					Gtk.DialogFlags.MODAL, Gtk.MessageType.ERROR,
					Gtk.ButtonsType.CLOSE, "¡Tipo de archivo no reconocido!")
				var resp_av = noti_av.run()
				if resp_av == Gtk.ResponseType.CLOSE
					noti_av.destroy()
		dialogo_avatar.destroy()

	def eliminar_imagen()
		entrada_avatar.set_text("")
		entrada_photo.set_from_pixbuf(null)

	def cambio_grupo()
		categoria: string = grupo_combo.get_active_text()
		entrada_grupo.set_text(categoria)

	init

		this.set_modal(true)
		this.set_transient_for(win_notebook)
		this.window_position = WindowPosition.CENTER
		this.border_width = 20
		this.set_default_size (600, 500)

		var header = new Gtk.HeaderBar()
		header.show_close_button = true
		header.set_title ("CONTACTO")
		header.set_hexpand (true)
		this.set_titlebar(header)

		//var boton_cancelar = new Button.from_icon_name("gtk-cancel", IconSize.BUTTON)
		var boton_cancelar = new Button()
		boton_cancelar.label = "CANCELAR"
		boton_cancelar.set_tooltip_text ("Salir sin guardar cambios")
		header.pack_start(boton_cancelar)
		boton_cancelar.clicked.connect(contacto_cancelar)

		//var boton_aceptar = new Button.from_icon_name("gtk-apply", IconSize.BUTTON)
		var boton_aceptar = new Button()
		boton_aceptar.label = "ACEPTAR"
		//boton_aceptar.get_style_context ().add_class (Gtk.STYLE_CLASS_SUGGESTED_ACTION)
		boton_aceptar.set_tooltip_text ("Guardar cambios")
		header.pack_end(boton_aceptar)
		boton_aceptar.clicked.connect(contacto_aceptar)

		area: Gtk.Grid = new Gtk.Grid()
		area.set_column_spacing(4)

		var eti_nombre = new Gtk.Label("NOMBRE<sup>*</sup>")
		eti_nombre.set_use_markup (true)
		eti_nombre.set_xalign(0)
		entrada_nombre = new Gtk.Entry()
		var eti_apellido = new Gtk.Label("APELLIDOS")
		eti_apellido.set_xalign(0)
		entrada_apellido = new Gtk.Entry()
		entrada_apellido2 = new Gtk.Entry()
		var eti_phone = new Gtk.Label("TELÉFONOS")
		eti_phone.set_xalign(0)
		eti_phone.set_margin_top(6)
		entrada_phone = new Gtk.Entry()
		entrada_phone2 = new Gtk.Entry()
		entrada_phone3 = new Gtk.Entry()
		var eti_mail = new Gtk.Label("E-MAILS")
		eti_mail.set_xalign(0)
		eti_mail.set_margin_top(6)
		entrada_mail = new Gtk.Entry()
		entrada_mail2 = new Gtk.Entry()
		var eti_web = new Gtk.Label("WEB")
		eti_web.set_xalign(0)
		eti_web.set_margin_top(6)
		entrada_web = new Gtk.Entry()
		var eti_dir = new Gtk.Label("DIRECCIÓN")
		eti_dir.set_xalign(0)
		eti_dir.set_margin_top(6)
		entrada_dir = new Gtk.TextView()
		var eti_notas = new Gtk.Label("NOTAS")
		eti_notas.set_xalign(0)
		eti_notas.set_margin_top(6)
		entrada_notas = new Gtk.TextView()

		var eti_grupo = new Gtk.Label("GRUPO")
		eti_grupo.set_xalign(0)
		eti_grupo.set_margin_top(6)
		entrada_grupo = new Gtk.Entry()

		grupo_combo = new Gtk.ComboBoxText()
		grupo_combo.append_text("")
		grupo_combo.active = 0

		query_grupo: string = (@"SELECT DISTINCT grupo FROM Contactos;")
		stmt_grupo: Sqlite.Statement
		db.prepare_v2 (query_grupo, query_grupo.length, out stmt_grupo)
		cols_grupo: int = stmt_grupo.column_count ()
		//var lista_grupo = new list of string

		while (stmt_grupo.step () == Sqlite.ROW)
			for i:int = 0 to (cols_grupo-1)
				val_grupo: string = stmt_grupo.column_text(i)
				if val_grupo != ""
					grupo_combo.append_text (val_grupo)

		grupo_combo.changed.connect(cambio_grupo)

		var eti_avatar = new Gtk.Label("AVATAR")
		eti_avatar.set_xalign(0)
		eti_avatar.set_margin_top(6)

		var botonera = new Gtk.ButtonBox (Gtk.Orientation.HORIZONTAL)
		botonera.set_layout (Gtk.ButtonBoxStyle.CENTER)
		botonera.set_spacing (4)

		var boton_avatar = new Button.from_icon_name (
			"gtk-find", IconSize.LARGE_TOOLBAR)
		boton_avatar.set_tooltip_text ("Buscar imagen para avatar")
		boton_avatar.clicked.connect(buscar_imagen)
		boton_avatar.set_label("Buscar")
		botonera.add (boton_avatar)

		var boton_avatar_eliminar = new Button.from_icon_name (
			"gtk-clear", IconSize.LARGE_TOOLBAR)
		boton_avatar_eliminar.set_tooltip_text ("Eliminar imagen de avatar")
		boton_avatar_eliminar.clicked.connect(eliminar_imagen)
		boton_avatar_eliminar.set_label("Limpiar")
		botonera.add (boton_avatar_eliminar)

		entrada_avatar = new Gtk.Label("")
		entrada_photo = new Gtk.Image()

		area.attach(eti_nombre, 0, 0, 1, 1)
		area.attach_next_to (entrada_nombre, eti_nombre, Gtk.PositionType.BOTTOM, 1, 1)
		area.attach(eti_apellido, 1, 0, 1, 1)
		area.attach_next_to (entrada_apellido, eti_apellido, Gtk.PositionType.BOTTOM, 1, 1)
		area.attach(entrada_apellido2, 2, 1, 1, 1)

		area.attach(eti_phone, 0, 2, 1, 1)
		area.attach_next_to (entrada_phone, eti_phone, Gtk.PositionType.BOTTOM, 1, 1)
		area.attach_next_to (entrada_phone2, entrada_phone, Gtk.PositionType.RIGHT, 1, 1)
		area.attach_next_to (entrada_phone3, entrada_phone2, Gtk.PositionType.RIGHT, 1, 1)

		area.attach(eti_mail, 0, 4, 1, 1)
		area.attach_next_to (entrada_mail, eti_mail, Gtk.PositionType.BOTTOM, 1, 1)
		area.attach_next_to (entrada_mail2, entrada_mail, Gtk.PositionType.RIGHT, 1, 1)

		area.attach(eti_web, 0, 6, 1, 1)
		area.attach_next_to (entrada_web, eti_web, Gtk.PositionType.BOTTOM, 2, 1)

		area.attach(eti_dir, 0, 8, 1, 1)
		var scrolled_dir = new Gtk.ScrolledWindow (null, null)
		area.attach (scrolled_dir, 0, 9, 4, 3)
		entrada_dir.set_wrap_mode (Gtk.WrapMode.WORD)
		scrolled_dir.add (entrada_dir)

		area.attach(eti_notas, 0, 13, 1, 1)
		var scrolled_notas = new Gtk.ScrolledWindow (null, null)
		area.attach(scrolled_notas, 0, 14, 4, 3)
		entrada_notas.set_wrap_mode (Gtk.WrapMode.WORD)
		scrolled_notas.add (entrada_notas)

		area.attach(eti_grupo, 0, 19, 1, 1)
		area.attach_next_to (entrada_grupo, eti_grupo, Gtk.PositionType.BOTTOM, 1, 1)
		area.attach_next_to (grupo_combo, entrada_grupo, Gtk.PositionType.RIGHT, 1, 1)

		area.attach(eti_avatar, 0, 21, 1, 1)
		area.attach_next_to (botonera, eti_avatar, Gtk.PositionType.BOTTOM, 1, 1)
		area.attach_next_to (entrada_photo, botonera, Gtk.PositionType.BOTTOM, 1, 1)

		this.add(area)
		this.show_all ()

	construct datos_nuevos ()

		this.title = "Nuevo Contacto"

	construct datos_editar (lista_consulta: list of string)

		id = lista_consulta.get(0)
		this.title = "Editar Contacto"

		nombre_ed: string = lista_consulta.get(1)
		apellido_ed: string = lista_consulta.get(2)
		apellido2_ed: string = lista_consulta.get(3)
		phone_ed: string = lista_consulta.get(4)
		phone2_ed: string = lista_consulta.get(5)
		phone3_ed: string = lista_consulta.get(6)
		mail_ed: string = lista_consulta.get(7)
		mail2_ed: string = lista_consulta.get(8)
		web_ed: string = lista_consulta.get(9)
		grupo_ed: string = lista_consulta.get(10)
		dir_ed: string = lista_consulta.get(11)
		notas_ed: string = lista_consulta.get(12)
		avatar_ed: string = lista_consulta.get(13)

		entrada_nombre.set_text(nombre_ed)
		entrada_apellido.set_text(apellido_ed)
		entrada_apellido2.set_text(apellido2_ed)
		entrada_phone.set_text(phone_ed)
		entrada_phone2.set_text(phone2_ed)
		entrada_phone3.set_text(phone3_ed)
		entrada_mail.set_text(mail_ed)
		entrada_mail2.set_text(mail2_ed)
		entrada_web.set_text(web_ed)
		entrada_grupo.set_text(grupo_ed)
		entrada_dir.buffer.text = dir_ed
		entrada_notas.buffer.text = notas_ed
		entrada_avatar.set_text(avatar_ed)

		if avatar_ed != ""
			var file_test = File.new_for_path (avatar_ed)
			if (file_test.query_exists () == true)
				try
					var pix_avatar = new Gdk.Pixbuf.from_file (avatar_ed)
					pix_avatar = pix_avatar.scale_simple (128, 128, Gdk.InterpType.BILINEAR)
					entrada_photo.set_from_pixbuf(pix_avatar)
				except e: Error
					var noti = new MessageDialog (this, Gtk.DialogFlags.MODAL,
						Gtk.MessageType.WARNING, Gtk.ButtonsType.CLOSE,
						"No se ha podido cargar la imagen.")
					var res_noti = noti.run()
					if res_noti == Gtk.ResponseType.CLOSE
						noti.destroy()
			else
				try
					data:array of uint8 = Base64.decode(avatar_ed)
					var stream = new MemoryInputStream.from_data(data)
					var pixbuf = new Gdk.Pixbuf.from_stream(stream)
					pixbuf = pixbuf.scale_simple (128, 128, Gdk.InterpType.BILINEAR)
					entrada_photo.set_from_pixbuf(pixbuf)
				except e: Error
					var noti = new MessageDialog (this, Gtk.DialogFlags.MODAL,
						Gtk.MessageType.WARNING, Gtk.ButtonsType.CLOSE,
						"No se ha podido cargar la imagen.")
					var res_noti = noti.run()
					if res_noti == Gtk.ResponseType.CLOSE
						noti.destroy()

	def contacto_cancelar()
		this.destroy()

	def contacto_aceptar()
		if this.title == "Nuevo Contacto"
			notebook.ok_nuevo()
			if entrada_nombre.get_text().length > 0
				this.destroy()
		else if this.title == "Editar Contacto"
			notebook.ok_editar(id)
			if entrada_nombre.get_text().length > 0
				this.destroy()
		else
			this.destroy()
