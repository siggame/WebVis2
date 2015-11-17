WebVis = {};

WebVis.onloadActionList = [];

WebVis.loadHtml = function(name) {
    WebVis.onloadActionList.push(name);
};