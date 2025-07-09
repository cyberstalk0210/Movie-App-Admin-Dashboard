import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Login from "./components/Login";
import Movies from "./components/Movies";
import VideoList from "./components/VideoList";
import CreateSeries from "./components/createSeries";
import UsersTable from "./components/UserTable";
import ProtectedRoute from "./routes/ProtectedRoute";
import Sidebar from "./components/SideBar";
import Register from "./components/Register";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        <Route path="/">
          <Sidebar />
          <Switch>
            <ProtectedRoute path="/movies" component={Movies} />
            <ProtectedRoute path="/videolist" component={VideoList} />
            <ProtectedRoute path="/create/series" component={CreateSeries} />
            <ProtectedRoute path="/user-table" component={UsersTable} />
            <Redirect to="/login" />
          </Switch>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
