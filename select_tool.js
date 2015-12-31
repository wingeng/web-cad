/* 
 *
 * Copyright (c) 2014, Wing Eng
 * All rights reserved.
 */

/*
 * Returns array of objects that contain pt
 *         NULL if no objects bound pt
 */
function point_in_object_list (objs, pt, margin) {
    var found_objs = []
    var obj = objs

    for (var i in objs) {
	var o = objs[i]
	if (o.pt_in_object(pt, margin)) {
	    found_objs.push(o)
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
    invoke_key : ' ',
    cursor_style : "initial",
    selected_control_pt : null,

    mouse_down : function (e) {
	selected_object = null
	this.selected_control_pt = null

	var objs = point_in_object_list(global_objects, e.grid_scaled.pt,
				       CONTROL_MARGIN * scale_factor)
	selected_object = last(objs)
	if (! selected_object) return

	var so = selected_object
	if (e.altKey) {
	    var obj = so.clone()
	    if (obj) {
		global_objects.push(obj)
		selected_object = obj
	    }
	}

	this.selected_control_pt = so.pt_in_control_pt(e.grid_scaled.pt,
						       CONTROL_MARGIN)
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

	var cpt = this.selected_control_pt
	if (cpt) {
	    this.pvt.move_control_pt(cpt, delta_x * scale_factor,
				     delta_y * scale_factor)
	    mouse_down_x = e.offsetX
	    mouse_down_y = e.offsetY

	    this.need_jiggle_select_object_to_grid = true

	    return RET_NEED_REDRAW
	}


	if (e.which == 1 && "move" in selected_object) {
	    selected_object.move(delta_x * scale_factor,
				 delta_y * scale_factor)
	    
	    mouse_down_x = e.offsetX
	    mouse_down_y = e.offsetY

	    this.need_jiggle_select_object_to_grid = true
	    return RET_NEED_REDRAW
	}
    },

    mouse_up : function (e) {
	this.selected_control_pt = null

	if (selected_object && this.need_jiggle_select_object_to_grid) {
	    selected_object.pts = grid_round_points(selected_object.pts)

	    return RET_NEED_REDRAW
	}
    },


    key_delete : function (e) {
	select_delete_object(global_objects, selected_object)
	selected_object = null

	return RET_NEED_REDRAW
    },

    /*
     * Hide functions private to select_tool
     */
    pvt : {
	move_control_pt : function (pt, x, y) {
	    pt.x += x
	    pt.y += y
	}
    }

}

global_tools.select = SelectTool

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
