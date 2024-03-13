const {client, createTables, createCustomer, createRestaurant, fetchCustomers, fetchRestaurants, createReservation, fetchReservations, destroyReservation} = require('./db');

const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/api/customers', async(req, res, next)=> {
  try{
    res.send(await fetchCustomers());
  }
  catch(error){
    next(error);
  }
});

app.get('/api/restaurants', async(req, res, next)=> {
  try{
    res.send(await fetchRestaurants());
  }
  catch(error){
    next(error);
  }
});

app.get('/api/reservations', async(req, res, next)=> {
  try{
    res.send(await fetchReservations());
  }
  catch(error){
    next(error);
  }
});

app.delete('/api/customers/:customerId/reservations/:id', async(req, res, next)=> {
  try{
    await destroyReservation({ id: req.params.id, customer_id: req.params.customerId});
    res.sendStatus(204);
  }
  catch(error){
    next(error);
  }
});

app.post('/api/customers/:id/reservations', async(req, res, next)=> {
  try {
    res.status(201).send(await createReservation({ customer_id: req.params.id, restaurant_id: req.body.restaurant_id, dinner_date: req.body.dinner_date}));
  }
  catch(error){
    next(error);
  }
});

app.use((err, req, res, next)=> {
  res.status(err.status || 500).send({error: err.message || err});
});

const init = async ()=> {
  console.log('connecting to the database');
  await client.connect();
  console.log('connected to the database');
  createTables();
  console.log('tables created');
  const [chandler, ross, joey, alessandros, centralperk, moondancediner] = await Promise.all([
    createCustomer({ name: "chandler"}),
    createCustomer({ name: "ross"}),
    createCustomer({ name: "joey"}),
    createRestaurant({ name: "alessandros"}),
    createRestaurant({ name: "central perk"}),
    createRestaurant({ name: "moondance diner"})
  ]);
  // console.log(await fetchCustomers());
  // console.log(await fetchRestaurants());

  const reservations = await Promise.all([
    createReservation({ customer_id: chandler.id, restaurant_id: moondancediner.id, dinner_date: '03/14/2024' }),
    createReservation({ customer_id: ross.id, restaurant_id: alessandros.id, dinner_date: '03/14/2024' }),
    createReservation({ customer_id: joey.id, restaurant_id: centralperk.id, dinner_date: '03/14/2024' }),
  ]);
  
  await destroyReservation(reservations[0]);

  // console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> {
    console.log(`listening on port ${port}`)
    //use curl to test out the app via console.logs
    console.log(`curl localhost:${port}/api/customers`);
    console.log(`curl localhost:${port}/api/restaurants`);
    console.log(`curl localhost:${port}/api/reservations`);
    console.log(`curl -X DELETE localhost:${port}/api/customers/${chandler.id}/reservations/${reservations[0].id}`);
    console.log(`curl -X POST localhost:${port}/api/customers/${chandler.id}/reservations -d '{"dinner_date": "03/15/2024", "restaurant_id": "${alessandros.id}"}' -H "Content-Type:application/json"`);
  });

}

init();