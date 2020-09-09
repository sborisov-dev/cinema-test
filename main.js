/*!
 * Created by Sergey Borisov on 08.09.2016.
 */
"use strict";

const server = require('./app_start/server');
const routes = require('./routes');
const socketHandler = require('./routes/reservation');
const UserStore = require('./data/UserStore');
const TokenStore = require('./data/TokenStore');
const HallStore = require('./data/HallStore');
const SeanceStore = require('./data/SeanceStore');

let app = server.start(process.env.PORT || 8080);

app
    .useRequestLogger()
    .useStatic(__dirname + '/wwwroot')
    .useRouterAuth(/^\/api/i)
    .useRouter(routes)
    .useNotFound()
    .useWS('/reservation', socketHandler)
    .useStore(new UserStore())
    .useStore(new TokenStore({
        lifetime: 30,
        slidingExpiration: true
    }))
    .useStore(new HallStore())
    .useStore(new SeanceStore());

onCtxInit();

function onCtxInit()
{
    let userStore = app.getStore(UserStore),
        tokenStore = app.getStore(TokenStore),
        hallStore = app.getStore(HallStore),
        seanceStore = app.getStore(SeanceStore);

    userStore.createUser('tester', 'tester');
    userStore.createUser('tester2', 'tester2');
    let hall = hallStore.create();
    seanceStore.create(hall);
}