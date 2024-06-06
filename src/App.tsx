import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./component/login";
import Main from "./component/main";
import Zindex from "./component/zindex";
import "./App.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/main" element={<Main />} />
          <Route path="/zindex" element={<Zindex />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
