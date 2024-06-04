import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import ResForm from "../form/ResForm";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import TableForm from "../tables/TableForm";
import SeatForm from "../form/SeatForm";
import ReservationSearch from "../search/ReservationSearch";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations/new">
        <ResForm />
      </Route>
      <Route path="/search">
        <ReservationSearch />
      </Route>
      <Route path="/reservations/:id/edit">
        <ResForm />
      </Route>
      <Route path="/reservations/:id/seat">
        <SeatForm />
      </Route>
      <Route path="/tables/new">
        <TableForm />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={today()} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
