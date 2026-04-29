/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "@/api/axiosInstance"
import type { Book, SuccessResponse } from "@/types/api"

export default function BookDetail() {
    // Menangkap :id dari URL (/book/:id)
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [book, setBook] = useState<Book | null>(null)
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem("access_token")

    useEffect(() => {
        const fetchBookDetail = async () => {
            try {
                // AXIOS otomatis mengubah JSON ke tipe SuccessResponse<Book>
                const response = await axiosInstance.get<SuccessResponse<Book>>(`/api/books/${id}`)
                setBook(response.data.data)
            } catch (err: any) {
                toast.error(err.response?.data?.error || "Gagal memuat detail buku")
                navigate("/") // Tendang kembali ke katalog jika buku tidak ditemukan (404)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchBookDetail()
    }, [id, navigate])

    const handleAddToLibrary = async () => {
        if (!token) return toast.error("Silakan login terlebih dahulu untuk menyimpan ke rak!")

        try {
            await axiosInstance.post('/api/library/', { book_id: id })
            toast.success("Buku berhasil ditambahkan ke rak!")
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        }
    }

    if (loading) return <div className="p-20 text-center text-slate-500">Memuat detail buku...</div>
    if (!book) return null

    // Format tanggal menjadi tahun agar lebih enak dibaca
    const publishYear = new Date(book.published_date).getFullYear()

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-6">
            {/* Tombol Kembali */}
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                ← Kembali
            </Button>

            <Card className="overflow-hidden border-none shadow-none bg-transparent">
                <CardContent className="p-0 flex flex-col md:flex-row gap-8">

                    {/* KOLOM KIRI: Cover & Aksi */}
                    <div className="w-full md:w-1/3 space-y-6 shrink-0">
                        <div className="aspect-[2/3] bg-slate-200 rounded-lg overflow-hidden shadow-md">
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    Tidak Ada Cover
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {token ? (
                                <Button className="w-full text-md h-12" onClick={handleAddToLibrary}>
                                    Simpan ke Rak Saya
                                </Button>
                            ) : (
                                <Link to="/auth">
                                    <Button variant="outline" className="w-full text-md h-12">
                                        Login untuk Menyimpan
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* KOLOM KANAN: Informasi Detail */}
                    <div className="w-full md:w-2/3 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
                                {book.title}
                            </h1>
                            <p className="text-lg text-slate-600 font-medium">
                                Oleh: <span className="text-slate-900">{book.authors?.join(", ")}</span>
                            </p>
                        </div>

                        {/* Metadata Buku */}
                        <div className="flex flex-wrap gap-4 py-4 border-y border-slate-200">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Tahun Terbit</p>
                                <p className="font-semibold text-slate-800">{publishYear || "-"}</p>
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Halaman</p>
                                <p className="font-semibold text-slate-800">{book.page_count}</p>
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">ISBN</p>
                                <p className="font-semibold text-slate-800">{book.isbn || "Tidak ada"}</p>
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">Sinopsis</h3>
                            <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-line">
                                {book.description || "Tidak ada deskripsi tersedia untuk buku ini."}
                            </p>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}