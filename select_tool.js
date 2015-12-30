
/*
 * Returns array of objects that contain pt
 *         NULL if no objects bound pt
 */
function point_in_object_list (objs, pt) {
    var found_objs = []
    var obj = objs

    for (var i in objs) {
	var o = objs[i]
	if (o.hasOwnProperty("pt_in_object")) {
	    if (o.pt_in_object(pt)) {
		found_objs.push(o)
	    }
	}
    }

    if (found_objs.length > 0)
	return found_objs
    else
	return null
}

function select_delete_object (obj_list, obj) {
    if (obj == null) return

    for (var i in obj_list) {
	if (obj == obj_list[i]) {
	    obj_list.splice(i, 1)
	    return
	}
    }
}

SelectTool = {
    "name" : "select",

    mouse_down : function (e) {
	selected_object = null

	var objs = point_in_object_list(global_objects, e.grid_scaled.pt)
	
	if (objs) {
	    selected_object = first(objs)
	}
    },

    mouse_click : function (e) {
    },

    // On mouse up we need to move/jiggle the object to the nearest
    // grid coordiates, this could be a global setting in case
    // we need non-grid coordainates
    need_jiggle_select_object_to_grid : false,

    mouse_move : function (e) {
	if (selected_object == null)
	    return

	delta_x = e.offsetX - mouse_down_x
	delta_y = e.offsetY - mouse_down_y
	if (e.which == 1 && selected_object.hasOwnProperty("move")) {
	    selected_object.move(delta_x * scale_factor,
				 delta_y * scale_factor)
	    
	    mouse_down_x = e.offsetX
	    mouse_down_y = e.offsetY

	    this.need_jiggle_select_object_to_grid = true
	    return RET_NEED_REDRAW
	}
    },

    mouse_up : function (e) {
	if (selected_object && this.need_jiggle_select_object_to_grid) {
	    selected_object.pts = grid_round_points(selected_object.pts)

	    return RET_NEED_REDRAW
	}
    },


    key_delete : function (e) {
	select_delete_object(global_objects, selected_object)
	selected_object = null

	return RET_NEED_REDRAW
    }
    
}
/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
