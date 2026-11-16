/**
 * Client Testimonial Carousel Component
 *
 * Displays verified customer testimonials with:
 * - Real names (first + last initial)
 * - Location (suburb, state)
 * - Before/after photos
 * - Response time achieved
 * - Verified badge (✓)
 *
 * Critical E.E.A.T signal: Demonstrates real customer satisfaction
 * Ideal for people researching before emergency call (20% of audience)
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  customerName: string;
  location: string;
  serviceType: string;
  rating: number;
  quote: string;
  responseTime: string;
  imageUrl?: string;
  verified: boolean;
  date: string;
}

// Testimonials must come from the real /api/testimonials source only. Do NOT add
// hardcoded sample testimonials here — displaying invented reviews as "verified"
// is misleading conduct (ACCC). When there are no real testimonials, the carousel
// renders nothing.

export function ClientTestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials?limit=6');
        if (response.ok) {
          const data = await response.json();
          setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []);
        }
        setIsLoading(false);
      } catch (err) {
        // No fabricated fallback — leave the list empty so nothing misleading renders.
        console.warn('Failed to fetch testimonials:', err);
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIndex];

  if (isLoading) {
    return <div className="h-96 bg-slate-100 rounded-3xl animate-pulse" />;
  }

  // No fabricated fallback: if there are no real testimonials, render nothing.
  if (!current) {
    return null;
  }

  return (
    <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 min-h-96">
        {/* Testimonial Content */}
        <div className="flex flex-col justify-center space-y-6">
          {/* Header with verification */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(current.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              {current.verified && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">Verified</span>
                </div>
              )}
            </div>

            <p className="text-2xl md:text-3xl font-bold text-slate-900">
              "{current.quote}"
            </p>
          </div>

          {/* Customer Info */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">{current.customerName}</p>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  {current.location}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Service</p>
                <p className="font-bold text-slate-900">{current.serviceType}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                <strong>Response Time:</strong> {current.responseTime}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={goToPrevious}
              className="p-3 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white transition-[background-color,color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="p-3 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white transition-[background-color,color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-[width,background-color] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
                    index === currentIndex ? 'bg-blue-600 w-8' : 'bg-slate-300 w-2'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden md:flex flex-col justify-center items-center space-y-4">
          {current.imageUrl && (
            <div className="relative w-full h-80 rounded-2xl overflow-hidden">
              <Image
                src={current.imageUrl}
                alt={`${current.customerName}'s restoration`}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="w-full bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
              Why customers choose NRPG
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✓ Qualified contractors</li>
              <li>✓ Priority emergency dispatch</li>
              <li>✓ Professional documentation for insurance</li>
              <li>✓ Transparent $2,750 emergency pricing</li>
              <li>✓ 24/7 availability, all states</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Counter */}
      <div className="bg-blue-600 text-white px-8 py-3 text-center text-sm font-semibold">
        {currentIndex + 1} / {testimonials.length} client stories
      </div>
    </div>
  );
}
