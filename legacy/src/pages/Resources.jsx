import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  Search,
  Filter,
  Star,
  Lock,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('is_featured'),
    initialData: [],
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === "" || 
      resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesTier = selectedTier === "all" || resource.tier_required === selectedTier;

    return matchesSearch && matchesCategory && matchesTier;
  });

  const categories = [...new Set(resources.map(r => r.category))];
  const featuredResources = resources.filter(r => r.is_featured);

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'DOCX':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'XLSX':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'PPTX':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'ZIP':
        return <FileText className="w-5 h-5 text-gray-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Free':
        return <Badge className="bg-green-100 text-green-800">Free</Badge>;
      case 'Standard':
        return <Badge className="bg-blue-100 text-blue-800">Standard</Badge>;
      case 'Enterprise':
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Download className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Resource Library</h1>
              <p className="text-gray-600">Templates, guides, and toolkits for your anti-racism journey</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900">{resources.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Resources</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-700">
                {resources.filter(r => r.tier_required === 'Free').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Free Resources</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900">{featuredResources.length}</div>
              <div className="text-sm text-gray-600 mt-1">Featured</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-700">{categories.length}</div>
              <div className="text-sm text-gray-600 mt-1">Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Find Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Access Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Resources */}
        {featuredResources.length > 0 && selectedCategory === "all" && searchTerm === "" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.slice(0, 3).map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          {getFileIcon(resource.file_type)}
                        </div>
                        <div className="flex gap-2">
                          {getTierBadge(resource.tier_required)}
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1 fill-yellow-600" />
                            Featured
                          </Badge>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {resource.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {resource.file_type}
                        </span>
                        <span>{resource.file_size_mb} MB</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {resource.download_count || 0} downloads
                        </span>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Resources Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === "all" ? "All Resources" : selectedCategory}
          </h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No resources found. Try adjusting your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => {
                const isFeatured = resource.is_featured;
                const isLocked = resource.tier_required === "Enterprise"; // In real app, check user tier

                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`h-full hover:shadow-xl transition-all ${
                      isFeatured ? 'border-2 border-yellow-200' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getFileIcon(resource.file_type)}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getTierBadge(resource.tier_required)}
                            {isFeatured && !featuredResources.slice(0, 3).some(f => f.id === resource.id) && (
                              <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                          {resource.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {resource.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                          {resource.tags?.slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {resource.file_type}
                          </span>
                          <span>{resource.file_size_mb} MB</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {resource.download_count || 0}
                          </span>
                        </div>

                        <Button 
                          className={`w-full ${isLocked ? 'bg-gray-300 text-gray-600' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'}`}
                          disabled={isLocked}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Upgrade to Access
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}