import { HashRouter, Route, Routes } from 'react-router-dom';
import CaseIntro from './pages/CaseIntro';
import CaseList from './pages/CaseList';
import CaseRoute from './pages/CaseRoute';
import NotFound from './pages/NotFound';
import Play from './pages/Play';
import Report from './pages/Report';
import Result from './pages/Result';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CaseList />} />
        <Route path="/case/:caseId" element={<CaseRoute page={CaseIntro} />} />
        <Route path="/case/:caseId/play" element={<CaseRoute page={Play} />} />
        <Route path="/case/:caseId/report" element={<CaseRoute page={Report} />} />
        <Route path="/case/:caseId/result" element={<CaseRoute page={Result} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
