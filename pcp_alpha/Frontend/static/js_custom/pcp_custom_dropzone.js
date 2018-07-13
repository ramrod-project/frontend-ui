// using dropzone.js

var dom_filename_map = {};

function add_file_to_dropzone_list(filename){
    var file_list_dom = $(".upload_file_list");
    var next_id = file_list_dom.length;
    // dom_filename_map[next_id] = filename;
    file_list_dom
        .append($("<li/>")
            .append($("<hr/>"))
            .append($("<div/>")
                .attr({"class": "del_file_upload_c"})
                .append($("<h4/>")
                    .attr({"class": "control-sidebar-subheading file_upload_name brain_filename"})
                    .text(filename))
                .append($("<div/>")
                    .append($("<span>")
                        .attr({"class": "btn btn-social-icon btn-danger btn-xs pull-right"})
                        .append($("<i/>")
                            .attr({"class": "fa fa-close",
                                   "onclick": "remove_file_from_dropzone_list("+next_id+")"})
                        )
                    )
                    .append($("<span>")
                        .attr({"class": "btn btn-social-icon  btn-info btn-xs pull-left"})
                        .append($("<a/>")
                            .attr({"class": "fa fa-download",
                                   "href": "/file_download/"+filename+"/"})
                        )
                    )
                )
            )
            .append($("<br/>"))
        );

}


function populate_file_listing(){
    var file_list_dom = $(".upload_file_list");
    var file_refresh = $("#upload_file_refresh");
    file_refresh.addClass("fa-spin");
    file_list_dom.empty();
    var counter_int;
    $.ajax({
        type: "GET",
        url: "/file_listing/",
        datatype: 'json',
        success: function(data) {
            var dan = data;
            counter_int = 0;
            for (var idx in data){
                var filename = data[idx];
                dom_filename_map[counter_int] = filename;
                counter_int++;
                add_file_to_dropzone_list(filename);
            }
            file_refresh.removeClass("fa-spin");
        }
    });
}

function clear_upload_message(){
    var file_upload_msg;
    file_upload_msg = $(".file_upload_msg");
    file_upload_msg[0].style.visibility = "hidden";
    file_upload_msg[0].style.display = "none";
    $(".file_upload_msg span").remove();
}

function remove_file_from_dropzone_list(file_dom_id){
    var filename = dom_filename_map[file_dom_id];
    if (filename != undefined){
        $.ajax({
            type: "GET",
            url: "/del_file_upload/"+filename+"/",
            datatype: 'json',
            success: function(data) {
                populate_file_listing();
            }
        });
    }
}

function getCookie(name) {
    var cookieValue,
        cookies,
        i,
        cookie;
    cookieValue = null;
    if (document.cookie && document.cookie != '') {
        cookies = document.cookie.split(';');
        for (i = 0; i < cookies.length; i++) {
            cookie = jQuery.trim(cookies[i]);
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
        var file_upload_element,
            progressElement;
        file_upload_element = $(".file_upload_msg");
        $(".dz-preview")[0].style.visibility = "hidden";
        $(".progress")[0].style.visibility = "";
        file_upload_element[0].style.visibility = "hidden";
        file_upload_element[0].style.display = "none";
        progressElement = $(".progress-bar");
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
            var file_upload_ele_msg;
           if(response.errors > 0){
               file_upload_ele_msg = $(".file_upload_msg");
               file_upload_ele_msg[0].style.visibility = "";
               file_upload_ele_msg[0].style.display = "";
               file_upload_ele_msg.text(response.first_error);
               file_upload_ele_msg.append($("<span>")
                                        .attr({"class": "btn btn-social-icon btn-xs pull-right"})
                                        .append($("<i/>")
                                            .attr({"class": "fa fa-close",
                                                   "onclick": "clear_upload_message()"})
                                        )
                                    );
           } else {
               $(".progress")[0].style.visibility = "hidden";
               add_file_to_dropzone_list(file.upload.filename);
           }
        });
    }
});

$(document).ready(function() {
    populate_file_listing();
    $("#upload_file_refresh").click(populate_file_listing);

});


