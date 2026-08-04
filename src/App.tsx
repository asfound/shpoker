import { Route, Routes } from 'react-router-dom';
import GamePage from '@/pages/GamePage';
import Home from '@/pages/Home';
import SettleUp from '@/pages/SettleUp';

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/game/:gameId/settle" element={<SettleUp />} />
      </Routes>
    </div>
  );
}

export default App;
