/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */

const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

export async function submitReservation(reservation) {
  const abortController = new AbortController();
  const url = new URL(`${API_BASE_URL}/reservations`);

  const request = {
    method: "POST",
    headers,
    signal: abortController.signal,
    body: JSON.stringify({ data: reservation }),
  };

  return await fetchJson(url, request, []);
}

export async function editReservation(reservation, id) {
  const abortController = new AbortController();
  const url = new URL(`${API_BASE_URL}/reservations/${id}`);

  const request = {
    method: "PUT",
    headers,
    signal: abortController.signal,
    body: JSON.stringify({ data: reservation }),
  };

  console.log(request);

  return await fetchJson(url, request, []);
}

export async function finishReservation(id) {
  const abortController = new AbortController();
  const url = new URL(`${API_BASE_URL}/tables/${id}/seat`);

  const request = {
    method: "DELETE",
    headers,
    signal: abortController.signal,
  };

  console.log("deleting...");

  return await fetchJson(url, request, []);
}

export async function seatReservation(tableId, resId) {
  const abortController = new AbortController();
  const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`);

  const request = {
    method: "PUT",
    headers,
    signal: abortController.signal,
    body: JSON.stringify({ data: { reservation_id: resId } }),
  };

  return await fetchJson(url, request, []);
}

export async function adjustStatus(id, status) {
  const request = {
    headers,
  };
  const abortController = new AbortController();
  const url = new URL(`${API_BASE_URL}/reservations/${id}/status`);
  request.method = "PUT";
  request.body = JSON.stringify({ data: { status } });
  request.signal = abortController.signal;

  return await fetchJson(url, request, []);
}

export async function readReservation(id) {
  const request = {
    headers,
  };
  const abortController = new AbortController();
  const url = new URL(`${API_BASE_URL}/reservations/${id}`);

  request.method = "GET";
  request.signal = abortController.signal;

  return await fetchJson(url, request, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

export async function listTables() {
  const request = {
    headers,
  };
  const abortController = new AbortController();
  const url = new URL(`${API_BASE_URL}/tables`);
  request.method = "GET";
  request.signal = abortController.signal;

  return await fetchJson(url, request, []);
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}
