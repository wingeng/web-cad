
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

function clone_points (pts) {
    var new_pts = []

    for (var i in pts) {
	new_pts.push(new Point(pts[i].x, pts[i].y))
    }
    return new_pts
}
	
function LineObject (pts) {
    this.__proto__ = BaseObject
    this.name = "line"
    this.pts = pts

    this.clone = function () {
	var pts = clone_points(this.pts)
	var obj = new LineObject(pts)
	return obj
    }

    this.draw = function () {
	var color = "blue"
	var selected = this == selected_object
	
	if (selected) {
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

	// draw control points
	if (selected) {
	    for (var i in this.pts) {
		bbox = dot_bound_box(this.pts[i])
		draw_points(bbox, CONTROL_POINT_COLOR)
	    }
	}
    }

    this.pt_in_object = function (pt, margin) {
	return pt_in_rect(pt, bbound(this.pts, margin))
    }

    this.move = function (x, y) {
	this.pts = move_points(x, y, this.pts)
    }

    this.pt_in_control_pt = function (pt, margin) {
	return point_in_point_list(this.pts, pt)
    }

}

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
