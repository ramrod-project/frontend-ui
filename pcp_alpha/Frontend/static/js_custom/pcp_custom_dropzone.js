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
        $(".dz-preview")[0].style.visibility = "hidden";
        $(".progress")[0].style.visibility = "";
        $(".file_upload_msg")[0].style.visibility = "hidden";
        var progressElement = $(".progress-bar");
        progressElement[0].style.width = progress + "%";
    },
    init: function(){
        this.on('complete', function(file){
            this.removeFile(file);
            if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
                $(".progress")[0].style.visibility = "hidden";
            }
        });

        this.on("success", function(file, response){
           var obj = jQuery.parseJSON(response);
           if(obj != 0){
               console.log("message: file already exist.");
               $(".file_upload_msg")[0].style.visibility = "";
               $(".file_upload_msg").text("File already exist.")
           } else {
               $(".progress")[0].style.visibility = "hidden";
                $(".upload_file_list").append($("<li/>").append($("<a/>").attr(
                    {"href": "/del_file_upload/"+file.upload.filename+"/", "class": "del_file_upload_c"}).append($("<h4/>").attr({"class": "control-sidebar-subheading file_upload_name"}).text(file.upload.filename).append($("<span>").attr(
                    {"class": "btn btn-social-icon btn-danger btn-xs pull-right"}).append($("<i/>").attr({"class": "fa fa-close"}))))));
           }
        });
    }
});

