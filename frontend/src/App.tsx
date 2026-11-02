import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import Summary from './pages/Summary'
import Categories from './pages/Categories'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full flex justify-center bg-[var(--bg)] sm:py-6">
        <div className="w-full max-w-[430px] h-screen sm:h-[860px] bg-[var(--bg)] sm:rounded-[28px] sm:shadow-xl sm:border sm:border-[var(--border)] overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddExpense />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
