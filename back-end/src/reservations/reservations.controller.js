const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const P = require("pino");

/**
 * List handler for reservation resources
 */

// middleware functions

function isDate(req, res, next) {
  const date = new Date(req.body.data.reservation_date);

  if (!isNaN(date)) {
    next();
  } else {
    next({
      status: 400,
      message: "reservation_date is invalid.",
    });
  }
}

function isTime(req, res, next) {
  try {
    const time = req.body.data.reservation_time;

    const splitTime = time.split(":");

    if (
      splitTime[0] < "00" ||
      splitTime[0] > "23" ||
      splitTime[1] < "00" ||
      splitTime[1] > "59" ||
      splitTime[2] < "00" ||
      splitTime[2] > "59"
    ) {
      next({
        status: 400,
        message: "reservation_time is invalid.",
      });
    } else {
      next();
    }
  } catch (error) {
    next({
      status: 400,
      message: "reservation_time is invalid.",
    });
  }
}

async function checkExists(req, res, next) {
  const id = req.params.reservation_id;

  const found = await service.check(id);

  if (found) {
    res.locals.reservation = found;
    next();
  } else {
    next({
      status: 404,
      message: `Reservation with ID ${id} does not exist`,
    });
  }
}

function checkPeople(req, res, next) {
  const people = req.body.data.people;

  if (typeof people === "number" && people > 0) {
    next();
  } else {
    next({
      status: 400,
      message: "people must be a number greater than 0",
    });
  }
}

function checkWeekday(req, res, next) {
  const data = req.body.data;

  if (data.reservation_date) {
    const date = new Date(data.reservation_date + "T00:00:00");

    const day = date.getDay();

    if (day !== 2) {
      res.locals.date = date;
      res.locals.data = data;
      next();
    } else {
      next({
        status: 400,
        message: "We are closed on Tuesdays.",
      });
    }
  } else {
    next();
  }
}

function checkPast(req, res, next) {
  const now = Date.now();
  const date = res.locals.date;

  if (now > date) {
    next({
      status: 400,
      message: "Must be future date.",
    });
  } else {
    next();
  }
}

function checkTime(req, res, next) {
  const time = res.locals.data.reservation_time;

  if (time >= "10:30:00" && time <= "21:30:00") {
    next();
  } else {
    next({
      status: 400,
      message:
        "Invalid time for reservation. Reservation must be scheduled between 10:30 AM and 9:30 PM.",
    });
  }
}

function checkProperties(req, res, next) {
  if (req.body.data) {
    const properties = [
      "first_name",
      "last_name",
      "mobile_number",
      "people",
      "reservation_date",
      "reservation_time",
    ];

    const data = req.body.data;

    for (let property of properties) {
      if (!data[property]) {
        next({
          status: 400,
          message: `Missing '${property}' property.`,
        });
      }
    }

    next();
  } else {
    next({
      status: 400,
      message: "Please fill out the form.",
    });
  }
}

function validateStatus(req, res, next) {
  const valid = ["booked", "seated", "finished", "cancelled"];

  const { status } = req.body.data;

  if (valid.includes(status)) {
    next();
  } else {
    next({
      status: 400,
      message: `Status of ${status} is invalid.`,
    });
  }
}

function validateInitialStatus(req, res, next) {
  const { status } = req.body.data;

  if (status !== "finished" && status !== "seated") {
    next();
  } else {
    next({
      status: 400,
      message: `Initial status cannot be "${status}".`,
    });
  }
}

function checkCurrentStatus(req, res, next) {
  const reservation = res.locals.reservation;

  if (reservation.status !== "finished") {
    next();
  } else {
    next({
      status: 400,
      message:
        "Reservations with the current status of 'finished' cannot be modified.",
    });
  }
}

// end of middleware functions

// controller functions

async function list(req, res) {
  const date = req.query.date;
  const mobile = req.query.mobile_number;

  let reservations;

  if (date) {
    reservations = await service.read(date);
  } else if (mobile) {
    reservations = await service.search(mobile);
  } else {
    reservations = await service.list();
  }

  res.json({
    data: reservations,
  });
}

async function create(req, res) {
  const reservation = res.locals.data;

  const response = await service.create(reservation);

  res.status(201).json({
    data: response[0],
  });
}

async function update(req, res) {
  const reservation = res.locals.data;

  const id = req.params.reservation_id;

  const response = await service.update(reservation, id);

  res.status(200).json({
    data: response[0],
  });
}

async function updateStatus(req, res) {
  const status = req.body.data;

  const id = req.params.reservation_id;

  const response = await service.updateStatus(status, id);

  res.status(200).json({
    data: response[0],
  });
}

async function read(req, res) {
  const id = req.params.reservation_id;

  const reservation = await service.check(id);

  res.json({ data: reservation });
}

// end of controller functions

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [
    asyncErrorBoundary(checkProperties),
    asyncErrorBoundary(isDate),
    asyncErrorBoundary(isTime),
    asyncErrorBoundary(checkWeekday),
    asyncErrorBoundary(checkPast),
    asyncErrorBoundary(checkTime),
    asyncErrorBoundary(checkPeople),
    asyncErrorBoundary(validateInitialStatus),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(checkExists), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(checkExists),
    asyncErrorBoundary(checkProperties),
    asyncErrorBoundary(isDate),
    asyncErrorBoundary(isTime),
    asyncErrorBoundary(checkWeekday),
    asyncErrorBoundary(checkPast),
    asyncErrorBoundary(checkTime),
    asyncErrorBoundary(checkPeople),
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(checkExists),
    asyncErrorBoundary(validateStatus),
    asyncErrorBoundary(checkCurrentStatus),
    asyncErrorBoundary(updateStatus),
  ],
};
