"use client"

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { coursesService } from "@/lib/supabase/services/courses";
import { progressService } from "@/lib/supabase/services/progress";
import type { CourseWithLessons, Lesson } from "@/lib/supabase/services/courses";
import type { CourseEnrollment, LessonProgress } from "@/lib/supabase/services/progress";
// Import UI components used in the JSX (Accordion, Badge, Link, etc.)
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlayCircle, BarChart3, FileText, CheckCircle, Star, ArrowRight, Award } from "lucide-react";

// World-class Course Player: dynamic, authenticated, interactive


