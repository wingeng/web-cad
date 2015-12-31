ArcTool = {
    name : "arc",
    invoke_key : 'A',
    cursor_style : "crosshair",
    
    mouse_click : function (e) {
	if (selected_object == null || selected_object.name != this.name ||
	    selected_object.control_pts.length >= 3) {

	    selected_object = new ArcObject([e.grid_scaled.pt])
	    global_objects.push(selected_object)
	} else {
	    selected_object.control_pts.push(e.grid_scaled.pt)
	}
    },
}

global_tools.arc = ArcTool
/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
