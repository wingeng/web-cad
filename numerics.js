/* 
 *
 * Copyright (c) 2014, Wing Eng
 * All rights reserved.
 */

numerics_sin_table = []
numerics_cos_table = []

function deg_to_rad (x) {
    return x / 180 * Math.PI
}

function numerics_init () {
    for (var i = 0; i < 360; i++) {
	var rad = deg_to_rad(i)

	numerics_cos_table[i] = Math.sin(rad)
	numerics_sin_table[i] = Math.cos(rad)
    }
}

function draw_sin (sin) {
    last_x = 0
    last_y = 0

    if (sin)
	table = numerics_sin_table
    else
	table = numerics_cos_table

    line_width(3)

    for (var i = 1; i < 360; i++) {

	var angle = Math.floor(i) % 360

	var x = i
	var y = dots_per_inch * table[angle] + 200

	x *= 360 / dots_per_inch / 4
	y *= scale_factor

	line(last_x, last_y, x, y)
	last_x = x
	last_y = y
    }
}

function from_inch (n) {
    return n * dots_per_inch
}

function from_mm (n) {
    return n * dots_per_mm
}

function pline (x, y, x1, y1) {
    x *= dots_per_inch
    y *= dots_per_inch
    x1 *= dots_per_inch
    y1 *= dots_per_inch

    line(x, y, x1, y1)
}
/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
