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

function reset_ctx () {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // round origin to grid spacing of 10
    origin_x = origin_x_last - (origin_x_last % 10)
    origin_y = origin_y_last - (origin_y_last % 10)

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

function last (o) {
    if (typeof(o) == "object") {
	return o[o.length - 1]
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

function Gear (origin, radius, n_teeth, addendum, teeth_percent) {
    this.origin = origin
    this.radius = radius
    this.n_teeth = n_teeth
    this.addendum = addendum
    this.g_descendant = addendum * .4

    this.teeth_percent = teeth_percent
    this.tooth_angle = 360 / this.n_teeth
    this.g_color = "red"
    this.g_rotation = 0
    this.g_initial_rotation = 0
    
    // The diametrial_pitch must be the same for all meshed gears.
    // Diametrial Pitch can be seen as the number of teeth per inch.  Given
    // one gear, we can derive the radius for all other gears of a given
    // number of teeth.
    this.diametrial_pitch = n_teeth / (radius * 2 * Math.PI)

    this.tooth_pitch = perimeter(this.tooth_angle * (1 - teeth_percent), 
				 radius)

    this.g_points = make_gear_path(this)

    this.move = function (x, y) {
	this.origin.x = x
	this.origin.y = y
    }
    
    this.draw  = function () {
	var x = this.origin.x
	var y = this.origin.y
	var deg = this.g_rotation

	var pts = rotate_points(deg, this.g_points)
	pts = move_points(x, y, pts)
	draw_points(pts, this.g_color)

	dot(x, y, "green")

	var tooth_zero_pt =  arc(x, y, this.radius + this.addendum,
				 this.g_rotation +
				 (360 / this.n_teeth / 3.0))
	tp = move_points(x, y, [tooth_zero_pt])
	tooth_zero_pt = tp[0]
	dot(tooth_zero_pt.x, tooth_zero_pt.y, "black")
	line(x, y, tooth_zero_pt.x, tooth_zero_pt.y, "gray")
    }
}

function Point(x, y) {
    this.x = x
    this.y = y
}

function set_origin (x, y) {
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
    //    return new Point(x + origin_x, y + origin_y);
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
    
    var offset_x = origin_x * scale_factor
    var offset_y = origin_y * scale_factor

    line_width(0.1)
    for (var x = -1 * offset_x ; x < width; x += 10) {
	line(x, - offset_y , x, height);
    }
    for (var y = -1 * offset_y; y < height; y += 10) {
	line(-offset_x, y, width, y);
    }

    // draw origin lines
    line_width(0.2)
    line(-offset_x, 0, width, 0)
    line(0, -offset_y, 0, height)
}

function circle(x, y, r) {
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

function p(o) {
    console.log(o)
}

/* Set to true to see temporary steps */
var debug_path = false

function make_gear_path (gear) {
    var addendum = gear.addendum
    var radius = gear.radius
    var teeth_pcnt = gear.teeth_percent

    if (debug_path) {
	line_width(0.1)
	circle(gear.origin.x, gear.origin.y,
	       radius + addendum, "blue")

	circle(gear.origin.x, gear.origin.y,
	       radius, "blue")

	circle(gear.origin.x, gear.origin.y, radius - gear.g_descendant, "red")
    }

    var angle = gear.tooth_angle
    var theta
    var ipts = []

    ipts.push(new Point(radius - gear.g_descendant, 0))
	      
    /*
     * Figure out the angle where the involute curve crosses
     * the addendum circle.
     */
    for (var i = 0; i <  360; i += 1) {
	var p = involute(radius, i)

	theta = atan(p.y / p.x)
	
	var a = arc(0, 0, radius + addendum, theta)

	if (distance_pt(p) < distance_pt(a)) {
	    ipts.push(p)
	} else {
	    /*
	     * this is the angle swept by the addendum
	     */
	    var tooth_spur_angle =
		(gear.tooth_angle * (1 - gear.teeth_percent)) - (2 * theta)

	    break;
	}
    }

    var tooth_angle = angle * teeth_pcnt / 2;
    var corner_pt = last(ipts)
    for (var i = theta; i < tooth_angle; i += 2) {
	var a = arc(0, 0, radius + addendum, i)

	if (corner_pt == undefined)
	    corner_pt = a
	ipts.push(a)
    }

    var l_pt = mirror_points(tooth_angle, [corner_pt])[0]

    /*
     * angle of addendum perimeter
     */
    gear.addendum_angle = atan(l_pt.y / l_pt.x) - atan(corner_pt.y / corner_pt.x)
    gear.addendum_pitch = perimeter(gear.radius + gear.addendum,
				    gear.addendum_angle)

    // make one tooth
    var ri_pts = mirror_points(tooth_angle, ipts)


    var one_tooth = ipts.concat(reverse_points(ri_pts))


    for (i = angle * (1 - teeth_pcnt / 2); i < angle; i++) {
	var a = arc(0, 0, radius - gear.g_descendant, i)
	one_tooth.push(a)
    }

    var c_angle = angle
    var nxt_tooth = one_tooth.concat([])
    var gear_teeth = one_tooth.concat([])

    for (var i = 0; i < gear.n_teeth - 1; i++) {
	var nxt_tooth = rotate_points(c_angle, one_tooth)
	gear_teeth = gear_teeth.concat(nxt_tooth)

	c_angle = c_angle + angle
    }

    gear_teeth.push(gear_teeth[0])

    if (debug_path) {
	line_width(1)
	draw_points(gear_teeth, "black")

	for (i = 0; i < 361; i += gear.tooth_angle) {
	    var pt = arc(0, 0, gear.radius, i)
	    line_width(0.2)
	    line(0, 0, pt.x, pt.y)
	}

    }

    return gear_teeth;
}

function tt () {
    var pts = draw_all()

    clear()

    // teeth = 16
    // 
    var n_teeth = 16
    var d = 360 / n_teeth
    draw_points(pts);

    // reflect around axis
    var half_angle = d / 2
    
    for (i = pts.length - 1; i >= 0; i--) {
	var p = pts[i]

	var d_angle = atan(p.y / p.x)
	var np = new Point()
	
    }
}

function abs_tan(y, x) {
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

function draw_all () {
    draw_grid()

    line_width(1)

    for (i in gears) {
	gears[i].draw()
    }

    dot(0, 0, "blue")
}

function clear () {
    ctx.fillStyle = "white";
    ctx.fillRect (-3000, -3000, 9000, 9000);
}

function geo_init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext('2d');

    set_init_origin()


    draw_all()
}

var mirror_angle = 45


function make_initial_gears () {
    var g1_radius = 450
    var g1_add = 80
    var padding = 10
    var tooth_percent = .70
    
    var gear = new Gear(new Point(g1_radius + 9 * padding,
				  g1_radius + 9 * padding),
			g1_radius, /* radius */
			18, /* teeth */
			g1_add, /* addendum */
			tooth_percent /* Percent tooth width */
		       )

    gear.g_rotation = 2
    gear.g_initial_rotation = gear.g_rotation
    gears.push(gear)
    
    var second_n_teeth = 9
    var second_radius  = (second_n_teeth / gear.diametrial_pitch) / (2 * Math.PI)

    var g2_slop = 110
    var gear = new Gear(new Point((g1_radius * 2) + (g1_add) +
				  second_radius + g2_slop,  
				  g1_radius + padding), 
			   second_radius, /* radius */
			   8, /* teeth */
			   g1_add, /* addendum */
			   tooth_percent /* Percent tooth width */
			  )

    gear.g_rotation = -238
    gear.g_initial_rotation = gear.g_rotation
    
    gears.push(gear)
}

function gcode_init() {
    window.addEventListener('keydown', do_key, true)

    canvas = document.getElementById('can');
    ctx = canvas.getContext('2d');

    msg_obj = document.getElementById('msg');

    scale(.4)

    make_initial_gears()
    draw_all()

    msg_out("mouse on ", 3, 6)
}

function do_me() {
    alert("hey ho");
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

	clear()
	draw_all()
    }
}
function do_mup(e) {
    bdown = 0

    delta_x = e.offsetX - mouse_down_x
    delta_y = e.offsetY - mouse_down_y

    set_origin(origin_x_last + delta_x, origin_y_last + delta_y)
    clear()
    draw_all()
}


function do_mclick(e) {
    var p = new Point((e.offsetX - origin_x),
		      (e.offsetY - origin_y))

    circle(p.x, p.y, 5)

    pt = mirror_pt(mirror_angle, p)
    
    circle(pt.x, pt.y, 5, "blue")
}

function do_mmove (e) {
    msg_out("mouse at", e.offsetX, e.offsetY)
    
    if (bdown == 1) {
	delta_x = e.offsetX - mouse_down_x
	delta_y = e.offsetY - mouse_down_y
	mouse_down_x = e.offsetX
	mouse_down_y = e.offsetY
	set_origin(origin_x_last + delta_x, origin_y_last + delta_y)
	clear()
	draw_all()

    }
}

function do_wheel (e) {
    scale(scale_last + e.wheelDeltaY / 4800)
    clear()
    draw_all()

    event.preventDefault()
}

function do_rotate_gears (i, increment) {
    if (increment == undefined) {
	increment = 1
    }

    clear()

    gears[i].g_rotation += increment
    console.log("gear : ", i, " rotate: ", gears[i].g_rotation)
    draw_all()
}

function do_move_gears (i, increment) {
    if (increment == undefined) {
	increment = 1
    }

    clear()

    gears[i].origin.x += increment

    draw_all()
}

function do_key (e) {
    switch (e.keyCode) {
    case 'G'.charCodeAt():
	to_gcode()
	break
    case 'R'.charCodeAt():
	do_rotate_gears(0, 1)
	break

    case 'T'.charCodeAt():
	do_rotate_gears(0, -1)
	break

    case 'I'.charCodeAt():
	do_rotate_gears(1, 1)
	break;
    case 'O'.charCodeAt():
	do_rotate_gears(1, -1)
	break;

    case 'K'.charCodeAt():
	do_move_gears(1, 1);
	break

    case 'J'.charCodeAt():
	do_move_gears(1, -1);
	break

    case ' '.charCodeAt():
	var ratio = gears[0].n_teeth / gears[1].n_teeth
	do_rotate_gears(0, 1)
	do_rotate_gears(1, -ratio)
	break


    default:
	break;
    }
}

function inches (x) {
    x = x / pixels_per_inch
    return x.toFixed(4)
}

function mm (x) {
    x = x / pixels_per_mm
    return x.toFixed(4)
}

function to_gcode () {
    var p = gears[0].g_points
    var pass_thickness = 14
    var cut_thickness = 14.1
    var str = ""

    str += "G21 (mm)\n"
    str += "G90 (Abs programming)\n"
    str += "\n"
    str += "G00 Z5.0 \n"

    str += "\n"

    // Punch hole for center
    str += "G01 X0 Y0 \n"
    str += "G01 Z" + (-cut_thickness).toFixed(2) + " \n"

    // Lift above
    str += "G00 Z5 (Lift above)\n"

    // Cut the shape per pass
    for (var depth = pass_thickness; depth < cut_thickness; depth += pass_thickness) {
	var depth_str = (- depth).toFixed(2)
	str += "\n"
	str += "(--------- pass for depth " + depth_str + "----------)\n" 
	str += "G01 X" + mm(p[0].x) + " Y" + mm(p[0].y) + "\n"

	str += "G01 Z" + depth_str + " \n"
	
	for (i = 0; i < p.length - 1; i++) {
	    str += "G01 X" + mm(p[i].x) + " Y" + mm(p[i].y) + "\n"
	}
    }

    str += "\n\n"
    str += "G00 Z5 (Lift above) \n"

    str += "G00 X0 Y0 \n"
    
    var gcode = document.getElementById('gcode');
    gcode.innerText = str
}

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
