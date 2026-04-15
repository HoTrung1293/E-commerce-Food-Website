
import React, { useState } from 'react';
import { marked } from 'marked';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List as ListIcon, 
  Eye, 
  Code,
  Type,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MarkdownEditor({ value, onChange, placeholder = 'Nhập nội dung (Markdown)...' }) {
  const [activeTab, setActiveTab] = useState('write');
  const [isExpanded, setIsExpanded] = useState(false);

  // Configure marked
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  const htmlPreview = marked(value || '');

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('markdown-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  };

  const tools = [
    { title: 'Đậm', icon: Bold, action: () => insertMarkdown('**', '**') },
    { title: 'Nghiêng', icon: Italic, action: () => insertMarkdown('_', '_') },
    { title: 'Tiêu đề 1', icon: Heading1, action: () => insertMarkdown('# ', '') },
    { title: 'Tiêu đề 2', icon: Heading2, action: () => insertMarkdown('## ', '') },
    { title: 'Tiêu đề 3', icon: Heading3, action: () => insertMarkdown('### ', '') },
    { title: 'Danh sách', icon: ListIcon, action: () => insertMarkdown('- ', '') },
  ];

  return (
    <div className={`flex flex-col border border-slate-200 rounded-3xl overflow-hidden bg-white transition-all duration-300 shadow-inner ${isExpanded ? 'fixed inset-4 z-[100] h-auto' : 'h-full min-h-[400px]'}`}>
      <div className="flex items-center justify-between p-3 border-b bg-slate-50/50">
        <div className="flex items-center gap-1.5">
           {tools.map((tool, idx) => (
             <Button 
                key={idx}
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                onClick={tool.action}
                title={tool.title}
             >
                <tool.icon className="w-4 h-4 text-slate-600" />
             </Button>
           ))}
        </div>
        
        <div className="flex items-center gap-3">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-slate-200/50 rounded-xl p-1 h-9">
              <TabsList className="bg-transparent h-full p-0">
                <TabsTrigger value="write" className="rounded-lg px-4 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <Type className="w-3 h-3 mr-2" /> Soạn thảo
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg px-4 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <Eye className="w-3 h-3 mr-2" /> Xem trước
                </TabsTrigger>
              </TabsList>
           </Tabs>
           
           <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-sm">
              {isExpanded ? <Minimize2 className="w-4 h-4 text-slate-400" /> : <Maximize2 className="w-4 h-4 text-slate-400" />}
           </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'write' ? (
          <textarea
            id="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-6 text-sm font-medium text-slate-700 placeholder-slate-300 resize-none outline-none bg-white leading-relaxed"
            spellCheck="false"
          />
        ) : (
          <ScrollArea className="w-full h-full p-8 bg-slate-50/30">
            <div 
              className="prose prose-sm max-w-none text-slate-800 markdown-preview"
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          </ScrollArea>
        )}
      </div>
      
      <div className="p-2 border-t bg-slate-50/30 flex justify-between items-center px-4">
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Markdown Editor Mode</span>
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeTab === 'write' ? 'bg-primary animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{activeTab === 'write' ? 'Recording Changes' : 'Preview Only'}</span>
         </div>
      </div>
    </div>
  );
}
