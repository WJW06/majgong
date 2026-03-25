import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import QuizSetting from './pages/QuizSetting';
import QuizPlay from './pages/QuizPlay';
import Ranking from './pages/Ranking';
import OAuth2Callback from './pages/OAuth2Callback';
import ProblemCreate from './pages/ProblemCreate';

function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main />} />
        <Route path="/quiz/setting" element={<QuizSetting />} />
        <Route path="/quiz/play" element={<QuizPlay />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/problem/create" element={<ProblemCreate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
