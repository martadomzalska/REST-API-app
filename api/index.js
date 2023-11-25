const express = require("express");
const router = express.Router();
const ctrlTask = require("../controller");

router.get("/contacts", ctrlTask.get);

router.get("/contacts/:id", ctrlTask.getById);

router.post("/contacts", ctrlTask.create);

router.put("/contacts/:id", ctrlTask.update);

router.patch("/contacts/:id/favorite", ctrlTask.updateFavorite);

router.delete("/contacts/:id", ctrlTask.remove);

router.post('/users/signup', ctrlTask.register);

router.post("/users/login", ctrlTask.login);

router.get("/users/logout", ctrlTask.auth, ctrlTask.logout);

router.get("/users/current", ctrlTask.auth, ctrlTask.listUser);


module.exports = router;
