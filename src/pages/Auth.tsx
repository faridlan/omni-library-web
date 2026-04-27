/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TokenResponse } from "@/types/api"
import { API_URL } from "@/api/config"

export default function Auth() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

    const handleAuth = async (action: 'login' | 'register') => {
        setLoading(true)
        setMessage(null)
        try {
            const endpoint = action === 'login' ? '/api/auth/login' : '/api/auth/register'
            const payload = action === 'login' ? { email, password } : { name, email, password }

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || `Gagal ${action}`)

            if (action === 'login') {
                const tokenData = result.data as TokenResponse
                localStorage.setItem("access_token", tokenData.access_token)
                navigate("/dashboard") // Jika sukses, lempar ke dashboard
            } else {
                setMessage({ text: "Registrasi berhasil! Silakan login.", type: 'success' })
            }
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center p-8">
            <Card className="w-100">
                <CardHeader>
                    <CardTitle>OmniLibrary Masuk</CardTitle>
                    <CardDescription>Silakan login atau buat akun baru.</CardDescription>
                </CardHeader>
                <CardContent>
                    {message && (
                        <div className={`p-3 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message.text}
                        </div>
                    )}
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