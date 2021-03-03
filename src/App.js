import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ContactPage from "./pages/ContactPage";
import VideoCallPage from "./pages/VideoCallPage/index";

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route component={VideoCallPage} path="/" exact />
          <Route component={ContactPage} path="/contact" />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
