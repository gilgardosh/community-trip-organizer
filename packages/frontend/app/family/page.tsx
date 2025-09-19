"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Calendar,
  Users,
  Settings,
  Edit,
  LogOut,
  Key,
  Utensils,
  Backpack,
  Clock,
  CheckCircle,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"

interface Trip {
  id: string
  name: string
  location: string
  date: string
  status: "upcoming" | "past"
  isAttending: boolean
  dietaryInfo: string
}

interface FamilyMember {
  id: string
  name: string
  age: number
  type: "adult" | "child"
}

export default function FamilyDashboard() {
  const [activeTab, setActiveTab] = useState("trips")
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: "1",
      name: "טיול לפארק הירקון",
      location: "פארק הירקון, תל אביב",
      date: "2024-01-15",
      status: "upcoming",
      isAttending: false,
      dietaryInfo: "",
    },
    {
      id: "2",
      name: "ביקור במוזיאון המדע",
      location: "מוזיאון המדע, חולון",
      date: "2024-01-22",
      status: "upcoming",
      isAttending: true,
      dietaryInfo: "ללא גלוטן",
    },
    {
      id: "3",
      name: "טיול בחוף הים",
      location: "חוף גורדון, תל אביב",
      date: "2023-12-20",
      status: "past",
      isAttending: true,
      dietaryInfo: "",
    },
  ])

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: "1", name: "שרה כהן", age: 35, type: "adult" },
    { id: "2", name: "דוד כהן", age: 37, type: "adult" },
    { id: "3", name: "נועה כהן", age: 8, type: "child" },
    { id: "4", name: "יונתן כהן", age: 5, type: "child" },
  ])

  const updateTripAttendance = (tripId: string, isAttending: boolean) => {
    setTrips(trips.map((trip) => (trip.id === tripId ? { ...trip, isAttending } : trip)))
  }

  const updateTripDietaryInfo = (tripId: string, dietaryInfo: string) => {
    setTrips(trips.map((trip) => (trip.id === tripId ? { ...trip, dietaryInfo } : trip)))
  }

  const upcomingTrips = trips.filter((trip) => trip.status === "upcoming")
  const pastTrips = trips.filter((trip) => trip.status === "past")
  const familyName = "משפחת כהן"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/family-photo.png" />
              <AvatarFallback>מכ</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground">{familyName}</h1>
              <p className="text-sm text-muted-foreground">ברוכים הבאים לדשבורד המשפחתי</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {familyMembers.length} חברי משפחה
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="trips" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              טיולים
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              משפחה
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              הגדרות
            </TabsTrigger>
          </TabsList>

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-6">
            {/* Upcoming Trips */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                טיולים קרובים
              </h2>
              <div className="grid gap-4">
                {upcomingTrips.map((trip) => (
                  <Link key={trip.id} href={`/family/trip/${trip.id}`}>
                    <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-right flex items-center gap-2">
                              {trip.name}
                              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-right mt-1">
                              <MapPin className="w-4 h-4" />
                              {trip.location}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 ml-1" />
                            {new Date(trip.date).toLocaleDateString("he-IL")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Attendance Checkbox */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox
                              id={`attend-${trip.id}`}
                              checked={trip.isAttending}
                              onCheckedChange={(checked) => {
                                updateTripAttendance(trip.id, checked as boolean)
                              }}
                              onClick={(e) => e.preventDefault()}
                            />
                            <Label htmlFor={`attend-${trip.id}`} className="text-sm">
                              הצטרפות לטיול
                            </Label>
                          </div>
                          {trip.isAttending && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 ml-1" />
                              משתתפים
                            </Badge>
                          )}
                        </div>

                        {/* Dietary Info */}
                        {trip.isAttending && (
                          <div className="space-y-2">
                            <Label className="text-sm flex items-center gap-2">
                              <Utensils className="w-4 h-4" />
                              מידע תזונתי
                            </Label>
                            <Textarea
                              placeholder="אלרגיות, העדפות תזונתיות, או מגבלות מיוחדות..."
                              value={trip.dietaryInfo}
                              onChange={(e) => updateTripDietaryInfo(trip.id, e.target.value)}
                              onClick={(e) => e.preventDefault()}
                              className="text-right text-sm"
                              rows={2}
                            />
                          </div>
                        )}

                        {/* Gear Volunteering */}
                        {trip.isAttending && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Backpack className="w-4 h-4 ml-2" />
                            התנדבות לציוד
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Past Trips */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                טיולים שהיו
              </h2>
              <div className="grid gap-4">
                {pastTrips.map((trip) => (
                  <Link key={trip.id} href={`/family/trip/${trip.id}`}>
                    <Card className="opacity-75 hover:opacity-90 transition-opacity cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-right flex items-center gap-2">
                              {trip.name}
                              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-right mt-1">
                              <MapPin className="w-4 h-4" />
                              {trip.location}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="w-3 h-3 ml-1" />
                            {new Date(trip.date).toLocaleDateString("he-IL")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {trip.isAttending ? (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            השתתפנו
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            לא השתתפנו
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Family Tab */}
          <TabsContent value="family" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">חברי המשפחה</h2>
              <div className="grid gap-4">
                {familyMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.type === "adult" ? "מבוגר" : "ילד"} • {member.age} שנים
                            </p>
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={`/abstract-geometric-shapes.png?height=40&width=40&query=${member.name}`}
                            />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">הגדרות חשבון</h2>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    שינוי סיסמה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-right block">
                      סיסמה נוכחית
                    </Label>
                    <Input id="current-password" type="password" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-right block">
                      סיסמה חדשה
                    </Label>
                    <Input id="new-password" type="password" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-right block">
                      אישור סיסמה חדשה
                    </Label>
                    <Input id="confirm-password" type="password" className="text-right" />
                  </div>
                  <Button className="w-full">עדכון סיסמה</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Button variant="destructive" className="w-full">
                    <LogOut className="w-4 h-4 ml-2" />
                    יציאה מהחשבון
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
