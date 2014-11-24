GestureSimplifyJS
=================

Given a list of points (x, y), GestureSimplifyJS removes points but
aims to keep the integrity of the shape of the line.  It does this
by iterating over the list and removing the points that fall under
a given distance and angle threshold.  These thresholds are increased
with each iteration until the stopping criteria is satisfied, that is,
when the list length is less than a given constant.

See demoDriver.html for an implementation example.

This script was used in this project: http://youtu.be/qMcKJ90m-1s
to prevent exponential rendering times.