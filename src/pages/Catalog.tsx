/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/api/axiosInstance" // Import Axios Instance
import type { Book, PaginatedResponse } from "@/types/api"
import { Link } from "react-router-dom"

export default function Catalog() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)

    const token = localStorage.getItem("access_token")

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // AXIOS: URL lebih singkat, tidak perlu manual .json()
                const response = await axiosInstance.get<PaginatedResponse<Book>>('/api/books')
                setBooks(response.data.data || [])
            } catch (err: any) {
                console.error("Gagal load buku:", err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchBooks()
    }, [])

    const handleAddToLibrary = async (bookId: string) => {
        if (!token) return toast.error("Silakan login terlebih dahulu!")

        try {
            // AXIOS: Tidak perlu lagi menulis Header Authorization! Satpam yang urus.
            await axiosInstance.post('/api/library/', { book_id: bookId })
            toast.success("Buku berhasil ditambahkan ke rak!")
        } catch (err: any) {
            // AXIOS Error Handling: Ambil pesan error asli dari Golang-mu
            const errorMessage = err.response?.data?.error || err.message
            toast.error(errorMessage)
        }
    }

    if (loading) return <div className="p-10 text-center">Memuat katalog...</div>

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Katalog Buku Publik</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                    <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                        <Link to={`/book/${book.id}`} className="block">
                            <div className="h-48 bg-slate-200 w-full shrink-0">
                                {book.cover_url ? (
                                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">No Cover</div>
                                )}
                            </div>
                            <CardHeader className="p-4 pb-2 grow hover:text-blue-600 transition-colors">
                                <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                                <CardDescription className="text-sm">{book.authors?.join(", ")}</CardDescription>
                            </CardHeader>
                        </Link>

                        <CardContent className="p-4 pt-0">
                            <p className="text-xs text-slate-500 mt-2">ISBN: {book.isbn || "N/A"}</p>
                        </CardContent>

                        {token && (
                            <CardFooter className="p-4 pt-0">
                                <Button variant="secondary" className="w-full" onClick={() => handleAddToLibrary(book.id)}>
                                    Simpan ke Rak
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}