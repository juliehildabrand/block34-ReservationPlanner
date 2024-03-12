const {client, createTables, createCustomer, createRestaurant, fetchCustomers, fetchRestaurants, createReservation, fetchReservations, destroyReservation} = require('./db');

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
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const reservations = await Promise.all([
    createReservation({ customer_id: chandler.id, restaurant_id: moondancediner.id, dinner_date: '03/14/2024' }),
    createReservation({ customer_id: ross.id, restaurant_id: alessandros.id, dinner_date: '03/14/2024' }),
    createReservation({ customer_id: joey.id, restaurant_id: centralperk.id, dinner_date: '03/14/2024' }),
  ]);
  

  await destroyReservation(reservations[0]);

  console.log(await fetchReservations());
}

init();