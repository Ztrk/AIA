const express = require('express');
const session = require('express-session');

const gamesData = require('./games.json')
const DatabaseConnection = require('./database-connection.js');
const cartRouter = require('./cart.js');
const app = express();

app.set('view engine', 'ejs');

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} ${new Date()}`);
    next();
});

app.use('/cart', cartRouter);

app.get('/', async (req, res) => {
    try {
        const games = await req.app.locals.gamesCollection.find().toArray();
        res.render('index', {games});
    }
    catch (error) {
        console.log(error);
    }
});

app.get('/transaction/success', (req, res) => {
    res.render('transaction-success', {cart: req.session.boughtGames});
});

const connection = new DatabaseConnection('mongodb://localhost:27017', 'games-shop', 'games');

connection.connect().then(() => {
    app.locals.connection = connection;
    app.locals.gamesCollection = connection.collection;
    return connection.recreateData(gamesData);
}).then(() => app.listen(3000))
.then(() => console.log('Server running at http://localhost:3000/'))
.catch(console.log);
