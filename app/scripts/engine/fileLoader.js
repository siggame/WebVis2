WebVis.ready(function() {

    var acceptedFileExtensions = ["gamelog", "glog", "json"];

    var verifyFileType = function(filename) {
        var ext = "";
        for(var i = 0; i < acceptedFileExtensions.length; i++) {
            if(filename.indexOf("." + acceptedFileExtensions[i]) !== -1) {
               ext = acceptedFileExtensions[i];
               break;
            }
        }
        return ext;
    };

    var checkDroppedFiles = function(files) {
        if(files.length != 1) {
            throw "Multiple files dropped";
        }

        var file = files[0];
        var filename = escape(file.name)

        var ext = verifyFileType(filename);
        if(ext === "") {
            throw "Bad file extension.";
        }

        return {
            extension: ext,
            file: file
        };
    };

    var readCompressed = function(fileData, callback) {
        var prepareFile = function(event) {
            var file = {
                extension: fileData.extension,
                data: event.target.result
            };
            callback(file);
        };

        var decompress = function(file) {
            var buffer = new Uint8Array(file.target.result);
            var decompressed = compressjs.Bzip2.decompressFile(buffer);
            var textReader = new FileReader();
            textReader.onload = prepareFile;
            textReader.readAsText(new Blob([decompressed]));
        };

        var reader = new FileReader();
        reader.onload = decompress;
    };

    var readDecompressed = function(fileData, callback) {
        reader = new FileReader();
        reader.onload = function(event) {
            var file = {
                extension: fileData.extension,
                data: event.target.result
            };
            callback(file);
        };
        console.log("Reading decompressed file");
        reader.readAsText(fileData.file);
    };

    var preProcessFile = function(file, callback) {
        if(file.extension === "glog") {
            readCompressed(file, callback);
        } else {
            readDecompressed(file, callback);
        }
    };

    WebVis.fileLoader = {
        loadFile: function(files, callback) {
            try {
                var fileData = checkDroppedFiles(files);
                preProcessFile(fileData, callback);
            } catch(error) {
                console.log(error);
            }
        },

        loadFromUrl: function(u, callback) {
            var urlsplit = u.split(".");
            
            var checkExtension = function(url) {
                var a = url.split('.');
                if(a.length === 1 || a[1] === "") {
                    return "";
                }
                return verifyFileType("." + a.pop());
            };

            var error = function(jqxhr, textStatus, errorThrown) {
                console.error("File could not be loaded from " + u);
            }

            var success = function(data) {
                file = {
                    extension: ext,
                    file: new Blob([data])
                };
                preProcessFile(file, callback);
            };

            var fetchText = function() {
                $.ajax({
                    type: "GET",
                    dataType: "text",
                    url: u,
                    data: null,
                    success: success,
                    error: error
                });
            };

            var fetchBinary = function() {
                $.ajax({
                    type: "GET",
                    dataType: "text",
                    url: u,
                    data: null,
                    success: success,
                    error: error
                });
            };

            try {
                var ext = checkExtension(u);
                switch(ext) {
                    case "glog":
                        fetchBinary();
                        break;
                    case "gamelog":
                        fetchText();
                        break;
                    case "json":
                        fetchText();
                        break;
                    default:
                        fetchBinary();
                        break;
                }
            } catch(error) {
                console.log(error);
            }

        }
    };

});
