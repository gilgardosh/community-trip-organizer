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
} from 'lucide-react';
import {
  getTripWithParticipation,
  getGearItemsByTripId,
  updateFamilyParticipation,
} from '@/lib/api';
import type { Trip, FamilyParticipation } from '@/data/mock/trips';
import type { GearItem } from '@/data/mock/gear';

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participation, setParticipation] =
    useState<FamilyParticipation | null>(null);
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [dietaryRequirements, setDietaryRequirements] = useState('');
  const [gearCommitments, setGearCommitments] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setLoading(true);
        const familyId = 'family1'; // Mock current family ID
        const { trip: tripData, participation: participationData } =
          await getTripWithParticipation(params.id as string, familyId);
        const gearData = await getGearItemsByTripId(params.id as string);

        setTrip(tripData);
        setParticipation(participationData);
        setGearItems(gearData);

        if (participationData) {
          setIsAttending(participationData.isAttending);
          setDietaryRequirements(participationData.dietaryRequirements);
          setGearCommitments(participationData.gearCommitments);
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [params.id]);

  const handleGearCommitment = (gearId: string, quantity: number) => {
    setGearCommitments((prev) => ({
      ...prev,
      [gearId]: quantity,
    }));
  };

  const handleSaveDietaryRequirements = async () => {
    try {
      await updateFamilyParticipation(params.id as string, 'family1', {
        dietaryRequirements,
      });
      alert('דרישות התזונה נשמרו בהצלחה!');
    } catch (error) {
      alert('שגיאה בשמירת דרישות התזונה');
    }
  };

  const handleSaveAttendance = async () => {
    try {
      await updateFamilyParticipation(params.id as string, 'family1', {
        isAttending,
      });
      alert('סטטוס ההשתתפות נשמר בהצלחה!');
    } catch (error) {
      alert('שגיאה בשמירת סטטוס ההשתתפות');
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

  const familyParticipating = participation?.isParticipating ?? false;

  if (!familyParticipating) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                חזרה
              </Button>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">
                {trip.name}
              </h1>

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
              </div>

              {trip.description && (
                <p className="text-foreground leading-relaxed">
                  {trip.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">
                המשפחה לא משתתפת בטיול זה
              </h2>
              <p className="text-muted-foreground">
                המשפחה שלכם לא רשומה כמשתתפת בטיול זה. לפרטים נוספים פנו למנהל
                הטיול.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isAttendanceCutoffPassed = trip.attendanceCutoff
    ? new Date() > new Date(trip.attendanceCutoff)
    : false;
  const tripEndDate = new Date(trip.endDate);
  const currentDate = new Date();
  const isTripPassed = currentDate > tripEndDate;
  const isTripOngoingOrFuture = currentDate <= tripEndDate;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה
            </Button>
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
            </div>

            {trip.description && (
              <p className="text-foreground leading-relaxed">
                {trip.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Attendance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              השתתפות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAttendanceCutoffPassed && trip.attendanceCutoff && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  תאריך הרשמה אחרון עבר (
                  {new Date(trip.attendanceCutoff).toLocaleDateString('he-IL')}
                  ). לא ניתן לשנות את סטטוס ההשתתפות.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="attendance"
                checked={isAttending}
                onCheckedChange={(checked) => setIsAttending(checked === true)}
                disabled={isAttendanceCutoffPassed}
              />
              <Label htmlFor="attendance" className="text-right">
                המשפחה משתתפת בטיול
              </Label>
            </div>

            {!isAttendanceCutoffPassed && (
              <Button
                onClick={handleSaveAttendance}
                className="w-full sm:w-auto"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                שמירת סטטוס השתתפות
              </Button>
            )}
          </CardContent>
        </Card>

        {isTripOngoingOrFuture && (
          <>
            {/* Dietary Requirements Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  דרישות תזונתיות
                </CardTitle>
                <CardDescription>
                  אנא ציינו אלרגיות, העדפות תזונתיות או דרישות מיוחדות עבור בני
                  המשפחה
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
                    value={dietaryRequirements}
                    onChange={(e) => setDietaryRequirements(e.target.value)}
                    className="text-right min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleSaveDietaryRequirements}
                  className="w-full sm:w-auto"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  שמירת דרישות תזונתיות
                </Button>
              </CardContent>
            </Card>

            {/* Shared Gear Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Backpack className="w-5 h-5" />
                  ציוד משותף
                </CardTitle>
                <CardDescription>
                  עזרו לקהילה על ידי התנדבות להביא ציוד משותף לטיול
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gearItems.map((item) => {
                    const quantityAssigned = item.quantityAssigned ?? 0;
                    return (
                      <div
                        key={item.id}
                        className="border border-border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                quantityAssigned >= item.quantityNeeded
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {quantityAssigned}/{item.quantityNeeded}
                            </Badge>
                            {quantityAssigned >= item.quantityNeeded && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <h4 className="font-medium text-foreground">
                            {item.name}
                          </h4>
                        </div>

                        {item.assignedFamilies.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <span>משפחות שהתחייבו: </span>
                            {item.assignedFamilies.join(', ')}
                          </div>
                        )}

                        {quantityAssigned < item.quantityNeeded && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max={item.quantityNeeded - quantityAssigned}
                              placeholder="כמות"
                              className="w-20 text-center"
                              value={gearCommitments[item.id] || ''}
                              onChange={(e) =>
                                handleGearCommitment(
                                  item.id,
                                  Number.parseInt(e.target.value) || 0,
                                )
                              }
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={
                                !gearCommitments[item.id] ||
                                gearCommitments[item.id] <= 0
                              }
                              onClick={async () => {
                                try {
                                  await updateFamilyParticipation(
                                    params.id as string,
                                    'family1',
                                    {
                                      gearCommitments: {
                                        ...gearCommitments,
                                        [item.id]: gearCommitments[item.id],
                                      },
                                    },
                                  );
                                  alert(
                                    `התחייבתם להביא ${gearCommitments[item.id]} יחידות של ${item.name}`,
                                  );
                                  setGearCommitments((prev) => ({
                                    ...prev,
                                    [item.id]: 0,
                                  }));
                                } catch (error) {
                                  alert('שגיאה בשמירת התחייבות הציוד');
                                }
                              }}
                            >
                              המשפחה שלנו תביא {gearCommitments[item.id] || 0}{' '}
                              יחידות
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Photo Album Section */}
        {trip.photoAlbumUrl && (
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
                onClick={() => window.open(trip.photoAlbumUrl, '_blank')}
              >
                <Camera className="w-4 h-4 ml-2" />
                פתיחת אלבום התמונות
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
