const express = require('express')
    , Controller = require('../../../controllers/Gestion Stock/Fournisseur/Fournisseur')
    , { VerifyToken } = require('../../../middlewares/Functions')

    , router = express.Router()
    , controller = new Controller();

router
    .post("/fournisseur", VerifyToken, controller.create)
    .get("/fournisseur", VerifyToken, controller.get)
    .get("/fournisseur/:id", VerifyToken, controller.getByID)
    .patch("/fournisseur/:id", VerifyToken, controller.update)
    .delete("/fournisseur/:id", VerifyToken, controller.delete);

module.exports = router;