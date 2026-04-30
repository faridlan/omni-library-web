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

    // State untuk Update Progres Buku
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [editStatus, setEditStatus] = useState("")
    const [editPage, setEditPage] = useState(0)
    const [editRating, setEditRating] = useState(0)

    // State untuk Tambah Catatan Baru
    const [newQuote, setNewQuote] = useState("")
    const [newPageRef, setNewPageRef] = useState<number>(0)
    const [newTags, setNewTags] = useState("")

    // ==========================================
    // STATE UNTUK EDIT CATATAN (NOTES)
    // ==========================================
    const [isEditNoteOpen, setIsEditNoteOpen] = useState(false)
    const [editNoteId, setEditNoteId] = useState("")
    const [editNoteQuote, setEditNoteQuote] = useState("")
    const [editNotePageRef, setEditNotePageRef] = useState<number>(0)
    const [editNoteTags, setEditNoteTags] = useState("")

    // State untuk konfirmasi hapus buku dari rak 
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const fetchData = async () => {
        try {
            const resDetail = await axiosInstance.get<SuccessResponse<UserBookResponse>>(`/api/library/${bookId}`)
            const libraryData = resDetail.data.data
            setData(libraryData)

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
            await axiosInstance.put(`/api/library/${bookId}`, {
                status: editStatus,
                current_page: editPage,
                rating: editRating
            })
            toast.success("Progres berhasil diperbarui!")
            setIsUpdateOpen(false)
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Gagal memperbarui progres")
        }
    }

    // --- FUNGSI CRUD CATATAN (NOTES) ---

    // 1. CREATE
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

    // 2. Persiapan UPDATE (Buka Modal)
    const openEditNoteDialog = (note: BookNoteResponse) => {
        setEditNoteId(note.id)
        setEditNoteQuote(note.quote)
        setEditNotePageRef(note.page_reference)
        setEditNoteTags(note.tags.join(", ")) // Array dikembalikan jadi string CSV
        setIsEditNoteOpen(true)
    }

    // 3. Eksekusi UPDATE (PUT)
    const handleUpdateNote = async () => {
        if (!editNoteQuote) return toast.error("Catatan tidak boleh kosong")
        const tagsArray = editNoteTags.split(",").map(t => t.trim()).filter(t => t !== "")

        try {
            await axiosInstance.put(`/api/library/${bookId}/notes/${editNoteId}`, {
                quote: editNoteQuote,
                page_reference: editNotePageRef,
                tags: tagsArray
            })
            toast.success("Catatan berhasil diperbarui")
            setIsEditNoteOpen(false)
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Gagal memperbarui catatan")
        }
    }

    // 4. DELETE
    const handleDeleteNote = async (noteId: string) => {
        // Konfirmasi standar agar tidak terhapus tak sengaja
        const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus catatan ini?")
        if (!isConfirmed) return

        try {
            await axiosInstance.delete(`/api/library/${bookId}/notes/${noteId}`)
            toast.success("Catatan berhasil dihapus")
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Gagal menghapus catatan")
        }
    }

    // 5. HAPUS BUKU DARI RAK
    const handleRemoveFromLibrary = async () => {
        try {
            await axiosInstance.delete(`/api/library/${bookId}`)
            toast.success("Buku berhasil dikeluarkan dari rak")
            navigate("/dashboard")
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Gagal menghapus buku dari rak")
        }
    }

    if (loading) return <div className="p-20 text-center">Menghubungkan ke perpustakaan pribadi...</div>
    if (!data) return null

    const progressPercentage = Math.round((data.current_page / data.book.page_count) * 100)

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>← Kembali ke Rak</Button>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* SISI KIRI: Info Buku & Metadata */}
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

                    {/* ========================================== */}
                    {/* TOMBOL HAPUS BUKU DARI RAK                 */}
                    {/* ========================================== */}
                    <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        Keluarkan dari Rak Pribadi
                    </Button>
                </div>

                {/* SISI KANAN: Konten Utama */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{data.book.title}</h1>
                            <p className="text-lg text-slate-600">{data.book.authors.join(", ")}</p>
                        </div>

                        {/* Dialog Update Progres Buku */}
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
                                                <SelectItem value="TO_READ">Belum Dibaca</SelectItem>
                                                <SelectItem value="READING">Sedang Dibaca</SelectItem>
                                                <SelectItem value="FINISHED">Selesai</SelectItem>
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

                        {/* TAB RINGKASAN */}
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

                        {/* TAB CATATAN */}
                        <TabsContent value="notes" className="space-y-6 pt-4">

                            {/* FORM TAMBAH CATATAN */}
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

                            {/* DAFTAR CATATAN */}
                            <div className="space-y-4">
                                {notes.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8 italic">Belum ada catatan. Mulailah menulis!</p>
                                ) : (
                                    notes.map(note => (
                                        <div key={note.id} className="p-5 border rounded-xl hover:bg-slate-50 transition-colors bg-white relative group">

                                            {/* Tombol Aksi (Hanya Muncul saat di-hover/mobile) */}
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openEditNoteDialog(note)}>
                                                    Edit
                                                </Button>
                                                {/* Variant 'destructive' bawaan shadcn akan memberikan warna merah peringatan */}
                                                <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDeleteNote(note.id)}>
                                                    Hapus
                                                </Button>
                                            </div>

                                            <p className="italic text-slate-800 text-lg pr-24">"{note.quote}"</p>
                                            <div className="flex justify-between items-center mt-4 text-xs text-slate-500 border-t pt-3">
                                                <span className="font-medium">📌 Halaman {note.page_reference}</span>
                                                <div className="flex gap-2">
                                                    {note.tags.map((tag, i) => (
                                                        <span key={i} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* ========================================== */}
            {/* DIALOG MODAL: EDIT CATATAN                 */}
            {/* ========================================== */}
            <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Catatan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Kutipan / Catatan</Label>
                            <textarea
                                className="w-full p-3 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                rows={4}
                                value={editNoteQuote}
                                onChange={(e) => setEditNoteQuote(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Halaman Referensi</Label>
                                <Input type="number" value={editNotePageRef} onChange={(e) => setEditNotePageRef(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <Input value={editNoteTags} onChange={(e) => setEditNoteTags(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditNoteOpen(false)}>Batal</Button>
                        <Button onClick={handleUpdateNote}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Peringatan Berbahaya!</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <p className="text-slate-700">
                            Apakah Anda yakin ingin mengeluarkan buku <strong>{data.book.title}</strong> dari rak?
                        </p>
                        <div className="bg-red-50 p-3 rounded-md border border-red-100">
                            <p className="text-sm text-red-800">
                                <strong>Tindakan ini permanen.</strong> Semua progres membaca, rating, dan catatan jurnal yang Anda buat untuk buku ini akan ikut terhapus dari database.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
                        <Button variant="destructive" onClick={handleRemoveFromLibrary}>Ya, Keluarkan Buku</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}