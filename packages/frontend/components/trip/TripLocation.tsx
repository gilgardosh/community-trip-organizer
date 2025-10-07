'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface TripLocationProps {
  location: string;
  description?: string;
  showMap?: boolean;
}

export function TripLocation({
  location,
  description,
  showMap = true,
}: TripLocationProps) {
  const handleOpenInMaps = () => {
    // Open in Google Maps (works on both desktop and mobile)
    const encodedLocation = encodeURIComponent(location);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
      '_blank'
    );
  };

  const handleNavigate = () => {
    // Open navigation in Google Maps
    const encodedLocation = encodeURIComponent(location);
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`,
      '_blank'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          מיקום
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{location}</h4>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {showMap && (
          <div className="space-y-3">
            {/* Simple map embed using Google Maps Static API or iframe */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=${
                  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
                }&q=${encodeURIComponent(location)}`}
                allowFullScreen
                title={`מפה של ${location}`}
                loading="lazy"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleOpenInMaps}
                className="flex-1 gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                פתיחה במפות Google
              </Button>
              <Button
                variant="default"
                onClick={handleNavigate}
                className="flex-1 gap-2"
              >
                <Navigation className="w-4 h-4" />
                ניווט למיקום
              </Button>
            </div>
          </div>
        )}

        {!showMap && (
          <Button
            variant="outline"
            onClick={handleOpenInMaps}
            className="w-full gap-2"
          >
            <MapPin className="w-4 h-4" />
            פתיחה במפות
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
