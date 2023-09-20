$(document).ready(function () {

    $("form").on("change", "input[type='file']", function() {
        const file = this.files;
        const div = this.parentElement;
        const form = this.form;
        if (file) {
            div.querySelector(".upload_image").src = URL.createObjectURL(file[0]);
            div.querySelector(".field__file-fake").textContent = file[0].name;
            div.querySelector(".cancel_image").classList.remove("not-active");
            if (form.classList.contains("post-action-form")) {
                form.querySelector(".past_image_post").classList.add("not-active");
            }
        }
    });

    $("form").on("click", ".cancel_image", function(e) {
        e.preventDefault();
        const div = this.parentElement;
        const form = div.parentElement;
        if (form.classList.contains("post-action-form")) {
            div.querySelector(".upload_image").src = "";
            div.querySelector(".field__file-fake").textContent = "Выберите изображение поста";
            form.querySelector(".past_image_post").classList.remove("not-active");
        } else {
            div.querySelector(".upload_image").src = 'images/avatars/default.jpg?t=' + Date.now();
            div.querySelector(".field__file-fake").textContent = "Выбериет аватар";
            if (sessionStorage.getItem("temporary_avatar") && sessionStorage.getItem("temporary_avatar") !== "default.jpg") {
                $.ajax({
                    url: "controllers/users_controllers/delete_avatar_controller.php",
                    method: 'get',
                    dataType: 'json',
                    data: {"src_avatar": sessionStorage.getItem("temporary_avatar")},
                    success: function(data){
                        sessionStorage.removeItem("temporary_avatar");
                    },
                    error: function (data) {
                        let errors = data.responseJSON.data.errors;
                        if (errors.file) {
                            sessionStorage.removeItem("temporary_avatar");
                        }
                    }
                });
            }
        }
        div.querySelector(".input_file").value = null;
        div.querySelector(".cancel_image").classList.add("not-active");
    });

});
