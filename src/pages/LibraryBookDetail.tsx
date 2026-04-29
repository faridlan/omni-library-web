/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axiosInstance from "@/api/axiosInstance"
import type { UserBookResponse, BookNoteResponse, SuccessResponse } from "@/types/api"

export default function LibraryBookDetail() {
    const { bookId } = useParams<{ bookId: string }>() // Ini adalah user_book_id
    const navigate = useNavigate()

    const [data, setData] = useState<UserBookResponse | null>(null)
    const [notes, setNotes] = useState<BookNoteResponse[]>([])
    const [loading, setLoading] = useState(true)

    // State untuk Update Progres
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [editStatus, setEditStatus] = useState("")
    const [editPage, setEditPage] = useState(0)
    const [editRating, setEditRating] = useState(0)

    // State untuk Tambah Catatan Baru
    const [newQuote, setNewQuote] = useState("")
    const [newPageRef, setNewPageRef] = useState<number>(0)
    const [newTags, setNewTags] = useState("")

    const fetchData = async () => {
        try {
            const resDetail = await axiosInstance.get<SuccessResponse<UserBookResponse>>(`/api/library/${bookId}`)
            const libraryData = resDetail.data.data
            setData(libraryData)

            // Set default value untuk form update
            setEditStatus(libraryData.status)
            setEditPage(libraryData.current_page)
            setEditRating(libraryData.rating)

            const resNotes = await axiosInstance.get(`/api/library/${bookId}/notes`)
            setNotes(resNotes.data.data || [])
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Gagal memuat data")
            navigate("/dashboard")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (bookId) fetchData()
    }, [bookId])

    const handleUpdateProgress = async () => {
        try {
            // Kita gunakan bookId (user_book_id) sesuai endpoint API
            await axiosInstance.put(`/api/library/${bookId}`, {
                status: editStatus,
                current_page: editPage,
                rating: editRating
            })
            toast.success("Progres berhasil diperbarui!")
            setIsUpdateOpen(false)
            fetchData() // Refresh data
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Gagal memperbarui progres")
        }
    }

    const handleAddNote = async () => {
        if (!newQuote) return toast.error("Catatan tidak boleh kosong")
        const tagsArray = newTags.split(",").map(t => t.trim()).filter(t => t !== "")

        try {
            await axiosInstance.post(`/api/library/${bookId}/notes`, {
                quote: newQuote,
                page_reference: newPageRef,
                tags: tagsArray
            })
            toast.success("Catatan ditambahkan")
            setNewQuote("")
            setNewTags("")
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Gagal menyimpan")
        }
    }

    if (loading) return <div className="p-20 text-center">Menghubungkan ke perpustakaan pribadi...</div>
    if (!data) return null

    const progressPercentage = Math.round((data.current_page / data.book.page_count) * 100)

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>← Kembali ke Rak</Button>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* SISI KIRI: Info Buku & Metadata (1 Kolom) */}
                <div className="lg:col-span-1 space-y-6">
                    <img
                        src={data.book.cover_url}
                        alt={data.book.title}
                        className="w-full rounded-lg shadow-xl aspect-[2/3] object-cover"
                    />

                    <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200">
                        <div className="space-y-1">
                            <Label className="text-slate-500 text-xs uppercase">ISBN</Label>
                            <p className="text-sm font-medium">{data.book.isbn || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-500 text-xs uppercase">Tahun Terbit</Label>
                            <p className="text-sm font-medium">{new Date(data.book.published_date).getFullYear() || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-500 text-xs uppercase">Total Halaman</Label>
                            <p className="text-sm font-medium">{data.book.page_count} Halaman</p>
                        </div>
                    </div>
                </div>

                {/* SISI KANAN: Konten Utama (3 Kolom) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{data.book.title}</h1>
                            <p className="text-lg text-slate-600">{data.book.authors.join(", ")}</p>
                        </div>

                        {/* Dialog Update Progres */}
                        <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full md:w-auto">Update Progres</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Update Progres Membaca</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={editStatus} onValueChange={setEditStatus}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UNREAD">Belum Dibaca</SelectItem>
                                                <SelectItem value="READING">Sedang Dibaca</SelectItem>
                                                <SelectItem value="COMPLETED">Selesai</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Halaman Saat Ini</Label>
                                        <Input type="number" value={editPage} onChange={(e) => setEditPage(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rating Pribadi (1-5)</Label>
                                        <Input type="number" min="0" max="5" value={editRating} onChange={(e) => setEditRating(Number(e.target.value))} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleUpdateProgress}>Simpan Perubahan</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                            <TabsTrigger value="notes">Catatan ({notes.length})</TabsTrigger>
                        </TabsList>

                        {/* TAB RINGKASAN: Sinopsis & Statistik */}
                        <TabsContent value="overview" className="space-y-6 pt-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Statistik Saya</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span>{data.status} — {data.current_page} / {data.book.page_count} Halaman</span>
                                            <span>{progressPercentage}%</span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-3" />
                                    </div>
                                    <p className="text-sm">Rating Anda: ⭐ <strong>{data.rating}/5</strong></p>
                                </CardContent>
                            </Card>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold">Sinopsis</h3>
                                <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-line">
                                    {data.book.description || "Tidak ada deskripsi tersedia."}
                                </p>
                            </div>
                        </TabsContent>

                        {/* TAB CATATAN: Sama seperti sebelumnya */}
                        <TabsContent value="notes" className="space-y-6 pt-4">
                            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 shadow-sm">
                                <h3 className="font-bold text-sm">Tulis Jurnal Membaca</h3>
                                <textarea
                                    className="w-full p-3 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Bagian mana yang paling berkesan hari ini?"
                                    rows={3}
                                    value={newQuote}
                                    onChange={(e) => setNewQuote(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Halaman Referensi</Label>
                                        <Input type="number" value={newPageRef} onChange={(e) => setNewPageRef(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tags (Koma sebagai pemisah)</Label>
                                        <Input placeholder="Penting, Inspiratif" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                                    </div>
                                </div>
                                <Button className="w-full" onClick={handleAddNote}>Simpan ke Jurnal</Button>
                            </div>

                            <div className="space-y-4">
                                {notes.map(note => (
                                    <div key={note.id} className="p-5 border rounded-xl hover:bg-slate-50 transition-colors bg-white">
                                        <p className="italic text-slate-800 text-lg">"{note.quote}"</p>
                                        <div className="flex justify-between items-center mt-4 text-xs text-slate-500 border-t pt-3">
                                            <span className="font-medium">📌 Halaman {note.page_reference}</span>
                                            <div className="flex gap-2">
                                                {note.tags.map((tag, i) => (
                                                    <span key={i} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}