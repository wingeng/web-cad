
function dot_bound_box (pt) {
    var bbox = []
    var dot_margin = 10 * scale_factor
    con_out(dot_margin)
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

    this.pt_in_object = function (pt) {
	var r = pt_in_rect(pt, bbound(dot_bound_box(this.pts[0])))
	con_out("p in do: ", r, pt, dot_bound_box(this.pts[0]))
	return pt_in_rect(pt, bbound(dot_bound_box(this.pts[0])))
    }
}

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
