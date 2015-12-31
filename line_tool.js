
LineTool = {
    name : "line",
    invoke_key : 'L',
    cursor_style : "crosshair",

    mouse_click : function (e) {
	if (selected_object == null || selected_object.name != this.name) {
	    selected_object = new LineObject([e.grid_scaled.pt])
	    global_objects.push(selected_object)
	} else {
	    selected_object.pts.push(e.grid_scaled.pt)
	}
    },

    mouse_dbl_click : function (e) {
	con_out("dblmclick")
	con_out(selected_object)

	if (selected_object)
	    return

	con_out("in double")
    },

    mouse_move : function (e) {
	var pt = e.grid_scaled.pt

	if (selected_object == null || selected_object.name != this.name) {
	    return
	}

	draw_all()
	var last_pt = last(selected_object.pts)

	line(pt.x, pt.y, last_pt.x, last_pt.y)
    },

    close : function (e) {
	selected_object = null
	con_out("closed: ", selected_object)
	return RET_NEED_REDRAW
    }
}

global_tools.line = LineTool

/*
 * Returns point which bounds pt given a bounding 
 * box around a point in the pt_list
 */
function point_in_point_list (pt_list, pt) {
    for (var i in pt_list) {
	var p = pt_list[i]

	var bbox = bbound(dot_bound_box(p, CONTROL_MARGIN * scale_factor))
	if (pt_in_rect(pt, bbox)) {
	    return p
	}
    }
}



/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
