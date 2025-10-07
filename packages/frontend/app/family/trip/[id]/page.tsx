'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Calendar,
  Users,
  Utensils,
  Backpack,
  Camera,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { TripSchedule } from '@/components/trip/TripSchedule';
import { TripLocation } from '@/components/trip/TripLocation';
import { AttendanceSummary } from '@/components/trip/AttendanceSummary';
import {
  getTripById,
  markTripAttendance,
  updateDietaryRequirements,
} from '@/lib/api';
import type { Trip } from '@/types/trip';

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Current family ID - in production, get from auth context
  const familyId = 'family1';
  
  // Find if current family is attending
  const familyAttendance = trip?.attendees.find(att => att.familyId === familyId);
  const isAttending = !!familyAttendance;
  
  const [dietaryRequirementsInput, setDietaryRequirementsInput] = useState('');

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setLoading(true);
        const tripData = await getTripById(params.id as string);
        setTrip(tripData);

        // Set dietary requirements if family is attending
        const attendance = tripData.attendees.find(att => att.familyId === familyId);
        if (attendance?.dietaryRequirements) {
          setDietaryRequirementsInput(attendance.dietaryRequirements);
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [params.id, familyId]);

  const handleSaveDietaryRequirements = async () => {
    if (!trip || !isAttending) return;
    
    try {
      setSaving(true);
      await updateDietaryRequirements(
        trip.id,
        familyId,
        dietaryRequirementsInput
      );
      
      // Update local state
      setTrip({
        ...trip,
        attendees: trip.attendees.map(att => 
          att.familyId === familyId 
            ? { ...att, dietaryRequirements: dietaryRequirementsInput }
            : att
        )
      });
      
      alert('דרישות התזונה נשמרו בהצלחה!');
    } catch (error) {
      alert('שגיאה בשמירת דרישות התזונה');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAttendance = async () => {
    if (!trip) return;
    
    try {
      setSaving(true);
      await markTripAttendance(trip.id, {
        familyId,
        attending: !isAttending
      });
      
      // Refresh trip data
      const updatedTrip = await getTripById(params.id as string);
      setTrip(updatedTrip);
      
      alert('סטטוס ההשתתפות עודכן בהצלחה!');
    } catch (error: any) {
      alert(error.message || 'שגיאה בעדכון סטטוס ההשתתפות');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>טוען פרטי טיול...</span>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">טיול לא נמצא</h2>
            <p className="text-muted-foreground mb-4">
              הטיול המבוקש לא קיים במערכת
            </p>
            <Button onClick={() => router.back()}>חזרה</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAttendanceCutoffPassed = trip.attendanceCutoffDate
    ? new Date() > new Date(trip.attendanceCutoffDate)
    : false;
  const tripEndDate = new Date(trip.endDate);
  const currentDate = new Date();
  const isTripPassed = currentDate > tripEndDate;
  const isTripOngoingOrFuture = currentDate <= tripEndDate;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה
            </Button>
            {trip.draft && (
              <Badge variant="secondary">טיוטה</Badge>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">{trip.name}</h1>

            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{trip.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(trip.startDate).toLocaleDateString('he-IL')} -{' '}
                  {new Date(trip.endDate).toLocaleDateString('he-IL')}
                </span>
              </div>
              {trip.attendees.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{trip.attendees.length} משפחות משתתפות</span>
                </div>
              )}
            </div>

            {trip.description && (
              <p className="text-foreground leading-relaxed max-w-3xl">
                {trip.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">פרטים</TabsTrigger>
            <TabsTrigger value="schedule">לוח זמנים</TabsTrigger>
            <TabsTrigger value="location">מיקום</TabsTrigger>
            <TabsTrigger value="attendance">משתתפים</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Attendance Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  השתתפות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAttendanceCutoffPassed && trip.attendanceCutoffDate && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      תאריך הרשמה אחרון עבר (
                      {new Date(trip.attendanceCutoffDate).toLocaleDateString('he-IL')}
                      ). לא ניתן לשנות את סטטוס ההשתתפות.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="attendance"
                    checked={isAttending}
                    onCheckedChange={handleToggleAttendance}
                    disabled={isAttendanceCutoffPassed || saving}
                  />
                  <Label htmlFor="attendance" className="text-right">
                    המשפחה משתתפת בטיול
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Dietary Requirements Section */}
            {isAttending && isTripOngoingOrFuture && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    דרישות תזונתיות
                  </CardTitle>
                  <CardDescription>
                    אנא ציינו אלרגיות, העדפות תזונתיות או דרישות מיוחדות עבור בני המשפחה
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dietary" className="text-right block">
                      פרטי דרישות תזונתיות
                    </Label>
                    <Textarea
                      id="dietary"
                      placeholder="לדוגמה: אלרגיה לאגוזים, צמחוני, כשר, ללא גלוטן..."
                      value={dietaryRequirementsInput}
                      onChange={(e) => setDietaryRequirementsInput(e.target.value)}
                      className="text-right min-h-[100px]"
                      disabled={saving}
                    />
                  </div>

                  <Button
                    onClick={handleSaveDietaryRequirements}
                    className="w-full sm:w-auto"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        שומר...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 ml-2" />
                        שמירת דרישות תזונתיות
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Photo Album Section */}
            {trip.photoAlbumLink && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    אלבום תמונות
                  </CardTitle>
                  <CardDescription>
                    צפו בתמונות מהטיול ושתפו את התמונות שלכם
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => window.open(trip.photoAlbumLink!, '_blank')}
                  >
                    <Camera className="w-4 h-4 ml-2" />
                    פתיחת אלבום התמונות
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule">
            <TripSchedule 
              scheduleItems={trip.scheduleItems} 
              tripStartDate={trip.startDate}
            />
          </TabsContent>

          <TabsContent value="location">
            <TripLocation 
              location={trip.location}
              description={trip.description}
              showMap={true}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceSummary attendees={trip.attendees} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
