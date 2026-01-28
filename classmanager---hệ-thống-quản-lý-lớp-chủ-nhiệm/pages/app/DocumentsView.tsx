
import React, { useEffect, useState } from 'react';
import provider from '../../core/provider';
import { Document, Student } from '../../core/types';
import { FileText, Download, Folder, Search, ExternalLink } from 'lucide-react';

const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [child, setChild] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const students = await provider.getStudents();
      const firstChild = students[0]; // Mock
      if (firstChild) {
        setChild(firstChild);
        const data = await provider.getDocuments(firstChild.classId);
        setDocuments(data);
      }
    };
    loadData();
  }, []);

  const filtered = documents.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category
  const categories = Array.from(new Set(documents.map(d => d.category)));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Học liệu & Biểu mẫu</h2>
        <p className="text-gray-500">Các tài liệu dùng chung được GVCN cung cấp</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
         <Search size={20} className="text-gray-400"/>
         <input 
           type="text" 
           placeholder="Tìm kiếm tài liệu, biểu mẫu..." 
           className="bg-transparent border-none outline-none flex-1 text-sm"
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic bg-white rounded-2xl border border-gray-50">
            Không tìm thấy tài liệu phù hợp
          </div>
        ) : (
          filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition group-hover:bg-indigo-600 group-hover:text-white">
                    <FileText size={24}/>
                 </div>
                 <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded uppercase">{doc.category}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2" title={doc.title}>{doc.title}</h3>
              <p className="text-[10px] text-gray-400 mb-6 flex items-center gap-1 uppercase tracking-widest font-bold">
                 Cập nhật: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
              </p>
              <a 
                href={doc.url} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-indigo-600 font-bold text-sm hover:bg-indigo-600 hover:text-white transition"
              >
                 <Download size={16}/> Xem chi tiết
              </a>
            </div>
          ))
        )}
      </div>

      <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100">
         <div>
            <h3 className="text-xl font-bold mb-2">Bạn cần biểu mẫu khác?</h3>
            <p className="text-indigo-100 text-sm max-w-md">Nếu không tìm thấy biểu mẫu cần thiết, phụ huynh vui lòng liên hệ trực tiếp GVCN qua mục Tin nhắn.</p>
         </div>
         <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2">
            Gửi yêu cầu tài liệu
         </button>
      </div>
    </div>
  );
};

export default DocumentsView;
