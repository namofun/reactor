import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";

import 'azure-devops-ui/Core/override.css';
import "@namofun/vssui-platform/Theme/Light.css";

import App from "./App";
import NotFound from "./NotFound";
import DatePickerTest from "./DatePickerTest";

ReactDOM.render(
  <BrowserRouter>
    <App>
      <Switch>
        <Route exact path="/date-picker" component={DatePickerTest} />
        <Route component={NotFound} />
      </Switch>
    </App>
  </BrowserRouter>,
  document.getElementById('react-root')
);
