import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "Xác nhận hành động", description = "Dữ liệu này sẽ bị tác động vĩnh viễn, bạn có chắc chắn không?" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center fade-in text-zinc-900">
       <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose}></div>
       <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl mx-4 text-center transform scale-100">
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="material-symbols-outlined text-[40px] drop-shadow-sm">warning</span>
           </div>
           <h3 className="font-headline font-extrabold text-2xl mb-3 text-zinc-900 tracking-tight">{title}</h3>
           <p className="text-zinc-500 text-sm mb-8 leading-relaxed px-4">{description}</p>
           <div className="flex gap-3 justify-center w-full">
               <button onClick={onClose} className="flex-1 py-4 font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 rounded-2xl transition-colors text-sm">Giữ Lại</button>
               <button onClick={onConfirm} className="flex-1 py-4 font-bold bg-red-500 text-white rounded-2xl shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:-translate-y-0.5 transition-all text-sm">Chắc Chắn</button>
           </div>
       </div>
    </div>
  );
};

export default ConfirmModal;
