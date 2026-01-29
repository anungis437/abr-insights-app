/**
 * Testimonials Component
 * Displays featured testimonials on the homepage
 * Part of Phase 4: Public Site Enhancement
 */

import Image from 'next/image'
import { Star, Quote } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string
  organization: string
  content: string
  rating: number
  photo_url: string | null
}

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Trusted by Leading Organizations
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Hear from HR leaders, diversity officers, and executives who are using ABR Insights to
            build more equitable workplaces.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white p-8 shadow-sm transition-all hover:shadow-lg">
      {/* Quote Icon */}
      <div className="absolute right-8 top-8 opacity-10 transition-opacity group-hover:opacity-20">
        <Quote className="h-16 w-16 text-primary-600" />
      </div>

      {/* Rating */}
      <div className="mb-4 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <blockquote className="relative z-10 mb-6 leading-relaxed text-gray-700">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        {testimonial.photo_url ? (
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
            <Image
              src={testimonial.photo_url}
              alt={testimonial.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-gray-900">{testimonial.name}</div>
          <div className="text-sm text-gray-600">
            {testimonial.role}
            <span className="text-gray-400"> • </span>
            {testimonial.organization}
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  )
}
