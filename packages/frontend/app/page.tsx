"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Upload, User, Lock, Calendar } from "lucide-react"

interface Child {
  id: string
  name: string
  age: string
}

export default function AuthPage() {
  const router = useRouter()
  const [isRegistered, setIsRegistered] = useState(false)
  const [children, setChildren] = useState<Child[]>([])
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [newChildName, setNewChildName] = useState("")
  const [newChildAge, setNewChildAge] = useState("")

  const addChild = () => {
    if (newChildName.trim() && newChildAge.trim()) {
      const newChild: Child = {
        id: Date.now().toString(),
        name: newChildName.trim(),
        age: newChildAge.trim(),
      }
      setChildren([...children, newChild])
      setNewChildName("")
      setNewChildAge("")
    }
  }

  const removeChild = (id: string) => {
    setChildren(children.filter((child) => child.id !== id))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistered(true)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/family")
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">נרשמתם בהצלחה!</h2>
              <p className="text-muted-foreground">ההרשמה ממתינה לאישור מנהל.</p>
              <Button onClick={() => setIsRegistered(false)} variant="outline" className="w-full">
                חזרה לדף הכניסה
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">טיולי השכונה</CardTitle>
          <CardDescription className="text-muted-foreground">
            הצטרפו לקהילת ההורים המתכננים טיולים משפחתיים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">כניסה</TabsTrigger>
              <TabsTrigger value="register">הרשמה</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">
                    אימייל
                  </Label>
                  <Input id="email" type="email" placeholder="הכניסו את כתובת האימייל" className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-right block">
                    סיסמה
                  </Label>
                  <Input id="password" type="password" placeholder="הכניסו את הסיסמה" className="text-right" />
                </div>
                <Button type="submit" className="w-full">
                  <Lock className="w-4 h-4 ml-2" />
                  כניסה
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">או</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button onClick={() => router.push("/family")} variant="outline" className="w-full bg-transparent">
                  <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23 7.7 23 3.99 20.53 2.18 17.07l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 1c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  כניסה עם Google
                </Button>
                <Button onClick={() => router.push("/family")} variant="outline" className="w-full bg-transparent">
                  <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                  כניסה עם Facebook
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegistration} className="space-y-4">
                {/* Profile Photo Upload */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profilePhoto || undefined} />
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="photo-upload"
                      className="absolute -bottom-1 -left-1 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90"
                    >
                      <Upload className="w-3 h-3" />
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">תמונת פרופיל (אופציונלי)</p>
                </div>

                {/* Adult Information */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right block">
                    שם מלא *
                  </Label>
                  <Input id="name" type="text" placeholder="הכניסו את השם המלא" className="text-right" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block">
                    טלפון (אופציונלי)
                  </Label>
                  <Input id="phone" type="tel" placeholder="הכניסו מספר טלפון" className="text-right" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-right block">
                    אימייל (אופציונלי)
                  </Label>
                  <Input id="reg-email" type="email" placeholder="הכניסו כתובת אימייל" className="text-right" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-right block">
                    סיסמה *
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="בחרו סיסמה חזקה"
                    className="text-right"
                    required
                  />
                </div>

                {/* Children Section */}
                <div className="space-y-3">
                  <Label className="text-right block">ילדים</Label>

                  {/* Add Child Form */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="שם הילד"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      className="text-right flex-1"
                    />
                    <Input
                      placeholder="גיל"
                      value={newChildAge}
                      onChange={(e) => setNewChildAge(e.target.value)}
                      className="text-right w-16"
                      type="number"
                      min="0"
                      max="18"
                    />
                    <Button type="button" onClick={addChild} size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Children List */}
                  {children.length > 0 && (
                    <div className="space-y-2">
                      {children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <Button
                            type="button"
                            onClick={() => removeChild(child.id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="w-3 h-3 ml-1" />
                              {child.age}
                            </Badge>
                            <span className="text-sm font-medium">{child.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  <User className="w-4 h-4 ml-2" />
                  הרשמה
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
