import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function Navbar() {
    const navigate = useNavigate()
    const token = localStorage.getItem("access_token")

    const handleLogout = () => {
        localStorage.removeItem("access_token")
        navigate("/auth") // Tendang kembali ke halaman login
    }

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="font-bold text-xl text-slate-800">
                    <Link to="/">📚 OmniLibrary</Link>
                </div>

                <div className="flex gap-4 items-center">
                    <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        Katalog Publik
                    </Link>

                    {token ? (
                        <>
                            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                                Dashboard VIP
                            </Link>
                            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
                        </>
                    ) : (
                        <Link to="/auth">
                            <Button size="sm">Login / Register</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}