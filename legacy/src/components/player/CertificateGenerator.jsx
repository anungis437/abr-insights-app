import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, ExternalLink, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function CertificateGenerator({ course, user, onClose }) {
  const [certificate, setCertificate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCertificateMutation = useMutation({
    mutationFn: async () => {
      // Check if certificate already exists
      const existingCerts = await base44.entities.Certificate.filter({
        user_email: user.email,
        course_id: course.id,
      });

      if (existingCerts.length > 0) {
        return existingCerts[0];
      }

      // Generate new certificate
      const certificateNumber = `ABR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const certData = {
        user_email: user.email,
        user_name: user.full_name || user.email,
        course_id: course.id,
        course_title_en: course.title_en,
        issue_date: new Date().toISOString().split('T')[0],
        certificate_number: certificateNumber,
        completion_score: 100, // Can be dynamic based on quiz scores
      };

      return await base44.entities.Certificate.create(certData);
    },
  });

  useEffect(() => {
    const generateCert = async () => {
      setIsGenerating(true);
      try {
        const cert = await generateCertificateMutation.mutateAsync();
        setCertificate(cert);
      } catch (error) {
        console.error("Error generating certificate:", error);
      }
      setIsGenerating(false);
    };
    generateCert();
  }, []);

  const handleDownload = () => {
    // In real implementation, this would generate a PDF
    alert("PDF download would be triggered here. Implementation requires backend PDF generation service.");
  };

  const handleShare = () => {
    const shareText = `I just completed "${course.title_en}" on ABR Insight Platform! 🎓`;
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'Certificate Achievement',
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert("Share text copied to clipboard!");
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-300 text-lg">Generating your certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Celebration Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Congratulations! 🎉</h1>
          <p className="text-xl text-gray-300 mb-2">
            You've successfully completed
          </p>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
            {course.title_en}
          </h2>
        </motion.div>

        {/* Certificate Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Card className="bg-white border-8 border-double border-yellow-600 shadow-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-12">
              {/* Certificate Header */}
              <div className="text-center mb-8 border-b-4 border-yellow-600 pb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">ABR Insight Platform</h3>
                    <p className="text-sm text-gray-600">Anti-Black Racism Training Certification</p>
                  </div>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="text-center space-y-6">
                <div>
                  <p className="text-lg text-gray-700 mb-2">This certifies that</p>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    {certificate?.user_name || user.full_name || user.email}
                  </h2>
                </div>

                <div>
                  <p className="text-lg text-gray-700 mb-2">has successfully completed the course</p>
                  <h3 className="text-2xl font-bold text-teal-700 mb-6">
                    {certificate?.course_title_en}
                  </h3>
                </div>

                <div className="flex items-center justify-center gap-12 py-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date of Completion</p>
                    <p className="text-lg font-bold text-gray-900">
                      {certificate?.issue_date ? format(new Date(certificate.issue_date), 'MMMM d, yyyy') : 'Today'}
                    </p>
                  </div>
                  <div className="w-px h-16 bg-gray-300" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Certificate Number</p>
                    <p className="text-lg font-mono font-bold text-gray-900">
                      {certificate?.certificate_number}
                    </p>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full border-2 border-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">Completion Score: {certificate?.completion_score || 100}%</span>
                  </div>
                </div>
              </div>

              {/* Certificate Footer */}
              <div className="mt-12 pt-6 border-t-2 border-gray-200 flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="w-32 h-px bg-gray-900 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Platform Director</p>
                  <p className="text-xs text-gray-600">ABR Insight</p>
                </div>
                <div className="w-20 h-20 opacity-10">
                  <img 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23d4af37' stroke-width='3'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23d4af37' font-size='20' font-weight='bold'%3EABR%3C/text%3E%3C/svg%3E"
                    alt="Seal"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-center flex-1">
                  <div className="w-32 h-px bg-gray-900 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Certification Authority</p>
                  <p className="text-xs text-gray-600">Canadian Standards</p>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="mt-8 text-center">
                <div className="inline-block p-3 bg-white border-2 border-gray-300 rounded-lg">
                  <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
                    <p className="text-xs text-gray-500">QR Code</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Scan to verify certificate authenticity
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={handleDownload}
            size="lg"
            className="gold-gradient text-gray-900 font-semibold"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF Certificate
          </Button>
          <Button
            onClick={handleShare}
            size="lg"
            variant="outline"
            className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Achievement
          </Button>
          <Button
            onClick={onClose}
            size="lg"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Back to Courses
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              What's Next?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Continue Learning</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Explore more courses to deepen your understanding of anti-racism practices.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Browse Courses
                </Button>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Join Community</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Connect with other learners and share experiences in our community forum.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Join Discussion
                </Button>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Add to LinkedIn</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Showcase your achievement on your professional profile.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Add to Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}