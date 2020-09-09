/*!
 * Created by Sergey Borisov on 10.09.2016.
 */

(function (app)
{
    (function (pages)
    {
        function RegisterPage()
        {
            this._container = null;
            this._loginForm = null;
            this._errorMsg = null;
            this._loginLink = null;
            this._onSubmit = this._onSubmit.bind(this);
            this._onRegister = this._onRegister.bind(this);
            this._onLoginClick = this._onLoginClick.bind(this);
        }

        RegisterPage.prototype.show = function (node)
        {
            this._container = node;
            this._render();
        };

        RegisterPage.prototype._render = function ()
        {
            var html = '<form class="register-form">' +
                '<h1>Регистрация</h1>' +
                '<input type="text" placeholder="Введите логин" class="input" required minlength="6"/>' +
                '<input type="password" placeholder="Введите пароль" class="input" required minlength="6"/>' +
                '<a data-show-page="login">Войти</a><br/> ' +
                '<input type="submit" class="btn btn-blue" value="Зарегистрироваться" /> ' +
                '<p class="error-message"></p>' +
                '</form>';
            this._container.innerHTML = html;
            this._loginForm = this._container.querySelector(".register-form");
            this._errorMsg = this._container.querySelector(".register-form .error-message");
            this._loginLink = this._container.querySelector(".register-form [data-show-page='login']");
            this._bindEvents();
            setTimeout(function ()
            {
                var text = document.querySelector('input[type="text"]');
                if (text)
                    text.focus();
            }, 100);
        };

        RegisterPage.prototype._bindEvents = function ()
        {
            this._loginForm.addEventListener("submit", this._onSubmit);
            this._loginLink.addEventListener("click", this._onLoginClick);
        };

        RegisterPage.prototype._unbindEvents = function ()
        {
            this._loginForm.removeEventListener("submit", this._onSubmit);
            this._loginLink.removeEventListener("click", this._onLoginClick);
        };

        RegisterPage.prototype._onSubmit = function (e)
        {
            var form = this._loginForm,
                login = form.querySelector('[type="text"]').value,
                password = form.querySelector('[type="password"]').value;

            app.account.signUp({
                login: login,
                password: password
            }, this._onRegister);

            e.stopPropagation();
            e.preventDefault();
            return false;
        };

        RegisterPage.prototype._onRegister = function (err, response)
        {
            if (err)
                return this.setMessage(response);

            var res = JSON.parse(response);
            if (res.errorMessage)
                return this.setMessage(res.errorMessage);
            if (res.token)
            {
                app.setAccessToken(res.token);
                app.setUserColor(res.color);
                app.setUsername(res.username);
                app.pages.show('home');
            }
        };

        RegisterPage.prototype._onLoginClick = function ()
        {
            app.pages.show('login');
        };

        RegisterPage.prototype.setMessage = function (message)
        {
            this._errorMsg.innerHTML = message;
            this._errorMsg.style.display = !!message ? "block" : "none";
        };

        RegisterPage.prototype.destroy = function ()
        {
            this._unbindEvents();
            this._loginForm = null;
            this._container = null;
            this._errorMsg = null;
            this._loginLink = null;
        };

        pages.addPage('register', RegisterPage);

    })(app.pages = app.pages || {});
})(window.app = window.app || {});