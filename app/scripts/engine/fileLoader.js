// The contents of this file are responsible for loading files from either
// a file that has been dropped on the client, or a file that is downloaded
// from a url
// TODO: Should probably remove support for .gamelog and .glog files

WebVis.ready(function() {
    var acceptedFileExtensions = ["gamelog", "glog", "json"];

    // this obtains the file extension of the provide file.
    // If it is an accepted file extension, then it is returned
    // if it is not accepted, and empty string is returned
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

    // this function takes the files dropped on the webvis and determines
    // if they are valid file types. If it is, it returns the file and its
    // file extension. If not, an exception is thrown.
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

    // DEPRECATED
    // This function is used to take glog files and decrompress them
    // to a usable file type
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

    // receives the filedata as a buffer and turns it into a proper string.
    // when the file reader is done, it passes this data to the provide callback.
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

    // DEPRECATED
    // This is used to determine if the file is of a compressed or uncompressed
    // and calls the appropriate read function
    var preProcessFile = function(file, callback) {
        if(file.extension === "glog") {
            readCompressed(file, callback);
        } else {
            readDecompressed(file, callback);
        }
    };

    // This function is made available to the WebVis and takes in the file that
    // ws dropped onto the webvis and passes the data out as a string via the
    // provided callback
    var loadFile = function(files, callback) {
        try {
            var fileData = checkDroppedFiles(files);
            preProcessFile(fileData, callback);
        } catch(error) {
            console.log(error);
        }
    };

    // This function is made available to the WebVis and takes a url, (as a string),
    // downloads the files using an ajax call, and then processes the file. The
    // complete string data is passed as the first parameter to the callback.
    var loadFromUrl = function(u, callback) {
        var urlsplit = u.split(".");

        console.log("GETTING FILE FROM " + u);

        var checkExtension = function(url) {
            var a = url.split('.');
            if(a.length === 1 || a[1] === "") {
                return "";
            }
            return verifyFileType("." + a.pop());
        };

        var error = function(jqxhr, textStatus, errorThrown) {
            WebVis.alert("Danger", "File could not be loaded from " + u);
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

    };

    WebVis.fileLoader = {
        loadFile: loadFile,
        loadFromUrl: loadFromUrl
    };

});
