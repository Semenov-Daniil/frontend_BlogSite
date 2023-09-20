$(document).ready(function(){

    // menu
    $("body").on("click", ".link", function(e){
        e.preventDefault();
        cleaningAllForm($("form"));
        $("html, body").scrollTop(0);

        getMenu();

        if (sessionStorage.getItem("token")) {
            checkingUser();
        }

        $("#colorlib-main-menu ul li a").removeClass("colorlib-active");
        if ($(this).hasClass("link")) {
            $(`.link[data-section="${$(this).data("section")}"]`).addClass("colorlib-active");
        }

        if ($(this).data("section")) {
            $("section").addClass("not-active");
            $(`.${$(this).data("section")}`).removeClass("not-active");
        }

        switch ($(this).data("section")) {
            case "index":
                get10Posts();
                break;
            case "blogs":
                getAllPosts(1);
                break;
            case "post":
                addingViews($(this).data("idPost"));
                getPost($(this).data("idPost"));
                break;
            case "post-action":
                if ($(this).data("idPost")) {
                    fillingPost($(this).data("idPost"));
                }
                break;
            case "users":
                getUsers();
                break;
            case "register":
                $(".register .register-form").removeClass("not-active");
                $(".register .title-register .h3").html(`Регистрация`);
                break;
            case "login":
                $(".login .login-form").removeClass("not-active");
                $(".login .block-user").remove();
                break;
            case "account":
                if ($(this).data("idUser") != sessionStorage.getItem("id")) {
                    $("#colorlib-main-menu ul li a").removeClass("colorlib-active");
                }
                getAccount($(this).data("idUser"));
                break;
            case "exting":
                exting();
                break;
        }
    });

    $(".link[data-section=index]").trigger("click");

    // получение бокового меню в зависимости от пользователя
    function getMenu()
    {
        if(sessionStorage.getItem("token")) {
            $(".identity_user").addClass("not-active");
            $(".exting_user").removeClass("not-active");

            if (!($("#colorlib-main-menu ul .account-link").length)) {
                $("#colorlib-main-menu ul").prepend(`<li class="my__invalid account-link"><img src="images/avatars/${sessionStorage.getItem("src_avatar")}?t=${(new Date()).getTime()}" alt="Image placeholder" class="avatar"><a href="" class="link" data-section='account' data-id-user="${sessionStorage.getItem("id")}">${sessionStorage.getItem("login")}</a></li>`);
            }
        } else {
            $(".identity_user").removeClass("not-active");
            $(".exting_user").addClass("not-active");
            $("#colorlib-main-menu ul .account-link").remove();
            $("#colorlib-main-menu ul .users").remove();
        }

        if(sessionStorage.getItem("role") == "Администратор") {
            if (!($("#colorlib-main-menu ul .users").length)) {
                $("#colorlib-main-menu ul .about").after(`<li class="users"><a class="link" href="" data-section="users">Пользователи</a></li>`);
            }
        }
    }

    // проверка пользователя во время сеанса (проверка на блокировку и вход под другим токином)
    function checkingUser()
    {
        $.ajax({
            url: "http://apiblogsite/api/users/user",
            method: 'get',
            dataType: 'json',
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            error: function () {
                exting();
            }
        });
    }

    // получение 10 постов, главная страница
    function get10Posts()
    {
        $.ajax({
            url: "http://apiblogsite/api/posts/index",
            method: 'get',
            dataType: 'json',
            success: function(data){
                let html = '';
                for (let post of data.data.posts) {
                    html += `<div class="col-md-12 col-xl-12">${getMiniPost(post, false)}</div>`;
                }
                $(".list-10-posts").html(html);
            }
        });
    }

    // получение html разметки одного поста
    function getMiniPost(post, iconc) 
    {
        return `<div class="blog-entry d-md-flex">
                    ${post.image ? `<a href="" class="img img-2 link" data-section="post" data-id-post="${post.id}" style="background-image: url(images/posts/${post.image}?id=${post.id});"></a>` : ``}
                    <div class="text text-2 pl-md-4">
                        <h3 class="mb-2"><a href="" class="title-post link" data-section="post" data-id-post="${post.id}">${post.title}</a></h3>
                        <div class="meta-wrap">
                            <p class="meta">
                            <a href="" class="link link-account user-login-post" data-section="account" data-id-user="${post.Users_id}"><img src="images/avatars/${post.user.avatar}?t=${(new Date).getTime()}" alt="Image placeholder" class="avatar"></a>
                                <span class="text text-3"><a href="" class="link link-account user-login-post login-post" data-section="account" data-id-user="${post.user.id}">${post.user.login}</a></span>
                                <span><i class="icon-calendar mr-2"></i>${post.create_at}</span></br>
                                
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                    </svg> ${post.views} Просмотров
                                </span>
                                <span><i class="icon-comment2 mr-2"></i>${post.countComments} Комментариев</span>
                                <span>
                                    ${post.countLike}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                                        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                                    </svg>
                                </span>
                                <span>
                                    ${post.countDislike}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-down" viewBox="0 0 16 16">
                                        <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964l-.261.065zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a8.912 8.912 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581 0-.211-.027-.414-.075-.581-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.224 2.224 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.866.866 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1z"/>
                                    </svg>    
                                </span>                           
                            </p>
                        </div>
                        <p class="mb-4 preview-post">${post.preview}</p>
                        <div class="d-flex pt-1 justify-content-between">
                            <div>
                                <a href="" class="btn-custom link" data-section="post" data-id-post="${post.id}">Подробнее... <span class="ion-ios-arrow-forward"></span></a>
                            </div>
                            ${iconc ? getIconcEditingDelete(post) : ''}
                        </div>
                    </div>
                </div>`;
    }

    // получение иконок редактирования и удаления
    function getIconcEditingDelete(post)
    {
        return `<div>
                    ${sessionStorage.getItem("id") == post.user.id ? `<a href="" class="text-warning creat-post-btn link" data-section="post-action" data-id-post="${post.id}" style="font-size: 1.8em;" title="Редактировать">🖍</a>` : ''}
                    ${(sessionStorage.getItem("role") == "Администратор" || (sessionStorage.getItem("id") == post.user.id && post.countComments == 0)) ? `<a href="" class="text-danger delet-post" data-section="blogs" data-id-post="${post.id}" style="font-size: 1.8em;" title="Удалить">🗑</a>` : ''}
                </div>`;
    }

    // получение всех постов, страница Блоги
    function getAllPosts(pag)
    {
        if ((sessionStorage.getItem("token") && sessionStorage.getItem("is_admin") == "autor")) {
            $(".blogs .page-blogs .div-creat-post").removeClass("not-active");
        }

        sizeSettingSelect();

        let flag = $(".blogs .selection-sort").val();
        let options = null;

        if ($(".blogs .search_input").val()) {
            options = $(".blogs .search_input").val();
        }

        $.ajax({
            url: options != '' ? "http://apiblogsite/api/posts/posts" : "http://apiblogsite/api/posts/search",
            method: 'get',
            dataType: 'json',
            data: {"page": pag,
                    "flag": flag,
                    "options": options},
            success: function(data){
                let html = '';
                if (data.data.posts.length) {
                    for (let post of data.data.posts) {
                        html += `<div class="row pt-md-4"><div class="col-md-12 col-xl-12">${getMiniPost(post, true)}</div></div>`;
                    } 
                } else {
                    html += `К сожалению, по запросу: ${$(".blogs .search_input").val()} ничего не найдено:(`;
                }
                html += getHTMLPaginaction(pag, data.data.paginaction);
                $(".list-posts").html(html);
            }
        });
    }

    // пагинация
    function getHTMLPaginaction(action_pag, paginaction)
    {
        action_pag = Number(action_pag);
        let result = `<div class="row"><div class="col"><div class="block-27">
                        <ul>
                            ${action_pag != 1 ? `<li><a href="" class="paginaction" data-section="blogs" data-pag="${action_pag-1}" title="Предыдущая страница">&lt;</a></li>` : ""}`;
        paginaction.forEach(function(num_pag) {
            if (action_pag == num_pag) {
                result += `<li class="active"><span>${num_pag}</span></li>`;
            } else {
                result += `<li><a href="" class="paginaction" data-section="blogs" data-pag="${num_pag}">${num_pag}</a></li>`;
            }
        });
        result += action_pag < paginaction[paginaction.length - 1] ? `<li><a href="" class="paginaction" data-section="blogs" data-pag="${action_pag+1}" title="Следующая страница">&gt;</a></li>` : '';
        result += '</ul></div></div></div>';
        return result;
    }

    $(".blogs").on("click", ".paginaction", function(e) {
        e.preventDefault();
        $("html, body").scrollTop(0);
        getAllPosts($(this).data("pag"));
    });

    // взаимодействие с поиском
    $(".blogs").on("input", ".search_input", function(e){
        e.preventDefault();
        $(".search_div").css("border-color", "#1eafed");

        let flag = $(".blogs .selection-sort").val();

        let string = $(this).val();
        if (string) {
            $(".search_div .search_cence_btn").removeClass("not-active");
            $(".search_div .search_sumbit_btn").removeClass("not-active");

            $.ajax({
                url: "http://apiblogsite/api/posts/search",
                method: 'get',
                dataType: 'json',
                data: {"options": string,
                        "flag": flag},
                success: function(data){
                    let html = '';
                    if ((data)) {
                        for (let post of data.data.posts) {
                            html += `<div class="row pt-md-4"><div class="col-md-12 col-xl-12">${getMiniPost(post, true)}</div></div>`;
                        } 
                    } else {
                        html += `<div class="row pt-md-4"><div class="col-md-12 col-xl-12">К сожалению, по запросу: ${string} ничего не найдено:(</div></div>`;
                    }
    
                    $(".list-posts").html(html);
    
                    if(data && string.length !== 0){
                        textHighlighting($(".list-posts .title-post"), string);
                        textHighlighting($(".list-posts .login-post"), string);
                        textHighlighting($(".list-posts .preview-post"), string);
                    }
                }
            });
        } else {
            $(".search_div .search_cence_btn").addClass("not-active");
            $(".search_div .search_sumbit_btn").addClass("not-active");
            $(".search_div").css("border-color", "#cacaca");
            getAllPosts(1);
        }
    });

    // подсветка поиска
    $(".search_div").hover(
        function() {
            $(this).css("border-color", "#1eafed");
        }, function() {
            if (!($(".search_div .search_input").val())) {
                $(this).css("border-color", "#cacaca");
            }
        }
    );

    // выделение текста
    function textHighlighting(where, text)
    {
        for (let cnt of where) {
            let search_regexp = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
            $(cnt).html($(cnt).html().replace(search_regexp, "<g class ='highlighted'>$&</g>"));
        }
    }

    // очистка поиска
    $(".blogs").on("click", ".search_cence_btn", function(e){
        e.preventDefault();
        $(".search_div .search_cence_btn").addClass("not-active");
        $(".search_div .search_sumbit_btn").addClass("not-active");
        if ($(".search_div .search_input").val()) {
            $(".search_div .search_input").val("");
            getAllPosts(1);
        }
    });

    // найти
    $(".blogs").on("click", ".search_sumbit_btn", function(e){
        e.preventDefault();
        $(".search_div .search_sumbit_btn").addClass("not-active");
        $(".search_div").css("border-color", "#cacaca");
        getAllPosts(1);
    });

    // выбор сортировки
    $(".blogs").on("change", ".selection-sort", function(e) {
        getAllPosts(1);
    });

    // насройка размера select
    function sizeSettingSelect()
    {
        let text = $(".blogs .selection-sort").find('option:selected').text();
        let false_select = $('<select/>').append($('<option/>').text(text));
        $(".blogs .selection-sort").after(false_select);
        $(".blogs .selection-sort").width(false_select.width());
        false_select.remove();
    }

    // получение поста
    function getPost(post_id)
    {
        $.ajax({
            url: "http://apiblogsite/api/posts/post/" + post_id,
            method: 'get',
            dataType: 'json',
            async: false,
            success: function(data){
                let html = "";
                $(".post .post-content").html(""); 
                html += getHTMLPost(data.data.post);
                if (sessionStorage.getItem("token")) {
                    if ((!(data.data.post.Users_id == sessionStorage.getItem("id") && data.data.post.countComments == 0) && sessionStorage.getItem("is_admin") == "autor")) {
                        html += `<div>${getFormComment(data.data.post.id)}</div>`;
                    }
                } else {
                    html += `<div>${getNotComment()}</div>`;
                }
                html += `<div class="comments pt-5 mt-5 list-comment"><h3 class="mb-5 font-weight-bold count-comments">${data.data.post.countComments} комментариев</h3><ul class="comment-list">${getComments(data.data.post.id)}</ul></div>`;
                if (sessionStorage.getItem("token") && sessionStorage.getItem("role") == "Автор") {
                    getReactionUser(data.data.post);
                }
                $(".post .post-content").html(html);  
            }
        });
    }

    function addingViews(post_id)
    {
        console.log(post_id);
        $.ajax({
            url: "http://apiblogsite/api/posts/view/" + post_id,
            method: 'patch',
            dataType: 'json',
            async: false,
        });
    }

    // получение ru времени
    function getDate(date)
    {
        return date.toLocaleDateString("ru", { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'});
    }

    // получение разметки контента поста
    function getHTMLPost(post)
    {
        return `<div class="post-info" data-id-post="${post.id}">
                    <h1 class="mb-3">${post.title}</h1>

                    <div class="meta-wrap">
                        <p class="meta">
                        <a href="" class="link link-account user-login-post" data-section="account" data-id-user="${post.user.id}"><img src="images/avatars/${post.user.avatar}?t=${(new Date()).getTime()}" alt="Image placeholder" class="avatar"></a>
                            <span class="text text-3"><a href="" class="link link-account user-login-post" data-section="account" data-id-user="${post.user.id}">${post.user.login}</a></span>
                            <span>
                                <i class="icon-calendar mr-2"></i>${post.create_at}
                                ${((new Date(post.update_at)).getTime() > (new Date(post.create_at)).getTime()) ? `(изменено ${post.update_at})` : ""}
                            </span>
                            <span><i class="icon-comment2 mr-2"></i>${post.countComments} комментариев</span>
                            <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                        </svg> ${post.views} Просмотров
                            </span>
                        </p>
                    </div>

                    <div class="content-post">
                        <p>${post.content}</p>
                        ${post.image ? `<p><img src="images/posts/${post.image}?t=${(new Date()).getTime()}" alt="Изображение поста" class="img-fluid"></p>` : ''}
                    </div>
                    <div>
                        <span class="iconc-reaction like" data-id-post="${post.id}" value='1'>
                            ${post.countLike}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                                <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                            </svg>
                        </span>
                        <span class="iconc-reaction dislike" data-id-post="${post.id}" value='0'> 
                            ${post.countDislike}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-hand-thumbs-down" viewBox="0 0 16 16">
                                <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964l-.261.065zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a8.912 8.912 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581 0-.211-.027-.414-.075-.581-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.224 2.224 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.866.866 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1z"/>
                            </svg>    
                        </span> 
                    </div>
                    ${getIconcEditingDelete(post)}
                </div>`;
    }

    function getReactionUser(post)
    {
        $.ajax({
            url: "http://apiblogsite/api/reaction/react/" + sessionStorage.getItem("id") + '/' + post.id,
            method: 'get',
            dataType: 'json',
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            success: function(data){
                if (data.data.reaction[0].reaction == 1) {
                    $(".post .like svg").html('<path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>');
                    $(".post .like").addClass("active-react");
                } else if (data.data.reaction[0].reaction == 0) {
                    $(".post .dislike svg").html('<path d="M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.378 1.378 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51.136.02.285.037.443.051.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.896 1.896 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2.094 2.094 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.162 3.162 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.823 4.823 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591z"/>');
                    $(".post .dislike").addClass("active-react");
                }
            }
        });
    }

    $(".post").on("click", ".iconc-reaction", function() {
        if (sessionStorage.getItem("token") && sessionStorage.getItem("role") == "Автор") {
            let id_post = $(this).data("idPost");
            $.ajax({
                url: "http://apiblogsite/api/reaction/react",
                method: 'post',
                dataType: 'json',
                data: {
                    "Posts_id": id_post,
                    'Users_id': sessionStorage.getItem("id"),
                    "reaction": $(this).attr("value")
                },
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("token")
                },
                success: function(data){
                    getPost(id_post);
                }
            });
        } 
    });

    // получение списка комментариев
    function getComments(post_id)
    {
        let result = '';
        $.ajax({
            url: "http://apiblogsite/api/comments/comments/" + post_id,
            method: 'get',
            dataType: 'json',
            async: false,
            success: function(data){
                result = getListComments(data.data.comments)
            }
        });
        return result;
    }

    function getListComments(arr_comments, parent_id = null)
    {
        let result = '';
        arr_comments.forEach(comment => {
            if (parent_id == comment.parent_id) {
                result += `<li class="comment comment-content" id-comment="${comment.id}">
                                <div class="vcard bio">
                                <a href="" class="link link-account user-login-post" data-section="account" data-id-user="${comment.user.id}"><img src="${comment.user.avatar ? `images/avatars/${comment.user.avatar}?id=${comment.user.id}` : `images/avatars/default.jpg?id=${comment.user.id}`}" alt="Image placeholder"></a>
                                </div>
                                <div class="comment-body">
                                    <div class="d-flex justify-content-between">
                                        <h3><a href="" class="link link-account user-login-post" data-section="account" data-id-user="${comment.user.id}">${comment.user.login}</a></h3>
                                        ${sessionStorage.getItem("role") == "Администратор" ? `<a href="" class="text-danger delete-comment" data-id-comment=${comment.id} style="font-size: 1.8em; margin-right: 10px;" title="Удалить">🗑</a>` : ''}
                                    </div>
                                    
                                    <div class="meta">${comment.create_at}</div>
                                    <p class="text-comment" id-comment="${comment.id}">${comment.parent_id ? `<a href="" class="link-comment" link-comment="${comment.parent_id}" >${arr_comments.find((parent) => parent.id === comment.parent_id).user.login}, </a>` : ""}${comment.comment}</p>
                                    ${(sessionStorage.getItem("id") != comment.user.id && sessionStorage.getItem("role") == "Автор") ? `<a href="" class="reply" data-comment-id="${comment.id}">Ответить</a>` : ''}
                                    
                                </div>
                                
                                <ul class="comment-list">
                                    ${getListComments(arr_comments, comment.id)}
                                </ul>
                        </li>`;
            }
        });
        return result;
    }

    $(".post").on("click", ".link-comment", function(e) {
        e.preventDefault();
        $(`.post .text-comment[id-comment=${$(this).attr("link-comment")}]`).removeClass("link-comment-animathion");
        $(`.post .text-comment[id-comment=${$(this).attr("link-comment")}]`)[0].scrollIntoView({block: "center", inline: "center", behavior: "smooth"});
        $(`.post .text-comment[id-comment=${$(this).attr("link-comment")}]`).addClass("link-comment-animathion");
    });

    //получение формы для создания комментария 
    function getFormComment(post_id)
    {
        return `<div class="comment-form-wrap pt-5">
                    <h3 class="mb-5">Оставьте комментарий</h3>
                    <form class="p-3 p-md-5 bg-light creat-comment" id="form_comment" method="POST">
                        <div class="form-group">
                            <textarea name="comment" id="message" cols="30" rows="10" class="form-control comment" placeholder="Введите комментарий"></textarea>
                                <div class="invalid-feedback comment-message"></div> 
                        </div>
                        <div class="form-group">
                            <a class="btn py-3 px-4 btn-primary creat-comment-btn" href="" data-post-id="${post_id}">Отправить</a>
                        </div>
                    </form>
                </div>`;
    }

    // уведомление о авторизации для создания комментария
    function getNotComment()
    {
        return `<h5 class="pt-5 mb-5"><a href="" class="link" data-section="login">Авторизируйтесь</a>, чтобы получить возможность оставить комментарий</h5>`;
    }

    // отправка комментария
    $(".post").on("click", ".creat-comment-btn", function(e){
        e.preventDefault();
        cleaningForm($(".creat-comment")[0]);
        $.ajax({
            url: "http://apiblogsite/api/comments/create/" + $(".post-info").data("idPost"),
            method: 'post',
            dataType: 'json',
            data: {
                "comment": $(".creat-comment textarea").val()
            },
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            success: function(data){
                getPost($(".post-info").data("idPost"));
                $(`.post .comment-content[id-comment=${data.data.comment.id}]`).addClass("link-comment-animathion");
                $(`.post .comment-content[id-comment=${data.data.comment.id}]`)[0].scrollIntoView({block: "center", inline: "center"}); 
            },
            error: function (error) {
                let errors = error.responseJSON.error.errors;
                for (nameErrors in errors[0]) {
                    $("." + nameErrors).addClass("is-invalid");
                    $("." + nameErrors + "-message").html(errors[0][nameErrors].join("<br>"));
                }
            }
        });
    });

    // создание формы ответа на комментарий
    $(".post").on("click", ".reply", function(e){
        e.preventDefault();

        $(this).addClass("not-active");
        $(this).after(getAnswerForm(this.dataset.commentId));
    });

    // отмена ответа на комментарий
    $(".post").on("click", ".cance-answer", function(e){
        e.preventDefault();

        cleaningForm($(`.comment-answer[data-comment-id = ${$(this).data('commentId')}]`)[0]);

        $(`.reply[data-comment-id = ${$(this).data('commentId')}]`).removeClass("not-active");
        $(`.comment-answer[data-comment-id = ${$(this).data('commentId')}]`).remove();
    });

    // форма ответа на комментарий
    function getAnswerForm(comment_id)
    {
        return `<form class="bg-light comment-answer" id="form_comment" method="POST" data-comment-id="${comment_id}">
                    <div class="form-group">
                        <textarea name="comment" id="message" cols="30" rows="2" class="form-control comment-answer" placeholder="Введите ответ на комментарий"></textarea>
                            <div class="invalid-feedback comment-answer-message"></div> 
                    </div>
                    <div class="form-group">
                        <a class="btn btn-primary creat-answer-btn" href="" data-comment-id="${comment_id}">Отправить</a>
                        <a class="btn btn-primary cance-answer" href="" data-comment-id="${comment_id}">Отмена</a>
                    </div>    
                </form>`;
    }
    
    // отправка ответа на комментарий
    $(".post").on("click", ".creat-answer-btn", function(e){
        e.preventDefault();
        cleaningForm($(".comment-answer")[0]);
        $.ajax({
            url: "http://apiblogsite/api/comments/answer/" + $(".post-info").data("idPost") + '/' + $(this).data("commentId"),
            method: 'post',
            dataType: 'json',
            data: {
                "comment": $(".comment-answer textarea")[0].value
            },
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            success: function(data){
                getPost($(".post-info").data("idPost"));
                $(`.post .comment-content[id-comment=${data.data.answer.id}]`).addClass("link-comment-animathion");
                $(`.post .comment-content[id-comment=${data.data.answer.id}]`)[0].scrollIntoView({block: "center", inline: "center"}); 
            },
            error: function (error) {
                let errors = error.responseJSON.error.errors;
                for (nameErrors in errors[0]) {
                    $("." + nameErrors + "-answer").addClass("is-invalid");
                    $("." + nameErrors + "-answer-message").html(errors[0][nameErrors].join("<br>"));
                }
            }
        });
    });

    // создание поста
    $(".post-action").on("click", `.creat-post-btn`, function(e){
        e.preventDefault();
        cleaningForm($(".post-action form")[0]);
        let formData = getDataForm($(".post-action form")[0]);
        if ($(this).data("idPost")) {
            formData.append("id", $(this).data("idPost"));
        }
        $.ajax({
            url: $(this).data("idPost") ? "http://apiblogsite/api/posts/update/" + $(this).data("idPost") : "http://apiblogsite/api/posts/create",
            method: $(this).data("idPost") ? 'patch' : 'post',
            dataType: 'json',
            cache: false,
			contentType: false,
			processData: false,
            data: formData,
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            success: function(data){
                $("section").addClass("not-active");
                $(`.post`).removeClass("not-active");
                $(".post-content").html("");
                getPost(data.data.post.id);
            },
            error: function (error) {
                let errors = error.responseJSON.error.errors;
                for (nameErrors in errors[0]) {
                    $("." + nameErrors).addClass("is-invalid");
                    $("." + nameErrors + "-message").html(errors[0][nameErrors].join("<br>"));
                }
            }
        });
    });

    // редактирование поста
    function fillingPost(post_id)
    {
        $(".post-action .h3")[0].textContent = "Редактирование поста";
        $(".post-action .creat-post-btn").data("id-post", post_id);
        $(".post-action .cance-post-action").data("id-post", post_id);
        $(".post-action .cance-post-action").data("section", "post");

        $.ajax({
            url: "http://apiblogsite/api/posts/post/" + post_id,
            method: 'get',
            dataType: 'json',
            success: function(data){
                for (let input of $(".post-action form")[0]) {
                    if (data.data.post.hasOwnProperty(input.name)) {
                        if (input.type !== "file") {
                            $(input).val(data.data.post[input.name].replace(/<br>/g,"\r\n"));
                        }
                    }
                }
                if (data.data.post.image) {
                    $("div .past_image_post").removeClass("not-active");
                    $("div .past_image_post img").attr("src", `images/posts/${data.data.post.image}`);
                }
            }
        });
    }

    // удаление поста
    $("body").on("click", ".delet-post", function(e) {
        e.preventDefault();
        $.ajax({
            url: "http://apiblogsite/api/posts/post/" + $(this).data("idPost"),
            method: 'delete',
            dataType: 'json',
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            success: function(){
                $(".link[data-section=blogs]").trigger("click");
            }
        });
    });

    // удаление комментария
    $(".post").on("click", ".delete-comment", function(e) {
        e.preventDefault();
        $.ajax({
            url: "http://apiblogsite/api/comments/comment/" + $(this).data("idComment"),
            method: 'delete',
            dataType: 'json',
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            success: function(){
                getPost($(".post-info").data("idPost"));
            }
        });
    });

    // ajax-запрос авторизации пользователя в системе
    $(".login").on("click", ".login-btn", function(e){
        e.preventDefault();
        cleaningForm($(".login form")[0]);
        $.ajax({
            url: "http://apiblogsite/api/users/login",
            method: 'post',
            dataType: 'json',
            data: $(".login-form").serialize(),
            success: function(data){
                sessionStorage.setItem("token", data.data.user.token);
                sessionStorage.setItem("id", data.data.user.id);
                sessionStorage.setItem("role", data.data.role);
                sessionStorage.setItem("src_avatar", (data.data.user.avatar ? data.data.user.avatar : "images/avatars/default.jpg"));
                sessionStorage.setItem("login", data.data.user.login);

                $(".link[data-section=index]").trigger("click");
            },
            error: function (error) {
                let errors = error.responseJSON.error.errors;
                for (nameErrors in errors[0]) {
                    $("." + nameErrors).addClass("is-invalid");
                    $("." + nameErrors + "-message").html(errors[0][nameErrors].join("<br>"));

                    if (nameErrors == "block") {
                        $(".login .login-form").addClass("not-active");
                        $(".login .login-form").after(`<h3 class="block-user">${errors[nameErrors]}</h3>`);
                    }
                }
            }
        });
    });

    // регистрация
    $("section").on("click", ".register-btn", function(e){
        e.preventDefault();
        cleaningForm($(".register form")[0]);
        let formData = getDataForm($(".register form")[0]);
        if (sessionStorage.getItem("temporary_avatar")) {
            formData.append("avatar", sessionStorage.getItem("temporary_avatar"));
        }
        $.ajax({
            url: "http://apiblogsite/api/users/register",
            method: 'post',
            dataType: 'json',
            cache: false,
			contentType: false,
			processData: false,
            data: formData,
            success: function(data){
                $(".register .register-form").addClass("not-active");
                $(".register .title-register").html(`<h2 class="h3">Успешная регистрация!!!</h2><h2 class="h3">Теперь вы можете <a href="" class="link" data-section="login">авторизироваться</a></h2>`);
                sessionStorage.removeItem("temporary_avatar");
            },
            error: function (error) {
                let errors = error.responseJSON.error.errors;
                for (nameErrors in errors[0]) {
                    $("." + nameErrors).addClass("is-invalid");
                    $("." + nameErrors + "-message").html(errors[0][nameErrors].join("<br>"));
                }
            }
        });
    });

    // генерация аватара
    $(".register").on("click", ".generate_avatar", function(e) {
        e.preventDefault();
        $(".register .register-form .generate_avatar-message").html('');
        $(`.register .login-message`).html("");
        $(".register .login").removeClass("is-invalid");
        
        let title_avatar = "default.jpg";
        if (sessionStorage.getItem("temporary_avatar")) {
            title_avatar = sessionStorage.getItem("temporary_avatar");
        }
        $.ajax({
            url: "http://apiblogsite/api/users/avatar",
            method: 'get',
            dataType: 'json',
            data: {"login": $(".register .register-form .login").val(),
                    "src_avatar": title_avatar},
            success: function(data){
                $(".register .register-form .upload_image").attr("src", `images/avatars/${data.data.src_avatar}?t=${(new Date).getTime()}`);
                $(".register .register-form .cancel_image").removeClass('not-active');
                sessionStorage.setItem("temporary_avatar", data.data.src_avatar);
            },
            error: function (error) {
                let errors = error.responseJSON.error.errors;
                for (nameErrors in errors[0]) {
                    $("." + nameErrors).addClass("is-invalid");
                    $(`.register .register-form .${nameErrors}-message`).html(errors[0][nameErrors]);
                }
            }
        });
    });

    // очистка уведомления при генерации аватара
    $(".register").on("input", "input[name='login']", function(e){
        if ($(this).val() && $(".register .register-form .generate_avatar-message").text()) {
            $(".register .register-form .generate_avatar-message").html("");
            $(`.invalid-feedback`).html("");
            $(this).removeClass("is-invalid");
        }
    });

    // получение списка пользователей
    function getUsers()
    {
        if (sessionStorage.getItem("role") == "Администратор") {
            let flag = `${$(".users .header-table-user").find(".options-sort").not("[sort='not-active']").attr("sort")}-${$(".users .header-table-user .options-sort").not("[sort='not-active']").attr("name")}`;
            let options = null;
            if ($(".users .search_input").val()) {
                options = $(".users .search_input").val();
            }

            $.ajax({
                url: "http://apiblogsite/api/users/users",
                method: 'get',
                dataType: 'json',
                data: {
                        "flag": flag,
                        "options": options
                },
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("token")
                },
                success: function(data){
                    if (data.data.users.length) {
                        let html = '';
                        html += getListUsers(data.data.users);
                        $(".users .list-users").html(html);

                        if (options) {
                            textHighlighting($(".users .list-users .search_field"), options);
                        }
                    } else {
                        console.log(data.data.errors);
                        $(".users .list-users").html("");
                        console.log($(".users .users-errors").html(data.data.errors));
                    }
                }
            });
        } else {
            $(".link[data-section=index]").trigger("click");
        }
    }

    // добавление-удаление стрелки сортировки
    $(".users").on("click", ".header-table-user .options-sort", function(){
        switch ($(this).attr("sort")) {
            case "not-active":
                $(".header-table-user .options-sort svg").remove();
                $(".header-table-user .options-sort").attr("sort", "not-active");
                $(this).append(gerSvg());
                $(this).attr("sort", "sort-desc");
                break;
            case "sort-desc":
                $(this).attr("sort", "sort-asc");
                break;
            case "sort-asc":
                $(this).attr("sort", "sort-desc");
                break;
        }
        getUsers();
    });

    // стрелка сортировки
    function gerSvg()
    {
        return `<svg class="arrow_sort_svg rotate-icon" width="15" height="15" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <g>
                        <path transform="rotate(90, 25, 25)" d="m20.01552,25.00001l29.19841,-24.50298l-19.22945,0l-29.19841,24.50298l29.19841,24.50296l19.22945,0l-29.19841,-24.50296z" 
                        fill-rule="evenodd" clip-rule="evenodd" fill="inherit"/>
                    </g>
                </svg>`;
    }

    // поиск пользователей
    $(".users").on("input", ".search_input", function(e){
        e.preventDefault();
        $(".users .search_div").css("border-color", "#1eafed");

        let string = $(this).val();
        if (string) {
            $(".users .search_div .search_cence_btn").removeClass("not-active");
            getUsers();
        } else {
            $(".users .search_div .search_cence_btn").addClass("not-active");
            $(".users .search_div").css("border-color", "#cacaca");
            getUsers();
        }
    });

    // очистка поиска
    $(".users").on("click", ".search_cence_btn", function(e){
        e.preventDefault();
        $(".users .search_div .search_cence_btn").addClass("not-active");
        $(".users .search_div .search_sumbit_btn").addClass("not-active");
        if ($(".users .search_div .search_input").val()) {
            $(".users .search_div .search_input").val("");
            getUsers();
        }
    });

    // формирование списка пользователей
    function getListUsers(arr_users)
    {
        let result = '';
        arr_users.forEach(user => {
            if (user.id != sessionStorage.getItem("id")) {
                result += `<tr data-id-user=${user.id}>
                            <th scope="row" class="search_field">${user.id}</th>
                            <td class="search_field">${user.name}</td>
                            <td class="search_field">${user.surname}</td>
                            <a href="" class="link link-account user-login-post" data-section="account" data-id-user="${user.id}"><td class="search_field">${user.login}</td></a>
                            <td class="search_field">${user.email}</td>
                            <td>${user.token ? `<div style="color: green">Active</div>` : `<div style="color: red">Not active</div>`}</td>
                            <td><a href="" class="btn btn-outline-warning px-4 temp-block" data-id-user=${user.id}>⏳ Block</a></td>
                            <td><a href="" class="btn btn-outline-danger px-4 permanent-block" data-id-user=${user.id}>📌 Block</a></td>
                            <td>${user.is_block ? `Заболкирован до ${user.block_time}<a href="" class="btn btn-outline-danger px-4 unlock" data-id-user=${user.id}>Разблокировать</a>` : `-`}</td>
                        </tr>`;
            }
        });
        return result;
    }

    // добавление формы временной блокировки
    $(".users").on("click", ".temp-block", function(e){
        e.preventDefault();
        $(`.list-users .temp-block-form`).remove();

        if (sessionStorage.getItem("role") == "Администратор") {
            $(`.list-users tr[data-id-user=${$(this).data("idUser")}]`).after(getFormTempBlock($(this).data("idUser")));
            $("#date-block").daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                timePicker: true,
                timePicker24Hour: true,
                minYear: 2023,
                maxYear: 2038,
                locale: {
                    format: 'DD.MM.YYYY HH:mm'
                }
            });
        } else {
            $(".link[data-section=index]").trigger("click");
        }
    });

    // форма временной блокировки
    function getFormTempBlock(id_user)
    {
        let result = `<tr class="temp-block-form">
                        <td colspan=9>
                            <form action="" class="bg-light p-5 contact-form" method="POST">
                                <div class="form-group">
                                    <label for="date-block">Дата временной блокировки</label>
                                    <input type="text" class="form-control block_time" id="date-block" name="block_time" required>
                                        <div class="invalid-feedback block_time-message"></div>
                                </div>
                                <div class="form-group">
                                    <a href class="btn btn-primary py-3 px-5 block-btn" data-id-user="${id_user}">Блокировать</a>
                                </div>
                                <a href="" class="cance-temp-block">Отмена</a>
                            </form>
                        </td>
                    </tr>`;
        return result;
    }

    // отмена формы временной блокировки
    $(".users").on("click", ".cance-temp-block", function(e){
        e.preventDefault();
        cleaningForm($(".users .temp-block-form form")[0]);
        $(".users .temp-block-form").remove();
    });

    //запрос временной блокировки
    $(".users").on("click", ".block-btn", function(e){
        e.preventDefault();

        $.ajax({
            url: "http://apiblogsite/api/admin/block/" + $(this).data("idUser"),
            method: 'patch',
            dataType: 'json',
            data: {
                    "block_time": $(".temp-block-form .contact-form .block_time").val()
            },
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            success: function(data){
                getUsers();
            },
            error: function (data) {
                let errors = data.responseJSON.error.errors;
                for (nameErrors in errors[0]) {
                    $(".users ." + nameErrors).addClass("is-invalid");
                    $(".users ." + nameErrors + "-message").html(errors[0][nameErrors].join("<br>"));
                }
            }
        });
    });

    // пермач
    $(".users").on("click", ".permanent-block", function(e){
        e.preventDefault();

        $.ajax({
            url: "http://apiblogsite/api/admin/block/" + $(this).data("idUser"),
            method: 'patch',
            dataType: 'json',
            data: {
                    "user_id": $(this).data("idUser"),
            },
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            success: function(data){
                getUsers();
            }
        });
    });

    // разблокировка
    $(".users").on("click", ".unlock", function(e){
        e.preventDefault(e);
        $.ajax({
            url: "http://apiblogsite/api/admin/unlock/" + $(this).data("idUser"),
            method: 'get',
            dataType: 'json',
            data: {"token": sessionStorage.getItem("token"),
                    "user_id": $(this).data("idUser")
            },
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            success: function(data){
                getUsers();
            }
        });
    });

    // аккаунт
    function getAccount(id_user)
    {
        $(".account .user-content").html("");
        $.ajax({
            url: "http://apiblogsite/api/users/user/" + id_user,
            method: 'get',
            dataType: 'json',
            success: function(data){
                $(".account .user-avatar").attr("src", `images/avatars/${data.data.user.avatar}?${(new Date).getTime()}`);
                $(".account .user-info .user-login").text(data.data.user.login);
                
                if (data.data.user.token) {
                    $(".account .activity-user .online-offline").text("в сети");
                    $(".account .activity-user .online-offline").addClass("active-user");
                    $(".account .activity-user .index-active").addClass("active-user");
                } else {
                    $(".account .activity-user .online-offline").text("оффлайн");
                    $(".account .activity-user .online-offline").removeClass("active-user");
                    $(".account .activity-user .index-active").removeClass("active-user");
                    $(".account .activity-user .last-time").removeClass("not-active");
                    $(".account .activity-user .last-time").text(` / последний раз был в сети ${(new Date(data.data.user.lifetime_token * 1000)).toLocaleDateString("ru", { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'})}`);
                }

                $(".account .activity-user .reg-date").text(` / на сайте с ${(new Date(data.data.user.register_at)).toLocaleDateString("ru", { day: 'numeric', month: 'numeric', year: 'numeric'})}`);
                $(".account .activity-user .count-posts").text(` / ${data.data.count_posts_user} постов`);

                $(".account .email-user span").text(` ${data.data.user.email}`);
                $(".account .user-content").data("idUser", data.data.user.id);

                if (data.data.user.id == sessionStorage.getItem("id")) {
                    $(".account .account-info .setting").html(`<a href="" class="editing-iconc link" title="Редактировать">🖍</a>
                    <a href="" class="setting-iconc link" title="Настройки">
                        <svg  class="setting-iconc" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                            <g>
                                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                            </g>
                        </svg>
                    </a>`);
                }


                let html = '';
                html = `<div class="pount-menu-navigation-account" name="posts">Посты</div>`;
                if (data.data.user.id == sessionStorage.getItem("id")) {
                    html += `<div class="pount-menu-navigation-account" name="like-post">Понравившиеся посты</div>`;
                }
                html += `<div class="pount-menu-navigation-account" name="data-user">Информация пользователя</div>`;
                $(".menu-navigation-account").html(html);
            }
        });
    }

    // перекключение меню в аккаунте
    $(".account").on("click", ".pount-menu-navigation-account", function(e) {
        switch ($(this).attr("name")) {
            case "posts":
                getPostsUser($(".user-content").data("idUser"));
                break;
            case "data-user":
                getInfoUser($(".user-content").data("idUser"));
                break;
            case "like-post":
                getLikePosts($(".user-content").data("idUser"));
                break;
        }
    });

    // получение постов пользователя
    function getPostsUser(user_id)
    {
        $.ajax({
            url: "http://apiblogsite/api/users/posts/" + user_id,
            method: 'get',
            dataType: 'json',
            success: function(data){
                let html = '';
                for (let post of data.data.posts) {
                    html += getMiniPost(post, true);
                }
                $(".account .user-content").html(html);
            }
        });
    }

    function getInfoUser(id_user)
    {
        $(".account .user-content").html('');
        $.ajax({
            url: "http://apiblogsite/api/users/user/" + id_user,
            method: 'get',
            dataType: 'json',
            success: function(data){
                let html = `<div class="user-all-info">
                                <div class="fio-user">
                                    <span class="text">Имя: ${data.data.user.name}</span>
                                    <span class="text">Фамилия: ${data.data.user.surname}</span>
                                    ${data.data.user.patronymic ? `<span class="text">Отчество: ${data.data.user.patronymic}</span>` : ''}
                                </div>
                                ${data.data.user.gender ? `<span class="text">Пол: ${data.data.user.gender}</span>` : ''}
                                <span class="text">E-mail: ${data.data.user.email}</span>
                                ${data.data.user.about_me ? `<span class="text">О себе: ${data.data.user.about_me}</span>` : ''}
                            </div>`;
                $(".account .user-content").html(html);
            }
        });
    }

    function getLikePosts(id_user)
    {
        $(".account .user-content").html('');
        $.ajax({
            url: "controllers/users_controllers/get_like_posts_user_controller.php",
            method: 'get',
            dataType: 'json',
            data: {"id": id_user},
            success: function(data){
                $(".account .user-content").html(data.data.posts);
            }
        });
    }

    // выход пользователя
    function exting()
    {
        $.ajax({
            url: "http://apiblogsite/api/users/logout",
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
              },
            method: 'get',
            dataType: 'json',
            success: function(){
                sessionStorage.clear();
                $(".link[data-section=index]").trigger("click");
            },
            error: function(){
                sessionStorage.clear();
                $(".link[data-section=index]").trigger("click");
            }
        });
    }
 
    // получение данных из формы
    function getDataForm(form)
    {
        let data = new FormData();

        for (let input of form) {
            if (input.type == "file") {
                if (input.files[0]) {
                    data.append(input.name, input.files[0]);
                } else {
                    data.append(input.name, []);
                }
            } else if (input.type == "checkbox") {
                data.append(input.name, input.checked);
            } else {
                data.append(input.name, input.value);
            }
        }

        if (sessionStorage.getItem("token")) {
            data.append("token", sessionStorage.getItem("token"));
        }
        
        return data;
    }

    // очистка формы
    function cleaningForm(form)
    {
        for (let input of form) {
            $(input).removeClass("is-invalid");
        }
        $(`.invalid-feedback`).html("");
    }

    // очистка всех форм
    function cleaningAllForm()
    {
        for (let form of $("form")) {
            for (let input of form) {
                $(input).val("");
                $(input).removeClass("is-invalid");
                if (input.type == "checkbox") {
                    input.checked = false;
                    $(input).removeClass("is-valid");
                }
            }
        }
        cleaningImage();
        $("form input .invalid-feedback").html("");
    }

    // очиства поля с изображением
    function cleaningImage()
    {
        $(".cancel_image").trigger("click");
    }

    // let timerId = setInterval(function() {
    //     if (sessionStorage.getItem("token")) {
    //         $.ajax({
    //             url: "controllers/users_controllers/update_lifetime_token_controller.php",
    //             method: 'get',
    //             dataType: 'json',
    //             data: {"token": sessionStorage.getItem("token")},
    //             error: function (data) {
    //                 exting();
    //             }
    //         });
    //     }
    // }, 60000);
});

$('#date-block').on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('DD.MM.YYYY HH:mm'))
});