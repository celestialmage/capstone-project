import React, { useEffect, useState } from "react";
import { useLocation, useParams, useHistory } from "react-router-dom";
import {
  submitReservation,
  editReservation,
  readReservation,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import "./Form.css";

function ResForm() {
  const defaultForm = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
  };

  const navigate = useHistory();
  const parameters = useParams();
  const isNew = useLocation().pathname.includes("new");

  const [reservation, setReservation] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState(null);

  const handleChange = async ({ target }) => {
    if (target.name !== "people") {
      setFormData({
        ...formData,
        [target.name]: target.value,
      });
    } else {
      try {
        setFormData({
          ...formData,
          [target.name]: Number(target.value),
        });
      } catch (error) {
        throw error;
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (isNew) {
        await submitReservation(formData); // Send POST request
      } else {
        await editReservation(formData, parameters.id);
      }

      setError(null);
      navigate.push(`/dashboard?date=${formData.reservation_date}`);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    async function loadReservation(id) {
      const reservation = await readReservation(id);
      setReservation(reservation);
      setFormData(reservation);
    }

    if (!isNew) {
      loadReservation(parameters.id);
    }
  }, [isNew, parameters.id]);

  if (!formData) return <div>Loading...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="first_name">
          First Name
          <input
            name="first_name"
            id="first_name"
            value={formData.first_name}
            required
            onChange={handleChange}
            type="text"
          />
        </label>
        <label htmlFor="last_name">
          Last Name
          <input
            name="last_name"
            id="last_name"
            value={formData.last_name}
            required
            onChange={handleChange}
            type="text"
          />
        </label>
        <label htmlFor="mobile_number">
          Mobile Number
          <input
            name="mobile_number"
            id="mobile_number"
            value={formData.mobile_number}
            required
            type="text"
            onChange={handleChange}
          />
        </label>
        <label htmlFor="reservation_date">
          Date
          <input
            name="reservation_date"
            id="reservation_date"
            value={formData.reservation_date}
            type="date"
            required
            onChange={handleChange}
          />
        </label>
        <label htmlFor="reservation_time">
          Time
          <input
            name="reservation_time"
            id="reservation_time"
            type="time"
            value={formData.reservation_time}
            required
            onChange={handleChange}
          />
        </label>
        <label htmlFor="people">
          People
          <input
            name="people"
            id="people"
            type="number"
            value={formData.people}
            required
            onChange={handleChange}
          />
        </label>
        <hr />
        <button name="submit" type="submit">
          Submit
        </button>
        <button
          name="cancel"
          id="cancel"
          onClick={() =>
            reservation
              ? navigate.push(`/dashboard?date=${reservation.reservation_date}`)
              : navigate.push("/dashboard")
          }
        >
          Cancel
        </button>
      </form>
      {error && <ErrorAlert error={error} />}
    </div>
  );
}

export default ResForm;
