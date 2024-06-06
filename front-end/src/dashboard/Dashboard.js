import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  listReservations,
  listTables,
  finishReservation,
  adjustStatus,
} from "../utils/api";
import { previous, next } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import ErrorAlert from "../layout/ErrorAlert";
import ListReservations from "../layout/ListReservations";
import ListTables from "../layout/ListTables";
import "./Dashboard.css";

function Dashboard({ date }) {
  const [formData, setFormData] = useState(date);
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [update, setUpdate] = useState(true);
  const navigate = useHistory();
  const query = useQuery();
  const param = query.get("date");

  if (param) {
    date = param;
  }

  async function cancelReservation(id) {
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      await adjustStatus(id, "cancelled");
      setUpdate(!update);
    }
  }

  async function finishReservationButton(id) {
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      try {
        const resTable = tables.find((table) => table.reservation_id === id);
        await finishReservation(resTable.table_id);
        setUpdate(!update);
      } catch (error) {
        setError(error);
      }
    }
  }

  const nextDay = (target) => {
    navigate.push(`/dashboard?date=${next(formData)}`);
  };

  const previousDay = (target) => {
    navigate.push(`/dashboard?date=${previous(formData)}`);
  };

  const handleChange = async ({ target }) => {
    setFormData(target.value);
    navigate.push(`/dashboard?date=${target.value}`);
  };

  useEffect(() => {
    async function loadDashboard() {
      const abortController = new AbortController();
      setError(null);

      try {
        const reservations = await listReservations(
          { date },
          abortController.signal
        );
        const tables = await listTables();

        setReservations(reservations);
        setTables(tables);
      } catch (error) {
        setError(error);
      }
      return () => abortController.abort();
    }

    setFormData(date);
    loadDashboard();
  }, [date, update]);

  return (
    <main>
      <h1>Dashboard</h1>

      <hr />

      <div className="group">
        <div className="item item-large">
          <h3>Reservations for date {date}</h3>
          <div>
            {" "}
            <button onClick={previousDay}>Previous</button>
            <input
              id="date"
              name="date"
              type="date"
              onChange={handleChange}
              value={formData}
            ></input>
            <button onClick={nextDay}>Next</button>
          </div>
          <ErrorAlert error={error} />

          {!reservations.length && (
            <h4>No reservations found for this date.</h4>
          )}
          {reservations.length > 0 && (
            <div>
              <ListReservations
                reservations={reservations}
                cancelReservation={cancelReservation}
                finishReservationButton={finishReservationButton}
              />
            </div>
          )}
        </div>

        <hr />

        {tables.length > 0 && (
          <div className="item tables">
            <h3>Tables</h3>
            <ListTables
              tables={tables}
              finishReservationButton={finishReservationButton}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
