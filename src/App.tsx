import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Catalog from "@/pages/Catalog"
import Auth from "@/pages/Auth"
import Dashboard from "@/pages/Dashboard"
import Navbar from "./components/shared/navbar"
import { Toaster } from "@/components/ui/sonner"
import BookDetail from "./pages/BookDetail"
import LibraryBookDetail from "./pages/LibraryBookDetail"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {/* Navbar akan selalu muncul di setiap rute */}
        <Navbar />

        {/* Area konten yang berubah-ubah sesuai URL */}
        <main>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Jika ada yang iseng ngetik URL ngawur, arahkan ke Katalog */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/library/:bookId" element={<LibraryBookDetail />} />
          </Routes>
        </main>
        <Toaster richColors position="top-center" />
      </div>
    </Router>
  )
}

export default App