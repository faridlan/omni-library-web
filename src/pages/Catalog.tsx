/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/api/config"
import type { Book, PaginatedResponse } from "@/types/api"
import { toast } from "sonner"

export default function Catalog() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)

    // Cek apakah user sedang login
    const token = localStorage.getItem("access_token")

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`${API_URL}/api/books`)
                if (!response.ok) throw new Error("Gagal mengambil data")
                const result: PaginatedResponse<Book> = await response.json()
                setBooks(result.data || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchBooks()
    }, [])

    // Fungsi POST ke /api/library/
    const handleAddToLibrary = async (bookId: string) => {
        if (!token) {
            toast.error("Silakan login terlebih dahulu!") // Pengganti alert
            return
        }

        try {
            const response = await fetch(`${API_URL}/api/library/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ book_id: bookId })
            })
            const result = await response.json()

            if (!response.ok) throw new Error(result.error)

            // Pengganti alert sukses
            toast.success("Buku berhasil ditambahkan ke rak!")
        } catch (err: any) {
            // Pengganti alert error
            toast.error(err.message)
        }
    }

    if (loading) return <div className="p-10 text-center">Memuat katalog...</div>

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Katalog Buku Publik</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                    <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-slate-200 w-full shrink-0">
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">No Cover</div>
                            )}
                        </div>
                        <CardHeader className="p-4 pb-2 grow">
                            <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                            <CardDescription className="text-sm">{book.authors?.join(", ")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-xs text-slate-500 mt-2">ISBN: {book.isbn || "N/A"}</p>
                        </CardContent>

                        {/* Tampilkan tombol HANYA jika sudah login */}
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