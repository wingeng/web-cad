
function dot_bound_box (pt, margin) {
    var bbox = []
    var dot_margin
    
    if (! margin)
	margin = 10

    dot_margin = margin * scale_factor

    bbox = [ new Point(pt.x - dot_margin, pt.y - dot_margin),
	     new Point(pt.x + dot_margin, pt.y - dot_margin),
	     new Point(pt.x + dot_margin, pt.y + dot_margin),
	     new Point(pt.x - dot_margin, pt.y + dot_margin),
	     new Point(pt.x - dot_margin, pt.y - dot_margin)
	   ]

    return bbox
}

function DotObject (pt) {
    this.pts = [pt]

    this.__proto__ = BaseObject

    this.draw = function () {
	var pts = this.pts
	var color = "blue"

	if (this == selected_object)
	    color = "red"

	dot(pts[0].x, pts[0].y, { color : color })

	var bbox = dot_bound_box(this.pts[0])

	if (this == selected_object) {
	    line_width(SELECT_LINE_WIDTH)
	    draw_points(bbox, SELECT_COLOR)
	}
    }

    this.move = function (x, y) {
	this.pts = move_points(x, y, this.pts)
    }

    this.pt_in_object = function (pt, margin) {
	var r = pt_in_rect(pt, bbound(this.pts, margin))
	return r
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
