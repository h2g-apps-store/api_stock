const express = require('express')
    , Controller = require('../../../controllers/Configuration/Auth/User')
    , { VerifyToken } = require('../../../middlewares/Functions')

    , router = express.Router()
    , controller = new Controller();

router
    .post("/login", controller.login)
    .post("/user", VerifyToken, controller.create)
    .get("/user", VerifyToken, controller.get)
    .get("/user/:id", VerifyToken, controller.getByID)
    .patch("/user/:id", VerifyToken, controller.update)
    .patch("/user/:id/role", VerifyToken, controller.update)
    .patch("/user/:id/password", VerifyToken, controller.updatePassword)
    .patch("/user/:id/reset", VerifyToken, controller.resetPassword)
    .patch("/user/:id/toggle", VerifyToken, controller.toggle)
    .delete("/user/:id", VerifyToken, controller.delete);

module.exports = router;