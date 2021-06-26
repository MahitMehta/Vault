import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

// Views
import DefaultHome from "./components/DefaultHome";
import Vault from "./components/Vault";
import SignUp from "./components/SignUp";
import LoginForm from "./components/LoginForm";
import PublicFileView from "./components/PublicFileView";

ReactDOM.render(
  <React.StrictMode>
      <Router>
        <Switch>
          <Route exact path="/" render={() => (
            <DefaultHome>
              <LoginForm />
            </DefaultHome>
          )}/>
          <Route exact path="/createAccount" render={() => (
            <DefaultHome>
              <SignUp />
            </DefaultHome>
          )}/>
          <Route exact path="/vault" component={Vault}/>
          <Route exact path="/public/getPublicObject/:userId" component={PublicFileView}/>
          <Redirect to="/" />
        </Switch>
      </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
