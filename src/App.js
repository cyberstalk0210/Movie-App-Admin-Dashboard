import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Movies from './components/Movies';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/movies" component={Movies} />
                <Route path="/" component={Login} />
            </Switch>
        </Router>
    );
}

export default App;