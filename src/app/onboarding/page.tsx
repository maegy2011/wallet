'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, ArrowRight, ArrowLeft, Plus, FileText, TrendingUp, BookOpen, Wallet, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

export default function OnboardingPage() {
  const { data: session } = useSession();
  const [isRTL, setIsRTL] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      title: 'Add Your First Wallet',
      description: 'Manually add your brokerage wallets to start tracking.',
      icon: <Wallet className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1554224154-260325c0578e?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Log Transactions',
      description: 'Easily log deposits, withdrawals, and transfers.',
      icon: <FileText className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1554224154-260325c0578e?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'View Performance',
      description: 'Get insights into your portfolio performance.',
      icon: <TrendingUp className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
    }
  ];

  useEffect(() => {
    // Check if user is authenticated
    if (!session?.user) {
      router.push('/signin');
      return;
    }

    // Check if user is already onboarded
    if (session.user.onboarded) {
      router.push('/dashboard');
      return;
    }
  }, [session, router]);

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = !isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = !isRTL ? 'ar' : 'en';
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = async () => {
    // Mark user as onboarded - this would typically update the database
    // For now, we'll just redirect to dashboard
    router.push('/dashboard');
  };

  const handleSkip = () => {
    handleComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Globe className="w-4 h-4" />
        {isRTL ? 'EN' : 'العربية'}
      </button>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 text-sm"
      >
        {isRTL ? 'تخطي' : 'Skip'}
      </button>

      <div className="w-full max-w-2xl">
        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'w-8 bg-blue-600' 
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Slide Content */}
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative h-64 md:h-auto">
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-blue-600">
                    {slide.icon}
                  </div>
                </div>
              </div>

              {/* Text Section */}
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {slide.icon}
                    </div>
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {slide.id}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {slide.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    {slide.description}
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentSlide === 0}
                    className="flex-1"
                  >
                    {isRTL ? (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        {currentSlide === 0 ? 'Previous' : 'Previous'}
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="w-4 h-4" />
                        {currentSlide === 0 ? 'Previous' : 'Previous'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isRTL ? (
                      <>
                        {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slide Counter */}
        <div className="text-center mt-4 text-gray-600 text-sm">
          {isRTL ? 
            `Slide ${currentSlide + 1} of ${slides.length}` :
            `Slide ${currentSlide + 1} of ${slides.length}`
          }
        </div>
      </div>
    </div>
  );
}