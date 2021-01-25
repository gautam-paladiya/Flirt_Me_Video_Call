import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ContactPage from "./pages/ContactPage";
import VideoPage from "./pages/VideoPage";

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route component={VideoPage} path="/" exact />
          <Route component={ContactPage} path="/contact" />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
