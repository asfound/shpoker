import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import GamePage from '@/pages/GamePage';
import SettleUp from '@/pages/SettleUp';

function App() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-6">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/game/:gameId/settle" element={<SettleUp />} />
      </Routes>
    </div>
  );
}

export default App;
