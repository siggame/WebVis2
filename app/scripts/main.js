(function() {
    var subsLeft = WebVis.onloadActionList.length;

    var fillHeight = function() {
        $('.fill-height').each(function(index, elem){
            var $elem = $(elem);
            var offset = 0;
            var children = $elem.parent().children().not($elem);
            children.each(function(i, otherelem) {
                var $otherelem = $(otherelem);
                offset += $otherelem.outerHeight();
            });

            console.log($elem.parent().outerHeight() + " " + offset);
            $elem.outerHeight($elem.parent().height() - offset);
        });
    };

    var fillWidth = function() {
        $('.fill-width').each(function(index, elem){
            var $elem = $(elem);
            var offset = 0;
            var children = $elem.parent().children().not($elem);
            children.each(function(i, otherelem) {
                var $otherelem = $(otherelem);
                offset += $otherelem.outerWidth();
            });

            offset += parseInt($elem.css('margin-right'));
            offset += parseInt($elem.css('padding-right'));

            console.log($elem.parent().outerWidth() + " " + offset);
            $elem.outerWidth($elem.parent().width() - offset);
        });
    };

    $(window).resize(fillWidth);
    $(window).resize(fillHeight);

    for(var i = 0; i < WebVis.onloadActionList.length; i++) {
        var name = WebVis.onloadActionList[i];
        var xhr = new XMLHttpRequest();
        var file = $('#' + name).children(':first').text();
        xhr.open('GET', file, true);
        xhr.responseType = 'document';
        xhr.onload = function(e) {
            var doc = e.target.response;
            $('#' + name).empty();
            $('#' + name).append($(e.target.response.body.innerHTML));
            $('#' + name).css("display", "block")

            subsLeft--;
            if(subsLeft === 0) {
                fillWidth();
                fillHeight();
            }
        };
        xhr.send();
    }

}).call(this);