// using dropzone.js

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var myDropzone = new Dropzone("#dropzone_testid", {
    url: "/file_upload/",
    'params': {'csrfmiddlewaretoken': getCookie('csrftoken')},
    uploadprogress: function(file, progress) {
        var progressElement = $(".progress-bar");
        console.log(progressElement);
        progressElement[0].style.width = progress + "%";

        var progressVar = $(".upload_file_list").append($("<li/>").append($("<h4/>").attr({"class": "control-sidebar-subheading"}).text(file.upload.filename)));
        console.log(progressVar);
        progressVar[0].style.width = progress + "%";
    },
    init: function(){
        console.log(this);

        // this.on("uploadprogress", function(file, progress){
        //     console.log(file);
        //     console.log(progress);
        // });

        this.on('complete', function(file){
            console.log(this);
            this.removeFile(file);
            console.log(file);
            if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
                // abstract this later
                $(".upload_file_list").append($("<li/>").append($("<a/>").attr(
                    {"href": "/del_file_upload/"}).append($("<h4/>").attr({"class": "control-sidebar-subheading"}).text(file.upload.filename).append($("<span>").attr(
                    {"class": "btn btn-social-icon btn-danger btn-xs pull-right"}).append($("<i/>").attr({"class": "fa fa-close"}))))));
            }
        });

        // this.on("success", function(file, response){
        //    var obj = jQuery.parseJSON(response);
        //    console.log(obj);
        // });
    }
});
