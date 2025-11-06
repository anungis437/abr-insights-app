import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause,
  Volume2,
  Maximize,
  FileText,
  Download,
  ExternalLink
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function LessonContent({ lesson }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!lesson) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-400">No lesson content available</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-12">
      {/* Video Player (if video exists) */}
      {lesson.video_url && (
        <Card className="mb-8 bg-black border-gray-700 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
            {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') ? (
              <iframe
                src={lesson.video_url.replace('watch?v=', 'embed/')}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : lesson.video_url.includes('vimeo.com') ? (
              <iframe
                src={lesson.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={lesson.video_url}
                controls
                className="w-full h-full"
                poster={`https://source.unsplash.com/1920x1080/?${encodeURIComponent(lesson.title_en)}`}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        </Card>
      )}

      {/* Lesson Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">{lesson.title_en}</h1>
        {lesson.duration_minutes && (
          <div className="flex items-center gap-2 text-gray-400">
            <FileText className="w-4 h-4" />
            <span>Estimated time: {lesson.duration_minutes} minutes</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardContent className="p-8">
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown>
              {lesson.content_en || "Content coming soon..."}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Case Study Reference (if applicable) */}
      {lesson.case_study_id && (
        <Card className="bg-gradient-to-r from-teal-900 to-teal-800 border-teal-600 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Related Case Study
                </h3>
                <p className="text-teal-100 mb-4">
                  This lesson references a real tribunal case. Review the case for deeper understanding.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white"
                onClick={() => window.open(`/case-details?id=${lesson.case_study_id}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Case
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Resources */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Additional Resources</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Lesson Notes (PDF)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Supplementary Reading Materials
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              External Resources & References
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Tips */}
      <div className="mt-8 p-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
        <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
          💡 Learning Tip
        </h4>
        <p className="text-gray-300 text-sm">
          Take notes as you go through the lesson. Consider how the concepts apply to your specific workplace context. 
          If you have questions, use the discussion forum to engage with other learners and instructors.
        </p>
      </div>
    </div>
  );
}