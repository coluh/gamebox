type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-3xl border-t border-l-2 border-emerald-400 bg-zinc-800 shadow-md shadow-emerald-400/50"
      >
        <button
          className="absolute top-2 right-2 ml-auto rounded-lg px-3 py-2 hover:bg-zinc-700"
          onClick={onClose}
        >
          &times;
        </button>

        {children}
      </div>
    </div>
  );
}
