const express = require('express')
    , Controller = require('../../../controllers/Gestion Stock/Raw materials/EntreeStock')
    , { VerifyToken } = require('../../../middlewares/Functions')

    , router = express.Router()
    , controller = new Controller();

router
    .post("/entreeStock", VerifyToken, controller.create)
    .get("/entreeStock", VerifyToken, controller.get)
    .get("/entreeStock/:id", VerifyToken, controller.getByID)
    .patch("/entreeStock/:id", VerifyToken, controller.update)
    .delete("/entreeStock/:id", VerifyToken, controller.delete);

module.exports = router;