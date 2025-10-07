'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/family';
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    tabParam === 'register' ? 'register' : 'login',
  );

  const handleAuthSuccess = () => {
    router.push(returnUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">טיולי השכונה</h1>
          <p className="text-muted-foreground">
            ברוכים הבאים למערכת ניהול הטיולים המשפחתיים
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {activeTab === 'login' ? 'התחברות' : 'הרשמה'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login'
                ? 'התחבר לחשבון שלך כדי להמשיך'
                : 'צור חשבון חדש כדי להצטרף לטיולים'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'login' | 'register')}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">התחברות</TabsTrigger>
                <TabsTrigger value="register">הרשמה</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <OAuthButtons onSuccess={handleAuthSuccess} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      או המשך עם דוא״ל
                    </span>
                  </div>
                </div>

                <LoginForm onSuccess={handleAuthSuccess} />
              </TabsContent>

              <TabsContent value="register" className="space-y-6">
                <OAuthButtons onSuccess={handleAuthSuccess} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      או הירשם עם דוא״ל
                    </span>
                  </div>
                </div>

                <RegisterForm onSuccess={handleAuthSuccess} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          בהמשך השימוש באפליקציה, אתה מסכים{' '}
          <a href="/terms" className="underline hover:text-primary">
            לתנאי השימוש
          </a>{' '}
          ו
          <a href="/privacy" className="underline hover:text-primary">
            מדיניות הפרטיות
          </a>
        </p>
      </div>
    </div>
  );
}
