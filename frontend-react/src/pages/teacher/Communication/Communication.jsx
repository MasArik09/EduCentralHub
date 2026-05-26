import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMessageSquare, FiUser, FiCircle } from 'react-icons/fi';

export default function Communication() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chats, setChats] = useState({});
  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Load student contacts
    const savedStudents = localStorage.getItem('teacher_students');
    const defaultStudents = [
      { id: 1, name: 'Ahmad Rafli', email: 'rafli@educentral.hub', classCode: 'MAT-7A', online: true },
      { id: 2, name: 'Budi Santoso', email: 'budi@educentral.hub', classCode: 'MAT-7A', online: false },
      { id: 3, name: 'Citra Kirana', email: 'citra@educentral.hub', classCode: 'MAT-7A', online: true },
      { id: 4, name: 'Fajar Pratama', email: 'fajar@educentral.hub', classCode: 'FIS-8B', online: false }
    ];

    let data = defaultStudents;
    if (savedStudents) {
      const parsed = JSON.parse(savedStudents);
      if (parsed.length > 0) {
        data = parsed.map((s, idx) => ({
          ...s,
          online: idx % 2 === 0
        }));
      }
    }
    setStudents(data);
    setSelectedStudent(data[0]);

    // Initial mock chat history
    const initialChats = {
      1: [
        { sender: 'student', text: 'Pak, permisi mau bertanya untuk tugas aljabar nomor 3 cara carinya bagaimana ya?', time: '09:15' },
        { sender: 'teacher', text: 'Halo Rafli, untuk nomor 3 kamu perlu memindahkan konstanta ke ruas kanan terlebih dahulu, lalu bagi dengan koefisien x.', time: '09:20' },
        { sender: 'student', text: 'Oh begitu ya Pak, baik akan saya coba kerjakan kembali. Terima kasih banyak Pak!', time: '09:22' }
      ],
      3: [
        { sender: 'student', text: 'Pagi Pak, kuis saya kemarin nilainya kok 60 ya? Apakah ada koreksi yang keliru?', time: '08:02' },
        { sender: 'teacher', text: 'Halo Citra, bapak sudah periksa ulang. Nilai 60 karena ada kesalahan hitung pada soal nomor 2 dan 4. Kamu bisa cek feedback tertulis di tab Penilaian ya.', time: '08:15' }
      ]
    };
    setChats(initialChats);
  }, []);

  useEffect(() => {
    // Scroll chats to bottom when selection or message changes
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedStudent]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedStudent) return;

    const studentId = selectedStudent.id;
    const timeNow = new Date().toTimeString().substring(0, 5);
    const newMsg = { sender: 'teacher', text: inputMsg, time: timeNow };

    const studentChats = chats[studentId] || [];
    const updatedChats = {
      ...chats,
      [studentId]: [...studentChats, newMsg]
    };

    setChats(updatedChats);
    setInputMsg('');

    // Simulate instant automated student reply after 1.5 seconds
    setTimeout(() => {
      const replies = [
        `Baik Pak, terima kasih atas arahannya! 🙏`,
        `Siap Pak, segera saya kerjakan dan perbaiki tugas saya.`,
        `Oh begitu ya Pak. Terima kasih banyak atas penjelasannya ya Pak! 😊`,
        `Mohon maaf mengganggu waktunya ya Pak. Selamat beraktivitas kembali!`
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const autoMsg = { sender: 'student', text: randomReply, time: new Date().toTimeString().substring(0, 5) };

      setChats(prevChats => ({
        ...prevChats,
        [studentId]: [...(prevChats[studentId] || []), autoMsg]
      }));
    }, 1500);
  };

  const activeMessages = selectedStudent ? chats[selectedStudent.id] || [] : [];

  return (
    <div className="w-full bg-transparent space-y-6 text-left">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-[#202124]">
          Pusat Komunikasi Guru & Siswa
        </h2>
        <p className="text-[#5F6368] text-xs mt-1">
          Hubungi siswa secara personal melalui pesan instan interaktif dengan simulasi respons balik otomatis.
        </p>
      </div>

      {/* Main Messaging Layout */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-none grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[550px]">
        {/* Left contacts list */}
        <div className="lg:col-span-4 border-r border-gray-200 flex flex-col h-full bg-gray-50/30">
          <div className="p-4 border-b border-gray-200 bg-white">
            <span className="text-xs font-bold text-[#202124] uppercase tracking-wider block">Kontak Siswa</span>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
            {students.length === 0 ? (
              <p className="text-xs text-[#5F6368] p-4 text-center">Belum ada daftar kontak siswa.</p>
            ) : (
              students.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                const lastMsg = chats[student.id]?.slice(-1)[0]?.text || 'Belum ada pesan.';
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-colors cursor-pointer border-none ${
                      isSelected
                        ? 'bg-white border-l-4 border-[#1A73E8]'
                        : 'bg-transparent hover:bg-gray-100/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100/70 flex items-center justify-center font-bold text-[#1A73E8] border border-gray-200 shrink-0 relative">
                      <FiUser className="w-5 h-5" />
                      <span className="absolute bottom-0 right-0">
                        <FiCircle className={`w-3.5 h-3.5 rounded-full ${student.online ? 'bg-emerald-500 text-emerald-500' : 'bg-slate-300 text-slate-300'}`} />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-[#202124] truncate">{student.name}</h4>
                        <span className="text-[9px] font-bold text-[#1A73E8] bg-blue-50/70 border border-blue-200/50 px-2 py-0.5 rounded-md shrink-0">{student.classCode}</span>
                      </div>
                      <p className="text-[11px] text-[#5F6368] truncate mt-0.5">{lastMsg}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right chat panel */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white">
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100/70 flex items-center justify-center font-bold text-[#1A73E8] border border-gray-200">
                  <FiUser className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#202124]">{selectedStudent.name}</h4>
                  <span className="text-[9px] text-[#5F6368] font-semibold uppercase tracking-wider block">
                    {selectedStudent.online ? 'Online' : 'Offline'} • Kelas {selectedStudent.classCode}
                  </span>
                </div>
              </div>

              {/* Chat Messages list */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#5F6368] text-xs">
                    <FiMessageSquare className="w-8 h-8 text-slate-300 mb-1" />
                    Kirim pesan pertama Anda untuk memulai percakapan.
                  </div>
                ) : (
                  activeMessages.map((msg, idx) => {
                    const isTeacher = msg.sender === 'teacher';
                    return (
                      <div key={idx} className={`flex ${isTeacher ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg px-4 py-2.5 text-xs shadow-none relative ${
                          isTeacher
                            ? 'bg-[#1A73E8] text-white rounded-tr-none'
                            : 'bg-white text-[#202124] border border-gray-200 rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed font-semibold">{msg.text}</p>
                          <span className={`text-[8px] font-medium block text-right mt-1 ${isTeacher ? 'text-indigo-200' : 'text-[#5F6368]'}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Message Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ketik pesan balasan di sini..."
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#1A73E8] text-[#202124]"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-[#1A73E8] hover:bg-[#1557B0] text-white p-2.5 rounded-lg flex items-center justify-center shrink-0 border-none transition-colors duration-150 cursor-pointer shadow-none"
                >
                  <FiSend className="w-4.5 h-4.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#5F6368] text-xs">
              <FiMessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              Pilih kontak siswa untuk memulai komunikasi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
