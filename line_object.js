
function line_bound_box (pts) {
    var bbox
    var r = bbound(pts)

    bbox = [ new Point(r.x, r.y),
	     new Point(r.x1, r.y),
	     new Point(r.x1, r.y1),
	     new Point(r.x, r.y1),
	     new Point(r.x, r.y) ]

    return bbox
}

function LineObject (pts) {
    this.name = "line"
    this.pts = pts

    this.draw = function () {
	var color = "blue"
	if (this == selected_object) {
	    color = "red"
	    line_width(SELECT_LINE_WIDTH)
	    draw_points(line_bound_box(this.pts), SELECT_COLOR)
	}

	line_width(2)
	draw_points(this.pts, color)
	var last_pt = last(this.pts)

	dot(last_pt.x, last_pt.y, {
	    color : "green", "radius" : 2 * scale_factor
	})
    }

    this.pt_in_object = function (pt) {
	return pt_in_rect(pt, bbound(this.pts))
    }

    this.move = function (x, y) {
	this.pts = move_points(x, y, this.pts)
    }
}

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
