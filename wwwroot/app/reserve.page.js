/*!
 * Created by Sergey Borisov on 10.09.2016.
 */

(function (app)
{
    (function (pages)
    {
        function ReservePage()
        {
            this._container = null;
            this._reserve = null;
            this._apiUrl = '/api/reserve';
            this._signOutLink = null;
            this._onReserveLoad = this._onReserveLoad.bind(this);
            this._onSignOutClick = this._onSignOutClick.bind(this);
        }

        ReservePage.prototype.show = function (node)
        {
            this._container = node;
            this._render();
            this.loadReserve();
        };

        ReservePage.prototype._render = function ()
        {
            var color = app.getUserColor();
            var html = '<div class="home-page">' +
                '<h1>Welcome, ' +
                '<span style="color:' + color + ';">' + app.getUsername() + '</span>!' +
                '<a class="signOut" data-role="signout">Выйти</a>' +
                '</h1>' +
                '<div class="hall">' +
                '<p>Ваши забронированные места:</p><br/>' +
                '</div>' +
                '</div>';
            this._container.innerHTML = html;
            this._hallNode = this._container.querySelector('.hall');
            this._signOutLink = this._container.querySelector('[data-role="signout"]');
            this._reserveLink = this._container.querySelector('[data-role="reserve"]');
            this._bindEvents();
        };

        ReservePage.prototype._bindEvents = function ()
        {
            this._signOutLink.addEventListener("click", this._onSignOutClick);
        };

        ReservePage.prototype._unbindEvents = function ()
        {
            this._signOutLink.removeEventListener("click", this._onSignOutClick);
        };

        ReservePage.prototype._onReserveLoad = function (err, responseText)
        {
            var res = JSON.parse(responseText);
            this._reserve = res.its || [];
            if (!this._reserve.length)
            {
                app.setIsReserved(null);
                app.pages.show('home');
            }
            else
            {
                this._renderReservation();
            }
        };

        ReservePage.prototype._onSignOutClick = function ()
        {
            app.account.signOut();
            app.pages.show('login');
        };

        ReservePage.prototype._renderReservation = function ()
        {
            var html = this._reserve.map(function (x)
            {
                return "<li> Ряд: " + (9 - x.row) + " Место:" + (x.place + 1) + "</li>";
            }).join('');

            this._container.querySelector('.hall').innerHTML += '<ol>' + html + '</ol>';
        };

        ReservePage.prototype.loadReserve = function ()
        {
            app.sendRequest(this._apiUrl, undefined, undefined, this._onReserveLoad);
        };

        ReservePage.prototype.destroy = function ()
        {
            this._unbindEvents();
            this._container = null;
            this._signOutLink = null;
            this._reserve = null;
        };

        pages.addPage('reservations', ReservePage);

    })(app.pages = app.pages || {});
})(window.app = window.app || {});