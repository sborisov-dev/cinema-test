/*!
 * Created by Sergey Borisov on 10.09.2016.
 */

(function (app)
{
    app.isIE = navigator.userAgent.indexOf(" MSIE ") > -1 || navigator.userAgent.indexOf(" Trident/") > -1;
    app.isEdge = navigator.userAgent.indexOf("Edge") > -1;

    app.getAccessToken = function ()
    {
        return localStorage.getItem("x-access-token") || null;
    };
    app.setAccessToken = function (value)
    {
        if (value === null || value === undefined)
            localStorage.removeItem("x-access-token");
        else
            localStorage.setItem("x-access-token", value);
    };
    app.getUserColor = function ()
    {
        return localStorage.getItem("user-color") || null;
    };
    app.setUserColor = function (value)
    {
        if (value === null || value === undefined)
            localStorage.removeItem("user-color");
        else
            localStorage.setItem("user-color", value);
    };
    app.getUsername = function ()
    {
        return localStorage.getItem("username") || null;
    };
    app.setUsername = function (value)
    {
        if (value === null || value === undefined)
            localStorage.removeItem("username");
        else
            localStorage.setItem("username", value);
    };

    app.getIsReserved = function ()
    {
        return localStorage.getItem("is-reserved") === "true";
    };
    app.setIsReserved = function (value)
    {
        if (value === null || value === undefined)
            localStorage.removeItem("is-reserved");
        else
            localStorage.setItem("is-reserved", value);
    };

    app.sendRequest = function (url, method, body, cb)
    {
        method = method || "GET";

        if (app.isIE || app.isEdge)
            url += (url.indexOf("?") > -1 ? "&" : "?") + Date.now();

        if (body && typeof body !== "string")
            body = JSON.stringify(body);

        var req = new XMLHttpRequest(),
            token = app.getAccessToken();

        req.onload = function (e)
        {
            let xhr = e.currentTarget,
                responseText = xhr.responseText;
            if (cb)
                cb(null, responseText, xhr);
        };

        req.onerror = function (e)
        {
            let xhr = e.currentTarget,
                responseText = xhr.responseText;
            if (cb)
                cb(new Error(xhr.statusText), responseText, xhr);
        };

        req.open(method, url);

        if (!!token)
            req.setRequestHeader('X-Access-Token', token);

        req.send(body);
    };

    app.initialize = function ()
    {
        this.account.check(this._initialize.bind(this));
    };

    app._initialize = function (err, responseText)
    {
        var res = JSON.parse(responseText);
        if (!res.isAuthenticated)
            this.account.signOut();

        this.isAuthenticated = !!res.isAuthenticated;
        this.pages.setContainer(document.querySelector('.page-container'));

        if (!this.isAuthenticated)

            this.pages.show('login');

        else
            this.pages.show(app.getIsReserved() ? 'reservations' : 'home');

    };

    app.doCheck = function ()
    {
        this._checkInterval = setInterval(function ()
        {
            app.account.check(this._onCheck.bind(this));
        }.bind(this), 5 * 60 * 1000);
    };

    app.stopCheck = function ()
    {
        if (this._checkInterval)
        {
            clearInterval(this._checkInterval);
            this._checkInterval = null;
        }
    };

    app._onCheck = function (err, responseText)
    {
        var res = JSON.parse(responseText);
        if (!res.isAuthenticated)
        {
            this.account.signOut();
            this.pages.show('login');
        }
    };

    document.addEventListener("DOMContentLoaded", function ()
    {
        app.initialize();
    });
})(window.app = window.app || {});