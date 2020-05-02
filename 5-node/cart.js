const { ObjectID } = require('mongodb');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.transactionFailed) {
        req.session.transactionFailed = false;
        const failureMessage = 'Some games were already bought. We removed them from your cart.';
        res.render('cart', {cart: req.session.cart, failureMessage});
        return;
    }
    res.render('cart', {cart: req.session.cart, failureMessage: ''});
});

router.post('/add/:name', async (req, res) => {
    try {
        const game = await req.app.locals.gamesCollection.find({name: req.params.name}).toArray();
        if (game.length >= 1) {
            if (!req.session.cart) {
                req.session.cart = [];
            }
            const cart = req.session.cart;
            if (cart.every(item => item.name !== game[0].name)) {
                cart.push(game[0]);
            }
        }
        res.redirect(303, '/');
    }
    catch (error) {
        console.log(error);
    }
});

router.post('/remove/:name', (req, res) => {
    if (!req.session.cart) {
        res.redirect(303, '/');
        return;
    }
    req.session.cart = req.session.cart.filter(item => item.name !== req.params.name);
    res.redirect(303, '/');
});

router.post('/checkout', async (req, res) => {
    try {
        const cart = req.session.cart;
        if (!cart || cart.length === 0) {
            res.redirect(303, '/cart');
            return;
        }

        const gamesCol = req.app.locals.gamesCollection;
        const promises = req.session.cart.map(item => 
            gamesCol.deleteOne({_id: ObjectID(item._id)})
        );
        const results = await Promise.all(promises);
        if (results.some(result => result.deletedCount === 0)) {
            const deletedGames = cart
            .filter((item, index) => results[index].deletedCount !== 0)
            .map(item => { return {...item, _id: ObjectID(item._id)} });

            if (deletedGames.length > 0) {
                await gamesCol.insertMany(deletedGames);
            }

            req.session.cart = deletedGames;
            req.session.transactionFailed = true;
            res.redirect(303, '/cart');
        }
        else {
            req.session.boughtGames = req.session.cart;
            req.session.cart = []
            res.redirect(303, '/transaction/success');
        }
    }
    catch (error) {
        console.log(error);
    }
});

router.post('/clear', (req, res) => {
    req.session.cart = [];
    res.redirect(303, '/');
});

module.exports = router;
