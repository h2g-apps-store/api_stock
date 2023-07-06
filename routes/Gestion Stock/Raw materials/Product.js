const express = require('express')
    , Controller = require('../../../controllers/Gestion Stock/Raw materials/Product')
    , { VerifyToken } = require('../../../middlewares/Functions')

    , router = express.Router()
    , controller = new Controller();

router
    .post("/product", VerifyToken, controller.create)
    .get("/product", VerifyToken, controller.get)
    .get("/product/:id", VerifyToken, controller.getByID)
    .patch("/product/:id", VerifyToken, controller.update)
    .delete("/product/:id", VerifyToken, controller.delete);

module.exports = router;