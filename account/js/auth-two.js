$(document).ready(function () {
    $('#auth-confirm').on('click', function (e) {

        e.preventDefault();

        $('.help-block').text('').removeClass('rc');
        $('#auth-key').removeClass('is-invalid');

        if ($('#auth-key').val() == '') {
            $('#auth-key').addClass('is-invalid');
            return false;
        }

        $.ajax({
            type: "POST",
            url: createUrl('/account/auth-add'),
            cache: true,
            dataType: "json",
            data: $('#auth-form').serialize(),
            success: function (json) {
                if (json.status) {
                    document.location.href = createUrl('/account/security')
                }
                else {
                    if (json.message) {
                        $('.help-block').text(json.message).addClass('rc');
                    }
                }
            }
        });
    });

    $('#auth-check').on('click', function (e) {

        e.preventDefault();

        $('.help-block').text('').removeClass('rc');
        $('#auth-password').removeClass('is-invalid');

        if ($('#auth-password').val() == '') {
            $('#auth-password').addClass('is-invalid');
            return false;
        }

        $.ajax({
            type: "POST",
            url: createUrl('/account/auth-check'),
            cache: true,
            dataType: "json",
            data: {"auth-password": $('#auth-password').val()},
            success: function (json) {
                if (json.status) {
                    document.location.reload();
                }
                else {
                    if (json.message) {
                        $('.help-block').text(json.message).addClass('rc');
                    }
                }
            }
        });
    });

    $('#start-auth').on('click', function () {
        swapBlocks($('#ga-box'), $('#qr-box'));
    });
    $('#finish-auth').on('click', function () {
        swapBlocks($('#ga-box'), $('#dis-box'));
    });

    $(document).on('click', '#auth-disable', function (e) {

        e.preventDefault();

        $('.help-block').text('').removeClass('rc');
        $('#auth-key').removeClass('is-invalid');

        if ($('#auth-key').val() == '') {
            $('#auth-key').addClass('is-invalid');
            return false;
        }

        $.ajax({
            type: "POST",
            url: createUrl('/account/auth-disable'),
            cache: true,
            dataType: "json",
            data: $('#dis-auth-form').serialize(),
            success: function (json) {
                if (json.status) {
                    document.location.href = createUrl('/account/security')
                }
                else {
                    if (json.message) {
                        $('.help-block').text(json.message).addClass('rc');
                    }
                }
            }
        });
    });

    $(document).on('click', '#auth-secret', function () {

        var key = $(this).val();

        if (key === '') return;

        $(this).select();
        document.execCommand("Copy");
        alert('Copied: ' + key);
    });

});

function swapBlocks(hide, show) {
    hide.css({opacity: 1}).animate({opacity: .1}, 400,
        function () {
            hide.hide();
            show.css({display: 'block', opacity: .1}).animate({opacity: 1}, 300);
        });
}