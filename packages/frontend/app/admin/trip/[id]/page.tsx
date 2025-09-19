"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Calendar, Users, Package, Clock, MessageCircle, Plus, Edit, Trash2, Copy } from "lucide-react"

interface Family {
  id: string
  name: string
  adults: { name: string; age: number }[]
  children: { name: string; age: number }[]
  attendance: boolean
  dietaryInfo: string
}

interface GearItem {
  id: string
  name: string
  quantityNeeded: number
  assignedFamilies: string[]
}

interface ScheduleItem {
  id: string
  time: string
  description: string
}

export default function TripAdminPage() {
  const [families] = useState<Family[]>([
    {
      id: "1",
      name: "משפחת כהן",
      adults: [
        { name: "דוד כהן", age: 35 },
        { name: "שרה כהן", age: 33 },
      ],
      children: [
        { name: "יוסי", age: 8 },
        { name: "מיכל", age: 5 },
      ],
      attendance: true,
      dietaryInfo: "צמחוני",
    },
    {
      id: "2",
      name: "משפחת לוי",
      adults: [{ name: "אבי לוי", age: 40 }],
      children: [
        { name: "נועה", age: 12 },
        { name: "רון", age: 9 },
      ],
      attendance: false,
      dietaryInfo: "",
    },
    {
      id: "3",
      name: "משפחת אברהם",
      adults: [
        { name: "מיכאל אברהם", age: 38 },
        { name: "רחל אברהם", age: 36 },
      ],
      children: [{ name: "אליה", age: 6 }],
      attendance: true,
      dietaryInfo: "ללא אגוזים",
    },
  ])

  const [gearItems, setGearItems] = useState<GearItem[]>([
    { id: "1", name: "אוהלים", quantityNeeded: 3, assignedFamilies: ["משפחת כהן", "משפחת אברהם"] },
    { id: "2", name: "כיסאות קמפינג", quantityNeeded: 8, assignedFamilies: ["משפחת לוי"] },
    { id: "3", name: "מנגל", quantityNeeded: 2, assignedFamilies: [] },
  ])

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { id: "1", time: "08:00", description: "התכנסות בחניון" },
    { id: "2", time: "08:30", description: "יציאה לטיול" },
    { id: "3", time: "12:00", description: "ארוחת צהריים" },
    { id: "4", time: "15:00", description: "חזרה הביתה" },
  ])

  const [newScheduleItem, setNewScheduleItem] = useState({ time: "", description: "" })
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null)
  const [whatsappModal, setWhatsappModal] = useState<{ type: string; message: string } | null>(null)

  const addScheduleItem = () => {
    if (newScheduleItem.time && newScheduleItem.description) {
      const newItem: ScheduleItem = {
        id: Date.now().toString(),
        time: newScheduleItem.time,
        description: newScheduleItem.description,
      }
      setScheduleItems([...scheduleItems, newItem])
      setNewScheduleItem({ time: "", description: "" })
    }
  }

  const updateScheduleItem = (id: string, time: string, description: string) => {
    setScheduleItems(scheduleItems.map((item) => (item.id === id ? { ...item, time, description } : item)))
    setEditingSchedule(null)
  }

  const deleteScheduleItem = (id: string) => {
    setScheduleItems(scheduleItems.filter((item) => item.id !== id))
  }

  const generateWhatsAppMessage = (type: string) => {
    let message = ""
    switch (type) {
      case "attendance":
        message = `🏕️ תזכורת השתתפות - טיול יער בן שמן\n\nשלום לכולם!\n\nאנא אשרו השתתפות בטיול המתוכנן ליום שבת הקרוב.\n\nפרטי הטיול:\n📅 תאריך: 15/12/2024\n📍 מקום: יער בן שמן\n⏰ שעת התכנסות: 08:00\n\nאנא השיבו עד יום רביעי.\n\nתודה!`
        break
      case "gear":
        message = `🎒 תזכורת ציוד - טיול יער בן שמן\n\nשלום משפחות יקרות!\n\nתזכורת לגבי הציוד הנדרש לטיול:\n\n• אוהלים - משפחת כהן ואברהם\n• כיסאות קמפינג - משפחת לוי\n• מנגל - עדיין זקוק למתנדב\n\nאם יש שינויים, אנא עדכנו.\n\nתודה!`
        break
      case "start":
        message = `🚀 הטיול מתחיל!\n\nבוקר טוב לכולם!\n\nהטיול ליער בן שמן מתחיל בעוד שעה.\n\n📍 נקודת המפגש: חניון יער בן שמן\n⏰ שעה: 08:00\n\nנתראה שם!\n🌲🏕️`
        break
    }
    setWhatsappModal({ type, message })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  טיול יער בן שמן
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    יער בן שמן, מודיעין
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    15/12/2024
                  </span>
                </CardDescription>
              </div>
              <Badge variant="secondary" className="w-fit">
                <Users className="w-4 h-4 ml-1" />
                {families.filter((f) => f.attendance).length} משפחות משתתפות
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="participants" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="participants">משתתפים</TabsTrigger>
            <TabsTrigger value="gear">ציוד</TabsTrigger>
            <TabsTrigger value="schedule">לוח זמנים</TabsTrigger>
            <TabsTrigger value="whatsapp">תזכורות בוואטסאפ</TabsTrigger>
          </TabsList>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  משתתפים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">משפחה</TableHead>
                        <TableHead className="text-right">מבוגרים</TableHead>
                        <TableHead className="text-right">ילדים</TableHead>
                        <TableHead className="text-right">השתתפות</TableHead>
                        <TableHead className="text-right">מידע תזונתי</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {families.map((family) => (
                        <TableRow key={family.id}>
                          <TableCell className="font-medium">{family.name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {family.adults.map((adult, idx) => (
                                <div key={idx} className="text-sm">
                                  {adult.name} ({adult.age})
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {family.children.map((child, idx) => (
                                <div key={idx} className="text-sm">
                                  {child.name} ({child.age})
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Checkbox checked={family.attendance} className="ml-2" />
                              <span className={family.attendance ? "text-green-600" : "text-red-600"}>
                                {family.attendance ? "כן" : "לא"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Textarea
                              placeholder="מידע תזונתי..."
                              value={family.dietaryInfo}
                              className="min-h-[60px] text-right"
                              readOnly
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gear Tab */}
          <TabsContent value="gear" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    ציוד
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 ml-1" />
                    הוסף פריט
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">פריט</TableHead>
                        <TableHead className="text-right">כמות נדרשת</TableHead>
                        <TableHead className="text-right">משפחות שהוקצו</TableHead>
                        <TableHead className="text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gearItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantityNeeded}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.assignedFamilies.length > 0 ? (
                                item.assignedFamilies.map((family, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {family}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">לא הוקצה</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              שייך ציוד למשפחה
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  לוח זמנים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Schedule Item */}
                <div className="flex gap-2 p-4 bg-muted rounded-lg">
                  <Button onClick={addScheduleItem} size="sm">
                    <Plus className="w-4 h-4 ml-1" />
                    הוסף
                  </Button>
                  <Input
                    placeholder="תיאור הפעילות"
                    value={newScheduleItem.description}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, description: e.target.value })}
                    className="flex-1 text-right"
                  />
                  <Input
                    type="time"
                    value={newScheduleItem.time}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, time: e.target.value })}
                    className="w-32"
                  />
                </div>

                {/* Schedule Items */}
                <div className="space-y-2">
                  {scheduleItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      {editingSchedule === item.id ? (
                        <>
                          <Button size="sm" onClick={() => updateScheduleItem(item.id, item.time, item.description)}>
                            שמור
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingSchedule(null)}>
                            ביטול
                          </Button>
                          <Input
                            defaultValue={item.description}
                            onChange={(e) => (item.description = e.target.value)}
                            className="flex-1 text-right"
                          />
                          <Input
                            type="time"
                            defaultValue={item.time}
                            onChange={(e) => (item.time = e.target.value)}
                            className="w-32"
                          />
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => deleteScheduleItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingSchedule(item.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <span className="flex-1 text-right">{item.description}</span>
                          <Badge variant="outline">{item.time}</Badge>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  תזכורות בוואטסאפ
                </CardTitle>
                <CardDescription>צור הודעות וואטסאפ מוכנות לשליחה לקבוצת המשפחות</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Button onClick={() => generateWhatsAppMessage("attendance")} className="h-20 flex-col gap-2">
                    <Users className="w-6 h-6" />
                    תזכורת השתתפות
                  </Button>
                  <Button
                    onClick={() => generateWhatsAppMessage("gear")}
                    className="h-20 flex-col gap-2"
                    variant="outline"
                  >
                    <Package className="w-6 h-6" />
                    תזכורת ציוד
                  </Button>
                  <Button
                    onClick={() => generateWhatsAppMessage("start")}
                    className="h-20 flex-col gap-2"
                    variant="secondary"
                  >
                    <MessageCircle className="w-6 h-6" />
                    הודעת תחילת טיול
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* WhatsApp Message Modal */}
        <Dialog open={!!whatsappModal} onOpenChange={() => setWhatsappModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>הודעת וואטסאפ</DialogTitle>
              <DialogDescription>העתק את ההודעה ושלח אותה בקבוצת הוואטסאפ</DialogDescription>
            </DialogHeader>
            {whatsappModal && (
              <div className="space-y-4">
                <Textarea value={whatsappModal.message} readOnly className="min-h-[200px] text-right" />
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(whatsappModal.message)} className="flex-1">
                    <Copy className="w-4 h-4 ml-1" />
                    העתק הודעה
                  </Button>
                  <Button variant="outline" onClick={() => setWhatsappModal(null)}>
                    סגור
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
