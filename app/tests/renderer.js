// Point constructor (default)
(function() {
    var point = new WebVis.renderer.Point();

    var error = "Renderer: Point constructor";
    assert(point.x === 0, error);
    assert(point.y === 0, error);
    assert(point.z === 0, error);
    assert(point.w === 1, error);
})();

(function() {
    var point = new WebVis.renderer.Point(3, 3, 3);

    var error = "Renderer: Point constructor";
    assert(point.x === 3, error);
    assert(point.y === 3, error);
    assert(point.z === 3, error);
    assert(point.w === 1, error);
})();

(function () {
    var mat = new WebVis.renderer.Matrix4x4();

    var error = "Renderer: Matrix4x4 constructor"
    for(var row = 0; row < 4; row++) {
        for(var col = 0; col < 4; col++) {
            if(row == col) {
                assert(mat.get(row, col) === 1, function() {
                    console.error(error);
                    console.error("expected 1, got " + mat.get(row, col));
                    console.error("row = " + row + ", col = " + col);
                });
            } else {
                assert(mat.get(row, col) === 0, function() {
                    console.error(error);
                    console.error("expected 0, got " + mat.get(row, col));
                    console.error("row = " + row + ", col = " + col);
                });
            }
        }
    }

})();
