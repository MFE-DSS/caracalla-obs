import { BrowserRouter, Routes, Route } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { AuditEntryPage } from './pages/AuditEntryPage';
import { SummaryPage } from './pages/SummaryPage';
import { PremiumPage } from './pages/PremiumPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentCancelPage } from './pages/PaymentCancelPage';
import { SharedReportPage } from './pages/SharedReportPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/audit/new" element={<AuditEntryPage />} />
        <Route path="/audit/:auditId/summary" element={<SummaryPage />} />
        <Route path="/audit/:auditId/premium" element={<PremiumPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        <Route path="/share/:token" element={<SharedReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}
