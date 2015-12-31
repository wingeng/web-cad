/* 
 *
 * Copyright (c) 2014, Wing Eng
 * All rights reserved.
 */

BaseObject = {
    clone : function () {
	con_out("base clone", this)
    },

    pt_in_object : function (pt) {
	return pt_in_rect(pt, bbound(this.pts))
    },

    move : function () {
	con_out("base move, not implemented", this)
    },

    pt_in_control_pt : function () {
	con_out("base pt_in_control_pt, not implemented", this)
    }
}

/*
 * Local Variables: 
 * mode: javascript
 * End:
 */

