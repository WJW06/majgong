import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Main from './pages/Main';
import QuizSetting from './pages/QuizSetting';
import QuizPlay from './pages/QuizPlay';
import Ranking from './pages/Ranking';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/quiz/setting" element={<QuizSetting />} />
        <Route path="/quiz/play" element={<QuizPlay />} />
        <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
