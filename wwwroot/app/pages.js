/*!
 * Created by Sergey Borisov on 10.09.2016.
 */

(function (app)
{
    (function (pages)
    {
        pages._pages = {};
        pages._currentPage = null;

        pages.setContainer = function (node)
        {
            pages._container = node;
        };

        pages.show = function (id)
        {
            var Page = this._pages[id];
            if (this._currentPage)
            {
                this._currentPage.destroy();
                this._currentPage = null;
            }
            this._currentPage = new Page();
            this._currentPage.show(this._container);

            if (id !== 'login' && id !== 'register')
                app.doCheck();
            else
                app.stopCheck();
        };

        pages.addPage = function (id, component)
        {
            this._pages[id] = component;
        }
    })(app.pages = app.pages || {});
})(window.app = window.app || {});