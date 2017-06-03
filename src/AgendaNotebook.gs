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

class AgendaNotebook: Gtk.Notebook

	dialogo: Gtk.ApplicationWindow

	pos: int
	buscado: string
	filtro: bool = false
	buscando: string = ""
	pix_avatar: Gdk.Pixbuf
	dialogo_inicio: Gtk.Dialog

	nombre_nuevo: string
	apellido_nuevo: string
	apellido2_nuevo: string
	phone_nuevo: string
	phone2_nuevo: string
	phone3_nuevo: string
	mail_nuevo: string
	mail2_nuevo: string
	web_nuevo: string
	grupo_nuevo: string
	dir_nuevo: string
	notas_nuevo: string
	avatar_nuevo: string

	tipo_file: string
	num_lin: int
	num_file: int
	vcard: array of string
	nombre_vcard: string
	version_vcard: bool
	control_version: string

	class Agenda: Object
		nombre: string
		apellido1: string
		apellido2: string
		tel1: string
		tel2: string
		tel3: string
		email1: string
		email2: string
		web: string
		grupo: string
		dir: string
		notas: string
		photo: string

	contacto: Agenda

	apellido_imp: string
	apellido2_imp: string
	phone_imp: string
	phone2_imp: string
	phone3_imp: string
	mail_imp: string
	mail2_imp: string
	web_imp: string
	grupo_imp: string
	dir_imp: string
	notas_imp: string
	avatar_imp: string

	lista_id_dup: list of string

	init
		this.set_hexpand (true)
		this.set_vexpand (true)
		this.set_tab_pos(Gtk.PositionType.RIGHT)
		this.set_scrollable(true)

	def abrir_bd (archivo: string)
		Sqlite.Database.open (archivo, out db)
		tabla: string = ("""CREATE TABLE Contactos (
			ID INTEGER PRIMARY KEY, nombre TEXT NOT NULL,
			apellido TEXT, apellido2 TEXT, phone INTEGER,
			phone2 INTEGER, phone3 INTEGER, email TEXT,
			email2 TEXT, web TEXT, grupo TEXT, dir TEXT,
			notas TEXT, avatar TEXT)""")
		db.exec (tabla)
		inicio_bd()

	def consulta_datos (id_x:string): list of string
		query:string = @"SELECT * FROM Contactos WHERE ID='$id_x';"
		stmt: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt)
		cols: int = stmt.column_count ()
		var lista_consulta = new list of string
		while (stmt.step () == Sqlite.ROW)
			for i:int = 0 to (cols-1)
				val: string = stmt.column_text(i)
				lista_consulta.add(val)
		return lista_consulta

	def consulta_ID (po:int): string
		query: string = @"SELECT ID FROM Contactos ORDER BY nombre ASC;"
		stmt: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt)
		cols: int = stmt.column_count ()
		var lista_consulta = new list of string
		while (stmt.step () == Sqlite.ROW)
			for i:int = 0 to (cols-1)
				val: string = stmt.column_text(i)
				lista_consulta.add(val)
		id_pos: string = lista_consulta.get(po)
		return id_pos

	def consulta_pos (id: string): int
		query: string = @"SELECT ID FROM Contactos ORDER BY nombre ASC;"
		stmt_new: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt_new)
		cols_new: int = stmt_new.column_count ()
		var lista_consulta_new = new list of string
		while (stmt_new.step () == Sqlite.ROW)
			for i: int = 0 to (cols_new-1)
				val: string = stmt_new.column_text(i)
				lista_consulta_new.add(val)
		pos_tab: int = lista_consulta_new.index_of(id)
		return pos_tab

	def consulta_nombre (id: string): string
		query: string = @"SELECT nombre FROM Contactos WHERE ID='$id' ORDER BY nombre ASC;"
		stmt_new: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt_new)
		cols_new: int = stmt_new.column_count ()
		var lista_consulta_nombre = new list of string
		while (stmt_new.step () == Sqlite.ROW)
			for i: int = 0 to (cols_new-1)
				val: string = stmt_new.column_text(i)
				lista_consulta_nombre.add(val)
		nombre_id: string = lista_consulta_nombre.get(0)
		return nombre_id

	def new_edit (): int
		query: string
		query = @"SELECT MAX(ID) FROM Contactos"
		stmt: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt)
		cols: int = stmt.column_count ()
		var lista_consulta_max = new list of string
		while (stmt.step () == Sqlite.ROW)
			for i:int = 0 to (cols-1)
				val_id: string = stmt.column_text(i)
				lista_consulta_max.add(val_id)
		val_id: string = lista_consulta_max.get(0)
		query = @"SELECT ID FROM Contactos ORDER BY nombre ASC;"
		stmt_new: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt_new)
		cols_new: int = stmt_new.column_count ()
		var lista_consulta_new = new list of string
		while (stmt_new.step () == Sqlite.ROW)
			for i:int = 0 to (cols_new-1)
				val: string = stmt_new.column_text(i)
				lista_consulta_new.add(val)
		pos_tab:int = lista_consulta_new.index_of(val_id)
		this.nueva_tab_nuevo(val_id, pos_tab)
		this.queue_draw()
		return pos_tab

	def borrar_all(): int
		query: string = @"SELECT ID FROM Contactos;"
		stmt: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt)
		cols: int = stmt.column_count ()
		var lista_id = new list of string
		tot_num: int = 0
		while (stmt.step () == Sqlite.ROW)
			for i:int = 0 to (cols-1)
				val_id: string = stmt.column_text(i)
				lista_id.add(val_id)
				tot_num++
		//tot_num:int = lista_id.size
		for var num = 1 to tot_num
			pos:int = this.get_current_page()
			this.remove_page(pos)
			this.queue_draw()
		return tot_num

	def consulta_dup (): list of string
		query: string = (@"SELECT ID, COUNT(*) FROM Contactos
			GROUP BY nombre, apellido, apellido2, phone, phone2,
			phone3, email, email2, web, grupo, dir, notas, avatar
			HAVING COUNT(*) > 1;")
		stmt: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt)
		cols: int = stmt.column_count ()
		var lista_consulta = new list of string
		while (stmt.step () == Sqlite.ROW)
			for i:int = 0 to (cols-1)
				val: string = stmt.column_text(i)
				lista_consulta.add(val)

		var lista_id_dup = new list of string
		for id in lista_consulta
			if lista_consulta.index_of(id) % 2 == 0
				lista_id_dup.add(id)
		return lista_id_dup

	def duplicados()

		lista_id_dup = consulta_dup()

		if lista_id_dup.size == 0
			var noti = new MessageDialog(win_notebook,
				Gtk.DialogFlags.MODAL,
				Gtk.MessageType.INFO,
				Gtk.ButtonsType.CLOSE,
				"No hay contactos duplicados.")
			var res_noti = noti.run()
			if res_noti == Gtk.ResponseType.CLOSE
				noti.destroy()
		else
			var lista_nombres = new list of string
			for id in lista_id_dup
				lista_nombres.add(consulta_nombre(id))
			var nombres_dup = new StringBuilder ()
			for name in lista_nombres
				nombres_dup.append ("\t" + name + "\n")

			var dialogo_dupe = new Gtk.Dialog.with_buttons ("Eliminar duplicados",
				win_notebook,
				Gtk.DialogFlags.MODAL | Gtk.DialogFlags.DESTROY_WITH_PARENT,
				"gtk-cancel", Gtk.ResponseType.CANCEL,
				"gtk-remove", Gtk.ResponseType.OK)

			dialogo_dupe.set_default_size (300, 400)
			dialogo_dupe.set_border_width (4)
			var content_area = dialogo_dupe.get_content_area ()
			content_area.set_border_width (4)

			var texto_dupe = new Gtk.TextView()
			texto_dupe.set_wrap_mode (Gtk.WrapMode.WORD)
			texto_dupe.set_editable(false)
			texto_dupe.set_vexpand(true)
			texto_dupe.buffer.text = nombres_dup.str

			var scrolled_dupe = new Gtk.ScrolledWindow (null, null)
			scrolled_dupe.add (texto_dupe)
			content_area.add (scrolled_dupe)
			dialogo_dupe.show_all()

			duple: int = dialogo_dupe.run()
			if duple == Gtk.ResponseType.OK
				refrescar()
				while lista_id_dup.size > 0
					lista_id_dup = consulta_dup()
					for id in lista_id_dup
						borrar: string = (@"DELETE FROM Contactos WHERE ID = '$id'")
						db.exec (borrar)
						this.remove_page(consulta_pos(id))
						this.queue_draw()
				bar_status.push (context_id, "Info: Duplicados eliminados.")
				text_color("verde")
				refrescar()
				dialogo_dupe.destroy()
			else
				dialogo_dupe.destroy()

	def rebuscar (buscado: string): list of string
		query: string = (@"SELECT ID FROM Contactos
			WHERE nombre LIKE '%$buscado%' OR apellido LIKE '%$buscado%' OR
			apellido2 LIKE '%$buscado%' ORDER BY nombre ASC;")
		stmt: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt)
		cols: int = stmt.column_count ()
		var lista_consulta = new list of string
		while (stmt.step () == Sqlite.ROW)
			for i:int = 0 to (cols-1)
				val: string = stmt.column_text(i)
				lista_consulta.add(val)
		return lista_consulta

	def rebuscar_grupo (buscado_grupo: string): list of string
		query: string = (@"SELECT ID FROM Contactos
			WHERE grupo = '$buscado_grupo' ORDER BY nombre ASC;")
		stmt: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt)
		cols: int = stmt.column_count ()
		var lista_consulta_grupo = new list of string
		while (stmt.step () == Sqlite.ROW)
			for i:int = 0 to (cols-1)
				val: string = stmt.column_text(i)
				lista_consulta_grupo.add(val)
		return lista_consulta_grupo

	def termino_buscado (): string
		querybus: string = @"SELECT * FROM Buscados;"
		stmtbus: Sqlite.Statement
		db.prepare_v2 (querybus, querybus.length, out stmtbus)
		colsbus: int = stmtbus.column_count ()
		var lista_bus = new list of string
		lista_size: int = 0
		while (stmtbus.step () == Sqlite.ROW)
			for i:int = 0 to (colsbus-1)
				val_bus: string = stmtbus.column_text(i)
				lista_bus.add(val_bus)
				lista_size++
		buscado: string = lista_bus.get(lista_size-1)
		return buscado

	def refrescar()
		filtro = false
		buscando = ""
		tot_num:int = borrar_all()
		inicio_bd()
		if tot_num > 1
			tot_txt: string = tot_num.to_string()
			bar_status.push (context_id,
				"Operación realizada correctamente. " + tot_txt + " contactos")
			text_color("verde")
		else
			tot_txt: string = tot_num.to_string()
			bar_status.push (context_id,
				"Operación realizada correctamente. " + tot_txt + " contacto")
			text_color("verde")

	def inicio_bd ()
		query: string = @"SELECT ID FROM Contactos ORDER BY nombre ASC;"
		stmt: Sqlite.Statement
		db.prepare_v2 (query, query.length, out stmt)
		cols: int = stmt.column_count ()
		var lista_consulta = new list of string
		while (stmt.step () == Sqlite.ROW)
			for i:int = 0 to (cols-1)
				val: string = stmt.column_text(i)
				lista_consulta.add(val)
		if lista_consulta.size > 0
			for id in lista_consulta
				this.nueva_tab(id)

	def nueva_tab (id_x:string)
		lista_consulta: list of string = consulta_datos (id_x)
		this.append_page (content(lista_consulta),
			create_label(lista_consulta.get(1)))

	def nueva_tab_nuevo (id_x:string, pos_x:int)
		lista_consulta: list of string = consulta_datos (id_x)
		this.insert_page (content(lista_consulta),
			create_label(lista_consulta.get(1)), pos_x)

	def content (lista_consulta: list of string): Gtk.Grid
		nombre: string = lista_consulta.get(1)
		apellido: string = lista_consulta.get(2)
		apellido2: string = lista_consulta.get(3)
		phone: string = lista_consulta.get(4)
		phone2: string = lista_consulta.get(5)
		phone3: string = lista_consulta.get(6)
		mail: string = lista_consulta.get(7)
		mail2: string = lista_consulta.get(8)
		web: string = lista_consulta.get(9)
		grupo: string = lista_consulta.get(10)
		dir: string = lista_consulta.get(11)
		notas: string = lista_consulta.get(12)
		avatar: string = lista_consulta.get(13)

		var content = new Gtk.Grid()
		content.set_border_width (10)

		var caja_datos = new Box (Orientation.VERTICAL, 0)
		caja_datos.set_vexpand (true)
		content.attach (caja_datos, 0, 0, 1, 1)

		var caja_cab = new Box (Orientation.HORIZONTAL, 20)
		caja_cab.set_hexpand (true)
		caja_datos.pack_start(caja_cab, false, false, 0)

		if avatar != ""
			var file_test = File.new_for_path (avatar)
			if (file_test.query_exists () == true)
				try
					pix_avatar = new Gdk.Pixbuf.from_file (avatar)
					pix_avatar = pix_avatar.scale_simple (128, 128, Gdk.InterpType.BILINEAR)
					var img_avatar = new Gtk.Image.from_pixbuf(pix_avatar)
					caja_cab.pack_start(img_avatar, false, false, 0)
				except e: Error
					avatar = ""
			else
				try
					data:array of uint8 = Base64.decode(avatar)
					var stream = new MemoryInputStream.from_data( data )
					var pixbuf = new Gdk.Pixbuf.from_stream(stream)
					pixbuf = pixbuf.scale_simple (128, 128, Gdk.InterpType.BILINEAR)
					var img_avatar = new Gtk.Image.from_pixbuf(pixbuf)
					caja_cab.pack_start(img_avatar, false, false, 0)
				except e: Error
					avatar = ""

		var caja_nombres = new Box (Orientation.VERTICAL, 0)
		caja_cab.pack_start(caja_nombres, false, false, 0)

		nombre_html: string = (nombre.replace("&", "&amp;").replace("<", "")
			.replace(">", "").replace("'", "’"))
		apellido_html: string = (apellido.replace("&", "&amp;").replace("<", "")
			.replace(">", ""))
		apellido2_html: string = (apellido2.replace("&", "&amp;").replace("<", "")
			.replace(">", ""))
		phone_html: string = (phone.replace("&", "&amp;").replace("<", "")
			.replace(">", ""))
		phone2_html: string = (phone2.replace("&", "&amp;").replace("<", "")
			.replace(">", ""))
		phone3_html: string = (phone3.replace("&", "&amp;").replace("<", "")
			.replace(">", ""))
		mail_html: string = (mail.replace("&", "&amp;").replace("<", "")
			.replace(">", ""))
		mail2_html: string = (mail2.replace("&", "&amp;").replace("<", "")
			.replace(">", ""))
		web_html: string = (web.replace("&", "&amp;").replace("<", "")
			.replace(">", ""))
		grupo_html: string = (grupo.replace("&", "&amp;").replace("<", "")
			.replace(">", ""))

		var salida_nombre = new Gtk.Label(@"<span foreground='blue' size='xx-large'>$nombre_html</span>")
		salida_nombre.set_use_markup (true)
		salida_nombre.set_margin_top(10)
		salida_nombre.set_xalign(0)
		var salida_apellido = new Gtk.Label(@"<span foreground='blue' size='xx-large'>$apellido_html</span>")
		salida_apellido.set_use_markup (true)
		salida_apellido.set_xalign(0)
		var salida_apellido2 = new Gtk.Label(@"<span foreground='blue' size='xx-large'>$apellido2_html</span>")
		salida_apellido2.set_use_markup (true)
		salida_apellido2.set_xalign(0)
		caja_nombres.pack_start(salida_nombre, false, false, 0)
		caja_nombres.pack_start(salida_apellido, false, false, 0)
		caja_nombres.pack_start(salida_apellido2, false, false, 0)

		var tel_label = new Gtk.Label ("<span size='small'>TELÉFONOS</span>")
		tel_label.set_use_markup (true)
		tel_label.set_xalign(0)
		tel_label.set_margin_top(6)

		var sub_caja_tel = new Gtk.ListBox()
		sub_caja_tel.set_margin_bottom(6)
		sub_caja_tel.set_selection_mode(SelectionMode.NONE)

		var row1_tel = new Gtk.ListBoxRow()
		var hbox1_tel = new Gtk.Box(Orientation.HORIZONTAL, 20)
		row1_tel.add(hbox1_tel)
		var salida_phone = new Gtk.Label(@"<span size='large'><tt>$phone_html</tt></span>")
		salida_phone.set_use_markup (true)
		salida_phone.set_selectable(true)
		hbox1_tel.pack_start (salida_phone, false, false, 0)

		var row2_tel = new Gtk.ListBoxRow()
		var hbox2_tel = new Gtk.Box(Orientation.HORIZONTAL, 20)
		row2_tel.add(hbox2_tel)
		var salida_phone2 = new Gtk.Label(@"<span size='large'><tt>$phone2_html</tt></span>")
		salida_phone2.set_use_markup (true)
		salida_phone2.set_selectable(true)
		hbox2_tel.pack_start (salida_phone2, false, false, 0)

		var row3_tel = new Gtk.ListBoxRow()
		var hbox3_tel = new Gtk.Box(Orientation.HORIZONTAL, 20)
		row3_tel.add(hbox3_tel)
		var salida_phone3 = new Gtk.Label(@"<span size='large'><tt>$phone3_html</tt></span>")
		salida_phone3.set_use_markup (true)
		salida_phone3.set_selectable(true)
		hbox3_tel.pack_start (salida_phone3, false, false, 0)

		if phone != "" or phone2 != "" or phone3 != ""
			caja_datos.pack_start (tel_label, false, false, 0)
			caja_datos.pack_start (sub_caja_tel, false, false, 0)
		if phone != ""
			sub_caja_tel.add(row1_tel)
		if phone2 != ""
			sub_caja_tel.add(row2_tel)
		if phone3 != ""
			sub_caja_tel.add(row3_tel)

		var mail_label = new Gtk.Label ("<span size='small'>E-MAILS</span>")
		mail_label.set_use_markup (true)
		mail_label.set_xalign(0)
		mail_label.set_margin_top(6)

		var sub_caja_mail = new Gtk.ListBox()
		sub_caja_mail.set_margin_bottom(6)
		sub_caja_mail.set_selection_mode(SelectionMode.NONE)

		var row1_mail = new Gtk.ListBoxRow()
		var hbox1_mail = new Gtk.Box(Orientation.HORIZONTAL, 20)
		row1_mail.add(hbox1_mail)
		var salida_mail = new Gtk.Label(@"<b>$mail_html</b>")
		salida_mail.set_use_markup (true)
		salida_mail.set_selectable(true)
		hbox1_mail.pack_start (salida_mail, false, false, 0)

		var row2_mail = new Gtk.ListBoxRow()
		var hbox2_mail = new Gtk.Box(Orientation.HORIZONTAL, 20)
		row2_mail.add(hbox2_mail)
		var salida_mail2 = new Gtk.Label(@"<b>$mail2_html</b>")
		salida_mail2.set_use_markup (true)
		salida_mail2.set_selectable(true)
		hbox2_mail.pack_start (salida_mail2, false, false, 0)

		if mail != "" or mail2 != ""
			caja_datos.pack_start (mail_label, false, false, 0)
			caja_datos.pack_start (sub_caja_mail, false, false, 0)
		if mail != ""
			sub_caja_mail.add(row1_mail)
		if mail2 != ""
			sub_caja_mail.add(row2_mail)

		var web_label = new Gtk.Label ("<span size='small'>WEB</span>")
		web_label.set_use_markup (true)
		web_label.set_xalign(0)
		web_label.set_margin_top(6)

		var sub_caja_web = new Gtk.ListBox()
		sub_caja_web.set_margin_bottom(6)
		sub_caja_web.set_selection_mode(SelectionMode.NONE)

		var row1_web = new Gtk.ListBoxRow()
		sub_caja_web.add(row1_web)
		var hbox1_web = new Gtk.Box(Orientation.HORIZONTAL, 20)
		row1_web.add(hbox1_web)
		var salida_web = new Gtk.Label(@"$web_html")
		salida_web.set_use_markup (true)
		salida_web.set_selectable(true)
		hbox1_web.pack_start (salida_web, false, false, 0)

		if web != ""
			caja_datos.pack_start (web_label, false, false, 0)
			caja_datos.pack_start (sub_caja_web, false, false, 0)

		var grupo_label = new Gtk.Label ("<span size='small'>GRUPO</span>")
		grupo_label.set_use_markup (true)
		grupo_label.set_xalign(0)
		grupo_label.set_margin_top(6)

		var sub_caja_grupo = new Gtk.ListBox()
		sub_caja_grupo.set_margin_bottom(6)
		sub_caja_grupo.set_selection_mode(SelectionMode.NONE)

		var row1_grupo = new Gtk.ListBoxRow()
		sub_caja_grupo.add(row1_grupo)
		var hbox1_grupo = new Gtk.Box(Orientation.HORIZONTAL, 20)
		row1_grupo.add(hbox1_grupo)
		var salida_grupo = new Gtk.Label(@"$grupo_html")
		salida_grupo.set_use_markup (true)
		salida_grupo.set_selectable(true)
		hbox1_grupo.pack_start (salida_grupo, false, false, 0)

		if grupo != ""
			caja_datos.pack_start (grupo_label, false, false, 0)
			caja_datos.pack_start (sub_caja_grupo, false, false, 0)

		var sub_caja_dir = new Box (Orientation.HORIZONTAL, 4)
		var dir_label = new Gtk.Label ("<span size='small'>DIRECCIÓN</span>")
		dir_label.set_use_markup (true)
		dir_label.set_margin_top(6)
		sub_caja_dir.pack_start (dir_label, false, false, 0)

		var scrolled_dir = new Gtk.ScrolledWindow (null, null)
		var salida_dir = new Gtk.TextView()
		salida_dir.set_hexpand (true)
		salida_dir.set_wrap_mode (Gtk.WrapMode.WORD)
		salida_dir.set_left_margin (4)
		salida_dir.set_margin_bottom(6)
		salida_dir.buffer.text = dir
		salida_dir.set_editable(false)
		scrolled_dir.add (salida_dir)
		if dir != ""
			caja_datos.pack_start(sub_caja_dir, false, false, 0)
			caja_datos.pack_start(scrolled_dir, false, false, 0)

		var sub_caja_notas = new Box (Orientation.HORIZONTAL, 4)
		var notas_label = new Gtk.Label ("<span size='small'>NOTAS</span>")
		notas_label.set_use_markup (true)
		notas_label.set_margin_top(6)
		sub_caja_notas.pack_start (notas_label, false, false, 0)

		var scrolled_notas = new Gtk.ScrolledWindow (null, null)
		var salida_notas = new Gtk.TextView()
		salida_notas.set_hexpand (true)
		salida_notas.set_wrap_mode (Gtk.WrapMode.WORD)
		salida_notas.set_left_margin (4)
		salida_notas.set_margin_bottom(6)
		salida_notas.buffer.text = notas
		salida_notas.set_editable(false)
		scrolled_notas.add (salida_notas)
		if notas != ""
			caja_datos.pack_start(sub_caja_notas, false, false, 0)
			caja_datos.pack_start(scrolled_notas, false, false, 0)

		var caja_pie = new Box (Orientation.HORIZONTAL, 0)
		caja_pie.set_hexpand (true)
		content.attach (caja_pie, 0, 2, 1, 1)

		var boton_editar = new Gtk.Button.from_icon_name("gtk-edit", IconSize.LARGE_TOOLBAR)
		boton_editar.set_tooltip_text ("Editar contacto actual")
		boton_editar.clicked.connect(editar_tab)

		var boton_eliminar = new Gtk.Button.from_icon_name("gtk-delete", IconSize.LARGE_TOOLBAR)
		boton_eliminar.set_tooltip_text ("Eliminar contacto actual")
		boton_eliminar.clicked.connect(borrar_tab)

		var boton_primero = new Gtk.Button.from_icon_name("media-skip-backward", IconSize.SMALL_TOOLBAR)
		boton_primero.set_margin_top(6)
		boton_primero.set_tooltip_text ("Ir al inicio")
		boton_primero.clicked.connect(ir_primero)

		var boton_anterior = new Gtk.Button.from_icon_name("go-previous", IconSize.SMALL_TOOLBAR)
		boton_anterior.set_margin_top(6)
		boton_anterior.set_tooltip_text ("Ver anterior")
		boton_anterior.clicked.connect(this.prev_page)

		var item_act = new Label("")
		item_act.set_margin_top(6)
		item_act.set_width_chars(5)
		num_tab: int = this.get_n_pages() + 1
		num_tab_txt: string = num_tab.to_string()
		item_act.set_text(num_tab_txt)

		var boton_siguiente = new Gtk.Button.from_icon_name("go-next", IconSize.SMALL_TOOLBAR)
		boton_siguiente.set_margin_top(6)
		boton_siguiente.set_tooltip_text ("Ver siguiente")
		boton_siguiente.clicked.connect(this.next_page)

		var boton_ultimo = new Gtk.Button.from_icon_name("media-skip-forward", IconSize.SMALL_TOOLBAR)
		boton_ultimo.set_margin_top(6)
		boton_ultimo.set_tooltip_text ("Ir al final")
		boton_ultimo.clicked.connect(ir_ultimo)

		var boton_saltar_menos = new Gtk.Button.from_icon_name("media-seek-backward", IconSize.SMALL_TOOLBAR)
		boton_saltar_menos.set_margin_top(6)
		boton_saltar_menos.set_tooltip_text ("Saltar hacia atrás")
		boton_saltar_menos.clicked.connect(saltar_menos)

		var boton_saltar_mas = new Gtk.Button.from_icon_name("media-seek-forward", IconSize.SMALL_TOOLBAR)
		boton_saltar_mas.set_margin_top(6)
		boton_saltar_mas.set_tooltip_text ("Saltar hacia adelante")
		boton_saltar_mas.clicked.connect(saltar_mas)

		caja_pie.pack_start(boton_editar, false, false, 2)
		caja_pie.pack_start(boton_eliminar, false, false, 4)

		caja_pie.pack_end(boton_ultimo, false, false, 0)
		caja_pie.pack_end(boton_saltar_mas, false, false, 0)
		caja_pie.pack_end(boton_siguiente, false, false, 0)
		caja_pie.pack_end (item_act, false, false, 0)
		caja_pie.pack_end(boton_anterior, false, false, 0)
		caja_pie.pack_end(boton_saltar_menos, false, false, 0)
		caja_pie.pack_end(boton_primero, false, false, 0)

		content.show_all()
		return content

	def create_label (nombre: string): Gtk.Widget
		var label = new Gtk.Label (nombre)
		label.show()
		return label

	def campos_get_replace()
		nombre_nuevo = entrada_nombre.get_text()
		nombre_nuevo = (nombre_nuevo.replace("'", "’").replace("<", "").replace(">", ""))
		apellido_nuevo = entrada_apellido.get_text()
		apellido_nuevo = (apellido_nuevo.replace("'", "").replace("<", "").replace(">", ""))
		apellido2_nuevo = entrada_apellido2.get_text()
		apellido2_nuevo = (apellido2_nuevo.replace("'", "").replace("<", "").replace(">", ""))
		phone_nuevo = entrada_phone.get_text()
		phone_nuevo = (phone_nuevo.replace("'", "").replace("<", "").replace(">", ""))
		phone2_nuevo = entrada_phone2.get_text()
		phone2_nuevo = (phone2_nuevo.replace("'", "").replace("<", "").replace(">", ""))
		phone3_nuevo = entrada_phone3.get_text()
		phone3_nuevo = (phone3_nuevo.replace("'", "").replace("<", "").replace(">", ""))
		mail_nuevo = entrada_mail.get_text()
		mail_nuevo = (mail_nuevo.replace("'", "").replace("<", "").replace(">", ""))
		mail2_nuevo = entrada_mail2.get_text()
		mail2_nuevo = (mail2_nuevo.replace("'", "").replace("<", "").replace(">", ""))
		web_nuevo = entrada_web.get_text()
		web_nuevo = (web_nuevo.replace("'", "").replace("<", "").replace(">", ""))
		grupo_nuevo = entrada_grupo.get_text()
		grupo_nuevo = (grupo_nuevo.replace("'", "").replace("<", "").replace(">", ""))
		dir_nuevo = entrada_dir.buffer.text
		dir_nuevo = dir_nuevo.replace("'", "’")
		notas_nuevo = entrada_notas.buffer.text
		notas_nuevo = notas_nuevo.replace("'", "’")
		avatar_nuevo = entrada_avatar.get_text()

	def contacto_nuevo()
		new Dialogo.datos_nuevos ()

	def ok_nuevo()
		campos_get_replace()
		if entrada_nombre.get_text().length > 0
			introducir: string = (@"INSERT INTO Contactos (
				nombre, apellido, apellido2, phone, phone2, phone3,
				email, email2, web, grupo, dir, notas, avatar)
				VALUES ('$nombre_nuevo', '$apellido_nuevo',
				'$apellido2_nuevo', '$phone_nuevo',
				'$phone2_nuevo', '$phone3_nuevo',
				'$mail_nuevo', '$mail2_nuevo',
				'$web_nuevo', '$grupo_nuevo','$dir_nuevo',
				'$notas_nuevo', '$avatar_nuevo')")
			db.exec (introducir)
			var tab_pos = new_edit()
			refrescar()
			this.set_current_page(tab_pos)
		else
			var noti = new MessageDialog(win_notebook, Gtk.DialogFlags.MODAL,
				Gtk.MessageType.ERROR, Gtk.ButtonsType.CLOSE, "¡Nombre requerido!")
			var res_noti = noti.run()
			if res_noti == Gtk.ResponseType.CLOSE
				noti.destroy()

	def editar_tab()
		id_x: string
		if filtro == false
			pos: int = this.get_current_page()
			id_x = consulta_ID(pos)
		else
			if buscando == "nombre"
				buscado: string = termino_buscado()
				pos: int = this.get_current_page()
				lista_consulta: list of string = rebuscar (buscado)
				id_x = lista_consulta.get(pos)
			else
				pos: int = this.get_current_page()
				lista_consulta_grupo: list of string = rebuscar_grupo (buscando)
				id_x = lista_consulta_grupo.get(pos)

		lista_consulta_bus: list of string = consulta_datos (id_x)
		//id: string = lista_consulta_bus.get(0)
		dialogo = new Dialogo.datos_editar (lista_consulta_bus)

	def ok_editar(id: string)
		campos_get_replace()
		if entrada_nombre.get_text().length > 0
			introducir: string = (@"INSERT INTO Contactos (
				nombre, apellido, apellido2, phone, phone2, phone3,
				email, email2, web, grupo, dir, notas, avatar)
				VALUES ('$nombre_nuevo', '$apellido_nuevo',
				'$apellido2_nuevo', '$phone_nuevo',
				'$phone2_nuevo', '$phone3_nuevo',
				'$mail_nuevo', '$mail2_nuevo',
				'$web_nuevo', '$grupo_nuevo','$dir_nuevo',
				'$notas_nuevo', '$avatar_nuevo')")
			db.exec (introducir)

			borrar: string = (@"DELETE FROM Contactos WHERE ID = '$id'")
			db.exec (borrar)
			this.remove_page(pos)
			this.queue_draw()

			var tab_pos = new_edit()
			refrescar()
			this.set_current_page(tab_pos)
		else
			var noti = new MessageDialog(dialogo, Gtk.DialogFlags.MODAL,
				Gtk.MessageType.ERROR, Gtk.ButtonsType.CLOSE, "¡Nombre requerido!")
			var res_noti = noti.run()
			if res_noti == Gtk.ResponseType.CLOSE
				noti.destroy()

	def resp_eliminar (msg_borrar:Gtk.Dialog, response_id:int)
		id_pos: string
		if response_id == Gtk.ResponseType.OK
			if filtro == false
				pos:int = this.get_current_page()
				id_pos = consulta_ID(pos)
			else
				if buscando == "nombre"
					buscado: string = termino_buscado()
					pos: int = this.get_current_page()
					lista_consulta: list of string = rebuscar (buscado)
					id_pos = lista_consulta.get(pos)
				else
					pos: int = this.get_current_page()
					lista_consulta: list of string = rebuscar_grupo (buscando)
					id_pos = lista_consulta.get(pos)

			borrar: string = (@"DELETE FROM Contactos WHERE ID = '$id_pos'")
			db.exec (borrar)
			this.remove_page(pos)
			this.queue_draw()
			query: string = @"SELECT ID FROM Contactos;"
			stmt: Sqlite.Statement
			db.prepare_v2 (query, query.length, out stmt)
			cols: int = stmt.column_count ()
			var lista_id = new list of string
			while (stmt.step () == Sqlite.ROW)
				for i:int = 0 to (cols-1)
					val_id: string = stmt.column_text(i)
					lista_id.add(val_id)
			if lista_id.size == 0
				bar_status.push (context_id,
					"Todos los contactos han sido eliminados.")
				text_color("rojo")
			else
				bar_status.push (context_id, "Info: Un contacto ha sido eliminado")
				text_color("verde")
				refrescar()
		msg_borrar.destroy()

	def borrar_tab()
		var win_borrar = new Gtk.Window()
		msg_borrar: Gtk.MessageDialog = new Gtk.MessageDialog (
			win_borrar, Gtk.DialogFlags.MODAL, Gtk.MessageType.WARNING,
			Gtk.ButtonsType.OK_CANCEL, "¿Eliminar el contacto actual?")
		msg_borrar.border_width = 10
		msg_borrar.response.connect(resp_eliminar)
		msg_borrar.show_all ()

	def buscar_tab()

		var dialogo_buscar = new Gtk.Dialog.with_buttons ("BUSCAR", win_notebook,
			Gtk.DialogFlags.MODAL | Gtk.DialogFlags.DESTROY_WITH_PARENT)

		dialogo_buscar.title = "Buscar Contacto"
		dialogo_buscar.border_width = 20
		dialogo_buscar.set_default_size (200, 300)

		var content_area = dialogo_buscar.get_content_area ()

		area: Gtk.Grid = new Gtk.Grid()
		area.set_column_spacing(4)
		area.set_row_spacing(10)

		var eti_buscar = new Gtk.Label("Busca por nombre y apellidos:")
		eti_buscar.set_xalign(0)

		entrada_buscar = new Gtk.SearchEntry()
		entrada_buscar.set_tooltip_text ("Buscar contacto")

		var eti_buscar_grupo = new Gtk.Label("Busca por grupo:")
		eti_buscar_grupo.set_xalign(0)

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

		area.attach(eti_buscar, 0, 1, 1, 1)
		area.attach(entrada_buscar, 0, 2, 1, 1)
		area.attach(eti_buscar_grupo, 0, 3, 1, 1)
		area.attach(grupo_combo, 0, 4, 1, 1)

		content_area.add (area)
		dialogo_buscar.add_button ("_Cancel", Gtk.ResponseType.CANCEL)
		dialogo_buscar.add_button ("_OK", Gtk.ResponseType.OK)
		dialogo_buscar.show_all ()

		var respuesta_buscar = dialogo_buscar.run()
		if respuesta_buscar == Gtk.ResponseType.OK
			buscado_grupo: string = grupo_combo.get_active_text()
			buscado: string = entrada_buscar.get_text()
			if buscado_grupo == ""
				db.exec ("CREATE TABLE Buscados (buscar TEXT)")
				intro: string = (@"INSERT INTO Buscados (buscar) VALUES ('$buscado')")
				db.exec (intro)
				lista_consulta: list of string = rebuscar (buscado)
				coinc: int = lista_consulta.size
				if coinc > 0
					borrar_all()
					for id in lista_consulta
						this.nueva_tab(id)
						filtro = true
						buscando = "nombre"
					bar_status.push (context_id,
						@"Mostrando $coinc coincidencias para " + buscado)
					text_color("verde")
				else if coinc == 0
					refrescar()
					bar_status.push (context_id,
						"No se ha encontrado ninguna coincidencia con '" + buscado + "'")
					text_color("rojo")
			else
				lista_consulta_grupo: list of string = rebuscar_grupo (buscado_grupo)
				coinc: int = lista_consulta_grupo.size
				if coinc > 0
					borrar_all()
					for id in lista_consulta_grupo
						this.nueva_tab(id)
						filtro = true
						buscando = buscado_grupo
					bar_status.push (context_id,
						@"Mostrando $coinc contactos del grupo " + buscado_grupo)
					text_color("verde")
				else if coinc == 0
					refrescar()
					bar_status.push (context_id,
						"No se ha encontrado ningún contacto del grupo '" + buscado_grupo + "'")
					text_color("rojo")

		else if respuesta_buscar == Gtk.ResponseType.CANCEL
			dialogo_buscar.destroy()
		dialogo_buscar.destroy()

	def importar ()   // DEF IMPORTAR

		aviso: string = ("Requerida versión vCard >= 3.0.\n\n"
			+ "Esta función se encuentra todavía en fase experimental, por lo "
			+ "que los resultados pueden no ser completamente satisfactorios.\n\n"
			+ "La versión actual importa un número limitado de datos de cada "
			+ "contacto. Para más información, ver Ayuda.")
		var noti_imp = new MessageDialog (win_notebook,
			Gtk.DialogFlags.MODAL, Gtk.MessageType.INFO,
			Gtk.ButtonsType.CLOSE, aviso)
		var resp_imp = noti_imp.run()
		if resp_imp == Gtk.ResponseType.CLOSE
			noti_imp.destroy()

		var dialogo_imp = new FileChooserDialog ("Importa una agenda en formato vcf",
			win_notebook, Gtk.FileChooserAction.OPEN,
			"_Cancelar",Gtk.ResponseType.CANCEL,
			"_Abrir", Gtk.ResponseType.ACCEPT)
		dialogo_imp.select_multiple = false
		dialogo_imp.set_modal(true)

		var filtro_vcard = new Gtk.FileFilter ()
		dialogo_imp.set_filter (filtro_vcard)
		filtro_vcard.add_mime_type ("text/vcard")

		res: int = dialogo_imp.run()

		if res == Gtk.ResponseType.ACCEPT
			var vcf_open = dialogo_imp.get_filename ()
			var vcf_test = File.new_for_path (vcf_open)
			try
				var file_info = vcf_test.query_info (
					"standard::content-type",
					FileQueryInfoFlags.NONE)
				tipo_file = file_info.get_content_type ()
			except e: Error
				msg_error: string = "Error: " + e.message
				var noti = new MessageDialog (win_notebook, Gtk.DialogFlags.MODAL,
					Gtk.MessageType.ERROR, Gtk.ButtonsType.CLOSE, msg_error)
				var res_noti = noti.run()
				if res_noti == Gtk.ResponseType.CLOSE
					noti.destroy()

			if tipo_file != "text/vcard"
				var noti_file = new MessageDialog (win_notebook,
					Gtk.DialogFlags.MODAL, Gtk.MessageType.ERROR,
					Gtk.ButtonsType.CLOSE, "¡Tipo de archivo no reconocido!")
				var resp_file = noti_file.run()
				if resp_file == Gtk.ResponseType.CLOSE
					noti_file.destroy()
			else
				var archivo = FileStream.open(vcf_open,"r")
				num_lin = 0
				var linea = archivo.read_line()
				version_vcard = false
				while linea != null
					if linea.has_prefix ("VERSION") == true
						indice: int = linea.last_index_of(":")
						control_version = linea.slice(indice+1, indice+2)
						if ((control_version != "3") and (control_version != "4"))
							version_vcard = false
							break
						else
							version_vcard = true
					if linea.has_prefix ("BEGIN:VCARD") == true
						num_lin++		// número de contactos
					linea = archivo.read_line()
				if num_lin > 1000
					mensaje: string = ("¡Proceso abortado!\n\n"
						+ "Detectados más de 1.000 contactos para importar.\n"
						+ "Aunque se ha probado con cifras mucho más altas, dependiendo "
						+ "del archivo, esto podría bloquear la aplicación.\n\n"
						+ "Considera dividir el archivo en archivos más pequeños e importar "
						+ "cada uno de ellos a distintas agendas creadas con AgenDie.")
					var noti_file = new MessageDialog (dialogo_imp,
						Gtk.DialogFlags.MODAL, Gtk.MessageType.WARNING,
						Gtk.ButtonsType.CLOSE, mensaje)
					var resp_file = noti_file.run()
					if resp_file == Gtk.ResponseType.CLOSE
						noti_file.destroy()

			if (version_vcard == false)
				var noti_file = new MessageDialog (dialogo_imp,
					Gtk.DialogFlags.MODAL, Gtk.MessageType.ERROR,
					Gtk.ButtonsType.CLOSE, "¡Versión de vCard no compatible o no reconocida!")
				var resp_file = noti_file.run()
				if resp_file == Gtk.ResponseType.CLOSE
					noti_file.destroy()

			if (version_vcard == true) and (num_lin <= 1000)
				txt: string
				len: ulong
				try
					FileUtils.get_contents(vcf_open, out txt, out len)
				except e: Error
					msg_error: string = "Error: " + e.message
					var noti = new MessageDialog (dialogo_imp, Gtk.DialogFlags.MODAL,
						Gtk.MessageType.ERROR, Gtk.ButtonsType.CLOSE, msg_error)
					var res_noti = noti.run()
					if res_noti == Gtk.ResponseType.CLOSE
						noti.destroy()

				var notification = new Notification ("Importando contactos")
				notification.set_body ("Espera, por favor...")
				var app = GLib.Application.get_default ()
				app.send_notification ("msg-imp", notification)

				var i = 0
				vcard = new array of string[num_lin]
				txt = txt.replace("\r\n", "\n").replace("'", "’")
				for contacto in txt.split("END:VCARD")
					vcard[i] = contacto
					i++

				var lista_contactos = new list of Agenda

				for persona in vcard
					var code_image = new list of string
					control_tel: int = 0
					control_mail: int = 0
					contacto = new Agenda()

					var linea_persona = persona.split("\n")
					for line in linea_persona
						if line.has_prefix("FN:") == true or line.has_prefix("FN;")
							indice_fn: int = line.index_of(":")  //line = line.replace("FN:", "")
							fin_fn: int = line.length
							extrae: string = line.slice(indice_fn+1, fin_fn)
							var fn = new list of string
							var n = 0
							for nom in extrae.split(" ")
								fn.add(nom)
								n++
							case n
								when 1
									contacto.nombre = fn.get(0)
									fin: int = contacto.nombre.length
									contacto.nombre = contacto.nombre.slice(0, fin)
								when 2
									contacto.nombre = fn.get(0)
									contacto.apellido1 = fn.get(1)
									fin: int = contacto.apellido1.length
									//contacto.apellido1 = contacto.apellido1.slice(0, fin)
									contacto.apellido1 = contacto.apellido1.substring(0, fin)
								when 3
									contacto.nombre = fn.get(0)
									contacto.apellido1 = fn.get(1)
									contacto.apellido2 = fn.get(2)
									fin: int = contacto.apellido2.length
									contacto.apellido2 = contacto.apellido2.slice(0, fin)
								when 4
									contacto.nombre = fn.get(0) + " " + fn.get(1)
									contacto.apellido1 = fn.get(2)
									contacto.apellido2 = fn.get(3)
									fin: int = contacto.apellido2.length
									contacto.apellido2 = contacto.apellido2.slice(0, fin)
								default
									contacto.nombre = fn.get(0) + " " + fn.get(1)
									contacto.apellido1 = fn.get(2) + " " + fn.get(3)
									contacto.apellido2 = fn.get(4)
									fin: int = contacto.apellido2.length
									contacto.apellido2 = contacto.apellido2.slice(0, fin)

						if line.has_prefix("TEL") == true
							indice: int = line.index_of(":")
							fin: int = line.length
							extrae: string = line.slice(indice+1, fin)
							control_tel++
							if control_tel == 1
								contacto.tel1 = extrae
							else if control_tel == 2
								contacto.tel2 = extrae
							else if control_tel == 3
								contacto.tel3 = extrae

						if line.has_prefix("EMAIL") == true
							indice: int = line.last_index_of(":")
							fin: int = line.length
							extrae: string = line.slice(indice+1, fin)
							control_mail++
							if control_mail == 1
								contacto.email1 = extrae
							if control_mail == 2
								contacto.email2 = extrae

						if ((line.has_prefix("URL") == true or line.contains ("URL;")) and
							line.contains("PHOTO") == false)
							indice: int = line.index_of(":")
							fin: int = line.length
							extrae: string = line.slice(indice+1, fin)
							contacto.web = extrae

						if line.has_prefix("ADR") == true or line.contains ("ADR;")
							indice: int = line.index_of(":")
							fin: int = line.length
							extrae: string = line.slice(indice+1, fin)
							if extrae.has_prefix(";")
								extrae = extrae.splice(0, 1, "")
							if extrae.has_prefix(";")
								extrae = extrae.splice(0, 1, "")
							extrae = extrae.replace(";", " ")
							contacto.dir = extrae

						if line.has_prefix("CATEGORIES") == true
							indice: int = line.index_of(":")
							fin: int = line.length
							extrae: string = line.slice(indice+1, fin)
							contacto.grupo = extrae

						if line.has_prefix("NOTE") == true
							indice:int = line.index_of(":")
							fin: int = line.length
							extrae: string = line.slice(indice+1, fin)
							contacto.notas = extrae

						if line.has_prefix("PHOTO") == true
							indice:int = line.index_of(":")
							fin: int = line.length
							data_photo1: string = line.slice(indice+1, fin)
							code_image.add(data_photo1)
						if line.has_prefix(" ")
							code_image.add(line)

					if persona.contains ("PHOTO")
						image64: string = ""
						for line_code in code_image
							image64 +=line_code
						contacto.photo = image64

					lista_contactos.add(contacto)

				longitud: int = lista_contactos.size - 1
				for var id = 0 to longitud
					var contacto = lista_contactos.get(id)
					nombre_imp: string = contacto.nombre
					if contacto.apellido1 != null
						apellido_imp = contacto.apellido1
					else
						apellido_imp = ""
					if contacto.apellido2 != null
						apellido2_imp = contacto.apellido2
					else
						apellido2_imp = ""
					if contacto.tel1 != null
						phone_imp = contacto.tel1
					else
						phone_imp = ""
					if contacto.tel2 != null
						phone2_imp = contacto.tel2
					else
						phone2_imp = ""
					if contacto.tel3 != null
						phone3_imp = contacto.tel3
					else
						phone3_imp = ""
					if contacto.email1 != null
						mail_imp = contacto.email1
					else
						mail_imp = ""
					if contacto.email2 != null
						mail2_imp = contacto.email2
					else
						mail2_imp = ""
					if contacto.web != null
						web_imp = contacto.web
					else
						web_imp = ""
					if contacto.grupo != null
						grupo_imp = contacto.grupo
					else
						grupo_imp = ""
					if contacto.dir != null
						dir_imp = contacto.dir
					else
						dir_imp = ""
					if contacto.notas != null
						notas_imp = contacto.notas
					else
						notas_imp = ""
					if contacto.photo != null
						avatar_imp = contacto.photo
					else
						avatar_imp = ""

					introducir: string = (@"INSERT INTO Contactos (
						nombre, apellido, apellido2, phone, phone2, phone3,
						email, email2, web, grupo, dir, notas, avatar)
						VALUES ('$nombre_imp', '$apellido_imp',
						'$apellido2_imp', '$phone_imp',
						'$phone2_imp', '$phone3_imp',
						'$mail_imp', '$mail2_imp',
						'$web_imp', '$grupo_imp','$dir_imp',
						'$notas_imp', '$avatar_imp')")
					db.exec (introducir)

				var tab_pos = new_edit()
				refrescar()
				this.set_current_page(tab_pos)

				msg_imp: string = "Se han importado " + num_lin.to_string() + " contactos"
				notification.set_title ("Importación completada")
				notification.set_body (msg_imp)
				app.send_notification ("msg-imp", notification)

		dialogo_imp.destroy()   // END DEF IMPORTAR

	def ir_primero()
		this.set_current_page(0)

	def ir_ultimo()
		this.set_current_page(this.get_n_pages() - 1)

	def saltar_menos()
		this.set_current_page(this.get_current_page() - 4)

	def saltar_mas()
		this.set_current_page(this.get_current_page() + 4)
