import React from "react";

export default function ListReservations({
  reservations,
  cancelReservation,
  finishReservation,
}) {
  return reservations.map(
    (reservation) =>
      reservation.status !== "cancelled" && (
        <div className="reservation" key={reservation.reservation_id}>
          <h3>
            {`${reservation.first_name} ${reservation.last_name} - ${reservation.reservation_time}`}
          </h3>
          <h5>Party of {reservation.people}</h5>
          <h6>{reservation.mobile_number}</h6>
          <p data-reservation-id-status={reservation.reservation_id}>
            Status: {reservation.status}
          </p>
          {reservation.status === "booked" && (
            <button>
              <a href={`/reservations/${reservation.reservation_id}/seat`}>
                Seat
              </a>
            </button>
          )}
          {reservation.status === "seated" && (
            <button
              data-reservation-id-finish={reservation.reservation_id}
              onClick={() => finishReservation(reservation.reservation_id)}
            >
              Finish
            </button>
          )}
          <button>
            <a href={`/reservations/${reservation.reservation_id}/edit`}>
              Edit
            </a>
          </button>
          <button
            id="cancel"
            name="cancel"
            onClick={() => {
              cancelReservation(reservation.reservation_id);
            }}
            data-reservation-id-cancel={reservation.reservation_id}
          >
            Cancel
          </button>
        </div>
      )
  );
}
