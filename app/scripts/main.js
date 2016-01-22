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
                if(!$otherelem.hasClass('ret')) {
                    offset += $otherelem.outerWidth();
                }
            });

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
                var $turnslider = $('#turn-slider');
                $turnslider.slider();
                $turnslider.slider('setLeft', 0);
                $turnslider.slider('setRight', 10);
            }
        };
        xhr.send();
    }

}).call(this);