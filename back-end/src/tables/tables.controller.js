const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// middleware functions

function validateCreate(req, res, next) {
  if (req.body.data) {
    const table = req.body.data;

    if (table.table_name && table.capacity) {
      if (table.table_name.length > 1) {
        if (typeof table.capacity === "number" && table.capacity > 0) {
          res.locals.newTable = table;
          next();
        } else {
          next({
            status: 400,
            message: "capacity must be a number greater than zero.",
          });
        }
      } else {
        next({
          status: 400,
          message: "table_name must be 2 or more characters long.",
        });
      }
    } else {
      next({
        status: 400,
        message: "table_name or capacity is missing.",
      });
    }
  } else {
    next({
      status: 400,
      message: "No content in request body",
    });
  }
}

function checkRequest(req, res, next) {
  if (req.body.data && req.body.data.reservation_id) {
    next();
  } else {
    next({
      status: 400,
      message: "Request data missing or reservation_id was missing.",
    });
  }
}

async function checkReservation(req, res, next) {
  try {
    const resId = req.body.data.reservation_id;

    const reservation = await service.readReservation(resId);

    if (reservation) {
      if (
        reservation.status === "finished" ||
        reservation.status === "seated"
      ) {
        next({
          status: 400,
          message: `Reservation status of ${reservation.status} cannot be seated.`,
        });
      } else {
        res.locals.reservation = reservation;
        next();
      }
    } else {
      next({
        status: 404,
        message: `reservation_id ${resId} not found.`,
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function compareCapacity(req, res, next) {
  const tableId = req.params.table_id;

  const table = await service.read(tableId);
  const reservation = res.locals.reservation;

  if (table.capacity >= reservation.people) {
    res.locals.table = table;
    next();
  } else {
    next({
      status: 400,
      message: `${table.table_name} does not have enough capacity for ${reservation.people} people.`,
    });
  }
}

function checkOccupied(req, res, next) {
  if (res.locals.table.reservation_id === null) {
    next();
  } else {
    next({
      status: 400,
      message: `${res.locals.table.table_name} is currently occupied.`,
    });
  }
}

async function checkExists(req, res, next) {
  const id = req.params.table_id;

  const table = await service.read(id);

  if (table) {
    res.locals.table = table;
    next();
  } else {
    next({
      status: 404,
      message: `table_id ${id} does not exist.`,
    });
  }
}

function checkStatus(req, res, next) {
  const table = res.locals.table;

  if (table.reservation_id) {
    next();
  } else {
    next({
      status: 400,
      message: `table_id ${table.table_id} is not occupied.`,
    });
  }
}

// end of middleware functions

// controller functions

async function list(req, res) {
  const response = await service.list();

  res.json({ data: response });
}

async function create(req, res) {
  const table = res.locals.newTable;

  const response = await service.create(table);

  res.status(201).json({
    data: response[0],
  });
}

async function seat(req, res) {
  const resId = res.locals.reservation.reservation_id;
  const tableId = req.params.table_id;

  const response = await service.seat(resId, tableId);

  res.json({
    data: response,
  });
}

async function destroy(req, res) {
  const tableId = req.params.table_id;
  const resId = res.locals.table.reservation_id;

  const table = await service.delete(tableId, resId);

  res.status(200).json({
    data: table,
  });
}

// end of controller functions

module.exports = {
  create: [asyncErrorBoundary(validateCreate), asyncErrorBoundary(create)],
  delete: [
    asyncErrorBoundary(checkExists),
    asyncErrorBoundary(checkStatus),
    asyncErrorBoundary(destroy),
  ],
  list: asyncErrorBoundary(list),
  seat: [
    asyncErrorBoundary(checkRequest),
    asyncErrorBoundary(checkReservation),
    asyncErrorBoundary(compareCapacity),
    asyncErrorBoundary(checkOccupied),
    asyncErrorBoundary(seat),
  ],
};
