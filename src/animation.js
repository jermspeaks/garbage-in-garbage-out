import { interpolateString } from "d3";

function lineTransition(path) {
  path.transition()
      //NOTE: Change this number (in ms) to make lines draw faster or slower
      .duration(5500)
      .attrTween("stroke-dasharray", tweenDash)
      .each("end", function(d,i) { 
          ////Uncomment following line to re-transition
          //d3.select(this).call(transition); 
          
          //We might want to do stuff when the line reaches the target,
          //  like start the pulsating or add a new point or tell the
          //  NSA to listen to this guy's phone calls
          //doStuffWhenLineFinishes(d,i);
      });
}

var tweenDash = function tweenDash() {
    //This function is used to animate the dash-array property, which is a
    //  nice hack that gives us animation along some arbitrary path (in this
    //  case, makes it look like a line is being drawn from point A to B)
    var len = this.getTotalLength(),
        interpolate = interpolateString("0," + len, len + "," + len);

    return function(t) { return interpolate(t); };
};