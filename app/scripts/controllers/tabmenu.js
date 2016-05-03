// The contents of this file are responsible for creating and managing the
// tabs on the left-hand side of the screen for the webvis. To create new tabs
// you will need to edit the menu.html file to add a new tab and this file
// will automatically create a bind point.

WebVis.ready(function() {

    var tabmenu = $("#tab-bind-point");
    var tabList = $("#tabs");
    var pages = {};

    // Tabs logic
    var selectPage = function() {
        var name = $(this).text();
        tabList.children().each(function(index, elem) {
            var $elem = $(elem);
            if($elem.children(':first').text() == name) {
                $elem.addClass('active');
            } else {
                $elem.removeClass('active');
            }
        })
        if(pages[name] !== undefined) {
            tabmenu.empty();
            tabmenu.append(pages[name]);
        }
    }

    tabList.children().each(function(index, elem) {
        var $elem = $(elem).children(':first');
        $elem.click(selectPage);
        pages[$elem.text()] = document.createElement("div");
    });

    // Alert tab
    WebVis.addAlert = function(type, message) {
        var $alert = $(document.createElement("div"));
        $alert.addClass('alert');
        switch(type) {
            case "success":
                $alert.addClass('alert-success');
                break;
            case "info":
                $alert.addClass('alert-info');
                break;
            case "warning":
                $alert.addClass('alert-warning');
                break;
            case "danger":
                $alert.addClass('alert-danger');
                break;
        }
        $alert.text(message);
        var $close = $(document.createElement("a"));
        $close.attr('href', '#');
        $close.addClass('close');
        $close.attr('aria-label', 'close');
        $close.attr('data-dismiss', 'alert');
        $close.text("X");
        $alert.append($close);
        $(pages["Alerts"]).append($alert);
    }

    tabmenu.empty();

    WebVis.pages = pages;

});
