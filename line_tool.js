LineTool = {
    name : "line",
    current : [],

    mouse_click : function (e) {
	if (selected_object == null || selected_object.name != this.name) {
	    selected_object = new LineObject([e.grid_scaled.pt])
	    global_objects.push(selected_object)
	} else {
	    selected_object.pts.push(e.grid_scaled.pt)
	}
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
	return RET_NEED_REDRAW
    }
    
}

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
