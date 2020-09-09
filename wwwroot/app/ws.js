/*!
 * Created by Sergey Borisov on 09.09.2016.
 */

(function (app)
{
    (function (ws)
    {
        ws.buildSocketUrl = function (path)
        {
            var l = window.location;
            return (l.protocol === "https:" ? "wss://" : "ws://") + l.host + path;
        };

        ws.isSupported = function ()
        {
            return typeof window.WebSocket !== "undefined";
        };

        ws.createConnection = function (path)
        {
            var link = this.buildSocketUrl(path);

            return this.isSupported() ? new WebSocket(link) : null;
        };

    })(app.ws = app.ws || {});
})(window.app = window.app || {});

