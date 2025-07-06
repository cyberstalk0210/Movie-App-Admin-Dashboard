import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Movies from "./components/Movies";
import VideoList from "./components/VideoList";
import CreateSeries from "./components/createSeries";
import Sidebar from "./components/SideBar"; // Assuming Sidebar is in the same components folder
// import VideoList from "./components/VideoList";

// ProtectedRoute component to check for token
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <div className="flex">
            <Sidebar userName="John Doe" /> {/* Replace with dynamic user name */}
            <div className="flex-1">
              <Component {...props} />
            </div>
          </div>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <ProtectedRoute path="/movies" component={Movies} />
        <ProtectedRoute path="/videolist" component={VideoList} />
        <ProtectedRoute path="/create/series" component={CreateSeries} />
        <Route path="/" component={Login} /> {/* Default route */}
      </Switch>
    </Router>
  );
}

export default App;