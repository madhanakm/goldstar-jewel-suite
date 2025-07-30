import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1>Page Not Found</h1></div>} />
    </Routes>
  </BrowserRouter>
);

export default App;