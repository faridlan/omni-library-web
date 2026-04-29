/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from "@/api/axiosInstance"
import type { TokenResponse } from "@/types/api"

export default function Auth() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleAuth = async (action: 'login' | 'register') => {
        setLoading(true)
        try {
            const endpoint = action === 'login' ? '/api/auth/login' : '/api/auth/register'
            const payload = action === 'login' ? { email, password } : { name, email, password }

            // AXIOS: Sangat singkat!
            const response = await axiosInstance.post(endpoint, payload)

            if (action === 'login') {
                const tokenData = response.data.data as TokenResponse
                localStorage.setItem("access_token", tokenData.access_token)
                localStorage.setItem("refresh_token", tokenData.refresh_token) // Simpan juga refresh token-nya

                toast.success("Berhasil Login!")
                navigate("/dashboard")
            } else {
                toast.success("Registrasi berhasil! Silakan login.")
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center p-8">
            {/* ... (Isi HTML/UI Form tidak ada yang berubah, tetap sama seperti sebelumnya) ... */}
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>OmniLibrary Masuk</CardTitle>
                    <CardDescription>Silakan login atau buat akun baru.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button className="w-full" onClick={() => handleAuth('login')} disabled={loading}>Masuk</Button>
                        </TabsContent>

                        <TabsContent value="register" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email-reg">Email</Label>
                                <Input id="email-reg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password-reg">Password</Label>
                                <Input id="password-reg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button className="w-full" onClick={() => handleAuth('register')} disabled={loading}>Daftar Akun</Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}