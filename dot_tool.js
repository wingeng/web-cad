DotTool = {
    "name" : "dot",
    "mouse_click" : function (e) {
	var pt = e.grid_scaled.pt
	global_objects.push(new DotObject(pt))
    }
}

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
