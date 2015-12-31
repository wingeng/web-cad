function ArcObject (pts) {
    this.__proto__ = BaseObject
    this.name = "arc"

    this.control_pts = pts

    this.clone = function () {
	var cpts = clone_points(this.control_pts)
	var pts = clone_points(this.pts)

	var obj = new ArcObject(cpts)
	obj.pts = pts

	return obj
    }

    this.draw = function () {
	var color = "blue"
	var selected = this == selected_object

	if (selected) {
	    color = "red"
	    line_width(SELECT_LINE_WIDTH)

	    for (var i in this.control_pts) {
		bbox = dot_bound_box(this.control_pts[i])
		draw_points(bbox, CONTROL_POINT_COLOR)
	    }
	}
	
	draw_points(this.control_pts, "gray")

	if (this.control_pts.length == 3) {
	    ctx.strokeStyle = color
	    ctx.beginPath()
	    ctx.moveTo(this.control_pts[0].x, this.control_pts[0].y)
	    ctx.quadraticCurveTo(this.control_pts[1].x, this.control_pts[1].y,
				 this.control_pts[2].x, this.control_pts[2].y)
	    ctx.stroke()
	}
    }

    this.pt_in_object = function (pt, margin) {
	return pt_in_rect(pt, bbound(this.control_pts, margin))
    }

    this.move = function (x, y) {
	this.control_pts = move_points(x, y, this.control_pts)
    }

    this.pt_in_control_pt = function (pt, margin) {
	return point_in_point_list(this.control_pts, pt)
    }
}
	
/*
 * Local Variables: 
 * mode: javascript
 * End:
 */
