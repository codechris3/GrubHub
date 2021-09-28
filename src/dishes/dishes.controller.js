const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function propertiesPresent(propertyName) {
  return (req, res, next) => {
    const { data = {} } = req.body;
    const value = data[propertyName];
    if (value) {
      return next();
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

const namePropertyPresent = propertiesPresent("name");
const descriptionPropertyPresent = propertiesPresent("description");
const imagePropertyPresent = propertiesPresent("image_url");

function pricePropertyPresent(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (Number.isInteger(price) && price > 0) {
    return next();
  }
  next({
    status: 400,
    message: `Dish must have a price that is an integer greater than 0`,
  });
}

// function pricePropertyPresent (req, res, next){
//       const { data: { price } = {} } = req.body;
//       if (!price || price <= 0 || Number.isNaN(price) ){
//             next({status: 400, message: "Dish must have a price that is an integer greater than 0"})
//       }
//   next()
// }

function dishIdExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish does not exist: ${dishId}` });
}

function foundDishIdMatch(req, res, next) {
  const dishId = req.params.dishId;
  const { id } = req.body.data;

  if (!id || id === dishId) {
    next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

//list
function list(req, res, next) {
  res.json({ data: dishes });
}

//create
function create(req, res, next) {
  const dish = req.body.data;
  dish.id = nextId();
  dishes.push(dish);
  res.status(201).json({ data: dish });
}

//read
function read(req, res, next) {
  const { dish } = res.locals;

  res.json({ data: dish });
}

//update
function update(req, res, next) {
  const { dishId } = req.params;
  const { dish } = res.locals;
  let { data: { id, name, description, price, image_url } = {} } = req.body;
  if (!id) {
    id = dishId;
  }
  if (id !== dishId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${dishId}`,
    });
  }
  res.json({ data: { id, name, description, price, image_url } });
}

// // destroy
// function destroy(req, res) {
//   const index = dishes.findIndex((dish) => dish.id === res.locals.dish);
//   dishes.splice(index, 1);
//   res.sendStatus(204);
// }

module.exports = {
  list,
  read: [dishIdExists, read],

  create: [
    namePropertyPresent,
    descriptionPropertyPresent,
    pricePropertyPresent,
    imagePropertyPresent,
    create,
  ],

  update: [
    dishIdExists,
    foundDishIdMatch,
    namePropertyPresent,
    descriptionPropertyPresent,
    pricePropertyPresent,
    imagePropertyPresent,
    update,
  ],
  //   delete: [dishIdExists, destroy],
};
