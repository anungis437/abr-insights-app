import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Clock, Users, BarChart3, Award, PlayCircle, FileText, CheckCircle, Star, ArrowRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

// Generate static paths for all courses
export async function generateStaticParams() {
  return [
    { slug: 'understanding-anti-black-racism' },
    { slug: 'workplace-allyship-action' },
    { slug: 'implicit-bias-decision-making' },
  ]
}

// TODO: Replace with actual database fetch
async function getCourse(slug: string) {
  // Placeholder course data
  const courses: Record<string, any> = {
    'understanding-anti-black-racism': {
      id: 1,
      slug: 'understanding-anti-black-racism',
      title: 'Understanding Anti-Black Racism in Canadian Workplaces',
      description: 'A comprehensive introduction to recognizing and addressing anti-Black racism in professional environments across Canada.',
      longDescription: 'This foundational course provides essential knowledge and practical frameworks for understanding how anti-Black racism manifests in Canadian workplaces. Through real case studies, expert insights, and interactive exercises, participants will develop the awareness and skills needed to identify, interrupt, and prevent racist behaviors and systemic inequities.',
      level: 'Beginner',
      duration: '4 hours',
      lessons: 12,
      enrolled: 2847,
      rating: 4.8,
      reviews: 342,
      price: 0,
      instructor: {
        name: 'Dr. Aisha Johnson',
        title: 'DEI Consultant & Anti-Racism Educator',
        bio: 'Dr. Johnson has over 15 years of experience in equity work and has trained thousands of professionals across Canada. Her research focuses on systemic racism in organizational contexts.',
        avatar: '/images/instructors/default.jpg',
      },
      objectives: [
        'Define anti-Black racism and understand its historical context in Canada',
        'Identify how anti-Black racism manifests in workplace policies and practices',
        'Recognize microaggressions and their cumulative impact on Black employees',
        'Apply strategies to interrupt racist behaviors and support affected colleagues',
        'Understand your role in creating more equitable workplace cultures',
      ],
      prerequisites: [
        'None - this course is open to all learners',
        'Willingness to engage with challenging content',
        'Commitment to self-reflection and learning',
      ],
      syllabus: [
        {
          title: 'Introduction to Anti-Black Racism',
          lessons: [
            { title: 'Welcome and Course Overview', duration: '5 min', type: 'video', isPreview: true },
            { title: 'Defining Anti-Black Racism', duration: '12 min', type: 'video', isPreview: true },
            { title: 'Historical Context in Canada', duration: '18 min', type: 'video', isPreview: false },
            { title: 'Knowledge Check Quiz', duration: '5 min', type: 'quiz', isPreview: false },
          ],
        },
        {
          title: 'Manifestations in the Workplace',
          lessons: [
            { title: 'Hiring and Recruitment Biases', duration: '15 min', type: 'video', isPreview: false },
            { title: 'Promotion and Advancement Barriers', duration: '14 min', type: 'video', isPreview: false },
            { title: 'Workplace Microaggressions', duration: '16 min', type: 'video', isPreview: false },
            { title: 'Case Study Analysis', duration: '20 min', type: 'assignment', isPreview: false },
          ],
        },
        {
          title: 'Taking Action',
          lessons: [
            { title: 'Bystander Intervention Strategies', duration: '18 min', type: 'video', isPreview: false },
            { title: 'Supporting Black Colleagues', duration: '15 min', type: 'video', isPreview: false },
            { title: 'Creating Action Plans', duration: '22 min', type: 'assignment', isPreview: false },
            { title: 'Final Assessment', duration: '15 min', type: 'quiz', isPreview: false },
          ],
        },
      ],
      features: [
        'Certificate of completion',
        'Downloadable resources',
        'Access to discussion forums',
        'Real workplace case studies',
        'Self-paced learning',
      ],
      testimonials: [
        {
          name: 'Michael Chen',
          role: 'HR Manager',
          company: 'Tech Solutions Inc.',
          rating: 5,
          text: 'This course completely changed how I approach equity in our hiring processes. The case studies were particularly eye-opening.',
        },
        {
          name: 'Sarah Thompson',
          role: 'Team Lead',
          company: 'Financial Services Co.',
          rating: 5,
          text: 'Practical, thoughtful, and necessary. Every manager should take this course.',
        },
      ],
      relatedCourses: [
        { id: 2, title: 'Advanced DEI Leadership', slug: 'advanced-dei-leadership', level: 'Advanced', duration: '6 hours' },
        { id: 3, title: 'Building Inclusive Teams', slug: 'building-inclusive-teams', level: 'Intermediate', duration: '3 hours' },
      ],
    },
  }

  return courses[slug] || null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await getCourse(params.slug)

  if (!course) {
    return {
      title: 'Course Not Found',
    }
  }

  return {
    title: `${course.title} | ABR Insights`,
    description: course.description,
  }
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug)

  if (!course) {
    notFound()
  }

  const totalDuration = course.syllabus.reduce(
    (acc: number, module: any) => acc + module.lessons.length,
    0
  )

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container-custom py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Link href="/courses" className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600">
                  ← Back to Courses
                </Link>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant="outline">{course.duration}</Badge>
              </div>
              <h1 className="mb-4 text-4xl font-bold text-gray-900">{course.title}</h1>
              <p className="mb-6 text-xl text-gray-600">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span>({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrolled.toLocaleString()} enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  <span>{course.lessons} lessons</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="mb-6">
                  <div className="mb-2 text-3xl font-bold text-gray-900">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </div>
                  {course.price === 0 && (
                    <p className="text-sm text-gray-600">Included with all plans</p>
                  )}
                </div>

                <button className="btn-primary mb-4 w-full">
                  Enroll Now
                </button>
                <Link href="/pricing" className="btn-outline w-full">
                  View Pricing
                </Link>

                <div className="mt-6 space-y-3 border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900">This course includes:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {course.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* What You'll Learn */}
              <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">What You&apos;ll Learn</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {course.objectives.map((objective: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <p className="text-gray-700">{objective}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Content */}
              <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Course Content</h2>
                <div className="mb-4 text-sm text-gray-600">
                  {course.syllabus.length} modules • {totalDuration} lessons • {course.duration} total
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {course.syllabus.map((module: any, moduleIndex: number) => (
                    <AccordionItem key={moduleIndex} value={`module-${moduleIndex}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{module.title}</span>
                          <span className="text-sm text-gray-600">
                            ({module.lessons.length} lessons)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {module.lessons.map((lesson: any, lessonIndex: number) => (
                            <li
                              key={lessonIndex}
                              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === 'video' && <PlayCircle className="h-4 w-4 text-gray-400" />}
                                {lesson.type === 'quiz' && <BarChart3 className="h-4 w-4 text-gray-400" />}
                                {lesson.type === 'assignment' && <FileText className="h-4 w-4 text-gray-400" />}
                                <span className="text-sm text-gray-700">{lesson.title}</span>
                                {lesson.isPreview && (
                                  <Badge variant="secondary" className="ml-2">Preview</Badge>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">{lesson.duration}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Prerequisites */}
              <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Prerequisites</h2>
                <ul className="space-y-3">
                  {course.prerequisites.map((prereq: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* About the Instructor */}
              <div className="mb-12 rounded-2xl border border-gray-200 bg-white p-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">About the Instructor</h2>
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-secondary-600">
                      <span className="text-2xl font-bold text-white">
                        {course.instructor.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 text-xl font-semibold text-gray-900">{course.instructor.name}</h3>
                    <p className="mb-3 text-sm text-gray-600">{course.instructor.title}</p>
                    <p className="text-gray-700">{course.instructor.bio}</p>
                  </div>
                </div>
              </div>

              {/* Student Testimonials */}
              {course.testimonials && course.testimonials.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-8">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Student Testimonials</h2>
                  <div className="space-y-6">
                    {course.testimonials.map((testimonial: any, index: number) => (
                      <div key={index} className="rounded-lg border border-gray-100 p-6">
                        <div className="mb-3 flex items-center gap-1">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="mb-4 text-gray-700">&ldquo;{testimonial.text}&rdquo;</p>
                        <div>
                          <p className="font-medium text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-600">
                            {testimonial.role} at {testimonial.company}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Related Courses */}
              {course.relatedCourses && course.relatedCourses.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Related Courses</h3>
                  <div className="space-y-4">
                    {course.relatedCourses.map((related: any) => (
                      <Link
                        key={related.id}
                        href={`/courses/${related.slug}`}
                        className="group block rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-300 hover:shadow-md"
                      >
                        <h4 className="mb-2 font-medium text-gray-900 group-hover:text-primary-600">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline" className="text-xs">{related.level}</Badge>
                          <span>•</span>
                          <span>{related.duration}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/courses" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                    View all courses
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-white py-16">
        <div className="container-custom text-center">
          <Award className="mx-auto mb-4 h-12 w-12 text-primary-600" />
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
          <p className="mb-8 text-xl text-gray-600">
            Join thousands of learners building more equitable workplaces
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="btn-primary px-8">
              Enroll in This Course
            </button>
            <Link href="/courses" className="btn-outline px-8">
              Explore All Courses
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
