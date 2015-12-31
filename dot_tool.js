/* 
 *
 * Copyright (c) 2014, Wing Eng
 * All rights reserved.
 */
DotTool = {
    "name" : "dot",
    invoke_key : 'D',
    cursor_style : "crosshair",

    "mouse_click" : function (e) {
	var pt = e.grid_scaled.pt
	global_objects.push(new DotObject(pt))
    }
}

global_tools.dot = DotTool

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
