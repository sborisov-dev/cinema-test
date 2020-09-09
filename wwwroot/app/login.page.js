/*!
 * Created by Sergey Borisov on 10.09.2016.
 */

(function (app)
{
    (function (pages)
    {
        function LoginPage()
        {
            this._container = null;
            this._loginForm = null;
            this._errorMsg = null;
            this._registerLink = null;
            this._onSubmit = this._onSubmit.bind(this);
            this._onLogin = this._onLogin.bind(this);
            this._onRegisterClick = this._onRegisterClick.bind(this);
        }

        LoginPage.prototype.show = function (node)
        {
            this._container = node;
            this._render();
        };

        LoginPage.prototype._render = function ()
        {
            var html = '<form class="login-form">' +
                '<h1>Вход в систему</h1>' +
                '<input type="text" placeholder="Введите логин" class="input" required minlength="6"/>' +
                '<input type="password" placeholder="Введите пароль" class="input" required minlength="6"/>' +
                '<a data-show-page="register">Зарегистрироваться</a><br/> ' +
                '<input type="submit" class="btn btn-blue" value="Войти" /> ' +
                '<p class="error-message"></p>' +
                '</form>';
            this._container.innerHTML = html;
            this._loginForm = this._container.querySelector(".login-form");
            this._errorMsg = this._container.querySelector(".login-form .error-message");
            this._registerLink = this._container.querySelector(".login-form [data-show-page='register']");
            this._bindEvents();
            setTimeout(function ()
            {
                var text = document.querySelector('input[type="text"]');
                if (text)
                    text.focus();
            }, 100);
        };

        LoginPage.prototype._bindEvents = function ()
        {
            this._loginForm.addEventListener("submit", this._onSubmit);
            this._registerLink.addEventListener("click", this._onRegisterClick);
        };

        LoginPage.prototype._unbindEvents = function ()
        {
            this._loginForm.removeEventListener("submit", this._onSubmit);
            this._registerLink.removeEventListener("click", this._onRegisterClick);
        };

        LoginPage.prototype._onSubmit = function (e)
        {
            var form = this._loginForm,
                login = form.querySelector('[type="text"]').value,
                password = form.querySelector('[type="password"]').value;

            app.account.signIn({
                login: login,
                password: password
            }, this._onLogin);

            e.stopPropagation();
            e.preventDefault();
            return false;
        };

        LoginPage.prototype._onLogin = function (err, response)
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

        LoginPage.prototype._onRegisterClick = function ()
        {
            app.pages.show('register');
        };

        LoginPage.prototype.setMessage = function (message)
        {
            this._errorMsg.innerHTML = message;
            this._errorMsg.style.display = !!message ? "block" : "none";
        };

        LoginPage.prototype.destroy = function ()
        {
            this._unbindEvents();
            this._loginForm = null;
            this._container = null;
            this._errorMsg = null;
            this._registerLink = null;
        };

        pages.addPage('login', LoginPage);

    })(app.pages = app.pages || {});
})(window.app = window.app || {});