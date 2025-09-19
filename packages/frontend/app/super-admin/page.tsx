"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Shield,
  UserCheck,
  Crown,
  Trash2,
  UserPlus,
  Loader2,
} from "lucide-react"

import { getFamilies, getTrips, getAdmins, type Family, type Trip, type Admin } from "@/lib/api"

export default function SuperAdminPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [familyFilter, setFamilyFilter] = useState("all")
  const [tripFilter, setTripFilter] = useState("all")
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

  const [families, setFamilies] = useState<Family[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [familiesData, tripsData, adminsData] = await Promise.all([getFamilies(), getTrips(), getAdmins()])
        setFamilies(familiesData)
        setTrips(tripsData)
        setAdmins(adminsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>טוען נתונים...</span>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-secondary text-secondary-foreground">פעיל</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            ממתין
          </Badge>
        )
      case "deactivated":
        return <Badge variant="destructive">מושבת</Badge>
      case "published":
        return <Badge className="bg-secondary text-secondary-foreground">פורסם</Badge>
      case "draft":
        return <Badge variant="outline">טיוטה</Badge>
      case "completed":
        return <Badge variant="secondary">הושלם</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "סופר אדמין":
        return (
          <Badge className="bg-primary text-primary-foreground">
            <Crown className="w-3 h-3 ml-1" />
            {role}
          </Badge>
        )
      case "מנהל טיול":
        return (
          <Badge className="bg-secondary text-secondary-foreground">
            <Shield className="w-3 h-3 ml-1" />
            {role}
          </Badge>
        )
      case "משתתף":
        return (
          <Badge variant="outline">
            <UserCheck className="w-3 h-3 ml-1" />
            {role}
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const filteredFamilies = families.filter((family) => {
    const matchesSearch = family.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = familyFilter === "all" || family.status === familyFilter
    return matchesSearch && matchesFilter
  })

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = tripFilter === "all" || trip.status === tripFilter
    return matchesSearch && matchesFilter
  })

  const filteredAdmins = admins.filter((admin) => {
    return (
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">פאנל סופר אדמין</h1>
            <p className="text-muted-foreground">ניהול מערכת טיולי השכונה</p>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium">אדמין ראשי</p>
              <p className="text-xs text-muted-foreground">סופר אדמין</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="חיפוש משפחות, טיולים או מנהלים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="families" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="families" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              משפחות
            </TabsTrigger>
            <TabsTrigger value="trips" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              טיולים
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              מנהלים
            </TabsTrigger>
          </TabsList>

          {/* Families Tab */}
          <TabsContent value="families" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-semibold">ניהול משפחות</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={familyFilter} onValueChange={setFamilyFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="active">פעיל</SelectItem>
                    <SelectItem value="pending">ממתין</SelectItem>
                    <SelectItem value="deactivated">מושבת</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">פעולות</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">תאריך הצטרפות</TableHead>
                      <TableHead className="text-right">חברים</TableHead>
                      <TableHead className="text-right">שם המשפחה</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFamilies.map((family) => (
                      <TableRow key={family.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {family.status === "pending" && (
                              <Button size="sm" className="h-8">
                                <CheckCircle className="h-3 w-3 ml-1" />
                                אשר
                              </Button>
                            )}
                            {family.status === "active" && (
                              <Button size="sm" variant="outline" className="h-8 bg-transparent">
                                <XCircle className="h-3 w-3 ml-1" />
                                השבת
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive" className="h-8">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>מחיקת משפחה</DialogTitle>
                                  <DialogDescription>
                                    האם אתה בטוח שברצונך למחוק את {family.name}? פעולה זו לא ניתנת לביטול.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="destructive">מחק</Button>
                                  <Button variant="outline">ביטול</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(family.status)}</TableCell>
                        <TableCell className="text-right">{family.joinDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{family.members} חברים</div>
                            <div className="text-xs text-muted-foreground">
                              {family.adults.length} מבוגרים, {family.children.length} ילדים
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{family.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-semibold">ניהול טיולים</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={tripFilter} onValueChange={setTripFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="draft">טיוטה</SelectItem>
                    <SelectItem value="published">פורסם</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">פעולות</TableHead>
                      <TableHead className="text-right">מנהל טיול</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">תאריכים</TableHead>
                      <TableHead className="text-right">מיקום</TableHead>
                      <TableHead className="text-right">שם הטיול</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {trip.status === "draft" && (
                              <Button size="sm" className="h-8">
                                <CheckCircle className="h-3 w-3 ml-1" />
                                אשר
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 bg-transparent">
                                  <UserPlus className="h-3 w-3 ml-1" />
                                  שייך מנהל
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>שיוך מנהל טיול</DialogTitle>
                                  <DialogDescription>בחר מנהל טיול עבור {trip.name}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="בחר מנהל טיול" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {admins
                                        .filter((admin) => admin.role === "מנהל טיול")
                                        .map((admin) => (
                                          <SelectItem key={admin.id} value={admin.id}>
                                            {admin.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <DialogFooter>
                                  <Button>שייך</Button>
                                  <Button variant="outline">ביטול</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {trip.adminName ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{trip.adminName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{trip.adminName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">לא משויך</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(trip.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <div className="text-sm">{trip.startDate}</div>
                            {trip.startDate !== trip.endDate && (
                              <div className="text-xs text-muted-foreground">עד {trip.endDate}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{trip.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{trip.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-semibold">ניהול מנהלים</h2>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">פעולות</TableHead>
                      <TableHead className="text-right">תפקיד</TableHead>
                      <TableHead className="text-right">אימייל</TableHead>
                      <TableHead className="text-right">שם</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {admin.role === "משתתף" && (
                              <Button size="sm" variant="outline" className="h-8 bg-transparent">
                                <Shield className="h-3 w-3 ml-1" />
                                הפוך למנהל
                              </Button>
                            )}
                            {admin.role === "מנהל טיול" && (
                              <>
                                <Button size="sm" className="h-8">
                                  <Crown className="h-3 w-3 ml-1" />
                                  הפוך לסופר אדמין
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 bg-transparent">
                                  <UserCheck className="h-3 w-3 ml-1" />
                                  הורד למשתתף
                                </Button>
                              </>
                            )}
                            {admin.role === "סופר אדמין" && admin.id !== "superadmin" && (
                              <Button size="sm" variant="outline" className="h-8 bg-transparent">
                                <Shield className="h-3 w-3 ml-1" />
                                הורד למנהל
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(admin.role)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{admin.email}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{admin.name}</div>
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={admin.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">{admin.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
