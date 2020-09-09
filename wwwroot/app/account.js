/*!
 * Created by Sergey Borisov on 10.09.2016.
 */

(function (app)
{
    (function (account)
    {

        account.signIn = function (params, cb)
        {
            app.sendRequest('/account/signin', "POST", params, cb);
        };

        account.signUp = function (params, cb)
        {
            app.sendRequest('/account/signup', "POST", params, cb);
        };

        account.signOut = function (cb)
        {
            var token = app.getAccessToken();
            app.setAccessToken(null);
            app.setUsername(null);
            app.setUserColor(null);
            app.isAuthenticated = false;
            if (token)
                app.sendRequest('/account/signout', "POST", {token: token}, cb);
            else if (cb)
                cb();
        };

        account.check = function (cb)
        {
            var token = app.getAccessToken();
            if (!token)
                return cb && cb(null, JSON.stringify({isAuthenticated: false}));
            app.sendRequest('/account/check', "POST", {token: token}, cb);
        }

    })(app.account = app.account || {});
})(window.app = window.app || {});