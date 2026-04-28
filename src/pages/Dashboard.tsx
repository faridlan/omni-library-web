/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BookNoteResponse, UserBookResponse } from "@/types/api"
import axiosInstance from "@/api/axiosInstance"

export default function Dashboard() {
    const navigate = useNavigate()
    const token = localStorage.getItem("access_token")

    const [isbn, setIsbn] = useState("")
    const [loadingFetch, setLoadingFetch] = useState(false)
    const [myLibrary, setMyLibrary] = useState<UserBookResponse[]>([])
    const [loadingLibrary, setLoadingLibrary] = useState(true)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editBookId, setEditBookId] = useState("")
    const [editStatus, setEditStatus] = useState("UNREAD")
    const [editPage, setEditPage] = useState<number>(0)
    const [editRating, setEditRating] = useState<number>(0)

    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
    const [activeUserBookId, setActiveUserBookId] = useState("")
    const [activeBookTitle, setActiveBookTitle] = useState("")
    const [notes, setNotes] = useState<BookNoteResponse[]>([])
    const [loadingNotes, setLoadingNotes] = useState(false)

    const [newQuote, setNewQuote] = useState("")
    const [newPageRef, setNewPageRef] = useState<number>(0)
    const [newTags, setNewTags] = useState("")

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

    // 3. UPDATE PROGRESS
    const openEditDialog = (item: UserBookResponse) => {
        setEditBookId(item.book_id)
        setEditStatus(item.status)
        setEditPage(item.current_page)
        setEditRating(item.rating)
        setIsDialogOpen(true)
    }

    const handleSaveProgress = async () => {
        try {
            await axiosInstance.put(`/api/library/${editBookId}`, {
                status: editStatus,
                current_page: editPage,
                rating: editRating
            })
            toast.success("Progress bacaan berhasil di-update!")
            setIsDialogOpen(false)
            fetchMyLibrary()
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        }
    }

    // 4. FETCH NOTES
    const openNoteDialog = async (userBookId: string, bookTitle: string) => {
        setActiveUserBookId(userBookId)
        setActiveBookTitle(bookTitle)
        setIsNoteDialogOpen(true)
        setLoadingNotes(true)
        try {
            const response = await axiosInstance.get(`/api/library/${userBookId}/notes`)
            setNotes(response.data.data || [])
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Gagal memuat catatan")
        } finally {
            setLoadingNotes(false)
        }
    }

    // 5. POST NOTE
    const handleAddNote = async () => {
        if (!newQuote) return toast.error("Kutipan catatan tidak boleh kosong")
        const tagsArray = newTags.split(",").map(tag => tag.trim()).filter(tag => tag !== "")

        try {
            await axiosInstance.post(`/api/library/${activeUserBookId}/notes`, {
                quote: newQuote,
                page_reference: newPageRef,
                tags: tagsArray
            })
            toast.success("Catatan berhasil disimpan!")
            setNewQuote("")
            setNewPageRef(0)
            setNewTags("")
            openNoteDialog(activeUserBookId, activeBookTitle)
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
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
                            <Card key={item.id} className="flex gap-4 p-4 border-l-4 border-l-blue-500">
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
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            size="sm" variant="outline" className="text-xs"
                                            onClick={() => openEditDialog(item)}
                                        >
                                            Progress
                                        </Button>
                                        {/* PERHATIKAN: Sekarang mengirimkan item.id */}
                                        <Button
                                            size="sm" variant="secondary" className="text-xs"
                                            onClick={() => openNoteDialog(item.id, item.book?.title || "Buku")}
                                        >
                                            📝 Catatan
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* ========================================== */}
            {/* KOMPONEN MODAL PROGRESS                    */}
            {/* ========================================== */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-106.25">
                    <DialogHeader>
                        <DialogTitle>Update Progress Bacaan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status Membaca</Label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UNREAD">Unread (Belum Dibaca)</SelectItem>
                                    <SelectItem value="READING">Reading (Sedang Dibaca)</SelectItem>
                                    <SelectItem value="COMPLETED">Completed (Selesai)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Berada di Halaman Berapa?</Label>
                            <Input
                                type="number"
                                value={editPage}
                                onChange={(e) => setEditPage(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Beri Rating (1 - 5)</Label>
                            <Input
                                type="number"
                                min="0" max="5"
                                value={editRating}
                                onChange={(e) => setEditRating(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveProgress}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ========================================== */}
            {/* KOMPONEN MODAL NOTES                       */}
            {/* ========================================== */}
            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogContent className="sm:max-w-150 max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Catatan: {activeBookTitle}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
                        {loadingNotes ? (
                            <p className="text-sm text-slate-500">Memuat catatan...</p>
                        ) : notes.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">Belum ada catatan untuk buku ini.</p>
                        ) : (
                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <div key={note.id} className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                                        <p className="text-sm text-slate-800 italic">"{note.quote}"</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs font-semibold text-slate-500">Hal: {note.page_reference}</span>
                                            <div className="flex gap-1">
                                                {note.tags?.map((tag, idx) => (
                                                    <span key={idx} className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <hr className="my-4" />

                        {/* Form Tambah Catatan Baru */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Tambah Catatan Baru</h4>
                            <div className="space-y-1">
                                <Label className="text-xs">Kutipan / Catatan</Label>
                                <textarea
                                    className="w-full text-sm flex min-h-20 rounded-md border border-slate-200 bg-white px-3 py-2"
                                    placeholder="Tulis insight menarik dari buku ini..."
                                    value={newQuote}
                                    onChange={(e) => setNewQuote(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Halaman</Label>
                                    <Input type="number" value={newPageRef} onChange={(e) => setNewPageRef(Number(e.target.value))} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Tags (Pisahkan dgn koma)</Label>
                                    <Input placeholder="Inspirasi, Bisnis..." value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleAddNote}>Simpan Catatan</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}