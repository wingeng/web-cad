/* 
 * Copyright (c) 2014, Wing Eng
 * All rights reserved.
 */
var canvas;
var ctx;

var dot_width = 2;
var dot_height = 2;

var default_color = "black";
var origin_x
var origin_y

var origin_x_last = 0
var origin_y_last = 0

var scale_factor = 1
var scale_last = 1

var mouse_down_x
var mouse_down_y

var main_gear_pts

var msg_obj

var pixels_per_mm = 10

var gears = []
var global_objects = []
var selected_object = null

var dots_per_inch = 96
var current_tool = null

// Number of dots per grid where 96 dots is == 1 inch
// more dots means each grid is a large measure.
//
// 12 = 1/8 inch grid, 6 = 1/16 inch grid
//
var grid_space = 6

function round_to_grid (p) {
    var half = grid_space / 2

    return Math.floor((p + half) / grid_space) * grid_space
}

function reset_ctx () {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // round origin to grid spacing
    origin_x = round_to_grid(origin_x_last)
    origin_y = round_to_grid(origin_y_last)

    ctx.translate(origin_x, origin_y)

    scale_factor = 1 / scale_last
    ctx.scale(scale_last, scale_last)
}

function msg_out () {
    var str = ""

    for (var i in arguments) {
	str = str + " " + String(arguments[i])
    }

    msg_obj.innerText = str
}

function label_out () {
    var label_id = arguments[0]
    var label_obj = document.getElementById(label_id)

    if (label_obj == null)
	return

    var str = ""
    for (var i in arguments) {
	if (i > 0) {
	    str = str + " " + String(arguments[i])
	}
    }

    label_obj.innerText = str
}

function con_out () {
    console.log(arguments)
}

function last (o) {
    if (typeof(o) == "object") {
	return o[o.length - 1]
    } else {
	return undefined
    }
}

function first (o) {
    if (typeof(o) == "object") {
	return o[0]
    } else {
	return undefined
    }
}

/*
 * Give angle and radius return the length of the perimeter
 * of the angle slice. (angle in degrees)
 */
function perimeter (angle, radius) {
    return angle / 360 * (radius * 2 * Math.PI);
}

function Point (x, y) {
    this.x = x
    this.y = y
}

function Rect (x, y, x1, y1) {
    this.x = x
    this.y = y
    this.x1 = x1
    this.y1 = y1
}

function grid_space_pt (x, y, constraint) {
    if (constraint != "no-shift") {
	x -= origin_x
	y -= origin_y
    }

    x *= scale_factor
    y *= scale_factor


    var half = grid_space / 2
    x = Math.floor((x + half) / grid_space) * grid_space
    y = Math.floor((y + half) / grid_space) * grid_space


    return new Point(x, y)
}

function set_origin (x, y) {
    var str = String(x) + ":" + String(y)

    origin_x_last = x
    origin_y_last = y

    reset_ctx()
}

function set_init_origin () {
    var ox = Math.round(2 * canvas.width / 8)
    var oy = Math.round(3 * canvas.height / 10)

    set_origin(ox, oy)
}

function trans_orig (x, y) {
    return new Point(x, y);
}

function line_width (w) {
    var old_width = ctx.lineWidth
    ctx.lineWidth = w
    return old_width;
}

function line (x1, y1, x2, y2, color) {

    if (color == undefined) {
	color = default_color;
    }

    var p1 = trans_orig(x1, y1);
    var p2 = trans_orig(x2, y2);

    
    ctx.beginPath();
    ctx.strokeStyle = color;

    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function draw_grid () {
    var height = canvas.height * scale_factor;
    var width = canvas.width * scale_factor;
    
    var offset_x =  2 * origin_x
    var offset_y =  2 * origin_y

    var grids_per_inch = dots_per_inch / grid_space
    
    function set_line_width (p) {
	gd = (p + grid_space) % dots_per_inch 
	
	if (gd % (dots_per_inch) == 0)
	    lwidth = 1.0
	else if (gd % (dots_per_inch / 2) == 0)
	    lwidth = 0.5
	else if (gd % (dots_per_inch / 4 ) == 0)
	    lwidth = 0.25
	else if (gd % (dots_per_inch / 16)  == 0)
	    lwidth = 0.125
	else
	    lwidth = 0.06

	line_width(lwidth)
    }

    for (var x = - offset_x ; x < width; x += grid_space) {
	line(x, - offset_y , x, height);
	set_line_width(x)
    }

    for (var y = - offset_y; y < height; y += grid_space) {
	line(- offset_x, y, width, y);
	set_line_width(y)
    }

    // draw origin lines
    line_width(0.8)
    line(-offset_x, 0, width, 0, "red")
    line(0, -offset_y, 0, height, "red")
}

function circle (x, y, r) {
    var context = ctx;
    var pt = trans_orig(x, y)

    context.beginPath();
    context.arc(pt.x, pt.y, r, 0, 2 * Math.PI, false);
    context.stroke();
}

function find_y_intercept (pts) {
    var min_pt = pts[0]
    for (i in pts) {
	if (Math.abs(pts[i].y) < min_pt.y)
	    min_pt = pts[i]
    }

    return min_pt;
}

function dot (x, y, color) {
    if (typeof(x) == "object") {
	x = x.x
	y = x.y
    }

    if (color == undefined) {
	color = default_color;
    }

    ctx.fillStyle = color
    ctx.strokeStyle = color
    circle(x, y, 2)
}

function deg2rad (deg) {
    return deg * Math.PI / 180
}

function rad2deg (rad) {
    return rad * 180 / Math.PI
}

function sin (deg) {
    return Math.sin(deg / 180 * Math.PI)
}

function cos (deg) {
    return Math.cos(deg / 180 * Math.PI)
}

function atan(x) {
    if (x == Infinity)
	return 0
    else
	return Math.atan(x) * 180 / Math.PI
}

/*
 * This returns the point on the circle perimeter for
 * circle at origin x, y, radius, and deg
 */
function arc (x, y, radius, deg) {
    var ax = cos(deg) * radius
    var ay = sin(deg) * radius

    return new Point(ax, ay)
}

function involute (radius, deg) {

    var pt = arc(0, 0, radius, deg)

    var s = perimeter(deg, radius)

    
    var ix = pt.x + sin(deg) * s
    var iy = pt.y - cos(deg) * s

    return new Point(ix, iy)
}

function draw_points (pts, color, bp) {
    if (bp == undefined) {
	bp = 1000000000
    }
    if (color == undefined) {
	color = default_color;
    }

    ctx.beginPath();
    ctx.strokeStyle = color;

    ctx.moveTo(pts[0].x, pts[0].y);
    for (i in pts) {
	if (i == bp)
	    break
	ctx.lineTo(pts[i].x, pts[i].y);
    }

    ctx.stroke();
}

function abs_tan (y, x) {
    var deg_offset = 0

    var deg = atan(y / x)

    if (x >= 0 && y >= 0)
	deg_offset = deg
    else if (x < 0 && y >= 0)
	deg_offset = 90 + (90 + deg)
    else if (x < 0 && y < 0)
	deg_offset = 180 + deg
    else
	deg_offset = 270 + (90 + deg)

    return deg_offset
}

SelectTool = {
    "name" : "select",
    "mouse_click" : function (e) {
	for (var i in global_objects) {
	    var obj = global_objects[i]

	    selected_object = null
	    if (obj.hasOwnProperty("pt_in_object")) {
		if (obj.pt_in_object(e.grid_scaled.pt)) {
		    selected_object = obj
		}
	    }
	}
    }
}

LineTool = {
    "name" : "line",
    "current" : [],
    "mouse_click" : function (e) {
	if (selected_object == null || selected_object.name != this.name) {
	    selected_object = new OLine([e.grid_scaled.pt])
	    global_objects.push(selected_object)
	} else {
	    selected_object.pts.push(e.grid_scaled.pt)
	}
    },
    "mouse_move" : function (e) {
	var pt = e.grid_scaled.pt

	if (selected_object == null || selected_object.name != this.name) {
	    return
	}

	draw_all()
	var last_pt = last(selected_object.pts)

	line(pt.x, pt.y, last_pt.x, last_pt.y)
    },
    "close" : function (e) {
	selected_object = null
	draw_all()
    }
    
}

DotTool = {
    "name" : "dot",
    "mouse_click" : function (e) {
	var pt = e.grid_scaled.pt
	global_objects.push(new ODot(pt))
    }
}

OriginTool = {
    "mouse_click" : function (e) {
	set_origin(e.offsetX, e.offsetY)
    }
}

function tool_do_event (event_name, e) {
    if (current_tool && current_tool.hasOwnProperty(event_name)) {
	current_tool[event_name](e)
    }
}

function tool_set (tname) {
    switch (tname) {
    case "dot":
	current_tool = DotTool
	break
    case "origin":
	current_tool = OriginTool
	break
    case "line":
	current_tool = LineTool
	break
    case "select":
	current_tool = SelectTool
	break
    default:
	return
    }

    label_out("tool", tname)
}

function ODot (pt) {
    function DotDraw () {
	dot(pt.x, pt.y, "blue")
    }
    
    this.draw = DotDraw
    this.dot_pt = pt
}

/*
 * Returns the bounding box of pts
 * [min-x, min-y, max-x, max-y]
 */
function bbound (pts) {
    var min_x = pts[0].x
    var min_y = pts[0].y
    var max_x = pts[0].x
    var max_y = pts[0].y

    for (var i in pts) {
	if (pts[i].x < min_x)
	    min_x = pts[i].x
	if (pts[i].y < min_y)
	    min_y = pts[i].y
	if (pts[i].x > max_x)
	    max_x = pts[i].x
	if (pts[i].y > max_y)
	    max_y = pts[i].y
    }

    return new Rect(min_x, min_y, max_x, max_y)
}

function pt_in_rect (pt, rect) {
    return pt.x > rect.x && pt.x < rect.x1 && pt.y > rect.y && pt.y < rect.y1
}

function OLine (pts) {
    this.name = "line"
    this.pts = pts
    line_width(1)
    this.draw = function () {
	var color = "blue"
	if (this == selected_object)
	    color = "red"

	draw_points(this.pts, color)
	var last_pt = last(this.pts)

	ctx.fillStyle = "green"
	ctx.strokeStyle = "green"
	circle(last_pt.x, last_pt.y, 3)
    }

    this.pt_in_object = function (pt) {
	return pt_in_rect(pt, bbound(this.pts))
    }
}

function draw_objects () {
    var gobjs = global_objects
    
    for (var i = gobjs.length - 1; i >= 0; i--) {
	gobjs[i].draw()
    }
}

function draw_all () {
    clear()
    draw_grid()

    draw_objects()
}

function clear () {
    ctx.fillStyle = "white";
    ctx.fillRect (-3000, -3000, 9000, 9000);
}

var mirror_angle = 45


function involute_init() {
    window.addEventListener('keydown', do_key, true)

    canvas = document.getElementById('can');
    ctx = canvas.getContext('2d');

    msg_obj = document.getElementById('msg');

    tool_set("line")
    scale(.5)

    draw_all()

    msg_out("mouse on ", 3, 6)
}

/*
 * Mirrors the pt using the reflection angle 
 */
function mirror_pt (mirror_angle, p) {
    var angle = atan(p.y/ p.x)
    var hypo = p.x / cos(angle)

    var delta_angle = mirror_angle - angle
    var new_angle = mirror_angle + delta_angle

    var new_x = cos(new_angle) * hypo
    var new_y = sin(new_angle) * hypo

    if (sin(angle) == 0) {
	var radius = p.x
	new_x = cos(mirror_angle * 2) * radius
	new_y = sin(mirror_angle * 2) * radius
    }

    
    return new Point(new_x, new_y)
}

function reverse_points (pts) {
    var new_pts = []

    for (var i = pts.length - 1; i >= 0; i--) {
	new_pts.push(pts[i])
    }
    return new_pts
}

function distance_pt (pt) {
    return Math.sqrt(pt.x * pt.x + pt.y * pt.y)
}

function distance (x, y) {
    return Math.sqrt(x * x + y * y)
}

/*
 * We get rounding errors that causes trig functions to go
 * to infinity or NaN. Just truncate numbers to detect that we
 * are close to zero
 */
function close_to_zero (v) {
    return Math.abs(0 - v) < 0.00001
}

/*
 * rotate all pts from origin x, y, by degrees
 */
function rotate_pt (rotate_angle, p) {
    var new_x, new_y

    if (close_to_zero(p.y)) {
	var radius = p.x
	new_x = cos(rotate_angle) * radius
	new_y = sin(rotate_angle) * radius
    } else {
	var angle = atan(p.y / p.x)
	var hypo = p.y / sin(angle)
	var new_angle = rotate_angle + angle

	new_x = cos(new_angle) * hypo
	new_y = sin(new_angle) * hypo
    }

    return new Point(new_x, new_y)
}

function rotate_points (rotate_angle, pts) {
    var new_pts = []
    for (var i in pts) {
	new_pts.push(rotate_pt(rotate_angle, pts[i]))
    }
    return new_pts
}

function move_points (x, y, pts) {
    var new_pts = []
    for (var i in pts) {
	new_pts.push(new Point(pts[i].x + x, pts[i].y + y))
    }
    return new_pts
}

function mirror_points (mirror_angle, pts) {
    var new_pts = []
    for (var i in pts) {
	new_pts.push(mirror_pt(mirror_angle, pts[i]))
    }
    return new_pts
}

var bdown = 0


function scale (x) {
    scale_last = x
    reset_ctx()
}

function do_mdown(e) {
    bdown = e.which

    mouse_down_x = e.offsetX
    mouse_down_y = e.offsetY

    if (e.altKey) {
	set_origin(e.offsetX, e.offsetY)
	draw_all()
    }
}

function do_wheel (e) {
    scale(scale_last + e.wheelDeltaY / 4800)
    draw_all()

    event.preventDefault()
}

function do_mup (e) {
    var pt = grid_space_pt(e.offsetX, e.offsetY)

    e.grid_scaled = { "pt" : pt }

    bdown = 0

    delta_x = e.offsetX - mouse_down_x
    delta_y = e.offsetY - mouse_down_y

    event.preventDefault()
}

function do_mclick(e) {
    var pt = grid_space_pt(e.offsetX, e.offsetY)

    e.grid_scaled = { "pt" : pt }

    tool_do_event("mouse_click", e)

    draw_all()

    event.preventDefault()
}

function do_mmove (e) {
    var pt = grid_space_pt(e.offsetX, e.offsetY)

    e.grid_scaled = { "pt" : pt }
    tool_do_event("mouse_move", e)

    msg_out("x: ", pt.x / dots_per_inch, "y: ", pt.y / dots_per_inch,
	    "scale-factor: ", scale_factor)

    event.preventDefault()
}

function do_key (e) {
    switch (e.keyCode) {
    case 'D'.charCodeAt():
	tool_set("dot")
	break;
    case 'L'.charCodeAt():
	tool_set("line")
	break;
    case 'R'.charCodeAt():
	tool_set("rectangle")
	break;
    case 'G'.charCodeAt():
	tool_set("origin")
	break
    case ' '.charCodeAt():
	tool_set("select")
	break

    case 'C'.charCodeAt():
	global_objects = []
	selected_object = null
	draw_all()
	break
    case 27:
	// escape key
	tool_do_event("close")
	break
    default:
	label_out("msg", e.keyCode)
	break;
    }
}

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
