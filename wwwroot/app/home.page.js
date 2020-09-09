/*!
 * Created by Sergey Borisov on 10.09.2016.
 */

(function (app)
{
    (function (pages)
    {
        function HomePage()
        {
            this._container = null;
            this._seanceId = 1;
            this._seance = null;
            this._apiUrl = '/api/seance/';
            this._wsPath = '/reservation';
            this._hallNode = null;
            this._signOutLink = null;
            this._reserveLink = null;
            this._index = {};
            this._socket = null;
            this._onHallClick = this._onHallClick.bind(this);
            this._onSeanceLoad = this._onSeanceLoad.bind(this);
            this._onSocketOpen = this._onSocketOpen.bind(this);
            this._onSocketClose = this._onSocketClose.bind(this);
            this._onSocketError = this._onSocketError.bind(this);
            this._onSocketMessage = this._onSocketMessage.bind(this);
            this._onSignOutClick = this._onSignOutClick.bind(this);
            this._onReserveClick = this._onReserveClick.bind(this);
        }

        HomePage.prototype.show = function (node)
        {
            if (app.getIsReserved())
                return app.pages.show('reservations');
            this._container = node;
            this._render();
        };

        HomePage.prototype._render = function ()
        {
            this.loadSeance();
            var color = app.getUserColor();
            var html = '<div class="home-page">' +
                '<h1>Welcome, ' +
                '<span style="color:' + color + ';">' + app.getUsername() + '</span>!' +
                '<a class="signOut" data-role="signout">Выйти</a>' +
                '</h1>' +
                '<div class="hall">' +
                //'<style>.home-page .hall-table td.my{background-color:' + app.getUserColor() + ';}</style>' +
                '<a class="btn btn-blue" data-role="reserve">Забронировать</a>' +
                '</div><br/>' +
                '<table class="hall-table"><tr><td class="place">Свободно</td><td class="place' +
                ' confirmed">Забронировано</td></tr></table>' +
                '</div>';
            this._container.innerHTML = html;
            this._hallNode = this._container.querySelector('.hall');
            this._signOutLink = this._container.querySelector('[data-role="signout"]');
            this._reserveLink = this._container.querySelector('[data-role="reserve"]');
            this._bindEvents();
        };

        HomePage.prototype._bindEvents = function ()
        {
            this._hallNode.addEventListener("click", this._onHallClick);
            this._signOutLink.addEventListener("click", this._onSignOutClick);
            this._reserveLink.addEventListener("click", this._onReserveClick);
        };

        HomePage.prototype._unbindEvents = function ()
        {
            if (this._hallNode)
                this._hallNode.removeEventListener("click", this._onHallClick);
            if (this._signOutLink)
                this._signOutLink.removeEventListener("click", this._onSignOutClick);
            if (this._reserveLink)
                this._reserveLink.removeEventListener("click", this._onReserveClick);
        };

        HomePage.prototype._onHallClick = function (e)
        {
            let id = e.target.id || "",
                cell = e.target;
            if (id.indexOf("place_") == 0)
            {
                var point = this.getCoord(cell.id);
                if (point)
                {
                    cell.classList.toggle("reserved");
                    if (cell.classList.contains('reserved'))
                        this.reserve(point.row, point.place);
                    else
                        this.unreserve(point.row, point.place);
                }
            }
        };

        HomePage.prototype._onSeanceLoad = function (err, responseText)
        {
            var res = JSON.parse(responseText);
            this._seance = res.seance;
            this.buildIndex();
            this.renderHall();
            this.createWSConnection();
        };

        HomePage.prototype._onSocketOpen = function (e)
        {
            console.log('[WS] Opened', e);
        };

        HomePage.prototype._onSocketClose = function (e)
        {
            console.log('[WS] Close', e);
        };

        HomePage.prototype._onSocketError = function (e)
        {
            console.log('[WS] Error', e);
        };

        HomePage.prototype._onSocketMessage = function (e)
        {
            var actions = JSON.parse(e.data);
            actions = Array.isArray(actions) ? actions : [actions];

            actions.forEach(function (x)
            {
                this.processAction(x);
            }, this)
        };

        HomePage.prototype._onSignOutClick = function ()
        {
            app.account.signOut();
            app.pages.show('login');
        };

        HomePage.prototype._onReserveClick = function ()
        {
            this.sendAction('confirm');
        };

        HomePage.prototype.createWSConnection = function ()
        {
            var socket = app.ws.createConnection(this._wsPath);
            socket.onopen = this._onSocketOpen;
            socket.onclose = this._onSocketClose;
            socket.onerror = this._onSocketError;
            socket.onmessage = this._onSocketMessage;
            this._socket = socket;
        };

        HomePage.prototype.loadSeance = function ()
        {
            app.sendRequest(this._apiUrl + this._seanceId, undefined, undefined, this._onSeanceLoad);
        };

        HomePage.prototype.buildIndex = function ()
        {
            this._index = {};
            let its = this._seance.reservations;
            for (var i = 0, l = its.length; i < l; i++)
            {
                var it = its[i];
                var id = this.getCellId(it.row, it.place);
                this._index[id] = it;
            }
        };

        HomePage.prototype.renderHall = function ()
        {
            var hall = this._seance.hall,
                title = hall.name,
                struct = hall.structure;

            var head = document.createElement("h2"),
                table = document.createElement("table");
            head.innerHTML = title;
            table.className = "hall-table";

            table.appendChild(this.createFirstRow(struct[0].length));
            for (var i = 0, n = struct.length; i < n; i++)
            {
                var row = document.createElement("tr"),
                    rowStruct = struct[i];

                for (var j = 0, m = rowStruct.length; j < m; j++)
                {
                    if (j == 0)
                        row.appendChild(this.createTextCell(struct.length - (i), "left-num"));

                    var cell;
                    if (rowStruct[j])
                        cell = this.createPlaceCell(i, j, struct.length);
                    else
                        cell = this.createTextCell();
                    row.appendChild(cell);
                }

                table.appendChild(row);
            }
            this._hallNode.appendChild(head);
            this._hallNode.appendChild(table);
        };

        HomePage.prototype.createFirstRow = function (n)
        {
            var row = document.createElement("tr");
            for (var i = 0; i <= n; i++)
                row.appendChild(this.createTextCell(i, !!i ? "top-num" : null));
            return row;
        };

        HomePage.prototype.createPlaceCell = function (i, j, rowCount)
        {
            var cell = this.createTextCell(null, "place");
            cell.id = this.getCellId(i, j);
            cell.title = "Ряд: " + (rowCount - i) + " Место:" + (j + 1);
            this.styleCell(cell);

            return cell;
        };

        HomePage.prototype.createTextCell = function (text, className)
        {
            var cell = document.createElement("td");
            cell.innerHTML = text || "&nbsp;";
            if (className)
                cell.classList.add(className);
            return cell;
        };

        HomePage.prototype.getCellId = function (i, j)
        {
            return "place_" + i + "_" + j;
        };

        HomePage.prototype.getCoord = function (id)
        {
            var its = id.split("_"),
                row = parseInt(its[1], 10),
                place = parseInt(its[2], 10);

            if (isNaN(row) || isNaN(place))
                return null;
            return {
                row: row,
                place: place
            };
        };

        HomePage.prototype.getCell = function (i, j)
        {
            var id = this.getCellId(i, j);
            return document.getElementById(id);
        };

        HomePage.prototype.styleCell = function (cell)
        {
            if (!cell)
                return;

            var reserveInfo = this._index[cell.id];

            if (reserveInfo)
                cell.classList.add("reserved");
            else
                cell.classList.remove("reserved");

            if (reserveInfo && reserveInfo.confirmed)
                cell.classList.add("confirmed");
            else
                cell.classList.remove("confirmed");

            cell.style.backgroundColor = reserveInfo ? reserveInfo.color : null;
        };

        HomePage.prototype.reserve = function (row, place)
        {
            this.sendAction('reserve', {row: row, place: place});
        };

        HomePage.prototype.unreserve = function (row, place)
        {
            this.sendAction('unreserve', {row: row, place: place});
        };

        HomePage.prototype.confirm = function ()
        {
            this.sendAction('confirm');
        };

        HomePage.prototype.sendAction = function (action, data)
        {
            var cmd = {
                type: action,
                accessToken: app.getAccessToken(),
                data: data
            };
            this._socket.send(JSON.stringify([cmd]));
        };

        HomePage.prototype.processAction = function (action)
        {
            var data = action.data || {};
            switch (action.type)
            {
                case 'reserve':
                    this.addReserve(data);
                    this.buildIndex();
                    this.styleCell(this.getCell(data.row, data.place));
                    break;

                case 'unreserve':
                    this.removeReserve(data);
                    this.buildIndex();
                    this.styleCell(this.getCell(data.row, data.place));
                    break;

                case 'confirmsuccess':
                    app.pages.show('reservations');
                    app.setIsReserved(true);
                    break;

                case 'confirmed':
                    data.forEach(function (x)
                    {
                        this.removeReserve(x);
                        this.addReserve(x);
                    }, this);
                    this.buildIndex();
                    data.forEach(function (x)
                    {
                        this.styleCell(this.getCell(x.row, x.place));
                    }, this);
                    break;
            }
        };

        HomePage.prototype.addReserve = function (data)
        {
            this._seance.reservations.push(data);
        };

        HomePage.prototype.removeReserve = function (data)
        {
            var its = this._seance.reservations,
                idx = -1;
            for (var i = 0; i < its.length; i++)
            {
                var it = its[i];
                if (it.row === data.row && it.place == data.place)
                {
                    idx = i;
                    break;
                }
            }
            if (idx > -1)
                its.splice(idx, 1);
        };

        HomePage.prototype.destroy = function ()
        {
            this._unbindEvents();
            this._container = null;
            this._seance = null;
            this._hallNode = null;
            this._signOutLink = null;
            this._reserveLink = null;
            this._index = null;
            if (this._socket)
                this._socket.close();
            this._socket = null;
        };

        pages.addPage('home', HomePage);

    })(app.pages = app.pages || {});
})(window.app = window.app || {});