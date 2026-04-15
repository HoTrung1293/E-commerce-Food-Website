import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Eye, MessageSquare, ChevronRight, BookOpen } from 'lucide-react';


const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blogs/all');
      const data = await response.json();
      if (data.success) {
        setBlogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc bài viết
  let filteredBlogs = blogs.filter(blog =>
    (blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
    blog.category !== 'about' // Loại bỏ bài "about"
  );

  if (selectedCategory !== 'all') {
    filteredBlogs = filteredBlogs.filter(blog => blog.category === selectedCategory);
  }

  const categories = [
    { value: 'general', label: 'Tổng hợp' },
    { value: 'promotion', label: 'Khuyến mãi' },
    { value: 'news', label: 'Tin tức' },
    { value: 'guide', label: 'Hướng dẫn' },
    { value: 'tips', label: 'Mẹo' },
    { value: 'other', label: 'Khác' }
  ];

  const getCategoryLabel = (value) => {
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  const truncateContent = (content, maxLength = 150) => {
    // Remove HTML tags first
    let cleanContent = content.replace(/<[^>]*>/g, '');
    if (cleanContent.length > maxLength) {
      return cleanContent.substring(0, maxLength) + '...';
    }
    return cleanContent;
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b py-20 relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
           <div className="max-w-2xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-none font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">Blog & Tin Tức</Badge>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 uppercase leading-none">Kiến thức ẩm thực & Mẹo nhà bếp</h1>
              <p className="text-lg font-bold text-slate-400 mb-8 leading-relaxed">Khám phá thế giới ẩm thực sạch, chia sẻ bí quyết nấu ăn và cập nhật những tin tức khuyến mãi mới nhất từ Bếp Sạch Việt.</p>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Category Filter */}
        <div className="flex gap-2 mb-12 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? "default" : "secondary"}
            className={`h-12 rounded-2xl px-8 font-black text-xs uppercase tracking-widest ${selectedCategory === 'all' ? 'shadow-xl shadow-primary/20' : 'bg-white border shadow-sm'}`}
          >
            Tất cả bài viết
          </Button>
          {categories.map(category => (
            <Button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              variant={selectedCategory === category.value ? "default" : "secondary"}
              className={`h-12 rounded-2xl px-8 font-black text-xs uppercase tracking-widest whitespace-nowrap ${selectedCategory === category.value ? 'shadow-xl shadow-primary/20' : 'bg-white border shadow-sm'}`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
                 <Skeleton className="h-48 w-full" />
                 <CardContent className="p-8 space-y-4">
                    <Skeleton className="h-6 w-1/2 rounded-full" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                 </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <Card className="rounded-[3rem] border-none shadow-2xl p-20 text-center bg-white">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Chưa có bài viết nào</h3>
            <p className="text-sm font-bold text-slate-400 mb-0">Hạng mục này đang được chúng tôi cập nhật nội dung mới.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredBlogs.map(blog => (
              <Link key={blog.id} to={`/blog/${blog.id}`} className="group h-full">
                <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white hover:scale-[1.02] transition-all duration-500 h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={blog.thumbnail_image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80'}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                       <Badge className="bg-white/90 backdrop-blur shadow-sm text-slate-900 border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-xl">
                          {getCategoryLabel(blog.category)}
                       </Badge>
                    </div>
                  </div>

                  <CardContent className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-6 mb-4">
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          <Eye className="w-3.5 h-3.5" />
                          {blog.view_count || 0} lượt đọc
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(blog.created_at).toLocaleDateString('vi-VN')}
                       </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>

                    <p className="text-sm font-bold text-slate-400 line-clamp-3 mb-6 flex-1 leading-relaxed">
                      {truncateContent(blog.content)}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                       <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {blog.comment_count || 0} thảo luận
                       </span>
                       <div className="text-primary font-black text-xs uppercase flex items-center gap-1 group/btn">
                          Xem thêm <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>

  );
};

export default Blog;
