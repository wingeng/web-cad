/* 
 *
 * Copyright (c) 2014, Wing Eng
 * All rights reserved.
 */
/*
 * Global values that are initialized before all other scripts
 */
var canvas;
var ctx;

var SELECT_COLOR = "gray"
var SELECT_LINE_WIDTH = 2

var dot_width = 2;
var dot_height = 2;

var default_color = "black";
var origin_x
var origin_y

var origin_x_last = 0
var origin_y_last = 0

var scale_factor = 1
var scale_last = 1

// max, min of scaling via the scroll wheel
var scale_max = 5
var scale_min = 0.9

var mouse_down_x
var mouse_down_y

var main_gear_pts

var msg_obj

var pixels_per_mm = 10

var gears = []
var global_objects = []
var selected_object = null

var dots_per_inch = 96
var dots_per_mm = 96 / 25.4

var current_tool = null

// Number of dots per grid where 96 dots is == 1 inch
// more dots means each grid is a large measure.
//
// 12 = 1/8 inch grid, 6 = 1/16 inch grid
//
var grid_space = 6

// global return code to say tool wants to 
// redraw the canvas due to some change in global
// object list
RET_NEED_REDRAW = { need_redraw : true }

// color for control point outline
CONTROL_POINT_COLOR = "gray"

// control point margins, set to 1/8 of inch
CONTROL_MARGIN = dots_per_inch / 8



// mapping of tool name to object, like this
// { dot : DotTool, line : LineTool }
// tools append themselves to this object when they
// are included
var global_tools = {}

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
