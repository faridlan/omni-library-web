/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { UserBookResponse } from "@/types/api"
import axiosInstance from "@/api/axiosInstance"

export default function Dashboard() {
    const navigate = useNavigate()
    const token = localStorage.getItem("access_token")

    const [isbn, setIsbn] = useState("")
    const [loadingFetch, setLoadingFetch] = useState(false)
    const [myLibrary, setMyLibrary] = useState<UserBookResponse[]>([])
    const [loadingLibrary, setLoadingLibrary] = useState(true)

    useEffect(() => {
        if (!token) navigate("/auth")
    }, [token, navigate])

    // 1. GET LIBRARY
    const fetchMyLibrary = async () => {
        try {
            const response = await axiosInstance.get('/api/library/')
            setMyLibrary(response.data.data || [])
        } catch (err: any) {
            console.error("Gagal load library")
        } finally {
            setLoadingLibrary(false)
        }
    }

    useEffect(() => {
        if (token) fetchMyLibrary()
    }, [token])

    // 2. FETCH BOOK API
    const handleFetchBookAPI = async () => {
        if (!isbn) return toast.error("ISBN tidak boleh kosong")
        setLoadingFetch(true)
        try {
            await axiosInstance.post('/api/books/fetch', { isbn })
            toast.success(`Buku berhasil ditarik ke database!`)
            setIsbn("")
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        } finally {
            setLoadingFetch(false)
        }
    }

    if (!token) return null

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard & Rak Buku</h1>
            </div>

            {/* SEKSI: Fetch Buku API */}
            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Tarik Data Buku dari Google</CardTitle>
                    <CardDescription>Buku akan masuk ke Katalog Publik.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Input placeholder="Masukkan ISBN..." value={isbn} onChange={(e) => setIsbn(e.target.value)} />
                    <Button onClick={handleFetchBookAPI} disabled={loadingFetch || !isbn}>
                        {loadingFetch ? "Tarik..." : "Fetch"}
                    </Button>
                </CardContent>
            </Card>

            {/* SEKSI: Rak Buku User */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-slate-800">Rak Buku Saya</h2>
                {loadingLibrary ? (
                    <p className="text-slate-500">Memuat rak buku...</p>
                ) : myLibrary.length === 0 ? (
                    <div className="p-8 border-2 border-dashed rounded-lg text-center text-slate-500">
                        Rak bukumu masih kosong. Pergi ke Katalog dan tambahkan buku!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myLibrary.map((item) => (
                            <Card key={item.id} className="flex gap-4 p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                                <div className="w-24 h-32 bg-slate-200 shrink-0 rounded overflow-hidden">
                                    {item.book?.cover_url ? (
                                        <img src={item.book.cover_url} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-xs text-slate-400">No Cover</div>
                                    )}
                                </div>
                                <div className="flex flex-col grow justify-between">
                                    <div>
                                        <h3 className="font-bold line-clamp-1">{item.book?.title || "Buku Unknown"}</h3>
                                        <p className="text-xs text-slate-500 mt-1">Status: <span className="font-semibold text-blue-600">{item.status}</span></p>
                                        <p className="text-xs text-slate-500">Halaman: {item.current_page} / {item.book?.page_count}</p>
                                        <p className="text-xs text-slate-500">Rating: ⭐ {item.rating}</p>
                                    </div>
                                    <div className="flex mt-2">
                                        {/* PERHATIKAN: URL Dinamis menggunakan item.id (ID relasi user_book) */}
                                        <Link to={`/library/${item.id}`} className="w-full">
                                            <Button size="sm" variant="secondary" className="w-full text-xs">
                                                Lihat Detail & Catatan
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}